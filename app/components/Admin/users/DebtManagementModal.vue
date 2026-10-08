<script setup lang="ts">
import { adminApi } from "~/services/api/admin";
import { loansApi } from "~/services/api/loans";
import { useToast } from "~/composables/useToast";
import { useConfirm } from "~/composables/useConfirm";
import { useApiCall } from "~/composables/useApiCall";
import { useCurrencyInput } from "~/composables/useCurrencyInput";
import { formatCurrency, formatNumber } from "~/utils/formatters";
import {
  validateDebtForm,
  ADD_DEBT_TRANSACTION_TYPES,
  getTransactionTypeLabel,
} from "~/utils/adminTransactionPayload";
import type { LoanListItem } from "~/types/loan";
import type { DebtTransactionType } from "~/types/transaction";

const props = defineProps<{
  userId: number;
  user: any;
  type: "add" | "reduce";
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const toast = useToast();
const { confirm } = useConfirm();
const { execute } = useApiCall();

// Currency input for debt amount
const debtAmountInput = useCurrencyInput();

const debtForm = ref({
  loanId: undefined as number | undefined,
  newLoanNumber: "",
  description: "",
  sendSms: true,
  transactionType: (props.type === "add" ? "" : "ADMIN_DEBT_REDUCE") as
    | DebtTransactionType
    | "",
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

// Fetch loans for user
const fetchUserLoans = async () => {
  try {
    isLoadingLoans.value = true;
    showLoanWarning.value = false;
    showNewLoanInput.value = false;
    loans.value = [];
    debtForm.value.loanId = undefined;

    const response = await loansApi.getUserLoans(props.userId);
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
    await loansApi.createLoan({
      userId: props.userId,
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
  debtForm.value.loanId = undefined;
  debtForm.value.newLoanNumber = "";
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

  if (props.type === "reduce") {
    debtForm.value.transactionType = "ADMIN_DEBT_REDUCE";
    const maxDebt = parseInt(props.user?.totalDebt || "0");
    if (debtAmountInput.numericValue.value > maxDebt) {
      const debtSafetyMessage = `مبلغ کاهش نمی‌تواند بیشتر از بدهی فعلی (${formatNumber(
        maxDebt
      )} ریال) باشد`;
      debtFieldErrors.value.amount = debtSafetyMessage;
      toast.error(debtSafetyMessage);
      return;
    }
  }

  const confirmMessage =
    props.type === "add"
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
    type: props.type === "add" ? "warning" : "info",
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
    props.type === "add"
      ? () =>
          adminApi.addDebt(
            props.userId,
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
            props.userId,
            debtAmountInput.rawValue.value,
            debtForm.value.description,
            debtForm.value.loanId,
            "ADMIN_DEBT_REDUCE",
            validation.transactionDateIso,
            debtForm.value.sendSms
          );

  await execute(apiCall, {
    successMessage:
      props.type === "add"
        ? "بدهی با موفقیت افزوده شد"
        : "بدهی با موفقیت کاهش یافت",
    onError: (err) => {
      const message = err?.data?.message || err?.message || "خطا در ثبت تراکنش";
      setDebtFieldErrorsFromBackend(message);
    },
    onSuccess: () => {
      emit("success");
    },
  });

  isSubmittingDebt.value = false;
};

fetchUserLoans();
</script>

<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-gray-900">
          {{ type === "add" ? "افزودن بدهی" : "کاهش بدهی" }}
        </h3>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600"
        >
          <IconsOutline name="x" class="w-6 h-6" />
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
            <IconsOutline name="plus" class="w-4 h-4" />
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
            v-if="type === 'reduce'"
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
            :disabled="type === 'reduce'"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
            :class="
              debtFieldErrors.transactionType
                ? 'border-red-500'
                : 'border-gray-300'
            "
          >
            <option
              v-if="type === 'reduce'"
              value="ADMIN_DEBT_REDUCE"
            >
              کاهش بدهی
            </option>
            <option v-else disabled value="">
              نوع تراکنش را مشخص کنید.
            </option>
            <option
              v-for="option in ADD_DEBT_TRANSACTION_TYPES"
              v-if="type === 'add'"
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
              type === 'add'
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-lg'
                : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:shadow-lg'
            "
          >
            <span v-if="isSubmittingDebt">در حال ثبت...</span>
            <span v-else>{{
              type === "add" ? "افزودن بدهی" : "کاهش بدهی"
            }}</span>
          </button>
          <button
            @click="emit('close')"
            :disabled="isSubmittingDebt"
            class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
