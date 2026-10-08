<script setup lang="ts">
import moment from "jalali-moment";
import { transactionsApi } from "~/services/api/transactions";
import { useToast } from "~/composables/useToast";
import { useApiCall } from "~/composables/useApiCall";
import { useCurrencyInput } from "~/composables/useCurrencyInput";
import { buildEditTransactionPayload } from "~/utils/adminTransactionPayload";
import type { DebtTransactionType, Transaction } from "~/types/transaction";

const props = defineProps<{
  transaction: Transaction;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const toast = useToast();
const { execute } = useApiCall();

const amountInput = useCurrencyInput();

const getDateForEdit = (isoDate?: string | null) => {
  if (!isoDate) return "";
  return moment(isoDate).locale("en").format("YYYY-MM-DD");
};

amountInput.setValue(props.transaction.amount || "0");

const isUpdating = ref(false);
const editForm = ref({
  amount: props.transaction.amount || "",
  type: props.transaction.type as DebtTransactionType,
  description: props.transaction.description || "",
  reason: "",
  transactionDate: getDateForEdit(props.transaction.transactionDate),
});
const editErrors = ref<{
  amount?: string;
  type?: string;
  reason?: string;
  transactionDate?: string;
}>({});

const editTransactionDateDisplay = computed(() => {
  if (!editForm.value.transactionDate) return "";

  const jalaliDate = moment(
    editForm.value.transactionDate,
    "YYYY-MM-DD",
    true
  );

  if (jalaliDate.isValid()) {
    return jalaliDate.locale("fa").format("jYYYY/jMM/jDD");
  }

  return editForm.value.transactionDate;
});

const handleEditDateChange = (value: string) => {
  editForm.value.transactionDate = value || "";
  editErrors.value.transactionDate = undefined;
};

const setEditErrorsFromBackend = (message: string) => {
  const normalized = (message || "").toLowerCase();
  if (normalized.includes("amount") || normalized.includes("مبلغ"))
    editErrors.value.amount = message;
  if (normalized.includes("reason") || normalized.includes("دلیل"))
    editErrors.value.reason = message;
  if (normalized.includes("type") || normalized.includes("نوع"))
    editErrors.value.type = message;
  if (normalized.includes("date") || normalized.includes("تاریخ"))
    editErrors.value.transactionDate = message;
};

const handleEditSubmit = async () => {
  editErrors.value = {};
  const validation = buildEditTransactionPayload(props.transaction, {
    amount: amountInput.rawValue.value,
    type: editForm.value.type,
    description: editForm.value.description,
    reason: editForm.value.reason,
    jalaliDate: editForm.value.transactionDate,
  });

  if (!validation.isValid || !validation.payload) {
    editErrors.value = validation.errors;
    toast.error("لطفاً خطاهای فرم را برطرف کنید");
    return;
  }

  isUpdating.value = true;
  await execute(
    () =>
      transactionsApi.updateTransaction(
        props.transaction.id,
        validation.payload!
      ),
    {
      successMessage: "تراکنش با موفقیت ویرایش شد",
      onError: (err) => {
        const message =
          err?.data?.message || err?.message || "خطا در ویرایش تراکنش";
        setEditErrorsFromBackend(message);
      },
      onSuccess: () => {
        emit("saved");
      },
    }
  );
  isUpdating.value = false;
};
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-bold text-gray-900">ویرایش تراکنش</h3>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-700"
        >
          <IconsOutline name="x" class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >مبلغ (ریال)</label
          >
          <input
            :value="amountInput.displayValue.value"
            @input="(e) => amountInput.handleInput(e)"
            type="text"
            inputmode="numeric"
            class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            :class="editErrors.amount ? 'border-red-500' : 'border-gray-300'"
            dir="ltr"
          />
          <p v-if="editErrors.amount" class="text-xs text-red-600 mt-1">
            {{ editErrors.amount }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >نوع تراکنش</label
          >
          <select
            v-model="editForm.type"
            class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            :class="editErrors.type ? 'border-red-500' : 'border-gray-300'"
          >
            <option value="ADMIN_DEBT_ADD">افزایش بدهی</option>
            <option value="LEGAL_DEBT_ADD">افزایش بدهی حقوقی</option>
            <option value="ADMIN_DEBT_REDUCE">کاهش بدهی</option>
          </select>
          <p v-if="editErrors.type" class="text-xs text-red-600 mt-1">
            {{ editErrors.type }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >تاریخ تراکنش (اختیاری)</label
          >
          <input
            :value="editTransactionDateDisplay"
            type="text"
            readonly
            placeholder="1405/02/08"
            class="admin-transaction-edit-date w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            :class="
              editErrors.transactionDate
                ? 'border-red-500'
                : 'border-gray-300'
            "
            dir="ltr"
          />
          <date-picker
            :model-value="editForm.transactionDate"
            @update:model-value="handleEditDateChange"
            custom-input=".admin-transaction-edit-date"
            format="YYYY-MM-DD"
            display-format="jYYYY/jMM/jDD"
          />
          <p
            v-if="editErrors.transactionDate"
            class="text-xs text-red-600 mt-1"
          >
            {{ editErrors.transactionDate }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >توضیحات</label
          >
          <textarea
            v-model="editForm.description"
            rows="3"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >دلیل ویرایش <span class="text-red-500">*</span></label
          >
          <textarea
            v-model="editForm.reason"
            rows="2"
            class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            :class="editErrors.reason ? 'border-red-500' : 'border-gray-300'"
          ></textarea>
          <p v-if="editErrors.reason" class="text-xs text-red-600 mt-1">
            {{ editErrors.reason }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <button
            @click="handleEditSubmit"
            :disabled="isUpdating"
            class="py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium disabled:opacity-60"
          >
            <span v-if="isUpdating">در حال ذخیره...</span>
            <span v-else>ذخیره</span>
          </button>
          <button
            @click="emit('close')"
            :disabled="isUpdating"
            class="py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-60"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
