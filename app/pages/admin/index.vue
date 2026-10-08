<script setup lang="ts">
import { useAdminGuard } from '~/composables/useAdminGuard'
import { adminApi } from '~/services/api/admin'
import type { DebtReport } from '~/types/admin'
import { formatCurrency, formatNumber } from '~/utils/formatters'
import AmountStatCard from '~/components/Admin/dashboard/AmountStatCard.vue'
import TopDebtorsTable from '~/components/Admin/dashboard/TopDebtorsTable.vue'
import QuickActionLink from '~/components/Admin/dashboard/QuickActionLink.vue'

useHead({
  title: 'داشبورد مدیریت - عماد ایران'
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
    error.value = err.data?.message || 'خطا در دریافت آمار'
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
  <AdminPage title="داشبورد">

    <!-- Loading State -->
    <StateLoader v-if="isLoading" message="در حال بارگذاری..." />

    <!-- Error State -->
    <StateError v-else-if="error" :message="error" @retry="fetchDashboard" />

    <!-- Dashboard Content -->
    <div v-else-if="dashboardData" class="space-y-8">
      <!-- User Stats -->
      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-4">آمار کاربران</h3>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <BaseStatsCard
            title="کل کاربران"
            :value="dashboardData.users.total"
            description="تعداد کل کاربران ثبت شده"
            icon="users"
            icon-color="primary"
          />

          <BaseStatsCard
            title="کاربران فعال"
            :value="dashboardData.users.active"
            :description="`از ${formatNumber(dashboardData.users.total)} کاربر`"
            icon="check"
            icon-color="success"
          />

          <BaseStatsCard
            title="کاربران غیرفعال"
            :value="dashboardData.users.inactive"
            :description="`از ${formatNumber(dashboardData.users.total)} کاربر`"
            icon="close"
            icon-color="gray"
          />

          <BaseStatsCard
            title="کاربران بدهکار"
            :value="dashboardData.users.withDebt"
            description="تعداد کاربران دارای بدهی"
            icon="money"
            icon-color="warning"
          />
        </div>
      </div>

      <!-- Financial Stats -->
      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-4">آمار مالی</h3>
        <div class="grid gap-6 md:grid-cols-3">
          <AmountStatCard
            label="مجموع بدهی"
            :value="formatCurrency(dashboardData.financial.totalDebt)"
            icon="money"
            color="red"
          />

          <AmountStatCard
            label="میانگین بدهی"
            :value="formatCurrency(dashboardData.financial.averageDebt)"
            icon="chart-bar"
            color="orange"
          />

          <AmountStatCard
            label="بیشترین بدهی"
            :value="formatCurrency(dashboardData.financial.maxDebt)"
            icon="trending-up"
            color="yellow"
          />
        </div>
      </div>

      <!-- Transaction Stats -->
      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-4">آمار پرداخت‌ها</h3>
        <div class="grid gap-6 md:grid-cols-2">
            <BaseStatsCard
            title="کل تراکنش‌ها"
            :value="dashboardData.transactions.totalPaymentTransactions"
              v-bind="{ title: 'تعداد پرداخت‌های موفق', description: 'ADMIN_DEBT_REDUCE و DEBT_PAYMENT' }"
              description="تعداد کل تراکنش‌ها"
            icon="document"
            icon-color="primary"
          />


          <AmountStatCard
            label="مجموع مبلغ پرداخت‌های موفق"
            :value="formatCurrency(dashboardData.transactions.totalPaymentAmount)"
            icon="money"
            color="green"
            large
          />
        </div>
      </div>

      <!-- Top Debtors -->
      <div v-if="debtReport && debtReport.topDebtors.length > 0">
        <h3 class="text-lg font-bold text-gray-900 mb-4">کاربران با بیشترین بدهی</h3>
        <TopDebtorsTable :debtors="debtReport.topDebtors" />
      </div>

      <!-- Quick Actions -->
      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-4">دسترسی سریع</h3>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickActionLink
            to="/admin/users"
            title="مدیریت کاربران"
            description="مشاهده و ویرایش کاربران"
            icon="user-group"
            icon-bg="bg-primary"
          />

          <QuickActionLink
            to="/admin/transactions"
            title="تاریخچه پرداخت"
            description="لیست و گزارش پرداخت‌ها"
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
            title="درگاه‌های پرداخت"
            description="مدیریت درگاه‌ها"
            icon="credit-card"
            icon-bg="bg-purple-600"
          />
        </div>
      </div>
    </div>
  </AdminPage>
</template>
