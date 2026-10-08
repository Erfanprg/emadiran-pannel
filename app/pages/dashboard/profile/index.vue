<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { userApi } from '~/services/api/user'
import { formatCurrency, formatDate } from '~/utils/formatters'
import { getUserDisplayName } from '~/func/getUserDisplayName'
import type { LoanDebtBreakdown } from '~/types/debt'

useHead({
  title: 'پروفایل کاربری - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const loanDebtBreakdown = ref<LoanDebtBreakdown | null>(null)
const isLoadingLoanDebts = ref(false)
const loanDebtError = ref<string | null>(null)

const fetchLoanDebts = async () => {
  try {
    isLoadingLoanDebts.value = true
    loanDebtError.value = null
    loanDebtBreakdown.value = await userApi.getLoanDebts()
  } catch (error: any) {
    console.error('Error fetching loan debts:', error)
    loanDebtError.value = error.data?.message || error.message || 'خطا در دریافت جزئیات بدهی'
  } finally {
    isLoadingLoanDebts.value = false
  }
}

// Ensure user data is loaded
onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchProfile()
  }

  await fetchLoanDebts()
})

// User info computed
const userInfo = computed(() => {
  if (!authStore.user) return null
  
  return {
    fullName: getUserDisplayName(authStore.user),
    phoneNumber: authStore.user.phoneNumber,
    nationalCode: authStore.user.nationalCode,
    totalDebt: authStore.user.totalDebt,
    isActive: authStore.user.isActive,
    role: authStore.user.role,
    createdAt: authStore.user.createdAt,
    updatedAt: authStore.user.updatedAt
  }
})

// Get role badge
const getRoleBadge = (role: string) => {
  return role === 'ADMIN' 
    ? { text: 'مدیر سیستم', variant: 'primary' }
    : { text: 'کاربر عادی', variant: 'default' }
}

// Get status badge
const getStatusBadge = (isActive: boolean) => {
  return isActive
    ? { text: 'فعال', variant: 'success' }
    : { text: 'غیرفعال', variant: 'danger' }
}
</script>

<template>
  <UserPage title="پروفایل کاربری">
    <div v-if="!userInfo" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else class="max-w-4xl mx-auto space-y-6">
      <!-- Profile Header Card -->
      <BaseCard class="bg-gradient-to-r from-primary to-accent">
        <div class="text-white p-4">
          <div class="flex flex-col md:flex-row items-center gap-6">
            <!-- User Icon -->
            <!-- <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="mdi:account-circle" size="64" class="text-white" />
            </div> -->

            <!-- User Info -->
            <div class="flex-1 text-center md:text-right">
              <h2 class="text-2xl font-bold">{{ userInfo.fullName }}</h2>
              <p class="text-white/90 " dir="ltr">{{ userInfo.phoneNumber }}</p>
            </div>

            <!-- Debt Display -->
            <div class="bg-white/10 backdrop-blur rounded-lg p-4 text-center md:text-right min-w-[200px]">
              <p class="text-sm text-white/80 mb-1">بدهی کل</p>
              <p class="text-2xl font-bold" dir="ltr">
                <span class="text-sm">ریال</span>
                {{ formatCurrency(userInfo.totalDebt) }}
              </p>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Personal Information -->
      <BaseCard>
     
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Full Name -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-600">نام و نام خانوادگی</label>
            <div class="p-3 bg-gray-50 rounded-lg">
              <p class="text-gray-900 font-medium">{{ userInfo.fullName }}</p>
            </div>
          </div>

          <!-- Phone Number -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-600">شماره موبایل</label>
            <div class="p-3 bg-gray-50 rounded-lg" dir="ltr">
              <p class="text-gray-900 font-medium">{{ userInfo.phoneNumber }}</p>
            </div>
          </div>

          <!-- National Code -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-600">کد ملی</label>
            <div class="p-3 bg-gray-50 rounded-lg" dir="ltr">
              <p class="text-gray-900 font-medium">{{ userInfo.nationalCode }}</p>
            </div>
          </div>

          <!-- Registration Date -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-600">تاریخ عضویت</label>
            <div class="p-3 bg-gray-50 rounded-lg">
              <p class="text-gray-900 font-medium">{{ formatDate(userInfo.createdAt) }}</p>
            </div>
          </div>
        </div>
      </BaseCard>


      <!-- Financial Summary -->
      <BaseCard class="bg-gradient-to-r  border-gray-200">
          <template #header>
          <div class="flex items-center gap-2">
            <Icon name="mdi:cash-multiple" size="24" class="text-red-600" />
            <h3 class="text-xl font-bold text-gray-900">خلاصه مالی</h3>
          </div>
        </template>

        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p class="text-gray-600 mb-2">بدهی کل شما</p>
            <p class="text-3xl font-bold text-red-600" dir="ltr">
              <span class="text-lg">ریال</span>
              {{ formatCurrency(userInfo.totalDebt) }}
            </p>
          </div>

          <NuxtLink
            to="/dashboard/payment/new"
            class="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-bold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Icon name="mdi:credit-card-plus" size="20" />
            پرداخت بدهی
          </NuxtLink>
        </div>
        </BaseCard>

        <LoanDebtBreakdownSection
          title="جزئیات بدهی به تفکیک تسهیلات"
          :breakdown="loanDebtBreakdown"
          :loading="isLoadingLoanDebts"
          :error="loanDebtError"
          empty-message="در حال حاضر تسهیلات بدهکاری برای شما ثبت نشده است."
          @retry="fetchLoanDebts"
        />

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- <NuxtLink
          to="/dashboard/installments"
          class="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 group"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Icon name="mdi:calendar-clock" size="24" class="text-blue-600" />
            </div>
            <div>
              <p class="font-bold text-gray-900">اقساط من</p>
              <p class="text-sm text-gray-600">مشاهده و مدیریت اقساط</p>
            </div>
          </div>
        </NuxtLink> -->

        <NuxtLink
          to="/dashboard/transactions"
          class="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 group"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Icon name="mdi:receipt-text" size="24" class="text-green-600" />
            </div>
            <div>
              <p class="font-bold text-gray-900">تاریخچه بدهی‌ها</p>
              <p class="text-sm text-gray-600">تاریخچه پرداخت‌ها</p>
            </div>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/dashboard"
          class="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 group"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Icon name="mdi:view-dashboard" size="24" class="text-purple-600" />
            </div>
            <div>
              <p class="font-bold text-gray-900">داشبورد</p>
              <p class="text-sm text-gray-600">بازگشت به صفحه اصلی</p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </UserPage>
</template>
