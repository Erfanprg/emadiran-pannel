<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { userApi } from "~/services/api/user";
import { paymentApi } from "~/services/api/payment";
import { gatewaysApi } from "~/services/api/gateways";
import { formatCurrency, formatNumber } from "~/utils/formatters";
import { useConfirm } from "~/composables/useConfirm";
import { useToast } from "~/composables/useToast";
import { useCurrencyInput } from "~/composables/useCurrencyInput";
import type { Gateway } from "~/types/gateway";
import type {
  LoanDebtBreakdown,
  LoanDebtItem,
  PaymentAllocationPreview,
} from "~/types/debt";

useHead({
  title: "پرداخت بدهی - عماد ایران",
});

definePageMeta({
  middleware: "auth",
});

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
const iban = "IR370130100000000441275655";
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
    return "در حال بررسی پیش‌نمایش...";
  }

  if (!amountInput.rawValue.value) {
    return "ابتدا مبلغ پرداختی را وارد کنید.";
  }

  if (!selectedLoanId.value) {
    return "ابتدا تسهیلات را انتخاب کنید.";
  }

  if (!canRequestPreview.value) {
    return "مبلغ پرداختی را بررسی کنید.";
  }

  return "پیش‌نمایش به صورت خودکار نمایش داده می‌شود.";
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
    fieldErrors.value.amount = "لطفاً مبلغ معتبری وارد کنید";
  } else if (amount < 10000) {
    fieldErrors.value.amount = "حداقل مبلغ پرداخت باید ۱۰,۰۰۰ ریال باشد";
  } else if (amount > maxPayableDebt) {
    fieldErrors.value.amount = `مبلغ پرداخت نمی‌تواند بیشتر از مبلغ کل (${formatCurrency(
      maxPayableDebt,
      true
    )}) باشد`;
  }

  if (!selectedLoanId.value) {
    fieldErrors.value.selectedLoanId = "لطفاً تسهیلات موردنظر را انتخاب کنید";
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
      error.data?.message || error.message || "خطا در دریافت اطلاعات پرداخت";
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
      "خطا در دریافت پیش‌نمایش تخصیص پرداخت";
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
    toast.error("لطفاً اطلاعات پرداخت را کامل و صحیح وارد کنید");
    return;
  }

  if (!selectedGateway.value) {
    paymentError.value = "لطفاً یک درگاه پرداخت انتخاب کنید";
    toast.error(paymentError.value);
    return;
  }

  if (!isPreviewCurrent.value) {
    paymentError.value =
      "پیش از تایید پرداخت، پیش‌نمایش تخصیص مبلغ را مشاهده و بررسی کنید";
    toast.error(paymentError.value);
    return;
  }

  const confirmed = await confirm({
    title: "تایید پرداخت",
    message: `آیا از پرداخت ${formatCurrency(
      amountInput.rawValue.value
    )} ریال برای تسهیلات ${selectedLoan.value?.loanNumber || "-"} از طریق ${
      selectedGatewayDisplayName.value
    } اطمینان دارید؟`,
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

    toast.success("در حال انتقال به درگاه پرداخت...");

    setTimeout(() => {
      window.location.href = response.data.paymentUrl;
    }, 1000);
  } catch (error: any) {
    console.error("Payment initiation error:", error);
    paymentError.value =
      error.data?.message || error.message || "خطا در ایجاد پرداخت";
    toast.error(paymentError.value);
    submitting.value = false;
  }
};

const copyIban = async () => {
  try {
    await navigator.clipboard.writeText(iban);
    toast.success("شماره شبا کپی شد");
  } catch (error) {
    console.error("Failed to copy IBAN:", error);
    toast.error("کپی شماره شبا انجام نشد");
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
</script>

<template>
  <UserPage title="پرداخت بدهی" main-class="w-full max-w-[1200px] mx-auto px-3 sm:px-4 pt-5 md:pt-8 pb-28 md:pb-8">
    <StateLoader
      v-if="loading"
      message="در حال آماده‌سازی اطلاعات پرداخت..."
    />

    <StateError
      v-else-if="loanDebtError"
      :message="loanDebtError"
      @retry="fetchPaymentPageData"
    />

    <div v-else class="space-y-3 md:space-y-5">
      <BaseCard class="!p-4 md:!p-6 bg-gradient-to-r from-red-500 to-red-600">
        <div class="text-white">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm opacity-90 mb-1">مبلغ کل</p>
              <div
                class="inline-flex flex-row-reverse items-baseline gap-1 text-3xl font-bold"
              >
                <span>{{ formatCurrency(positiveDebtTotal) }}</span>
                <span class="text-lg">ریال</span>
              </div>
            </div>
            <div class="text-left">
              <p class="text-sm opacity-90 mb-1">تسهیلات دارای بدهی</p>
              <p class="text-2xl font-bold">
                {{ formatNumber(positiveDebtLoans.length) }}
              </p>
            </div>
          </div>
        </div>
      </BaseCard>

      <template v-if="hasPayableLoans">
        <div
          class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-3 md:gap-4 items-start"
        >
          <div class="space-y-3 md:space-y-4">
            <BaseCard class="!p-4 md:!p-5">
              <div class="space-y-4">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">
                    انتخاب تسهیلات
                  </h3>
                </div>

                <div
                  v-if="positiveDebtLoans.length === 1 && selectedLoan"
                  class="rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div
                    class="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <p class="text-sm text-gray-500 mb-1">
                        تسهیلات دارای بدهی
                      </p>
                      <p class="text-lg font-bold text-gray-900" dir="ltr">
                        {{ selectedLoan.loanNumber }}
                      </p>
                    </div>
                    <div class="text-left">
                      <p class="text-sm text-gray-500 mb-1">بدهی فعلی</p>
                      <p class="text-lg font-bold text-gray-900">
                        {{ formatCurrency(selectedLoan.currentDebt, true) }}
                      </p>
                    </div>
                  </div>
                </div>

                <BaseSelect
                  v-else
                  v-model="selectedLoanIdModel"
                  label="تسهیلات موردنظر"
                  required
                  placeholder="تسهیلات دارای بدهی را انتخاب کنید"
                  :error="fieldErrors.selectedLoanId"
                  :options="
                    positiveDebtLoans.map((loan) => ({
                      value: loan.loanId,
                      label: `${loan.loanNumber} - ${formatCurrency(
                        loan.currentDebt,
                        true
                      )}`,
                    }))
                  "
                />
              </div>
            </BaseCard>

            <BaseCard class="!p-4 md:!p-5">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    مبلغ پرداخت (ریال):
                  </label>
                  <div class="flex flex-col sm:flex-row gap-3">
                    <div class="flex-1 relative">
                      <input
                        :value="amountInput.displayValue.value"
                        @input="(event) => amountInput.handleInput(event)"
                        @blur="normalizeAqayePardakhtAmount"
                        type="text"
                        inputmode="numeric"
                        placeholder="مبلغ را به ریال وارد کنید"
                        class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left"
                        :class="
                          fieldErrors.amount
                            ? 'border-red-500'
                            : 'border-gray-300'
                        "
                        dir="ltr"
                      />
                    </div>
                    <button
                      @click="
                        () => {
                          amountInput.setValue(positiveDebtTotal);
                          normalizeAqayePardakhtAmount();
                        }
                      "
                      class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors duration-200 whitespace-nowrap"
                    >
                      کل بدهی
                    </button>
                  </div>
                  <p
                    v-if="fieldErrors.amount"
                    class="mt-2 text-sm text-red-600"
                  >
                    {{ fieldErrors.amount }}
                  </p>
                </div>

                <div class="pt-4 border-t border-gray-100">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    توضیحات (اختیاری)
                  </label>
                  <textarea
                    v-model="description"
                    rows="3"
                    placeholder="توضیحات پرداخت"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  ></textarea>
                </div>
              </div>
            </BaseCard>

            <BaseCard class="!p-4 md:!p-5">
              <div class="mb-4">
                <div>
                  <h3 class="text-lg font-bold text-gray-900">
                    پیش‌نمایش تخصیص مبلغ پرداخت
                  </h3>
                </div>
              </div>

              <StateError
                v-if="allocationPreviewError"
                :message="allocationPreviewError"
                :retry="false"
              />

              <div
                v-else-if="isPreviewCurrent && allocationPreview"
                class="space-y-3"
              >
                <div
                  v-for="allocation in previewAllocations"
                  :key="`${allocation.loanId}-${allocation.allocationOrder}`"
                  :class="[
                    'rounded-xl border p-4',
                    allocation.allocationType === 'SELECTED_LOAN'
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-gray-200 bg-white',
                  ]"
                >
                  <div
                    class="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4"
                  >
                    <div>
                      <div class="flex items-center gap-2">
                        <p class="text-lg font-bold text-gray-900" dir="ltr">
                          {{ allocation.loanNumber }}
                        </p>
                        <BaseBadge
                          v-if="allocation.allocationType === 'SELECTED_LOAN'"
                          variant="primary"
                        >
                          انتخاب‌شده
                        </BaseBadge>
                      </div>
                    </div>

                    <div class="text-left">
                      <p class="text-lg font-bold text-primary">
                        {{ formatCurrency(allocation.allocatedAmount, true) }}
                      </p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div
                      class="rounded-lg bg-gray-50 border border-gray-200 px-3 py-3"
                    >
                      <p class="text-xs text-gray-500 mb-1">مبلغ بدهی فعلی</p>
                      <p class="font-bold text-gray-900">
                        {{
                          formatCurrency(
                            allocation.currentDebtBeforeAllocation,
                            true
                          )
                        }}
                      </p>
                    </div>
                    <div
                      class="rounded-lg bg-gray-50 border border-gray-200 px-3 py-3"
                    >
                      <p class="text-xs text-gray-500 mb-1">
                        باقی‌مانده بعد از پرداخت
                      </p>
                      <p class="font-bold text-gray-900">
                        {{
                          formatCurrency(
                            allocation.currentDebtAfterAllocation,
                            true
                          )
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="py-3 text-sm text-gray-500">
                {{ previewHint }}
              </div>
            </BaseCard>
          </div>

          <div class="space-y-3 md:space-y-4">
            <BaseCard class="!p-4 md:!p-5 bg-blue-50 border-blue-200 !pr-3">
              <div class="flex items-start gap-1">
                <IconsOutline name="information-circle" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div class="text-blue-900 w-full space-y-2 leading-7">
                  <p class="font-semibold">
                    مشتری گرامی به دلیل اختلالات بستر پرداخت، در صورت خطای
                    درگاه می‌توانید مبلغ موردنظر را به شماره شبای:
                  </p>
                  <div
                    class="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between gap-3"
                  >
                    <div
                      class="text-base md:text-lg tracking-wide text-gray-900 font-semibold"
                      dir="ltr"
                    >
                      {{ iban }}
                    </div>
                    <button
                      type="button"
                      @click="copyIban"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Icon name="mdi:content-copy" size="16" />
                      کپی
                    </button>
                  </div>
                  <p>
                    به نام شرکت
                    <span class="font-semibold">"عماد نماد اعتماد"</span> نزد
                    بانک رفاه، واریز نموده و رسید واریز را در شبکه اجتماعی بله
                    برای شماره زیر ارسال نمایید:
                  </p>
                  <div class="text-lg font-bold text-gray-900" dir="ltr">
                    09905036181
                  </div>
                  <p class="font-semibold text-blue-800">
                    با تشکر - عماد ایران
                  </p>
                </div>
              </div>
            </BaseCard>

            <BaseCard class="!p-4 md:!p-5 bg-gray-50">
              <h3 class="text-sm font-bold text-gray-900 mb-3">
                انتخاب درگاه پرداخت:
              </h3>

              <StateEmpty
                v-if="gateways.length === 0"
                icon="document"
                message="هیچ درگاه فعالی یافت نشد"
              />

              <div v-else class="space-y-2">
                <label
                  v-for="gateway in gateways"
                  :key="gateway.name"
                  :class="[
                    'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                    selectedGateway === gateway.name
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-primary/50 bg-white',
                  ]"
                >
                  <input
                    type="radio"
                    :value="gateway.name"
                    v-model="selectedGateway"
                    class="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <Icon
                    name="mdi:credit-card"
                    size="20"
                    :class="
                      selectedGateway === gateway.name
                        ? 'text-primary'
                        : 'text-gray-400'
                    "
                  />
                  <span
                    :class="
                      selectedGateway === gateway.name
                        ? 'text-primary font-bold'
                        : 'text-gray-700'
                    "
                  >
                    {{ gateway.displayName }}
                  </span>
                </label>
              </div>
            </BaseCard>

            <BaseCard class="!p-4 md:!p-5 bg-blue-50 border-blue-200">
              <div class="space-y-3">
                <h3
                  v-if="amountInput.numericValue.value > 0 && selectedLoan"
                  class="font-bold text-gray-900"
                >
                  خلاصه پرداخت
                </h3>

                <div
                  v-if="amountInput.numericValue.value > 0 && selectedLoan"
                  class="space-y-2"
                >
                  <div class="flex justify-between text-sm gap-4">
                    <span class="text-gray-600">تسهیلات:</span>
                    <span class="font-bold" dir="ltr">
                      {{ selectedLoan.loanNumber }}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm gap-4">
                    <span class="text-gray-600">مبلغ:</span>
                    <span class="font-bold">
                      {{ formatCurrency(amountInput.rawValue.value, true) }}
                    </span>
                  </div>
                  <div
                    v-if="selectedGatewayDisplayName"
                    class="flex justify-between text-sm gap-4"
                  >
                    <span class="text-gray-600">درگاه:</span>
                    <span class="font-bold">{{
                      selectedGatewayDisplayName
                    }}</span>
                  </div>
                  <div
                    v-if="description"
                    class="flex justify-between text-sm gap-4"
                  >
                    <span class="text-gray-600">توضیحات:</span>
                    <span class="font-bold">{{ description }}</span>
                  </div>
                </div>

                <StateError
                  v-if="paymentError"
                  :message="paymentError"
                  :retry="false"
                />

                <div class="hidden md:block">
                  <button
                    @click="handlePayment"
                    :disabled="!canSubmitPayment"
                    :class="[
                      'w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2',
                      canSubmitPayment
                        ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed',
                    ]"
                  >
                    <Icon
                      v-if="submitting"
                      name="mdi:loading"
                      size="24"
                      class="animate-spin"
                    />
                    <Icon v-else name="mdi:credit-card-check" size="24" />
                    {{ submitting ? "در حال انتقال..." : "پرداخت" }}
                  </button>

                  <p
                    v-if="!isPreviewCurrent"
                    class="text-sm text-center text-gray-500 mt-3"
                  >
                    ابتدا پیش‌نمایش تخصیص مبلغ را بررسی کنید.
                  </p>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </template>
    </div>

    <template #overlays>
      <div
        v-if="!loading && !loanDebtError && hasPayableLoans"
        class="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-3 py-3 shadow-[0_-8px_24px_rgba(15,48,87,0.08)]"
      >
        <button
          @click="handlePayment"
          :disabled="!canSubmitPayment"
          :class="[
            'w-full py-3.5 rounded-lg font-bold text-base transition-all duration-200 flex items-center justify-center gap-2',
            canSubmitPayment
              ? 'bg-gradient-to-r from-primary to-accent text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed',
          ]"
        >
          <Icon
            v-if="submitting"
            name="mdi:loading"
            size="22"
            class="animate-spin"
          />
          <Icon v-else name="mdi:credit-card-check" size="22" />
          {{ submitting ? "در حال انتقال..." : "پرداخت" }}
        </button>
      </div>
    </template>
  </UserPage>
</template>
