import moment from "jalali-moment";
import { adminApi } from "~/services/api/admin";
import { useToast } from "~/composables/useToast";
import { useApiCall } from "~/composables/useApiCall";
import { formatDate } from "~/utils/formatters";
import { convertJalaliDateToIso, isValidJalaliDate } from "~/func/GenerateDate";
import type { PaymentDeadline, PaymentDeadlinesMeta } from "~/types/admin";

/**
 * Payment deadline state of a user and the flow between its list, create and edit modals.
 */
export const usePaymentDeadlines = (userId: number) => {
  const toast = useToast();
  const { execute } = useApiCall();

  const currentPaymentDeadline = ref<PaymentDeadline | null>(null);
  const isLoadingPaymentDeadline = ref(false);
  const showPaymentDeadlinesModal = ref(false);
  const paymentDeadlines = ref<PaymentDeadline[]>([]);
  const paymentDeadlinesMeta = ref<PaymentDeadlinesMeta>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const isLoadingPaymentDeadlines = ref(false);
  const paymentDeadlinesError = ref<string | null>(null);
  const paymentDeadlinesPage = ref(1);
  const paymentDeadlinesLimit = ref(10);
  const showCreatePaymentDeadlineModal = ref(false);
  const showEditPaymentDeadlineModal = ref(false);
  const selectedPaymentDeadline = ref<PaymentDeadline | null>(null);
  const createPaymentDeadlineForm = ref({
    deadlineAt: "",
  });
  const createPaymentDeadlineErrors = ref<{ deadlineAt?: string }>({});
  const isSubmittingPaymentDeadline = ref(false);
  const editPaymentDeadlineForm = ref({
    deadlineAt: "",
    editReason: "",
  });
  const editPaymentDeadlineErrors = ref<{
    deadlineAt?: string;
    editReason?: string;
  }>({});
  const isSubmittingEditPaymentDeadline = ref(false);

  const paymentDeadlineLabel = computed(() => {
    if (isLoadingPaymentDeadline.value) {
      return "در حال بارگذاری مهلت پرداخت...";
    }
    if (currentPaymentDeadline.value?.deadlineAt) {
      return `مهلت پرداخت: ${formatDate(
        currentPaymentDeadline.value.deadlineAt
      )}`;
    }
    return "ثبت مهلت پرداخت";
  });

  const fetchCurrentPaymentDeadline = async () => {
    try {
      isLoadingPaymentDeadline.value = true;
      const response = await adminApi.getCurrentPaymentDeadline(userId);
      currentPaymentDeadline.value = response.data;
    } catch (err: any) {
      currentPaymentDeadline.value = null;
    } finally {
      isLoadingPaymentDeadline.value = false;
    }
  };

  const fetchPaymentDeadlines = async () => {
    try {
      isLoadingPaymentDeadlines.value = true;
      paymentDeadlinesError.value = null;
      const offset =
        (paymentDeadlinesPage.value - 1) * paymentDeadlinesLimit.value;
      const response = await adminApi.getPaymentDeadlines(
        userId,
        paymentDeadlinesLimit.value,
        offset
      );
      paymentDeadlines.value = response.data.items;
      paymentDeadlinesMeta.value = response.data.meta;
    } catch (err: any) {
      paymentDeadlinesError.value =
        err.data?.message || "خطا در دریافت لیست مهلت‌ها";
    } finally {
      isLoadingPaymentDeadlines.value = false;
    }
  };

  const openPaymentDeadlinesModal = () => {
    paymentDeadlinesPage.value = 1;
    showPaymentDeadlinesModal.value = true;
    fetchPaymentDeadlines();
  };

  const closePaymentDeadlinesModal = () => {
    showPaymentDeadlinesModal.value = false;
  };

  const handlePaymentDeadlinesPageChange = (page: number) => {
    paymentDeadlinesPage.value = page;
    fetchPaymentDeadlines();
  };

  const openCreatePaymentDeadlineModal = () => {
    if (currentPaymentDeadline.value) {
      toast.error("مهلت فعال وجود دارد و امکان ثبت مهلت جدید نیست");
      return;
    }
    createPaymentDeadlineForm.value.deadlineAt = "";
    createPaymentDeadlineErrors.value = {};
    showPaymentDeadlinesModal.value = false;
    showCreatePaymentDeadlineModal.value = true;
  };

  const openEditPaymentDeadlineModal = (deadline: PaymentDeadline) => {
    selectedPaymentDeadline.value = deadline;
    editPaymentDeadlineForm.value.deadlineAt = moment(deadline.deadlineAt)
      .locale("en")
      .format("YYYY-MM-DD");
    editPaymentDeadlineForm.value.editReason = "";
    editPaymentDeadlineErrors.value = {};
    showPaymentDeadlinesModal.value = false;
    showEditPaymentDeadlineModal.value = true;
  };

  const closeCreatePaymentDeadlineModal = () => {
    showCreatePaymentDeadlineModal.value = false;
    createPaymentDeadlineForm.value.deadlineAt = "";
    createPaymentDeadlineErrors.value = {};
    showPaymentDeadlinesModal.value = true;
    fetchPaymentDeadlines();
  };

  const setCreatePaymentDeadlineErrorsFromBackend = (message: string) => {
    const normalized = (message || "").toLowerCase();
    if (normalized.includes("date") || normalized.includes("تاریخ")) {
      createPaymentDeadlineErrors.value.deadlineAt = message;
    }
  };

  const validatePaymentDeadlineDate = (value: string) => {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return { isValid: false, error: "تاریخ مهلت الزامی است" };
    }

    if (!isValidJalaliDate(trimmed)) {
      return { isValid: false, error: "تاریخ مهلت معتبر نیست" };
    }

    const iso = convertJalaliDateToIso(trimmed);
    if (!iso) {
      return { isValid: false, error: "تاریخ مهلت معتبر نیست" };
    }

    const deadlineTime = new Date(iso).getTime();
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);

    if (deadlineTime < todayUtc.getTime()) {
      return { isValid: false, error: "تاریخ مهلت نمی‌تواند گذشته باشد" };
    }

    return { isValid: true, iso };
  };

  const editPaymentDeadlineDateDisplay = computed(() => {
    if (!editPaymentDeadlineForm.value.deadlineAt) return "";

    const jalaliDate = moment(
      editPaymentDeadlineForm.value.deadlineAt,
      "YYYY-MM-DD",
      true
    );

    if (jalaliDate.isValid()) {
      return jalaliDate.locale("fa").format("jYYYY/jMM/jDD");
    }

    return editPaymentDeadlineForm.value.deadlineAt;
  });

  const handleEditPaymentDeadlineDateChange = (value: string) => {
    editPaymentDeadlineForm.value.deadlineAt = value || "";
    editPaymentDeadlineErrors.value.deadlineAt = undefined;
  };

  const handleCreatePaymentDeadline = async () => {
    createPaymentDeadlineErrors.value = {};

    if (currentPaymentDeadline.value) {
      toast.error("مهلت فعال وجود دارد و امکان ثبت مهلت جدید نیست");
      return;
    }

    const validation = validatePaymentDeadlineDate(
      createPaymentDeadlineForm.value.deadlineAt
    );
    if (!validation.isValid) {
      createPaymentDeadlineErrors.value.deadlineAt = validation.error;
      toast.error(validation.error || "لطفاً خطاهای فرم را برطرف کنید");
      return;
    }

    isSubmittingPaymentDeadline.value = true;

    await execute(
      () =>
        adminApi.createPaymentDeadline(userId, {
          deadlineAt: validation.iso as string,
        }),
      {
        successMessage: "مهلت پرداخت با موفقیت ثبت شد",
        onError: (err) => {
          const message =
            err?.data?.message || err?.message || "خطا در ثبت مهلت پرداخت";
          setCreatePaymentDeadlineErrorsFromBackend(message);
        },
        onSuccess: async () => {
          closeCreatePaymentDeadlineModal();
          await fetchCurrentPaymentDeadline();
        },
      }
    );

    isSubmittingPaymentDeadline.value = false;
  };

  const closeEditPaymentDeadlineModal = () => {
    showEditPaymentDeadlineModal.value = false;
    editPaymentDeadlineForm.value.deadlineAt = "";
    editPaymentDeadlineForm.value.editReason = "";
    editPaymentDeadlineErrors.value = {};
    selectedPaymentDeadline.value = null;
    showPaymentDeadlinesModal.value = true;
    fetchPaymentDeadlines();
  };

  const setEditPaymentDeadlineErrorsFromBackend = (message: string) => {
    const normalized = (message || "").toLowerCase();
    if (normalized.includes("date") || normalized.includes("تاریخ")) {
      editPaymentDeadlineErrors.value.deadlineAt = message;
    }
    if (normalized.includes("reason") || normalized.includes("دلیل")) {
      editPaymentDeadlineErrors.value.editReason = message;
    }
  };

  const handleEditPaymentDeadline = async () => {
    editPaymentDeadlineErrors.value = {};

    if (!selectedPaymentDeadline.value) {
      toast.error("مهلت پرداخت برای ویرایش انتخاب نشده است");
      return;
    }

    const reason = (editPaymentDeadlineForm.value.editReason || "").trim();
    if (!reason) {
      editPaymentDeadlineErrors.value.editReason = "دلیل ویرایش الزامی است";
      toast.error("دلیل ویرایش الزامی است");
      return;
    }

    const validation = validatePaymentDeadlineDate(
      editPaymentDeadlineForm.value.deadlineAt
    );
    if (!validation.isValid) {
      editPaymentDeadlineErrors.value.deadlineAt = validation.error;
      toast.error(validation.error || "لطفاً خطاهای فرم را برطرف کنید");
      return;
    }

    isSubmittingEditPaymentDeadline.value = true;

    await execute(
      () =>
        adminApi.updatePaymentDeadline(
          userId,
          selectedPaymentDeadline.value!.id,
          {
            deadlineAt: validation.iso as string,
            editReason: reason,
          }
        ),
      {
        successMessage: "مهلت پرداخت با موفقیت ویرایش شد",
        onError: (err) => {
          const message =
            err?.data?.message || err?.message || "خطا در ویرایش مهلت پرداخت";
          setEditPaymentDeadlineErrorsFromBackend(message);
        },
        onSuccess: async () => {
          closeEditPaymentDeadlineModal();
          await fetchCurrentPaymentDeadline();
        },
      }
    );

    isSubmittingEditPaymentDeadline.value = false;
  };

  return {
    currentPaymentDeadline,
    isLoadingPaymentDeadline,
    paymentDeadlineLabel,
    showPaymentDeadlinesModal,
    paymentDeadlines,
    paymentDeadlinesMeta,
    paymentDeadlinesPage,
    paymentDeadlinesLimit,
    isLoadingPaymentDeadlines,
    paymentDeadlinesError,
    showCreatePaymentDeadlineModal,
    createPaymentDeadlineForm,
    createPaymentDeadlineErrors,
    isSubmittingPaymentDeadline,
    showEditPaymentDeadlineModal,
    editPaymentDeadlineForm,
    editPaymentDeadlineErrors,
    editPaymentDeadlineDateDisplay,
    isSubmittingEditPaymentDeadline,
    fetchCurrentPaymentDeadline,
    openPaymentDeadlinesModal,
    closePaymentDeadlinesModal,
    handlePaymentDeadlinesPageChange,
    openCreatePaymentDeadlineModal,
    closeCreatePaymentDeadlineModal,
    handleCreatePaymentDeadline,
    openEditPaymentDeadlineModal,
    closeEditPaymentDeadlineModal,
    handleEditPaymentDeadlineDateChange,
    handleEditPaymentDeadline,
  };
};
