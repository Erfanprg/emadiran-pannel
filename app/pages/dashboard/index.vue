<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { userApi } from "~/services/api/user";
import { formatCurrency } from "~/utils/formatters";
import { useMyLoanDebts } from "~/composables/useMyLoanDebts";
import type { Installment } from "~/types/installment";
import type { Transaction } from "~/types/transaction";
import QuickPayCard from "~/components/User/dashboard/QuickPayCard.vue";
import RecentTransactionsCard from "~/components/User/dashboard/RecentTransactionsCard.vue";

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
const stats = ref({
  totalDebt: "0",
  overdueInstallments: 0,
  remainingInstallments: 0,
  successfulTransactions: 0,
});

const authStore = useAuthStore();

const { loanDebtBreakdown, isLoadingLoanDebts, loanDebtError, fetchLoanDebts } =
  useMyLoanDebts("خطا در دریافت جزئیات تسهیلات");

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

// Installments table columns
const installmentColumns = [
  { key: "index", label: "ردیف" },
  { key: "amount", label: "مبلغ قسط" },
  { key: "loanNumber", label: "شماره تسهیلات" },
  { key: "dueDate", label: "سررسید" },
  { key: "status", label: "وضعیت" },
];

// Fetch data on mount
onMounted(() => {
  fetchDashboardData();
  fetchLoanDebts();
});
</script>

<template>
  <UserPage title="داشبورد">
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
      <QuickPayCard />

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
      <RecentTransactionsCard :transactions="recentTransactions" />
    </div>
  </UserPage>
</template>
