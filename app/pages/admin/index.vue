<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { adminApi } from '~/services/api/admin'
import { formatCurrency } from '~/utils/formatters'

useHead({
  title: 'داشبورد مدیریت - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()

// Check if user is admin
if (!authStore.isAdmin) {
  router.push('/dashboard')
}

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
    total: number
    successful: number
    successRate: string
    totalSuccessAmount: string
  }
}

interface DebtReport {
  summary: {
    totalDebt: string
    averageDebt: string
    maxDebt: string
    usersWithDebt: number
  }
  recentChanges: Array<{
    type: string
    totalAmount: string
    count: number
  }>
  topDebtors: Array<{
    id: number
    firstName: string | null
    lastName: string | null
    fullName: string | null
    phoneNumber: string
    totalDebt: string
  }>
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
        total: 0,
        successful: 0,
        successRate: '0%',
        totalSuccessAmount: '0'
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
  <div class="min-h-screen bg-gray-50 w-full">
    <!-- Header -->
    <AdminHeader title="داشبورد" />

    <!-- Main Content -->
    <main class="max-w-[1330px] mx-auto px-4 py-8">

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
              :description="`از ${dashboardData.users.total.toLocaleString('fa-IR')} کاربر`"
              icon="check"
              icon-color="success"
            />

            <BaseStatsCard
              title="کاربران غیرفعال"
              :value="dashboardData.users.inactive"
              :description="`از ${dashboardData.users.total.toLocaleString('fa-IR')} کاربر`"
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
            <BaseCard>
              <div class="text-center">
                <div class="w-16 h-16 bg-red-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-sm text-gray-600 mb-2">مجموع بدهی</p>
                <p class="text-2xl font-bold text-red-600" dir="ltr">{{ formatCurrency(dashboardData.financial.totalDebt) }}</p>
                <p class="text-xs text-gray-500 mt-1">ریال</p>
              </div>
            </BaseCard>

            <BaseCard>
              <div class="text-center">
                <div class="w-16 h-16 bg-orange-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p class="text-sm text-gray-600 mb-2">میانگین بدهی</p>
                <p class="text-2xl font-bold text-orange-600" dir="ltr">{{ formatCurrency(dashboardData.financial.averageDebt) }}</p>
                <p class="text-xs text-gray-500 mt-1">ریال</p>
              </div>
            </BaseCard>

            <BaseCard>
              <div class="text-center">
                <div class="w-16 h-16 bg-yellow-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p class="text-sm text-gray-600 mb-2">بیشترین بدهی</p>
                <p class="text-2xl font-bold text-yellow-600" dir="ltr">{{ formatCurrency(dashboardData.financial.maxDebt) }}</p>
                <p class="text-xs text-gray-500 mt-1">ریال</p>
              </div>
            </BaseCard>
          </div>
        </div>

        <!-- Transaction Stats -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-4">آمار پرداخت‌ها</h3>
          <div class="grid gap-6 md:grid-cols-4">
            <BaseStatsCard
              title="کل تراکنش‌ها"
              :value="dashboardData.transactions.total"
              description="تعداد کل تراکنش‌ها"
              icon="document"
              icon-color="primary"
              class="md:col-span-2"
            />


            <BaseCard class="md:col-span-2">
              <div class="text-center">
                <div class="w-16 h-16 bg-green-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-sm text-gray-600 mb-2">مجموع مبلغ پرداخت‌های موفق</p>
                <p class="text-3xl font-bold text-green-600" dir="ltr">{{ formatCurrency(dashboardData.transactions.totalSuccessAmount) }}</p>
                <p class="text-xs text-gray-500 mt-1">ریال</p>
              </div>
            </BaseCard>
          </div>
        </div>

        <!-- Top Debtors -->
        <div v-if="debtReport && debtReport.topDebtors.length > 0">
          <h3 class="text-lg font-bold text-gray-900 mb-4">کاربران با بیشترین بدهی</h3>
          <BaseCard :padding="false">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">رتبه</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">نام</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">شماره تماس</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">میزان بدهی</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">عملیات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(debtor, index) in debtReport.topDebtors" :key="debtor.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                        :class="{
                          'bg-yellow-100 text-yellow-800': index === 0,
                          'bg-gray-100 text-gray-600': index === 1,
                          'bg-orange-100 text-orange-600': index === 2,
                          'bg-gray-50 text-gray-500': index > 2
                        }"
                      >
                        {{ (index + 1).toLocaleString('fa-IR') }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">
                      {{ debtor.fullName || '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center" dir="ltr">
                      {{ debtor.phoneNumber }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <span class="text-sm font-bold text-red-600" dir="ltr">
                        {{ formatCurrency(debtor.totalDebt) }}
                      </span>
                      <span class="text-xs text-gray-500 mr-1">ریال</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <NuxtLink
                        :to="`/admin/users/${debtor.id}`"
                        class="text-primary hover:underline text-sm font-medium"
                      >
                        مشاهده جزئیات
                      </NuxtLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </BaseCard>
        </div>

        <!-- Quick Actions -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-4">دسترسی سریع</h3>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <NuxtLink
              to="/admin/users"
              class="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-200"
            >
              <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-gray-900">مدیریت کاربران</p>
                <p class="text-sm text-gray-600">مشاهده و ویرایش کاربران</p>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/admin/transactions"
              class="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-200"
            >
              <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 4 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-gray-900">تاریخچه پرداخت</p>
                <p class="text-sm text-gray-600">لیست و گزارش پرداخت‌ها</p>
              </div>
            </NuxtLink>

            <!-- <NuxtLink
              to="/admin/installments"
              class="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-200"
            >
              <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-gray-900">مدیریت اقساط</p>
                <p class="text-sm text-gray-600">لیست و ثبت اقساط</p>
              </div>
            </NuxtLink> -->

            <NuxtLink
              to="/admin/gateways"
              class="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-200"
            >
              <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p class="font-bold text-gray-900">درگاه‌های پرداخت</p>
                <p class="text-sm text-gray-600">مدیریت درگاه‌ها</p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
