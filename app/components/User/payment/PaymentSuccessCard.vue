<script setup lang="ts">
import { formatCurrency, formatDate } from '~/utils/formatters'
import type { Transaction } from '~/types/transaction'

defineProps<{
  transactionDetails: Transaction | null
  transactionId: string
  refId: string
  loading: boolean
}>()
</script>

<template>
  <BaseCard class="text-center">
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
        <div v-if="loading" class="text-center py-4">
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
          <div v-if="transactionDetails?.refId || refId" class="flex justify-between items-center">
            <span class="text-gray-600">شناسه تراکنش :</span>
            <span class="font-bold text-gray-900">{{ transactionDetails?.refId || refId || '-' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">وضعیت:</span>
            <BaseBadge variant="success">موفق</BaseBadge>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">تاریخ:</span>
            <span class="font-bold text-gray-900">
              {{
                transactionDetails?.transactionDate
                  ? formatDate(transactionDetails.transactionDate)
                  : transactionDetails?.createdAt
                  ? formatDate(transactionDetails.createdAt)
                  : formatDate(new Date())
              }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="transactionDetails" class="bg-white border border-gray-200 rounded-lg p-4 mb-6 text-right">
        <p class="text-sm text-gray-600 mb-2">جزئیات تسهیلات</p>
        <TransactionAllocationsSummary
          :transaction="transactionDetails"
          :default-expanded="true"
        />
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
</template>
