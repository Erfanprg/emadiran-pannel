<script setup lang="ts">
import { formatCurrency, formatNumber } from '~/utils/formatters'
import type { DebtReport } from '~/types/admin'

defineProps<{
  debtors: DebtReport['topDebtors']
}>()
</script>

<template>
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
          <tr v-for="(debtor, index) in debtors" :key="debtor.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                :class="{
                  'bg-yellow-100 text-yellow-800': index === 0,
                  'bg-gray-100 text-gray-600': index === 1,
                  'bg-orange-100 text-orange-600': index === 2,
                  'bg-gray-50 text-gray-500': index > 2
                }"
              >
                {{ formatNumber(index + 1) }}
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
</template>
