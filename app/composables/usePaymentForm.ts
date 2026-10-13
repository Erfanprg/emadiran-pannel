import { useAuthStore } from "~/stores/auth";
import { userApi } from "~/services/api/user";
import { paymentApi } from "~/services/api/payment";
import { gatewaysApi } from "~/services/api/gateways";
import { formatCurrency } from "~/utils/formatters";
import { useConfirm } from "~/composables/useConfirm";
import { useToast } from "~/composables/useToast";
import { useCurrencyInput } from "~/composables/useCurrencyInput";
import type { Gateway } from "~/types/gateway";
import type {
  LoanDebtBreakdown,
  LoanDebtItem,
  PaymentAllocationPreview,
} from "~/types/debt";
import { translate } from '~/i18n/translate'

/**
 * State and flow of the user's "pay debt" page: loan and amount selection,
 * debounced allocation preview, gateway choice and payment initiation.
 */
export const usePaymentForm = () => {
  const authStore = useAuthStore();
  const toast = useToast();
  const { confirm } = useConfirm();

  const amountInput = useCurrencyInput();

  const loading = ref(true);
  const previewLoading = ref(false);
  const submitting = ref(false);
  const gateways = ref<Gateway[]>([]);
  const selectedGateway = ref<string>("");
  const description = ref<string>("");
  const loanDebtBreakdown = ref<LoanDebtBreakdown | null>(null);
  const loanDebtError = ref<string | null>(null);
  const selectedLoanId = ref<number | null>(null);
  const allocationPreview = ref<PaymentAllocationPreview | null>(null);
  const allocationPreviewError = ref<string | null>(null);
  const paymentError = ref<string | null>(null);
  const fieldErrors = ref<{
    amount?: string;
    selectedLoanId?: string;
  }>({});
  let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let latestPreviewRequestId = 0;

  const parseAmount = (value: string | number | null | undefined) => {
    return Number(value || 0);
  };

  const positiveDebtLoans = computed<LoanDebtItem[]>(() => {
    return (loanDebtBreakdown.value?.loans || []).filter(
      (loan) => parseAmount(loan.currentDebt) > 0
    );
  });

  const positiveDebtTotal = computed(() => {
    return positiveDebtLoans.value
      .reduce((sum, loan) => sum + parseAmount(loan.currentDebt), 0)
      .toString();
  });

  const hasPayableLoans = computed(() => positiveDebtLoans.value.length > 0);

  const selectedLoan = computed(() => {
    return (
      positiveDebtLoans.value.find(
        (loan) => loan.loanId === selectedLoanId.value
      ) || null
    );
  });

  const selectedLoanIdModel = computed({
    get: () => selectedLoanId.value ?? "",
    set: (value: string | number) => {
      selectedLoanId.value = value === "" ? null : Number(value);
      fieldErrors.value.selectedLoanId = undefined;
    },
  });

  const selectedGatewayDisplayName = computed(() => {
    return (
      gateways.value.find((gateway) => gateway.name === selectedGateway.value)
        ?.displayName || ""
    );
  });

  const previewAllocations = computed(() => {
    return [...(allocationPreview.value?.allocations || [])]
      .filter((allocation) => parseAmount(allocation.allocatedAmount) > 0)
      .sort((first, second) => first.allocationOrder - second.allocationOrder);
  });

  const isPreviewCurrent = computed(() => {
    if (!allocationPreview.value || !selectedLoanId.value) return false;

    return (
      allocationPreview.value.paymentAmount === amountInput.rawValue.value &&
      allocationPreview.value.selectedLoanId === selectedLoanId.value
    );
  });

  const canRequestPreview = computed(() => {
    return (
      !loading.value &&
      hasPayableLoans.value &&
      amountInput.numericValue.value >= 10000 &&
      amountInput.numericValue.value <= parseAmount(positiveDebtTotal.value) &&
      !!selectedLoanId.value
    );
  });

  const canSubmitPayment = computed(() => {
    return (
      canRequestPreview.value &&
      !!selectedGateway.value &&
      isPreviewCurrent.value &&
      !submitting.value
    );
  });

  const previewHint = computed(() => {
    if (previewLoading.value) {
      return translate('user.payment.preview.hints.loading');
    }

    if (!amountInput.rawValue.value) {
      return translate('user.payment.preview.hints.enterAmount');
    }

    if (!selectedLoanId.value) {
      return translate('user.payment.preview.hints.selectLoan');
    }

    if (!canRequestPreview.value) {
      return translate('user.payment.preview.hints.checkAmount');
    }

    return translate('user.payment.preview.hints.auto');
  });

  const syncSelectedLoan = () => {
    if (positiveDebtLoans.value.length === 1) {
      selectedLoanId.value = positiveDebtLoans.value[0].loanId;
      return;
    }

    if (
      selectedLoanId.value &&
      !positiveDebtLoans.value.some(
        (loan) => loan.loanId === selectedLoanId.value
      )
    ) {
      selectedLoanId.value = null;
    }
  };

  const normalizeAqayePardakhtAmount = () => {
    if (
      selectedGateway.value !== "AQAYE_PARDAKHT" &&
      selectedGateway.value !== "PAYPING"
    ) {
      return;
    }

    const raw = amountInput.rawValue.value;
    if (!raw) return;

    const lastDigit = raw[raw.length - 1];
    if (lastDigit === "0") return;

    amountInput.setValue(`${raw.slice(0, -1)}0`);
  };

  const fillTotalDebt = () => {
    amountInput.setValue(positiveDebtTotal.value);
    normalizeAqayePardakhtAmount();
  };

  const resetPreviewState = () => {
    allocationPreview.value = null;
    allocationPreviewError.value = null;
    paymentError.value = null;
    previewLoading.value = false;
  };

  const validatePreviewInputs = () => {
    fieldErrors.value = {};

    const amount = amountInput.numericValue.value;
    const maxPayableDebt = parseAmount(positiveDebtTotal.value);

    if (!amount || amount <= 0) {
      fieldErrors.value.amount = translate('common.validation.invalidAmount');
    } else if (amount < 10000) {
      fieldErrors.value.amount = translate('user.payment.validation.minAmount');
    } else if (amount > maxPayableDebt) {
      fieldErrors.value.amount = translate('user.payment.validation.maxAmount', { maxPayableDebt: formatCurrency(
        maxPayableDebt,
        true
      ) });
    }

    if (!selectedLoanId.value) {
      fieldErrors.value.selectedLoanId = translate('user.payment.validation.selectLoan');
    }

    return Object.keys(fieldErrors.value).length === 0;
  };

  const fetchPaymentPageData = async () => {
    loading.value = true;
    loanDebtError.value = null;

    try {
      const [, gatewayData, loanDebtData] = await Promise.all([
        authStore.fetchProfile(),
        gatewaysApi.getPaymentGateways(),
        userApi.getLoanDebts(),
      ]);

      gateways.value = [...gatewayData].sort((first, second) => {
        if (first.name === "PAYPING") return -1;
        if (second.name === "PAYPING") return 1;
        return 0;
      });
      loanDebtBreakdown.value = loanDebtData;
      syncSelectedLoan();

      if (gateways.value.length > 0) {
        selectedGateway.value =
          gateways.value.find((gateway) => gateway.name === "PAYPING")?.name ||
          gateways.value[0].name;
      }
    } catch (error: any) {
      console.error("Error fetching payment page data:", error);
      loanDebtError.value =
        error.data?.message || error.message || translate('user.payment.errors.fetch');
    } finally {
      loading.value = false;
    }
  };

  const handleAllocationPreview = async () => {
    paymentError.value = null;
    allocationPreviewError.value = null;

    if (!canRequestPreview.value || !selectedLoanId.value) {
      return;
    }

    const requestId = ++latestPreviewRequestId;
    previewLoading.value = true;

    try {
      const preview = await paymentApi.getAllocationPreview({
        amount: amountInput.numericValue.value,
        loanId: selectedLoanId.value!,
      });

      if (requestId !== latestPreviewRequestId) {
        return;
      }

      allocationPreview.value = preview;
    } catch (error: any) {
      if (requestId !== latestPreviewRequestId) {
        return;
      }

      console.error("Allocation preview error:", error);
      allocationPreview.value = null;
      allocationPreviewError.value =
        error.data?.message ||
        error.message ||
        translate('user.payment.errors.preview');
    } finally {
      if (requestId === latestPreviewRequestId) {
        previewLoading.value = false;
      }
    }
  };

  const scheduleAllocationPreview = () => {
    if (previewDebounceTimer) {
      clearTimeout(previewDebounceTimer);
    }

    if (!canRequestPreview.value) {
      previewLoading.value = false;
      return;
    }

    previewDebounceTimer = setTimeout(() => {
      handleAllocationPreview();
    }, 600);
  };

  const handlePayment = async () => {
    paymentError.value = null;

    if (!validatePreviewInputs()) {
      toast.error(translate('user.payment.validation.incomplete'));
      return;
    }

    if (!selectedGateway.value) {
      paymentError.value = translate('user.payment.validation.selectGateway');
      toast.error(paymentError.value);
      return;
    }

    if (!isPreviewCurrent.value) {
      paymentError.value =
        translate('user.payment.validation.previewRequired');
      toast.error(paymentError.value);
      return;
    }

    const confirmed = await confirm({
      title: translate('user.payment.confirm.title'),
      message: translate('user.payment.confirm.message', { amount: formatCurrency(
        amountInput.rawValue.value
      ), loanNumber: selectedLoan.value?.loanNumber || "-", gateway: selectedGatewayDisplayName.value }),
      type: "warning",
    });

    if (!confirmed) return;

    submitting.value = true;
    try {
      const response = await paymentApi.initiatePayment({
        amount: amountInput.rawValue.value,
        gatewayName: selectedGateway.value,
        description: description.value || undefined,
        loanId: selectedLoanId.value!,
      });

      toast.success(translate('user.payment.messages.redirecting'));

      setTimeout(() => {
        window.location.href = response.data.paymentUrl;
      }, 1000);
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      paymentError.value =
        error.data?.message || error.message || translate('user.payment.errors.initiate');
      toast.error(paymentError.value);
      submitting.value = false;
    }
  };

  watch(
    positiveDebtLoans,
    () => {
      syncSelectedLoan();
    },
    { deep: true }
  );

  watch([() => amountInput.rawValue.value, selectedLoanId], () => {
    fieldErrors.value.amount = undefined;
    fieldErrors.value.selectedLoanId = undefined;
    resetPreviewState();
    scheduleAllocationPreview();
  });

  watch(selectedGateway, () => {
    normalizeAqayePardakhtAmount();
  });

  onMounted(() => {
    fetchPaymentPageData();
  });

  onBeforeUnmount(() => {
    if (previewDebounceTimer) {
      clearTimeout(previewDebounceTimer);
    }
  });

  return {
    amountInput,
    loading,
    submitting,
    gateways,
    selectedGateway,
    description,
    loanDebtError,
    allocationPreview,
    allocationPreviewError,
    paymentError,
    fieldErrors,
    positiveDebtLoans,
    positiveDebtTotal,
    hasPayableLoans,
    selectedLoan,
    selectedLoanIdModel,
    selectedGatewayDisplayName,
    previewAllocations,
    isPreviewCurrent,
    canSubmitPayment,
    previewHint,
    normalizeAqayePardakhtAmount,
    fillTotalDebt,
    fetchPaymentPageData,
    handlePayment,
  };
};
