<script setup lang="ts">
import { useAdminGuard } from "~/composables/useAdminGuard";
import { transactionsApi } from "~/services/api/transactions";
import { useToast } from "~/composables/useToast";
import { useApiCall } from "~/composables/useApiCall";
import type { Transaction, GetTransactionsQuery } from "~/types/transaction";
import type { TableColumn } from "~/components/Base/Table.vue";
import { formatDate, formatNumber, formatCurrency } from "~/utils/formatters";
import { getUserDisplayName } from "~/func/getUserDisplayName";
import { useCurrencyInput } from "~/composables/useCurrencyInput";
import moment from "jalali-moment";
import {
  buildEditTransactionPayload,
  EDITABLE_TRANSACTION_TYPES,
  getTransactionTypeLabel,
} from "~/utils/adminTransactionPayload";
import type { DebtTransactionType } from "~/types/transaction";
import { getTransactionAllocations } from "~/utils/transactionAllocations";
import { ADMIN_TRANSACTION_STATUS_BADGES, ADMIN_TRANSACTION_TYPE_BADGES } from "~/constants/badges";

useHead({
  title: "تاریخچه پرداخت - عماد ایران",
});

definePageMeta({
  middleware: "auth",
});

const toast = useToast();
const { execute } = useApiCall();

useAdminGuard();

const amountInput = useCurrencyInput();

// State
const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const isExporting = ref(false);
const showCsvImportModal = ref(false);
const showPaymentImportModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const isUpdating = ref(false);
const isDeleting = ref(false);
const selectedTransaction = ref<Transaction | null>(null);
const editForm = ref({
  amount: "",
  type: "ADMIN_DEBT_ADD" as DebtTransactionType,
  description: "",
  reason: "",
  transactionDate: "",
});
const deleteReason = ref("");
const editErrors = ref<{
  amount?: string;
  type?: string;
  reason?: string;
  transactionDate?: string;
}>({});
const deleteError = ref("");
const expandedTransactionId = ref<number | null>(null);

// Filters
const filters = ref<GetTransactionsQuery>({
  limit: 20,
  offset: 0,
  status: undefined,
  type: undefined,
  phoneNumber: undefined,
  nationalCode: undefined,
  firstName: undefined,
  lastName: undefined,
  loanNumber: undefined,
});

// Filter fields definition
const filterFields = computed(() => [
  {
    key: "phoneNumber",
    label: "شماره تلفن",
    type: "text" as const,
    placeholder: "09123456789",
    modelValue: filters.value.phoneNumber,
  },
  {
    key: "nationalCode",
    label: "کد ملی",
    type: "text" as const,
    placeholder: "1234567890",
    modelValue: filters.value.nationalCode,
  },
  {
    key: "firstName",
    label: "نام",
    type: "text" as const,
    placeholder: "نام",
    modelValue: filters.value.firstName,
  },
  {
    key: "lastName",
    label: "نام خانوادگی",
    type: "text" as const,
    placeholder: "نام خانوادگی ",
    modelValue: filters.value.lastName,
  },
  {
    key: "loanNumber",
    label: "شماره تسهیلات",
    type: "text" as const,
    placeholder: "LN_0000000001",
    modelValue: filters.value.loanNumber,
  },
  {
    key: "status",
    label: "وضعیت",
    type: "select" as const,
    modelValue: filters.value.status,
    options: [
      { label: "همه", value: undefined },
      { label: "موفق", value: "SUCCESS" },
      { label: "ناموفق", value: "FAILED" },
      { label: "در انتظار", value: "PENDING" },
    ],
  },
  {
    key: "type",
    label: "نوع",
    type: "select" as const,
    modelValue: filters.value.type,
    options: [
      { label: "همه", value: undefined },
      { label: "پرداخت", value: "DEBT_PAYMENT" },
      { label: "افزایش بدهی", value: "ADMIN_DEBT_ADD" },
      { label: "افزایش بدهی حقوقی", value: "LEGAL_DEBT_ADD" },
      { label: "کاهش بدهی", value: "ADMIN_DEBT_REDUCE" },
    ],
  },
]);

// Pagination
const page = ref(1);
const total = ref(0);

// Table columns
const columns: TableColumn<Transaction>[] = [
  { key: "id", label: "شناسه", align: "center", class: "align-middle" },
  { key: "userId", label: "کاربر", align: "center", class: "align-middle" },
  {
    key: "amount",
    label: "مبلغ",
    align: "center",
    class: "align-middle",
    format: (val) => formatNumber(val),
  },
  { key: "type", label: "نوع", align: "center", class: "align-middle" },
  { key: "status", label: "وضعیت", align: "center", class: "align-middle" },
  {
    key: "allocationSummary",
    label: "جزئیات تسهیلات",
    align: "center",
    class: "align-middle",
  },
  {
    key: "description",
    label: "توضیحات",
    align: "center",
    class: "align-middle whitespace-normal",
  },
  {
    key: "transactionDate",
    label: "تاریخ",
    align: "center",
    class: "align-middle",
    format: (val) => formatDate(val),
  },
  { key: "actions", label: "عملیات", align: "center", class: "align-middle" },
];

const getDateForEdit = (isoDate?: string) => {
  if (!isoDate) return "";
  return moment(isoDate).locale("en").format("YYYY-MM-DD");
};

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

const canManageTransaction = (row: Transaction): boolean => {
  return EDITABLE_TRANSACTION_TYPES.includes(row.type as DebtTransactionType);
};

const canExpandTransaction = (transaction: Transaction) =>
  getTransactionAllocations(transaction).length > 0;

const toggleTransactionDetails = (transactionId: number) => {
  expandedTransactionId.value =
    expandedTransactionId.value === transactionId ? null : transactionId;
};

const selectedTransactionTypeLabel = computed(() => {
  if (
    !selectedTransaction.value ||
    !canManageTransaction(selectedTransaction.value)
  ) {
    return "";
  }

  return getTransactionTypeLabel(
    selectedTransaction.value.type as DebtTransactionType
  );
});

const selectedTransactionDeleteSummary = computed(() => {
  if (!selectedTransaction.value) {
    return "";
  }

  return `شناسه تراکنش ${selectedTransaction.value.id} به مبلغ ${formatCurrency(
    selectedTransaction.value.amount
  )} ریال`;
});

const openEditModal = (row: Transaction) => {
  if (!canManageTransaction(row)) return;

  selectedTransaction.value = row;
  editErrors.value = {};

  amountInput.setValue(row.amount || "0");
  editForm.value = {
    amount: row.amount || "",
    type: row.type as DebtTransactionType,
    description: row.description || "",
    reason: "",
    transactionDate: getDateForEdit(row.transactionDate),
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  isUpdating.value = false;
  selectedTransaction.value = null;
  editErrors.value = {};
  amountInput.clear();
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
  if (!selectedTransaction.value) return;

  editErrors.value = {};
  const validation = buildEditTransactionPayload(selectedTransaction.value, {
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
        selectedTransaction.value!.id,
        validation.payload!
      ),
    {
      successMessage: "تراکنش با موفقیت ویرایش شد",
      onError: (err) => {
        const message =
          err?.data?.message || err?.message || "خطا در ویرایش تراکنش";
        setEditErrorsFromBackend(message);
      },
      onSuccess: async () => {
        closeEditModal();
        await fetchTransactions();
      },
    }
  );
  isUpdating.value = false;
};

const openDeleteModal = (row: Transaction) => {
  if (!canManageTransaction(row)) return;

  selectedTransaction.value = row;
  deleteReason.value = "";
  deleteError.value = "";
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  isDeleting.value = false;
  selectedTransaction.value = null;
  deleteReason.value = "";
  deleteError.value = "";
};

const handleDeleteSubmit = async () => {
  if (!selectedTransaction.value) return;

  deleteError.value = "";
  const reason = (deleteReason.value || "").trim();
  if (reason.length < 5) {
    deleteError.value = "دلیل باید حداقل ۵ کاراکتر باشد";
    return;
  }

  isDeleting.value = true;
  await execute(
    () =>
      transactionsApi.deleteTransaction(selectedTransaction.value!.id, {
        reason,
      }),
    {
      successMessage: "تراکنش با موفقیت حذف شد",
      onError: (err) => {
        deleteError.value =
          err?.data?.message || err?.message || "خطا در حذف تراکنش";
      },
      onSuccess: async () => {
        closeDeleteModal();
        await fetchTransactions();
      },
    }
  );
  isDeleting.value = false;
};

// Fetch transactions
const fetchTransactions = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    expandedTransactionId.value = null;
    filters.value.offset = (page.value - 1) * (filters.value.limit || 20);


    // Clean filters - remove undefined/empty values
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters.value).filter(
        ([_, v]) => v !== undefined && v !== "" && v !== null
      )
    );


    const response = await transactionsApi.getTransactions(
      cleanedFilters as GetTransactionsQuery
    );
    transactions.value = response.data.data || response.data.items || [];
    total.value = response.data.meta?.total || response.data.total || 0;
  } catch (err: any) {
    error.value =
      err.data?.message || err.message || "خطا در دریافت تاریخچه پرداخت";
    console.error("Error fetching transactions:", err);
  } finally {
    isLoading.value = false;
  }
};

// Handle export
const handleExport = async () => {
  try {
    isExporting.value = true;
    await transactionsApi.exportTransactions(filters.value);
    toast.success("فایل اکسل با موفقیت دانلود شد");
  } catch (err: any) {
    console.error("Export error:", err);
    toast.error("خطا در دانلود فایل اکسل");
  } finally {
    isExporting.value = false;
  }
};

const handleCsvImportSuccess = async () => {
  await fetchTransactions();
};

const handlePaymentImportSuccess = async () => {
  await fetchTransactions();
};

// Handle filter field updates
const handleFilterUpdate = (key: string, val: any) => {

  if (key === "phoneNumber") {
    const trimmed = val?.trim();
    filters.value.phoneNumber = trimmed || undefined;
  } else if (key === "nationalCode") {
    const trimmed = val?.trim();
    filters.value.nationalCode = trimmed || undefined;
  } else if (key === "firstName") {
    const trimmed = val?.trim();
    filters.value.firstName = trimmed || undefined;
  } else if (key === "lastName") {
    const trimmed = val?.trim();
    filters.value.lastName = trimmed || undefined;
  } else if (key === "loanNumber") {
    const trimmed = val?.trim();
    filters.value.loanNumber = trimmed || undefined;
  } else if (key === "status") {
    filters.value.status = val === "undefined" ? undefined : val;
  } else if (key === "type") {
    filters.value.type = val === "undefined" ? undefined : val;
  }

};

// Handle search
const handleSearch = () => {
  page.value = 1;
  fetchTransactions();
};

// Reset filters
const resetFilters = () => {
  filters.value = {
    limit: 20,
    offset: 0,
    status: undefined,
    type: undefined,
    phoneNumber: undefined,
    nationalCode: undefined,
    firstName: undefined,
    lastName: undefined,
    loanNumber: undefined,
  };
  page.value = 1;
  fetchTransactions();
};

// Load data on mount
onMounted(() => {
  fetchTransactions();
});

// Watch page changes
watch(page, () => {
  fetchTransactions();
});
</script>

<template>
  <AdminPage title="تاریخچه پرداخت">
    <!-- Filters -->
    <BaseFiltersBar
      :fields="filterFields"
      @apply="handleSearch"
      @reset="resetFilters"
      @update:field="handleFilterUpdate"
    />

    <!-- Table -->
    <BaseCard :padding="false">
      <div
        class="px-6 py-4 border-b border-gray-200 flex items-center justify-between"
      >
        <div>
          <h3 class="text-lg font-bold text-gray-900">تاریخچه پرداخت‌ها</h3>
          <p class="text-sm text-gray-600">
            تعداد: {{ formatNumber(total) }} مورد
          </p>
        </div>

        <div class="flex items-center gap-3 flex-wrap justify-end">
          <button
            @click="showCsvImportModal = true"
            class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <IconsOutline name="upload" class="w-5 h-5" />
            بدهی گروهی
          </button>

          <button
            @click="showPaymentImportModal = true"
            class="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <IconsOutline name="download" class="w-5 h-5" />
            پرداخت گروهی
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <StateLoader v-if="isLoading" message="در حال بارگذاری..." />

      <!-- Error State -->
      <StateError
        v-else-if="error"
        :message="error"
        @retry="fetchTransactions"
      />

      <!-- Table -->
      <BaseTable
        v-else-if="transactions.length > 0"
        :columns="columns"
        :data="transactions"
        :expanded-row-key="expandedTransactionId"
      >
        <!-- User Cell -->
        <template #cell-userId="{ row }">
          <NuxtLink
            :to="`/admin/users/${row.userId}`"
            class="text-primary hover:underline font-medium"
          >
            {{ row.user ? getUserDisplayName(row.user) : `#${row.userId}` }}
          </NuxtLink>
        </template>

        <!-- Amount Cell -->
        <template #cell-amount="{ value }">
          <div class="font-bold" dir="ltr">{{ value }}</div>
        </template>

        <!-- Type Cell -->
        <template #cell-type="{ row }">
          <BaseStatusBadge :map="ADMIN_TRANSACTION_TYPE_BADGES" :value="row.type" />
        </template>

        <!-- Status Cell -->
        <template #cell-status="{ row }">
          <BaseStatusBadge :map="ADMIN_TRANSACTION_STATUS_BADGES" :value="row.status" />
        </template>

        <!-- Loan Cell -->
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

        <!-- Date Cell -->
        <template #cell-transactionDate="{ value }">
          {{ value }}
        </template>

        <!-- Description Cell -->
        <template #cell-description="{ value }">
          <div
            class="max-w-[280px] mx-auto whitespace-normal break-words text-center leading-6"
          >
            {{ value || "-" }}
          </div>
        </template>

        <!-- Actions Cell -->
        <template #cell-actions="{ row }">
          <div
            v-if="canManageTransaction(row)"
            class="flex items-center justify-center gap-2"
          >
            <button
              @click="openEditModal(row)"
              class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 text-xs font-medium"
            >
              ویرایش
            </button>
            <button
              @click="openDeleteModal(row)"
              class="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 text-xs font-medium"
            >
              حذف
            </button>
          </div>
          <span v-else class="text-xs text-gray-400">-</span>
        </template>
      </BaseTable>

      <!-- Empty State -->
      <StateEmpty v-else icon="document" message="موردی یافت نشد" />

      <!-- Pagination -->
      <BasePagination
        v-if="!isLoading"
        :page="page"
        :total="total"
        :limit="filters.limit || 20"
        @update:page="(newPage) => (page = newPage)"
      />
    </BaseCard>

    <template #overlays>
      <AdminCsvImportModal
        v-model="showCsvImportModal"
        @success="handleCsvImportSuccess"
      />

      <AdminBulkPaymentImportModal
        v-model="showPaymentImportModal"
        @success="handlePaymentImportSuccess"
      />

      <!-- Edit Transaction Modal -->
      <div
        v-if="showEditModal"
        class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-gray-900">ویرایش تراکنش</h3>
            <button
              @click="closeEditModal"
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
                @click="closeEditModal"
                :disabled="isUpdating"
                class="py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-60"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Transaction Modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-2">حذف تراکنش</h3>
          <p class="text-sm text-gray-600 mb-4">
            آیا از حذف تراکنش {{ selectedTransactionTypeLabel }} اطمینان دارید؟
          </p>

          <div class="mb-4 rounded-lg bg-gray-50 border border-gray-200 p-3">
            <p class="text-sm text-gray-700">
              {{ selectedTransactionDeleteSummary }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >دلیل حذف <span class="text-red-500">*</span></label
            >
            <textarea
              v-model="deleteReason"
              rows="3"
              class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              :class="deleteError ? 'border-red-500' : 'border-gray-300'"
            ></textarea>
            <p v-if="deleteError" class="text-xs text-red-600 mt-1">
              {{ deleteError }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-4">
            <button
              @click="handleDeleteSubmit"
              :disabled="isDeleting || deleteReason.trim().length < 5"
              class="py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-medium disabled:opacity-60"
            >
              <span v-if="isDeleting">در حال حذف...</span>
              <span v-else>تایید حذف</span>
            </button>
            <button
              @click="closeDeleteModal"
              :disabled="isDeleting"
              class="py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-60"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </template>
  </AdminPage>
</template>
