<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { adminApi } from "~/services/api/admin";
import { transactionsApi } from "~/services/api/transactions";
import { loansApi } from "~/services/api/loans";
import { useToast } from "~/composables/useToast";
import { useConfirm } from "~/composables/useConfirm";
import { useApiCall } from "~/composables/useApiCall";
import { useCurrencyInput } from "~/composables/useCurrencyInput";
import { formatDate, formatNumber, formatCurrency } from "~/utils/formatters";
import { getUserDisplayName } from "~/func/getUserDisplayName";
import {
  validateDebtForm,
  ADD_DEBT_TRANSACTION_TYPES,
  getTransactionTypeLabel,
} from "~/utils/adminTransactionPayload";
import { convertJalaliDateToIso, isValidJalaliDate } from "~/func/GenerateDate";
import PaymentDeadlinesModal from "~/components/Admin/payment-deadlines/PaymentDeadlinesModal.vue";
import PaymentDeadlineCreateModal from "~/components/Admin/payment-deadlines/PaymentDeadlineCreateModal.vue";
import PaymentDeadlineEditModal from "~/components/Admin/payment-deadlines/PaymentDeadlineEditModal.vue";
import ContactHistoriesModal from "~/components/Admin/contact-histories/ContactHistoriesModal.vue";
import ContactHistoryCreateModal from "~/components/Admin/contact-histories/ContactHistoryCreateModal.vue";
import moment from "jalali-moment";
import type { LoanListItem } from "~/types/loan";
import type {
  PaymentDeadline,
  PaymentDeadlinesMeta,
  ContactHistoryItem,
  ContactHistoriesMeta,
} from "~/types/admin";
import type { LoanDebtBreakdown } from "~/types/debt";
import type { DebtTransactionType, Transaction } from "~/types/transaction";
import type { TableColumn } from "~/components/Base/Table.vue";
import { getTransactionAllocations } from "~/utils/transactionAllocations";

useHead({
  title: "جزئیات کاربر - عماد ایران",
});

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { confirm } = useConfirm();
const { execute } = useApiCall();

// Check if user is admin
if (!authStore.isAdmin) {
  router.push("/dashboard");
}

const userId = parseInt(route.params.id as string);

// Currency input for debt amount
const debtAmountInput = useCurrencyInput();

// State
const user = ref<any>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const loanDebtBreakdown = ref<LoanDebtBreakdown | null>(null);
const isLoadingLoanDebtBreakdown = ref(false);
const loanDebtBreakdownError = ref<string | null>(null);
const userTransactions = ref<Transaction[]>([]);
const isLoadingTransactions = ref(false);
const transactionsError = ref<string | null>(null);
const transactionsPage = ref(1);
const transactionsLimit = 10;
const transactionsTotal = ref(0);
const expandedTransactionId = ref<number | null>(null);

const canExpandTransaction = (transaction: any) =>
  getTransactionAllocations(transaction).length > 0;

const toggleTransactionDetails = (transactionId: number) => {
  expandedTransactionId.value =
    expandedTransactionId.value === transactionId ? null : transactionId;
};

const transactionColumns: TableColumn<Transaction>[] = [
  { key: "id", label: "شناسه", align: "center" },
  { key: "amount", label: "مبلغ", align: "center" },
  { key: "type", label: "نوع", align: "center" },
  { key: "allocationSummary", label: "جزئیات تسهیلات", align: "center" },
  { key: "status", label: "وضعیت", align: "center" },
  { key: "transactionDate", label: "تاریخ", align: "center" },
  {
    key: "description",
    label: "توضیحات",
    align: "center",
    class: "whitespace-normal"
  }
];

const getTransactionTypeBadge = (type: string) => {
  const badges = {
    DEBT_PAYMENT: { text: "پرداخت", variant: "success" },
    ADMIN_DEBT_ADD: { text: "افزایش بدهی", variant: "danger" },
    LEGAL_DEBT_ADD: { text: "افزایش بدهی حقوقی", variant: "danger" },
    ADMIN_DEBT_REDUCE: { text: "کاهش بدهی", variant: "warning" }
  };

  return badges[type as keyof typeof badges] || { text: type, variant: "default" };
};

const getTransactionStatusBadge = (status: string) => {
  const badges = {
    SUCCESS: { text: "موفق", variant: "success" },
    FAILED: { text: "ناموفق", variant: "danger" },
    PENDING: { text: "در انتظار", variant: "gray" }
  };

  return badges[status as keyof typeof badges] || { text: status, variant: "default" };
};

// Debt Modal State
const showDebtModal = ref(false);
const debtModalType = ref<"add" | "reduce">("add");
const debtForm = ref({
  loanId: undefined as number | undefined,
  newLoanNumber: "",
  description: "",
  sendSms: true,
  transactionType: "" as DebtTransactionType | "",
  transactionDate: "",
});
const debtFieldErrors = ref<{
  amount?: string;
  transactionType?: string;
  transactionDate?: string;
  loanId?: string;
  newLoanNumber?: string;
}>({});
const isSubmittingDebt = ref(false);
const loans = ref<LoanListItem[]>([]);
const isLoadingLoans = ref(false);
const showLoanWarning = ref(false);
const showNewLoanInput = ref(false);

// Payment Deadline State
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

// Contact Histories State
const showContactHistoriesModal = ref(false);
const showCreateContactHistoryModal = ref(false);
const contactHistories = ref<ContactHistoryItem[]>([]);
const contactHistoriesMeta = ref<ContactHistoriesMeta>({
  total: 0,
  limit: 10,
  offset: 0,
  hasMore: false,
});
const contactHistoriesLimit = ref(10);
const contactHistoriesOffset = ref(0);
const isLoadingContactHistories = ref(false);
const isLoadingMoreContactHistories = ref(false);
const contactHistoriesError = ref<string | null>(null);
const createContactHistoryForm = ref({
  description: "",
});
const createContactHistoryErrors = ref<{ description?: string }>({});
const isSubmittingContactHistory = ref(false);

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

const fetchUserLoanDebtBreakdown = async () => {
  try {
    isLoadingLoanDebtBreakdown.value = true;
    loanDebtBreakdownError.value = null;
    loanDebtBreakdown.value = await adminApi.getUserLoanDebts(userId);
  } catch (err: any) {
    console.error("Error fetching user loan debts:", err);
    loanDebtBreakdown.value = null;
    loanDebtBreakdownError.value =
      err.data?.message || "خطا در دریافت جزئیات بدهی تسهیلات";
  } finally {
    isLoadingLoanDebtBreakdown.value = false;
  }
};

const fetchUserTransactions = async () => {
  try {
    isLoadingTransactions.value = true;
    transactionsError.value = null;
    expandedTransactionId.value = null;

    const offset = (transactionsPage.value - 1) * transactionsLimit;
    const response = await transactionsApi.getTransactions({
      userId,
      limit: transactionsLimit,
      offset,
    });

    userTransactions.value = response.data.data || response.data.items || [];
    transactionsTotal.value = response.data.meta?.total || response.data.total || 0;
  } catch (err: any) {
    console.error("Error fetching user transactions:", err);
    userTransactions.value = [];
    transactionsTotal.value = 0;
    transactionsError.value =
      err.data?.message || err.message || "خطا در دریافت تاریخچه تراکنش‌ها";
  } finally {
    isLoadingTransactions.value = false;
  }
};

const handleTransactionsPageChange = (page: number) => {
  transactionsPage.value = page;
  fetchUserTransactions();
};

// Fetch user details
const fetchUserDetails = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    loanDebtBreakdownError.value = null;
    user.value = await adminApi.getUserById(userId);
    await fetchUserLoanDebtBreakdown();
  } catch (err: any) {
    error.value = err.data?.message || "خطا در دریافت اطلاعات کاربر";
    console.error("Error fetching user:", err);
  } finally {
    isLoading.value = false;
  }
};

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

// Fetch loans for user
const fetchUserLoans = async () => {
  try {
    isLoadingLoans.value = true;
    showLoanWarning.value = false;
    showNewLoanInput.value = false;
    loans.value = [];
    debtForm.value.loanId = undefined;

    const response = await loansApi.getUserLoans(userId);
    loans.value = response.data;

    if (loans.value.length === 0) {
      // نمایش input برای ایجاد تسهیلات جدید
      showLoanWarning.value = true;
      showNewLoanInput.value = true;
    }
  } catch (err: any) {
    console.error("Error fetching loans:", err);
    toast.error("خطا در دریافت لیست تسهیلات");
  } finally {
    isLoadingLoans.value = false;
  }
};

// Format loan option for display
const formatLoanOption = (loan: LoanListItem) => {
  return loan.loanNumber;
};

// Create loan for user
const createLoanForUser = async () => {
  if (!debtForm.value.newLoanNumber.trim()) {
    toast.error("لطفاً شماره تسهیلات را وارد کنید");
    return false;
  }

  try {
    isLoadingLoans.value = true;
    const response = await loansApi.createLoan({
      userId: userId,
      loanNumber: debtForm.value.newLoanNumber.trim(),
    });
    toast.success("تسهیلات جدید با موفقیت ایجاد شد");
    await fetchUserLoans();
    return true;
  } catch (err: any) {
    console.error("Error creating loan:", err);
    toast.error(err.data?.message || err.message || "خطا در ایجاد تسهیلات");
    return false;
  } finally {
    isLoadingLoans.value = false;
  }
};

// Toggle new loan input
const toggleNewLoanInput = () => {
  showNewLoanInput.value = !showNewLoanInput.value;
  if (showNewLoanInput.value) {
    debtForm.value.loanId = undefined;
    debtForm.value.newLoanNumber = "";
  } else {
    debtForm.value.newLoanNumber = "";
    debtForm.value.loanId = undefined;
  }
};

// Toggle status
const handleToggleStatus = async () => {
  if (!user.value) return;

  // Prevent toggling admin users
  if (user.value.role === "ADMIN") {
    toast.error("امکان تغییر وضعیت مدیران وجود ندارد");
    return;
  }

  // Confirm action
  const action = user.value.isActive ? "غیرفعال" : "فعال";
  const confirmed = await confirm({
    message: `آیا از ${action} کردن کاربر "${getUserDisplayName(
      user.value
    )}" اطمینان دارید؟`,
    type: "warning",
  });

  if (!confirmed) return;

  await execute(() => adminApi.toggleUserStatus(userId), {
    successMessage: `وضعیت کاربر با موفقیت ${action} شد`,
    onSuccess: () => fetchUserDetails(),
  });
};

// Open debt modal and fetch loans
const openDebtModal = async (type: "add" | "reduce") => {
  debtModalType.value = type;
  debtForm.value.transactionType =
    type === "add" ? "" : "ADMIN_DEBT_REDUCE";
  debtForm.value.sendSms = true;
  debtFieldErrors.value = {};
  showDebtModal.value = true;
  await fetchUserLoans();
};

const setDebtFieldErrorsFromBackend = (message: string) => {
  const normalized = (message || "").toLowerCase();

  if (normalized.includes("amount") || normalized.includes("مبلغ")) {
    debtFieldErrors.value.amount = message;
  }

  if (normalized.includes("type") || normalized.includes("نوع")) {
    debtFieldErrors.value.transactionType = message;
  }

  if (normalized.includes("date") || normalized.includes("تاریخ")) {
    debtFieldErrors.value.transactionDate = message;
  }

  if (normalized.includes("loan") || normalized.includes("تسهیلات")) {
    debtFieldErrors.value.loanId = message;
  }
};

// Handle Debt Management
const handleDebtSubmit = async () => {
  debtFieldErrors.value = {};

  if (
    !debtAmountInput.rawValue.value ||
    debtAmountInput.numericValue.value <= 0
  ) {
    debtFieldErrors.value.amount = "لطفاً مبلغ معتبری وارد کنید";
    toast.error("لطفاً مبلغ معتبری وارد کنید");
    return;
  }

  const validation = validateDebtForm({
    amount: debtAmountInput.numericValue.value,
    type: debtForm.value.transactionType,
    jalaliDate: debtForm.value.transactionDate,
  });

  if (!validation.isValid) {
    debtFieldErrors.value = { ...debtFieldErrors.value, ...validation.errors };
    toast.error("لطفاً خطاهای فرم را برطرف کنید");
    return;
  }

  // Validation for new loan mode
  if (showNewLoanInput.value && !debtForm.value.newLoanNumber.trim()) {
    debtFieldErrors.value.newLoanNumber = "لطفاً شماره تسهیلات را وارد کنید";
    toast.error("لطفاً شماره تسهیلات را وارد کنید");
    return;
  }

  // Validation for select loan mode
  if (
    !showNewLoanInput.value &&
    !debtForm.value.loanId &&
    loans.value.length > 0
  ) {
    debtFieldErrors.value.loanId = "لطفاً یک تسهیلات انتخاب کنید";
    toast.error("لطفاً یک تسهیلات انتخاب کنید");
    return;
  }

  if (debtModalType.value === "reduce") {
    debtForm.value.transactionType = "ADMIN_DEBT_REDUCE";
    const maxDebt = parseInt(user.value?.totalDebt || "0");
    if (debtAmountInput.numericValue.value > maxDebt) {
      const debtSafetyMessage = `مبلغ کاهش نمی‌تواند بیشتر از بدهی فعلی (${maxDebt.toLocaleString(
        "fa-IR"
      )} ریال) باشد`;
      debtFieldErrors.value.amount = debtSafetyMessage;
      toast.error(debtSafetyMessage);
      return;
    }
  }

  const confirmMessage =
    debtModalType.value === "add"
      ? `آیا از افزودن ${formatCurrency(
          debtAmountInput.rawValue.value
        )} ریال به بدهی کاربر (${getTransactionTypeLabel(
          debtForm.value.transactionType as DebtTransactionType
        )}) اطمینان دارید؟`
      : `آیا از کاهش ${formatCurrency(
          debtAmountInput.rawValue.value
        )} ریال از بدهی کاربر اطمینان دارید؟`;

  const confirmed = await confirm({
    message: confirmMessage,
    type: debtModalType.value === "add" ? "warning" : "info",
  });

  if (!confirmed) return;

  isSubmittingDebt.value = true;

  if (showNewLoanInput.value) {
    const loanCreated = await createLoanForUser();
    if (!loanCreated) {
      isSubmittingDebt.value = false;
      return;
    }
    debtForm.value.loanId = loans.value[0]?.id;
  }

  const apiCall =
    debtModalType.value === "add"
      ? () =>
          adminApi.addDebt(
            userId,
            debtAmountInput.rawValue.value,
            debtForm.value.description,
            debtForm.value.loanId,
            debtForm.value.transactionType === "LEGAL_DEBT_ADD"
              ? "LEGAL_DEBT_ADD"
              : "ADMIN_DEBT_ADD",
            validation.transactionDateIso,
            debtForm.value.sendSms
          )
      : () =>
          adminApi.reduceDebt(
            userId,
            debtAmountInput.rawValue.value,
            debtForm.value.description,
            debtForm.value.loanId,
            "ADMIN_DEBT_REDUCE",
            validation.transactionDateIso,
            debtForm.value.sendSms
          );

  const { success } = await execute(apiCall, {
    successMessage:
      debtModalType.value === "add"
        ? "بدهی با موفقیت افزوده شد"
        : "بدهی با موفقیت کاهش یافت",
    onError: (err) => {
      const message = err?.data?.message || err?.message || "خطا در ثبت تراکنش";
      setDebtFieldErrorsFromBackend(message);
    },
    onSuccess: () => {
      closeDebtModal();
      fetchUserDetails();
      fetchUserTransactions();
    },
  });

  isSubmittingDebt.value = false;
};

const closeDebtModal = () => {
  showDebtModal.value = false;
  debtAmountInput.clear();
  debtForm.value = {
    loanId: undefined,
    newLoanNumber: "",
    description: "",
    sendSms: true,
    transactionType: "",
    transactionDate: "",
  };
  debtFieldErrors.value = {};
  loans.value = [];
  showLoanWarning.value = false;
  showNewLoanInput.value = false;
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

const resetContactHistoriesPagination = () => {
  contactHistoriesOffset.value = 0;
  contactHistoriesMeta.value = {
    total: 0,
    limit: contactHistoriesLimit.value,
    offset: 0,
    hasMore: false,
  };
};

const fetchContactHistories = async (append = false) => {
  if (append) {
    isLoadingMoreContactHistories.value = true;
  } else {
    isLoadingContactHistories.value = true;
    contactHistoriesError.value = null;
    resetContactHistoriesPagination();
  }

  try {
    const response = await adminApi.getContactHistories(
      userId,
      contactHistoriesLimit.value,
      contactHistoriesOffset.value
    );

    if (append) {
      contactHistories.value = [
        ...contactHistories.value,
        ...response.data.items,
      ];
    } else {
      contactHistories.value = response.data.items;
    }

    contactHistoriesMeta.value = response.data.meta;
  } catch (err: any) {
    contactHistoriesError.value =
      err?.data?.message || err?.message || "خطا در دریافت تاریخچه تماس";
  } finally {
    isLoadingContactHistories.value = false;
    isLoadingMoreContactHistories.value = false;
  }
};

const openContactHistoriesModal = () => {
  showContactHistoriesModal.value = true;
  fetchContactHistories();
};

const closeContactHistoriesModal = () => {
  showContactHistoriesModal.value = false;
};

const handleLoadMoreContactHistories = () => {
  if (
    !contactHistoriesMeta.value.hasMore ||
    isLoadingMoreContactHistories.value
  )
    return;
  contactHistoriesOffset.value =
    contactHistoriesMeta.value.offset + contactHistoriesMeta.value.limit;
  fetchContactHistories(true);
};

const openCreateContactHistoryModal = () => {
  createContactHistoryForm.value.description = "";
  createContactHistoryErrors.value = {};
  showContactHistoriesModal.value = false;
  showCreateContactHistoryModal.value = true;
};

const closeCreateContactHistoryModal = () => {
  showCreateContactHistoryModal.value = false;
  createContactHistoryForm.value.description = "";
  createContactHistoryErrors.value = {};
  showContactHistoriesModal.value = true;
  fetchContactHistories();
};

const validateContactHistoryDescription = (value: string) => {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return { isValid: false, error: "توضیحات الزامی است" };
  }
  if (trimmed.length > 2000) {
    return { isValid: false, error: "حداکثر طول توضیحات 2000 کاراکتر است" };
  }
  return { isValid: true, value: trimmed };
};

const setCreateContactHistoryErrorsFromBackend = (message: string) => {
  const normalized = (message || "").toLowerCase();
  if (normalized.includes("description") || normalized.includes("توضیح")) {
    createContactHistoryErrors.value.description = message;
  }
};

const handleCreateContactHistory = async () => {
  createContactHistoryErrors.value = {};

  const validation = validateContactHistoryDescription(
    createContactHistoryForm.value.description
  );
  if (!validation.isValid) {
    createContactHistoryErrors.value.description = validation.error;
    toast.error(validation.error || "لطفاً خطاهای فرم را برطرف کنید");
    return;
  }

  isSubmittingContactHistory.value = true;

  await execute(
    () =>
      adminApi.createContactHistory(userId, {
        description: validation.value as string,
      }),
    {
      successMessage: "تماس با موفقیت ثبت شد",
      onError: (err) => {
        const message = err?.data?.message || err?.message || "خطا در ثبت تماس";
        setCreateContactHistoryErrorsFromBackend(message);
      },
      onSuccess: () => {
        closeCreateContactHistoryModal();
      },
    }
  );

  isSubmittingContactHistory.value = false;
};

// Load user on mount
onMounted(() => {
  fetchUserDetails();
  fetchCurrentPaymentDeadline();
  fetchUserTransactions();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <!-- Header -->
    <AdminHeader title="جزئیات کاربر" />

    <!-- Main Content -->
    <main class="max-w-[1330px] mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div
          class="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="text-gray-600 mt-4">در حال بارگذاری...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
      >
        <svg
          class="w-12 h-12 text-red-500 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-red-600 font-medium">{{ error }}</p>
        <button
          @click="fetchUserDetails"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          تلاش مجدد
        </button>
      </div>

      <!-- User Details -->
      <div v-else-if="user" class="space-y-6">
        <!-- User Info Card -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
        >
          <!-- Header -->
          <div class="flex flex-col gap-4 pb-6 border-b border-gray-200 mb-6">
            <!-- User Name & Payment Deadline -->
            <div
              class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
            >
              <button
                type="button"
                @click="openPaymentDeadlinesModal"
                :disabled="isLoadingPaymentDeadline"
                class="order-1 sm:order-2 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium text-sm border w-full sm:w-auto"
                :class="
                  currentPaymentDeadline
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
                "
              >
                {{ paymentDeadlineLabel }}
              </button>

              <div class="order-2 sm:order-1">
                <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  {{ getUserDisplayName(user) }}
                </h2>
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="px-3 py-1 text-sm font-medium rounded-full"
                    :class="
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    "
                  >
                    {{ user.isActive ? "فعال" : "غیرفعال" }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons - Responsive Grid -->
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2"
            >
              <NuxtLink
                v-if="user.role !== 'ADMIN'"
                :to="`/admin/users/edit/${user.id}`"
                class="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-accent transition-colors duration-200 font-medium text-center text-sm"
              >
                ویرایش اطلاعات
              </NuxtLink>
              <NuxtLink
                :to="`/admin/users/phones/${user.id}`"
                class="px-4 py-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                مدیریت شماره‌ها
              </NuxtLink>
              <button
                v-if="user.role !== 'ADMIN'"
                @click="openDebtModal('add')"
                class="px-4 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                افزودن بدهی
              </button>
              <button
                v-if="user.role !== 'ADMIN' && parseInt(user.totalDebt) > 0"
                @click="openDebtModal('reduce')"
                class="px-4 py-2.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 12H4"
                  />
                </svg>
                کاهش بدهی
              </button>
              <button
                @click="openContactHistoriesModal"
                class="px-4 py-2.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-sm"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 10h8M8 14h5m2 6H7a2 2 0 01-2-2V6a2 2 0 012-2h6l5 5v9a2 2 0 01-2 2z"
                  />
                </svg>
                تاریخچه تماس‌ها
              </button>
              <button
                v-if="user.role !== 'ADMIN'"
                @click="handleToggleStatus"
                class="px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium text-sm"
              >
                {{ user.isActive ? "غیرفعال کردن" : "فعال کردن" }}
              </button>
            </div>
          </div>

          <!-- User Details Grid -->
          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div class="space-y-4">
              <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div
                  class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-600 mb-1">شناسه کاربر</p>
                  <p class="text-lg font-bold text-gray-900">{{ user.id }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div
                  class="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-600 mb-1">شماره موبایل</p>
                  <p class="text-lg font-bold text-gray-900" dir="ltr">
                    {{ user.phoneNumber }}
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div
                  class="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-gray-600 mb-1">کد ملی</p>
                  <p class="text-lg font-bold text-gray-900">
                    {{ user.nationalCode }}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100"
              >
                <div
                  class="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-xs text-gray-600 mb-1">مبلغ بدهی</p>
                  <p class="text-xl font-bold text-red-600" dir="ltr">
                    {{ formatCurrency(user.totalDebt, true) }}
                  </p>
                </div>
                <NuxtLink
                  v-if="user.role !== 'ADMIN'"
                  :to="`/admin/users/debt-history/${user.id}`"
                  class="px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                >
                  تاریخچه
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="pt-6 border-t border-gray-200 grid md:grid-cols-2 gap-4">
            <div class="flex items-center gap-2 text-sm">
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-gray-600">تاریخ ثبت‌نام:</span>
              <span class="font-medium text-gray-900">
                {{ new Date(user.createdAt).toLocaleDateString("fa-IR") }}
              </span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span class="text-gray-600">آخرین به‌روزرسانی:</span>
              <span class="font-medium text-gray-900">
                {{ new Date(user.updatedAt).toLocaleDateString("fa-IR") }}
              </span>
            </div>
          </div>
        </div>

        <LoanDebtBreakdownSection
          title="جزئیات بدهی به تفکیک تسهیلات"
          :breakdown="loanDebtBreakdown"
          :loading="isLoadingLoanDebtBreakdown"
          :error="loanDebtBreakdownError"
          :show-discrepancy-warning="true"
          empty-message="در حال حاضر تسهیلات بدهکاری برای این کاربر ثبت نشده است."
          @retry="fetchUserLoanDebtBreakdown"
        />

        <!-- Transactions -->
        <BaseCard :padding="false">
          <div class="flex items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">
                تاریخچه تراکنش‌های کاربر
              </h3>
            
            </div>
         
          </div>

          <StateLoader
            v-if="isLoadingTransactions"
            message="در حال بارگذاری تاریخچه تراکنش‌ها..."
          />

          <StateError
            v-else-if="transactionsError"
            :message="transactionsError"
            @retry="fetchUserTransactions"
          />

          <template v-else>
            <BaseTable
              v-if="userTransactions.length > 0"
              :columns="transactionColumns"
              :data="userTransactions"
              :expanded-row-key="expandedTransactionId"
            >
              <template #cell-amount="{ row }">
                <span class="font-medium" dir="ltr">{{ formatCurrency(row.amount) }}</span>
              </template>

              <template #cell-type="{ row }">
                <BaseBadge :variant="getTransactionTypeBadge(row.type).variant as any">
                  {{ getTransactionTypeBadge(row.type).text }}
                </BaseBadge>
              </template>

              <template #cell-allocationSummary="{ row }">
                <div class="flex justify-center">
                  <TransactionAllocationsSummary
                    :transaction="row"
                    trigger-only
                    :expanded="expandedTransactionId === row.id"
                    @toggle="toggleTransactionDetails(row.id)"
                  />
                </div>
              </template>

              <template #expanded-row="{ row }">
                <TransactionAllocationsSummary
                  v-if="canExpandTransaction(row)"
                  :transaction="row"
                  default-expanded
                />
              </template>

              <template #cell-status="{ row }">
                <BaseBadge :variant="getTransactionStatusBadge(row.status).variant as any">
                  {{ getTransactionStatusBadge(row.status).text }}
                </BaseBadge>
              </template>

              <template #cell-transactionDate="{ row }">
                {{ formatDate(row.transactionDate) }}
              </template>

              <template #cell-description="{ row }">
                <div class="max-w-[230px] mx-auto whitespace-normal break-words text-center leading-6">
                  {{ row.description || "-" }}
                </div>
              </template>
            </BaseTable>

            <StateEmpty
              v-else
              icon="document"
              message="تراکنشی برای این کاربر یافت نشد"
            />

            <BasePagination
              v-if="transactionsTotal > 0"
              :page="transactionsPage"
              :total="transactionsTotal"
              :limit="transactionsLimit"
              @update:page="handleTransactionsPageChange"
            />
          </template>
        </BaseCard>

        <!-- Installments -->
        <!-- <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-bold text-gray-900">اقساط</h3>
            <p class="text-sm text-gray-600">10 قسط اخیر کاربر</p>
          </div>
          
          <div v-if="user.installments && user.installments.length > 0" class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">شناسه</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">مبلغ</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">شماره تسهیلات</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">تاریخ سررسید</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">وضعیت</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">توضیحات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="installment in user.installments" :key="installment.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{{ installment.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center" dir="ltr">
                    {{ formatCurrency(installment.amount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center" dir="ltr">
                    {{ installment.loan?.loanNumber || 'ندارد' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {{ formatDate(installment.dueDate) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full inline-block"
                      :class="{
                        'bg-green-100 text-green-800': installment.status === 'PAID',
                        'bg-red-100 text-red-800': installment.status === 'OVERDUE',
                        'bg-yellow-100 text-yellow-800': installment.status === 'PENDING'
                      }"
                    >
                      {{
                        installment.status === 'PAID' ? 'پرداخت شده' :
                        installment.status === 'OVERDUE' ? 'عقب افتاده' :
                        'در انتظار'
                      }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 text-center">
                    {{ installment.description || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p class="text-gray-600">قسطی یافت نشد</p>
          </div>
        </div> -->
      </div>
    </main>

    <ContactHistoriesModal
      v-if="showContactHistoriesModal"
      :items="contactHistories"
      :meta="contactHistoriesMeta"
      :limit="contactHistoriesLimit"
      :is-loading="isLoadingContactHistories"
      :is-loading-more="isLoadingMoreContactHistories"
      :error="contactHistoriesError"
      @close="closeContactHistoriesModal"
      @create="openCreateContactHistoryModal"
      @refresh="fetchContactHistories"
      @loadMore="handleLoadMoreContactHistories"
    />

    <ContactHistoryCreateModal
      v-if="showCreateContactHistoryModal"
      v-model:description="createContactHistoryForm.description"
      :error="createContactHistoryErrors.description"
      :is-submitting="isSubmittingContactHistory"
      @close="closeCreateContactHistoryModal"
      @submit="handleCreateContactHistory"
    />

    <PaymentDeadlinesModal
      v-if="showPaymentDeadlinesModal"
      :items="paymentDeadlines"
      :meta="paymentDeadlinesMeta"
      :page="paymentDeadlinesPage"
      :limit="paymentDeadlinesLimit"
      :current-id="currentPaymentDeadline?.id ?? null"
      :is-loading="isLoadingPaymentDeadlines"
      :error="paymentDeadlinesError"
      :disable-create="Boolean(currentPaymentDeadline)"
      @close="closePaymentDeadlinesModal"
      @create="openCreatePaymentDeadlineModal"
      @edit="openEditPaymentDeadlineModal"
      @update:page="handlePaymentDeadlinesPageChange"
    />

    <PaymentDeadlineCreateModal
      v-if="showCreatePaymentDeadlineModal"
      v-model:deadline-at="createPaymentDeadlineForm.deadlineAt"
      :error="createPaymentDeadlineErrors.deadlineAt"
      :is-submitting="isSubmittingPaymentDeadline"
      @close="closeCreatePaymentDeadlineModal"
      @submit="handleCreatePaymentDeadline"
    />

    <PaymentDeadlineEditModal
      v-if="showEditPaymentDeadlineModal"
      :deadline-at="editPaymentDeadlineForm.deadlineAt"
      :deadline-display="editPaymentDeadlineDateDisplay"
      v-model:edit-reason="editPaymentDeadlineForm.editReason"
      :deadline-error="editPaymentDeadlineErrors.deadlineAt"
      :reason-error="editPaymentDeadlineErrors.editReason"
      :is-submitting="isSubmittingEditPaymentDeadline"
      @close="closeEditPaymentDeadlineModal"
      @update:deadline-at="handleEditPaymentDeadlineDateChange"
      @submit="handleEditPaymentDeadline"
    />

    <!-- Debt Management Modal -->
    <div
      v-if="showDebtModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            {{ debtModalType === "add" ? "افزودن بدهی" : "کاهش بدهی" }}
          </h3>
          <button
            @click="closeDebtModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Loan Selection -->
          <div v-if="isLoadingLoans" class="text-center py-4">
            <div
              class="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
            ></div>
            <p class="text-gray-600 text-sm mt-2">در حال بارگذاری تسهیلات...</p>
          </div>

          <div v-else>
            <!-- Warning for no loans -->
            <div v-if="showLoanWarning && showNewLoanInput" class="mb-4">
              <div class="bg-yellow-50 rounded-lg p-3 mb-3 text-center">
                <p class="text-sm text-yellow-800">
                  این کاربر تسهیلاتی ندارد. لطفاً شماره تسهیلات جدید وارد کنید.
                </p>
              </div>

              <!-- Manual loan number input -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">
                  شماره تسهیلات جدید <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="debtForm.newLoanNumber"
                  type="text"
                  placeholder="LN_0000000001"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  dir="ltr"
                />
              </div>
            </div>

            <!-- Info for creating new loan when loans exist -->
            <div v-else-if="showNewLoanInput && loans.length > 0" class="mb-2">
              <div class="flex items-start gap-3">
                <div class="flex-1">
                  <!-- Manual loan number input -->
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2">
                      شماره تسهیلات جدید <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="debtForm.newLoanNumber"
                      type="text"
                      placeholder="LN_0000000002"
                      class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      :class="
                        debtFieldErrors.newLoanNumber
                          ? 'border-red-500'
                          : 'border-gray-300'
                      "
                      dir="ltr"
                    />
                    <p
                      v-if="debtFieldErrors.newLoanNumber"
                      class="mt-1 text-xs text-red-600"
                    >
                      {{ debtFieldErrors.newLoanNumber }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Select existing loan -->
            <div v-else-if="loans.length > 0">
              <label class="block text-sm font-medium text-gray-900 mb-2">
                انتخاب تسهیلات <span class="text-red-500">*</span>
              </label>
              <select
                v-model="debtForm.loanId"
                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                :class="
                  debtFieldErrors.loanId ? 'border-red-500' : 'border-gray-300'
                "
                dir="ltr"
              >
                <option disabled :value="undefined">
                  تسهیلات کاربر را انتخاب کنید
                </option>
                <option v-for="loan in loans" :key="loan.id" :value="loan.id">
                  {{ formatLoanOption(loan) }}
                </option>
              </select>
              <p
                v-if="debtFieldErrors.loanId"
                class="mt-1 text-xs text-red-600"
              >
                {{ debtFieldErrors.loanId }}
              </p>
            </div>

            <!-- Toggle button for creating new loan -->
            <button
              v-if="loans.length > 0"
              type="button"
              @click="toggleNewLoanInput"
              class="w-full py-2 text-sm font-medium text-primary hover:text-accent transition-colors duration-200 flex items-center justify-start gap-2"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {{
                showNewLoanInput
                  ? "انتخاب از تسهیلات موجود"
                  : "ایجاد تسهیلات جدید"
              }}
            </button>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              مبلغ (ریال) <span class="text-red-500">*</span>
            </label>
            <input
              :value="debtAmountInput.displayValue.value"
              @input="debtAmountInput.handleInput"
              type="text"
              inputmode="numeric"
              placeholder="1,000,000"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-left"
              :class="
                debtFieldErrors.amount ? 'border-red-500' : 'border-gray-300'
              "
              dir="ltr"
            />
            <p v-if="debtFieldErrors.amount" class="mt-1 text-xs text-red-600">
              {{ debtFieldErrors.amount }}
            </p>
            <p
              v-if="debtModalType === 'reduce'"
              class="mt-1 text-xs text-gray-600"
            >
              حداکثر: {{ formatCurrency(user?.totalDebt || "0") }} ریال
            </p>
          </div>

          <!-- Transaction Date -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2"
              >تاریخ تراکنش (اختیاری)</label
            >
            <input
              v-model="debtForm.transactionDate"
              type="text"
              placeholder="1405/02/08"
              class="user-debt-transaction-date w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              :class="
                debtFieldErrors.transactionDate
                  ? 'border-red-500'
                  : 'border-gray-300'
              "
              dir="ltr"
            />
            <date-picker
              v-model="debtForm.transactionDate"
              custom-input=".user-debt-transaction-date"
            />
            <p
              v-if="debtFieldErrors.transactionDate"
              class="mt-1 text-xs text-red-600"
            >
              {{ debtFieldErrors.transactionDate }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              توضیحات (اختیاری)
            </label>
            <textarea
              v-model="debtForm.description"
              rows="3"
              placeholder="توضیحات مربوط به این تراکنش..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            ></textarea>
          </div>

          <!-- Transaction Type -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">
              نوع تراکنش
            </label>
            <select
              v-model="debtForm.transactionType"
              :disabled="debtModalType === 'reduce'"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              :class="
                debtFieldErrors.transactionType
                  ? 'border-red-500'
                  : 'border-gray-300'
              "
            >
              <option
                v-if="debtModalType === 'reduce'"
                value="ADMIN_DEBT_REDUCE"
              >
                کاهش بدهی
              </option>
              <option v-else disabled value="">
                نوع تراکنش را مشخص کنید.
              </option>
              <option
                v-for="option in ADD_DEBT_TRANSACTION_TYPES"
                v-if="debtModalType === 'add'"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <p
              v-if="debtFieldErrors.transactionType"
              class="mt-1 text-xs text-red-600"
            >
              {{ debtFieldErrors.transactionType }}
            </p>
          </div>

          <!-- SMS Notification -->
          <div
            class="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
          >
            <input
              id="send-sms-notification"
              v-model="debtForm.sendSms"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label for="send-sms-notification" class="text-sm text-gray-800">
              ارسال پیامک اطلاع رسانی
            </label>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-4">
            <button
              @click="handleDebtSubmit"
              :disabled="isSubmittingDebt"
              class="flex-1 py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="
                debtModalType === 'add'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:shadow-lg'
              "
            >
              <span v-if="isSubmittingDebt">در حال ثبت...</span>
              <span v-else>{{
                debtModalType === "add" ? "افزودن بدهی" : "کاهش بدهی"
              }}</span>
            </button>
            <button
              @click="closeDebtModal"
              :disabled="isSubmittingDebt"
              class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
