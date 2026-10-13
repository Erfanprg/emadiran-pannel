<script setup lang="ts">
import { useAdminGuard } from '~/composables/useAdminGuard'
import { adminApi } from '~/services/api/admin'
import type { DebtReport } from '~/types/admin'
import { formatCurrency, formatNumber } from '~/utils/formatters'
import AmountStatCard from '~/components/Admin/dashboard/AmountStatCard.vue'
import TopDebtorsTable from '~/components/Admin/dashboard/TopDebtorsTable.vue'
import QuickActionLink from '~/components/Admin/dashboard/QuickActionLink.vue'

const { t } = useI18n()

useHead({
  title: t('seo.admin.dashboard')
})

definePageMeta({
  middleware: 'auth'
})


useAdminGuard()

// Stats data
interface DashboardData {
  users: {
    total: number
    active: number
    inactive: number
    withDebt: number
  }
  financial: {
    totalDebt: string
    averageDebt: string
    maxDebt: string
  }
  transactions: {
    totalPaymentTransactions: number
    totalPaymentAmount: string
  }
}

const dashboardData = ref<DashboardData | null>(null)
const debtReport = ref<DebtReport | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Fetch dashboard data
const fetchDashboard = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // Fetch user stats and debt report (dashboard endpoint has routing conflict)
    const [statsResponse, debtResponse] = await Promise.all([
      adminApi.getUserStats(),
      adminApi.getDebtReport()
    ])
    
    // Transform stats to dashboard format
    dashboardData.value = {
      users: {
        total: statsResponse.total,
        active: statsResponse.active,
        inactive: statsResponse.inactive,
        withDebt: statsResponse.usersWithDebt
      },
      financial: {
        totalDebt: statsResponse.totalDebt,
        averageDebt: debtResponse.data.summary.averageDebt,
        maxDebt: debtResponse.data.summary.maxDebt
      },
      transactions: {
        totalPaymentTransactions: debtResponse.data.summary.totalPaymentTransactions,
        totalPaymentAmount: debtResponse.data.summary.totalPaymentAmount
      }
    }
    
    debtReport.value = debtResponse.data
  } catch (err: any) {
    error.value = err.data?.message || t('admin.dashboard.errors.fetchStats')
    console.error('Error fetching dashboard:', err)
  } finally {
    isLoading.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <AdminPage :title="$t('global.navigation.dashboard')">

    <!-- Loading State -->
    <StateLoader v-if="isLoading" :message="$t('common.states.loading')" />

    <!-- Error State -->
    <StateError v-else-if="error" :message="error" @retry="fetchDashboard" />

    <!-- Dashboard Content -->
    <div v-else-if="dashboardData" class="space-y-8">
      <!-- User Stats -->
      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ $t('admin.dashboard.users.title') }}</h3>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <BaseStatsCard
            :title="$t('admin.dashboard.users.total')"
            :value="dashboardData.users.total"
            :description="$t('admin.dashboard.users.totalHint')"
            icon="users"
            icon-color="primary"
          />

          <BaseStatsCard
            :title="$t('admin.dashboard.users.active')"
            :value="dashboardData.users.active"
            :description="$t('admin.dashboard.users.ofTotal', { total: formatNumber(dashboardData.users.total) })"
            icon="check"
            icon-color="success"
          />

          <BaseStatsCard
            :title="$t('admin.dashboard.users.inactive')"
            :value="dashboardData.users.inactive"
            :description="$t('admin.dashboard.users.ofTotal', { total: formatNumber(dashboardData.users.total) })"
            icon="close"
            icon-color="gray"
          />

          <BaseStatsCard
            :title="$t('admin.dashboard.users.withDebt')"
            :value="dashboardData.users.withDebt"
            :description="$t('admin.dashboard.users.withDebtHint')"
            icon="money"
            icon-color="warning"
          />
        </div>
      </div>

      <!-- Financial Stats -->
      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ $t('admin.dashboard.finance.title') }}</h3>
        <div class="grid gap-6 md:grid-cols-3">
          <AmountStatCard
            :label="$t('admin.dashboard.finance.totalDebt')"
            :value="formatCurrency(dashboardData.financial.totalDebt)"
            icon="money"
            color="red"
          />

          <AmountStatCard
            :label="$t('admin.dashboard.finance.averageDebt')"
            :value="formatCurrency(dashboardData.financial.averageDebt)"
            icon="chart-bar"
            color="orange"
          />

          <AmountStatCard
            :label="$t('admin.dashboard.finance.maxDebt')"
            :value="formatCurrency(dashboardData.financial.maxDebt)"
            icon="trending-up"
            color="yellow"
          />
        </div>
      </div>

      <!-- Transaction Stats -->
      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ $t('admin.dashboard.payments.title') }}</h3>
        <div class="grid gap-6 md:grid-cols-2">
            <BaseStatsCard
            :title="$t('admin.dashboard.payments.totalTransactions')"
            :value="dashboardData.transactions.totalPaymentTransactions"
              v-bind="{ title: $t('admin.dashboard.payments.successCount'), description: $t('admin.dashboard.payments.successCountHint') }"
              :description="$t('admin.dashboard.payments.totalTransactionsHint')"
            icon="document"
            icon-color="primary"
          />


          <AmountStatCard
            :label="$t('admin.dashboard.payments.successAmount')"
            :value="formatCurrency(dashboardData.transactions.totalPaymentAmount)"
            icon="money"
            color="green"
            large
          />
        </div>
      </div>

      <!-- Top Debtors -->
      <div v-if="debtReport && debtReport.topDebtors.length > 0">
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ $t('admin.dashboard.topDebtors.title') }}</h3>
        <TopDebtorsTable :debtors="debtReport.topDebtors" />
      </div>

      <!-- Quick Actions -->
      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ $t('admin.dashboard.quickActions.title') }}</h3>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickActionLink
            to="/admin/users"
            :title="$t('admin.common.manageUsers')"
            :description="$t('admin.dashboard.quickActions.usersHint')"
            icon="user-group"
            icon-bg="bg-primary"
          />

          <QuickActionLink
            to="/admin/transactions"
            :title="$t('admin.common.paymentHistory')"
            :description="$t('admin.dashboard.quickActions.paymentsHint')"
            icon="clipboard-list"
            icon-bg="bg-green-600"
          />

          <!-- <NuxtLink
            to="/admin/installments"
            class="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-200"
          >
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <IconsOutline name="calendar" class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="font-bold text-gray-900">مدیریت اقساط</p>
              <p class="text-sm text-gray-600">لیست و ثبت اقساط</p>
            </div>
          </NuxtLink> -->

          <QuickActionLink
            to="/admin/gateways"
            :title="$t('admin.common.gateways')"
            :description="$t('admin.dashboard.quickActions.gatewaysHint')"
            icon="credit-card"
            icon-bg="bg-purple-600"
          />
        </div>
      </div>
    </div>
  </AdminPage>
</template>
