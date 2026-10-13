<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'

defineProps<{
  totalDebt: string
}>()
</script>

<template>
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
          {{ formatCurrency(totalDebt) }}
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
</template>
