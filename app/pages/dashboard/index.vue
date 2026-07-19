<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { userApi } from "~/services/api/user";
import { formatCurrency, formatDate } from "~/utils/formatters";
import type { Installment } from "~/types/installment";
import type { Transaction } from "~/types/transaction";
import type { LoanDebtBreakdown } from "~/types/debt";
import { getTransactionAllocations } from "~/utils/transactionAllocations";

useHead({
  title: "داشبورد - عماد ایران",
});

definePageMeta({
  middleware: "auth",
});

// State
const loading = ref(true);
const upcomingInstallments = ref<Installment[]>([]);
const recentTransactions = ref<Transaction[]>([]);
const loanDebtBreakdown = ref<LoanDebtBreakdown | null>(null);
const isLoadingLoanDebts = ref(false);
const loanDebtError = ref<string | null>(null);
const stats = ref({
  totalDebt: "0",
  overdueInstallments: 0,
  remainingInstallments: 0,
  successfulTransactions: 0,
});
const expandedRecentTransactionId = ref<number | null>(null);

const authStore = useAuthStore();

const fetchLoanDebts = async () => {
  try {
    isLoadingLoanDebts.value = true;
    loanDebtError.value = null;
    loanDebtBreakdown.value = await userApi.getLoanDebts();
  } catch (error: any) {
    console.error("Error fetching loan debts:", error);
    loanDebtBreakdown.value = null;
    loanDebtError.value =
      error.data?.message || error.message || "خطا در دریافت جزئیات تسهیلات";
  } finally {
    isLoadingLoanDebts.value = false;
  }
};

// Fetch dashboard data
const fetchDashboardData = async () => {
  loading.value = true;
  try {
    // Fetch user profile first to ensure authStore.user is populated
    if (!authStore.user) {
      await authStore.fetchProfile();
    }

    const [installmentsRes, transactionsRes, allInstallmentsRes, allTransactionsRes] = await Promise.all([
      userApi.getInstallments({ limit: 5 }),
      userApi.getTransactions({ limit: 5 }),
      userApi.getInstallments({}),
      userApi.getTransactions({
        status: "SUCCESS",
      }),
    ]);

    stats.value.totalDebt = authStore.user?.totalDebt || "0";
    upcomingInstallments.value = installmentsRes.data || [];
    recentTransactions.value = transactionsRes.data || [];

    // Calculate stats from installments
    const allInstallments = allInstallmentsRes.data || [];
    stats.value.overdueInstallments = allInstallments.filter(
      (i) => i.status === "OVERDUE"
    ).length;
    stats.value.remainingInstallments = allInstallments.filter(
      (i) => i.status === "PENDING"
    ).length;

    // Calculate successful transactions
    stats.value.successfulTransactions = allTransactionsRes.total || 0;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    loading.value = false;
  }
};

// Status badge config
const getStatusBadge = (status: string) => {
  const badges = {
    PENDING: { text: "در انتظار", variant: "warning" },
    PAID: { text: "پرداخت شده", variant: "success" },
    OVERDUE: { text: "عقب افتاده", variant: "danger" },
    SUCCESS: { text: "موفق", variant: "success" },
    FAILED: { text: "ناموفق", variant: "danger" },
  };
  return (
    badges[status as keyof typeof badges] || {
      text: status,
      variant: "default",
    }
  );
};

const getTypeBadge = (type: string) => {
  const badges = {
    DEBT_PAYMENT: { text: "پرداخت بدهی", variant: "success" },
    ADMIN_DEBT_ADD: { text: "افزایش بدهی", variant: "danger" },
    LEGAL_DEBT_ADD: { text: "افزایش بدهی حقوقی", variant: "danger" },
    ADMIN_DEBT_REDUCE: { text: "کاهش بدهی", variant: "success" },
  };
  return (
    badges[type as keyof typeof badges] || { text: type, variant: "default" }
  );
};

const canExpandTransaction = (transaction: Transaction) =>
  getTransactionAllocations(transaction).length > 0;

const toggleRecentTransactionDetails = (transactionId: number) => {
  expandedRecentTransactionId.value =
    expandedRecentTransactionId.value === transactionId ? null : transactionId;
};

// Installments table columns
const installmentColumns = [
  { key: "index", label: "ردیف" },
  { key: "amount", label: "مبلغ قسط" },
  { key: "loanNumber", label: "شماره تسهیلات" },
  { key: "dueDate", label: "سررسید" },
  { key: "status", label: "وضعیت" },
];

// Transactions table columns
const transactionColumns = [
  { key: "index", label: "ردیف" },
  { key: "amount", label: "مبلغ" },
  { key: "type", label: "نوع" },
  { key: "allocationSummary", label: "جزئیات تسهیلات" },
  { key: "status", label: "وضعیت" },
  { key: "createdAt", label: "تاریخ" },
];

// Fetch data on mount
onMounted(() => {
  fetchDashboardData();
  fetchLoanDebts();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <!-- Header -->
    <UserHeader title="داشبورد" />

    <!-- Main Content -->
    <main class="max-w-[1330px] mx-auto px-4 py-8">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
        ></div>
      </div>

      <div v-else class="space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <BaseStatsCard
            title="مجموع بدهی (ریال)"
            :value="formatCurrency(stats.totalDebt)"
            unit="ریال"
            icon="mdi:cash-multiple"
            color="red"
          />
          <!-- <BaseStatsCard
            title="اقساط عقب افتاده"
            :value="stats.overdueInstallments.toString()"
            unit="قسط"
            icon="mdi:alert-circle"
            color="orange"
          /> -->
          <!-- <BaseStatsCard
            title="اقساط باقی‌مانده"
            :value="stats.remainingInstallments.toString()"
            unit="قسط"
            icon="mdi:calendar-clock"
            color="blue"
          /> -->
          <BaseStatsCard
            title="تاریخچه پرداخت‌های موفق"
            :value="stats.successfulTransactions.toString()"
            unit="مورد"
            icon="mdi:check-circle"
            color="green"
          />
        </div>

        <!-- Quick Payment Button -->
        <BaseCard class="bg-gradient-to-r from-primary to-accent">
          <div
            class="flex flex-col md:flex-row items-center justify-between text-white p-2"
          >
            <div class="mb-4 md:mb-0">
              <h3 class="text-xl font-bold mb-2">پرداخت سریع</h3>
              <p class="text-white/90">برای پرداخت بدهی خود اقدام کنید</p>
            </div>
            <NuxtLink
              to="/dashboard/payment/new"
              class="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
            >
              <Icon name="mdi:credit-card-plus" size="20" />
              پرداخت بدهی
            </NuxtLink>
          </div>
        </BaseCard>

        <LoanDebtBreakdownSection
          title="جزئیات تسهیلات"
          :breakdown="loanDebtBreakdown"
          :loading="isLoadingLoanDebts"
          :error="loanDebtError"
          empty-message="در حال حاضر موردی برای شما ثبت نشده است."
          @retry="fetchLoanDebts"
        />

        <!-- Upcoming Installments -->
        <!-- <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">اقساط آتی</h2>
              <NuxtLink
                to="/dashboard/installments"
                class="text-primary hover:text-accent transition-colors duration-200 text-sm font-medium flex items-center gap-1"
              >
                مشاهده همه
                <Icon name="mdi:chevron-left" size="20" />
              </NuxtLink>
            </div>
          </template>

          <div v-if="!upcomingInstallments || upcomingInstallments.length === 0" class="text-center py-8 text-gray-500">
            هیچ قسطی یافت نشد
          </div>

          <BaseTable
            v-else
            :columns="installmentColumns"
            :data="upcomingInstallments"
          >
            <template #cell-index="{ index }">
              {{ index + 1 }}
            </template>
            <template #cell-amount="{ row }">
              <span class="font-medium" dir="ltr">{{ formatCurrency(row.amount) }}</span>
            </template>
            <template #cell-loanNumber="{ row }">
              <span dir="ltr">{{ row.loan?.loanNumber || 'ندارد' }}</span>
            </template>
            <template #cell-dueDate="{ row }">
              {{ formatDate(row.dueDate) }}
            </template>
            <template #cell-status="{ row }">
              <BaseBadge :variant="getStatusBadge(row.status).variant as any">
                {{ getStatusBadge(row.status).text }}
              </BaseBadge>
            </template>
          </BaseTable>
        </BaseCard> -->

        <!-- Recent Transactions -->
        <BaseCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">
                آخرین تاریخچه بدهی‌ها
              </h2>
              <NuxtLink
                to="/dashboard/transactions"
                class="text-primary hover:text-accent transition-colors duration-200 text-sm font-medium flex items-center gap-1"
              >
                مشاهده همه
                <Icon name="mdi:chevron-left" size="20" />
              </NuxtLink>
            </div>
          </template>

          <div
            v-if="!recentTransactions || recentTransactions.length === 0"
            class="text-center py-8 text-gray-500"
          >
            هیچ موردی یافت نشد
          </div>

          <BaseTable
            v-else
            :columns="transactionColumns"
            :data="recentTransactions"
            :expanded-row-key="expandedRecentTransactionId"
          >
            <template #cell-index="{ index }">
              {{ index + 1 }}
            </template>
            <template #cell-amount="{ row }">
              <span class="font-medium" dir="ltr">{{
                formatCurrency(row.amount)
              }}</span>
            </template>
            <template #cell-type="{ row }">
              <BaseBadge :variant="getTypeBadge(row.type).variant as any">
                {{ getTypeBadge(row.type).text }}
              </BaseBadge>
            </template>
            <template #cell-allocationSummary="{ row }">
              <TransactionAllocationsSummary
                :transaction="row"
                trigger-only
                :expanded="expandedRecentTransactionId === row.id"
                @toggle="toggleRecentTransactionDetails(row.id)"
              />
            </template>
            <template #expanded-row="{ row }">
              <TransactionAllocationsSummary
                v-if="canExpandTransaction(row)"
                :transaction="row"
                default-expanded
              />
            </template>
            <template #cell-status="{ row }">
              <BaseBadge :variant="getStatusBadge(row.status).variant as any">
                {{ getStatusBadge(row.status).text }}
              </BaseBadge>
            </template>
            <template #cell-createdAt="{ row }">
              {{ formatDate(row.transactionDate) }}
            </template>
          </BaseTable>
        </BaseCard>
      </div>
    </main>
  </div>
</template>
