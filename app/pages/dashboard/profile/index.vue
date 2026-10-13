<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { formatDate } from '~/utils/formatters'
import { getUserDisplayName } from '~/func/getUserDisplayName'
import { useMyLoanDebts } from '~/composables/useMyLoanDebts'
import ProfileHeaderCard from '~/components/User/profile/ProfileHeaderCard.vue'
import ProfileField from '~/components/User/profile/ProfileField.vue'
import ProfileFinancialSummary from '~/components/User/profile/ProfileFinancialSummary.vue'
import ProfileQuickLink from '~/components/User/profile/ProfileQuickLink.vue'

useHead({
  title: 'پروفایل کاربری - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { loanDebtBreakdown, isLoadingLoanDebts, loanDebtError, fetchLoanDebts } =
  useMyLoanDebts('خطا در دریافت جزئیات بدهی')

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
</script>

<template>
  <UserPage title="پروفایل کاربری">
    <div v-if="!userInfo" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else class="max-w-4xl mx-auto space-y-6">
      <!-- Profile Header Card -->
      <ProfileHeaderCard
        :full-name="userInfo.fullName"
        :phone-number="userInfo.phoneNumber"
        :total-debt="userInfo.totalDebt"
      />

      <!-- Personal Information -->
      <BaseCard>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileField label="نام و نام خانوادگی" :value="userInfo.fullName" />
          <ProfileField label="شماره موبایل" :value="userInfo.phoneNumber" ltr />
          <ProfileField label="کد ملی" :value="userInfo.nationalCode" ltr />
          <ProfileField label="تاریخ عضویت" :value="formatDate(userInfo.createdAt)" />
        </div>
      </BaseCard>

      <!-- Financial Summary -->
      <ProfileFinancialSummary :total-debt="userInfo.totalDebt" />

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
        <!-- <ProfileQuickLink
          to="/dashboard/installments"
          icon="mdi:calendar-clock"
          title="اقساط من"
          description="مشاهده و مدیریت اقساط"
          icon-box-class="bg-blue-100 group-hover:bg-blue-200"
          icon-class="text-blue-600"
        /> -->

        <ProfileQuickLink
          to="/dashboard/transactions"
          icon="mdi:receipt-text"
          title="تاریخچه بدهی‌ها"
          description="تاریخچه پرداخت‌ها"
          icon-box-class="bg-green-100 group-hover:bg-green-200"
          icon-class="text-green-600"
        />

        <ProfileQuickLink
          to="/dashboard"
          icon="mdi:view-dashboard"
          title="داشبورد"
          description="بازگشت به صفحه اصلی"
          icon-box-class="bg-purple-100 group-hover:bg-purple-200"
          icon-class="text-purple-600"
        />
      </div>
    </div>
  </UserPage>
</template>
