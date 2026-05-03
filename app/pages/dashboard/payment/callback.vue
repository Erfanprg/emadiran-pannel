<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { formatCurrency } from '~/utils/formatters'
import { paymentApi } from '~/services/api/payment'
import type { Transaction } from '~/types'

useHead({
  title: 'نتیجه پرداخت - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const authStore = useAuthStore()

// Get status from query params
const status = computed(() => route.query.status as string)
const transactionId = computed(() => route.query.transactionId as string)
const refIdFromQuery = computed(() => route.query.refId as string)

// Check if payment was successful
const isSuccess = computed(() => status.value === 'success')

// Transaction details
const transactionDetails = ref<Transaction | null>(null)
const loadingDetails = ref(false)

// Fetch transaction details
const fetchTransactionDetails = async () => {
  if (!transactionId.value) return

  try {
    loadingDetails.value = true
    const response = await paymentApi.getTransactionDetail(Number(transactionId.value))
    if (response.data) {
      transactionDetails.value = response.data
    }
  } catch (error) {
    console.error('Error fetching transaction details:', error)
  } finally {
    loadingDetails.value = false
  }
}

// Refresh user profile and fetch transaction details on successful payment
onMounted(async () => {
  if (isSuccess.value) {
    try {
      await Promise.all([
        authStore.fetchProfile(),
        fetchTransactionDetails()
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <!-- Header -->
    <UserHeader title="نتیجه پرداخت" />

    <!-- Main Content -->
    <main class="max-w-[1330px] mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <!-- Success State -->
        <BaseCard v-if="isSuccess" class="text-center">
          <div class="py-8">
            <!-- Success Icon -->
            <div class="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Icon name="mdi:check-circle" size="64" class="text-green-500" />
            </div>

            <!-- Success Message -->
            <h2 class="text-2xl font-bold text-gray-900 mb-2">پرداخت موفق!</h2>
            <p class="text-gray-600 mb-6">پرداخت شما با موفقیت ثبت شد</p>

            <!-- Transaction Details -->
            <div class="bg-gray-50 rounded-lg p-6 mb-6 text-right">
              <div v-if="loadingDetails" class="text-center py-4">
                <Icon name="mdi:loading" size="32" class="animate-spin text-primary" />
                <p class="text-gray-600 mt-2">در حال دریافت جزئیات...</p>
              </div>
              <div v-else class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">مبلغ پرداختی:</span>
                  <span class="font-bold text-gray-900 text-lg">
                    {{ transactionDetails?.amount ? formatCurrency(transactionDetails.amount) : '-' }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">شماره پیگیری:</span>
                  <span class="font-bold text-gray-900">{{ transactionId || '-' }}</span>
                </div>
                <div v-if="transactionDetails?.refId || refIdFromQuery" class="flex justify-between items-center">
                  <span class="text-gray-600">شناسه تراکنش :</span>
                  <span class="font-bold text-gray-900">{{ transactionDetails?.refId || refIdFromQuery || '-' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">وضعیت:</span>
                  <BaseBadge variant="success">موفق</BaseBadge>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">تاریخ:</span>
                  <span class="font-bold text-gray-900">
                    {{ transactionDetails?.transactionDate 
                      ? new Date(transactionDetails.transactionDate).toLocaleDateString('fa-IR') 
                      : transactionDetails?.createdAt 
                        ? new Date(transactionDetails.createdAt).toLocaleDateString('fa-IR')
                        : new Date().toLocaleDateString('fa-IR') 
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <NuxtLink
                to="/dashboard"
                class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Icon name="mdi:view-dashboard" size="20" />
                بازگشت به داشبورد
              </NuxtLink>
              <NuxtLink
                to="/dashboard/transactions"
                class="px-6 py-3 bg-white border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary/5 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Icon name="mdi:receipt-text" size="20" />
                مشاهده تاریخچه
              </NuxtLink>
            </div>
          </div>
        </BaseCard>

        <!-- Failed State -->
        <BaseCard v-else class="text-center">
          <div class="py-8">
            <!-- Error Icon -->
            <div class="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Icon name="mdi:close-circle" size="64" class="text-red-500" />
            </div>

            <!-- Error Message -->
            <h2 class="text-2xl font-bold text-gray-900 mb-2">پرداخت ناموفق</h2>
            <p class="text-gray-600 mb-6">متأسفانه پرداخت شما ناموفق بود</p>

            <!-- Failure Reason -->
            <!-- <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p class="text-red-700 text-sm">
                <strong>دلیل:</strong> {{ route.query.message || 'انصراف کاربر یا خطا در پردازش' }}
              </p>
            </div> -->

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <NuxtLink
                to="/dashboard/payment/new"
                class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Icon name="mdi:refresh" size="20" />
                تلاش مجدد
              </NuxtLink>
              <NuxtLink
                to="/dashboard"
                class="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Icon name="mdi:home" size="20" />
                بازگشت به داشبورد
              </NuxtLink>
            </div>
          </div>
        </BaseCard>

        <!-- Info Box -->
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex gap-3">
            <Icon name="mdi:information" size="24" class="text-blue-500 flex-shrink-0" />
            <div class="text-sm text-blue-800">
              <p class="font-bold mb-1">نکته:</p>
              <p>در صورت کسر وجه از حساب و عدم ثبت پرداخت، مبلغ پرداختی ظرف 72 ساعت به حساب شما بازگردانده خواهد شد.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
