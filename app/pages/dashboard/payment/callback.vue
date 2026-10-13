<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { userApi } from '~/services/api/user'
import type { Transaction } from '~/types/transaction'
import PaymentSuccessCard from '~/components/User/payment/PaymentSuccessCard.vue'
import PaymentFailedCard from '~/components/User/payment/PaymentFailedCard.vue'

const { t } = useI18n()

useHead({
  title: t('seo.user.paymentResult')
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
    transactionDetails.value = await userApi.getTransactionById(Number(transactionId.value))
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
  <UserPage :title="$t('user.paymentResult.title')">
    <div class="max-w-2xl mx-auto">
      <!-- Success State -->
      <PaymentSuccessCard
        v-if="isSuccess"
        :transaction-details="transactionDetails"
        :transaction-id="transactionId"
        :ref-id="refIdFromQuery"
        :loading="loadingDetails"
      />

      <!-- Failed State -->
      <PaymentFailedCard v-else />

      <!-- Info Box -->
      <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex gap-3">
          <Icon name="mdi:information" size="24" class="text-blue-500 flex-shrink-0" />
          <div class="text-sm text-blue-800">
            <p class="font-bold mb-1">{{ $t('user.paymentResult.note.title') }}</p>
            <p>{{ $t('user.paymentResult.note.refund') }}</p>
          </div>
        </div>
      </div>
    </div>
  </UserPage>
</template>
