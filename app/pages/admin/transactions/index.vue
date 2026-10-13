<script setup lang="ts">
import { useAdminGuard } from "~/composables/useAdminGuard";
import { useListFilters } from "~/composables/useListFilters";
import { transactionsApi } from "~/services/api/transactions";
import { useToast } from "~/composables/useToast";
import type { Transaction, GetTransactionsQuery } from "~/types/transaction";
import { formatNumber } from "~/utils/formatters";
import { canManageTransaction } from "~/utils/adminTransactionPayload";
import TransactionsTable from "~/components/Admin/transactions/TransactionsTable.vue";
import TransactionEditModal from "~/components/Admin/transactions/TransactionEditModal.vue";
import TransactionDeleteModal from "~/components/Admin/transactions/TransactionDeleteModal.vue";

const { t } = useI18n()

useHead({
  title: t('seo.admin.transactions'),
});

definePageMeta({
  middleware: "auth",
});

const toast = useToast();

useAdminGuard();

// State
const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const isExporting = ref(false);
const showCsvImportModal = ref(false);
const showPaymentImportModal = ref(false);
const editingTransaction = ref<Transaction | null>(null);
const deletingTransaction = ref<Transaction | null>(null);
const expandedTransactionId = ref<number | null>(null);

// Filters
const {
  filters,
  updateFilter: handleFilterUpdate,
  resetFilterValues,
  getCleanedFilters,
} = useListFilters<GetTransactionsQuery>(
  () => ({
    limit: 20,
    offset: 0,
    status: undefined,
    type: undefined,
    phoneNumber: undefined,
    nationalCode: undefined,
    firstName: undefined,
    lastName: undefined,
    loanNumber: undefined,
  }),
  ["phoneNumber", "nationalCode", "firstName", "lastName", "loanNumber"],
  ["status", "type"]
);

// Filter fields definition
const filterFields = computed(() => [
  {
    key: "phoneNumber",
    label: t('common.fields.phone'),
    type: "text" as const,
    placeholder: "09123456789",
    modelValue: filters.value.phoneNumber,
  },
  {
    key: "nationalCode",
    label: t('common.fields.nationalCode'),
    type: "text" as const,
    placeholder: "1234567890",
    modelValue: filters.value.nationalCode,
  },
  {
    key: "firstName",
    label: t('common.fields.name'),
    type: "text" as const,
    placeholder: t('common.fields.name'),
    modelValue: filters.value.firstName,
  },
  {
    key: "lastName",
    label: t('common.fields.lastName'),
    type: "text" as const,
    placeholder: t('admin.transactions.filters.lastNameLabel'),
    modelValue: filters.value.lastName,
  },
  {
    key: "loanNumber",
    label: t('common.fields.loanNumber'),
    type: "text" as const,
    placeholder: "LN_0000000001",
    modelValue: filters.value.loanNumber,
  },
  {
    key: "status",
    label: t('common.fields.status'),
    type: "select" as const,
    modelValue: filters.value.status,
    options: [
      { label: t('common.filters.all'), value: undefined },
      { label: t('status.success'), value: "SUCCESS" },
      { label: t('status.failed'), value: "FAILED" },
      { label: t('status.pending'), value: "PENDING" },
    ],
  },
  {
    key: "type",
    label: t('common.fields.type'),
    type: "select" as const,
    modelValue: filters.value.type,
    options: [
      { label: t('common.filters.all'), value: undefined },
      { label: t('status.transactionType.payment'), value: "DEBT_PAYMENT" },
      { label: t('status.transactionType.debtAdd'), value: "ADMIN_DEBT_ADD" },
      { label: t('status.transactionType.legalDebtAdd'), value: "LEGAL_DEBT_ADD" },
      { label: t('status.transactionType.debtReduce'), value: "ADMIN_DEBT_REDUCE" },
    ],
  },
]);

// Pagination
const page = ref(1);
const total = ref(0);

const toggleTransactionDetails = (transactionId: number) => {
  expandedTransactionId.value =
    expandedTransactionId.value === transactionId ? null : transactionId;
};

const openEditModal = (row: Transaction) => {
  if (!canManageTransaction(row)) return;
  editingTransaction.value = row;
};

const handleEditSaved = async () => {
  editingTransaction.value = null;
  await fetchTransactions();
};

const openDeleteModal = (row: Transaction) => {
  if (!canManageTransaction(row)) return;
  deletingTransaction.value = row;
};

const handleDeleted = async () => {
  deletingTransaction.value = null;
  await fetchTransactions();
};

// Fetch transactions
const fetchTransactions = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    expandedTransactionId.value = null;
    filters.value.offset = (page.value - 1) * (filters.value.limit || 20);

    const response = await transactionsApi.getTransactions(
      getCleanedFilters() as GetTransactionsQuery
    );
    transactions.value = response.data.data || response.data.items || [];
    total.value = response.data.meta?.total || response.data.total || 0;
  } catch (err: any) {
    error.value =
      err.data?.message || err.message || t('admin.transactions.errors.fetch');
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
    toast.success(t('admin.transactions.messages.excelDownloaded'));
  } catch (err: any) {
    console.error("Export error:", err);
    toast.error(t('admin.transactions.errors.excelDownload'));
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

// Handle search
const handleSearch = () => {
  page.value = 1;
  fetchTransactions();
};

// Reset filters
const resetFilters = () => {
  resetFilterValues();
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
  <AdminPage :title="$t('admin.common.paymentHistory')">
    <!-- Filters -->
    <BaseFiltersBar
      :fields="filterFields"
      @apply="handleSearch"
      @reset="resetFilters"
      @update:field="handleFilterUpdate"
    />

    <!-- Table -->
    <BaseCard :padding="false">
      <BaseCardHeader
        :title="$t('admin.transactions.list.title')"
        :subtitle="$t('admin.transactions.list.count', { total: formatNumber(total) })"
      >
        <div class="flex items-center gap-3 flex-wrap justify-end">
          <button
            @click="showCsvImportModal = true"
            class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <IconsOutline name="upload" class="w-5 h-5" />
            {{ $t('admin.import.csv.title') }}
          </button>

          <button
            @click="showPaymentImportModal = true"
            class="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <IconsOutline name="download" class="w-5 h-5" />
            {{ $t('admin.transactions.actions.bulkPayment') }}
          </button>
        </div>
      </BaseCardHeader>

      <!-- Loading State -->
      <StateLoader v-if="isLoading" :message="$t('common.states.loading')" />

      <!-- Error State -->
      <StateError
        v-else-if="error"
        :message="error"
        @retry="fetchTransactions"
      />

      <!-- Table -->
      <TransactionsTable
        v-else-if="transactions.length > 0"
        :transactions="transactions"
        :expanded-id="expandedTransactionId"
        @toggle="toggleTransactionDetails"
        @edit="openEditModal"
        @delete="openDeleteModal"
      />

      <!-- Empty State -->
      <StateEmpty v-else icon="document" :message="$t('common.states.noResults')" />

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

      <TransactionEditModal
        v-if="editingTransaction"
        :transaction="editingTransaction"
        @close="editingTransaction = null"
        @saved="handleEditSaved"
      />

      <TransactionDeleteModal
        v-if="deletingTransaction"
        :transaction="deletingTransaction"
        @close="deletingTransaction = null"
        @deleted="handleDeleted"
      />
    </template>
  </AdminPage>
</template>
