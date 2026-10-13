<script setup lang="ts">
import { formatCurrency, formatDate } from '~/utils/formatters'
import type { Installment } from '~/types/installment'
import { INSTALLMENT_STATUS_BADGES } from '~/constants/badges'

defineProps<{
  installments: Installment[]
  /** Row number of the first item minus one (pagination offset) */
  offset: number
}>()

// Table columns
const columns = [
  { key: 'index', label: 'ردیف' },
  { key: 'amount', label: 'مبلغ قسط' },
  { key: 'loanNumber', label: 'شماره تسهیلات' },
  { key: 'dueDate', label: 'تاریخ سررسید' },
  { key: 'status', label: 'وضعیت' },
  { key: 'description', label: 'توضیحات' }
]
</script>

<template>
  <BaseTable :columns="columns" :data="installments">
    <template #cell-index="{ index }">
      {{ offset + index + 1 }}
    </template>
    <template #cell-amount="{ row }">
      <span class="font-medium" dir="ltr">{{ formatCurrency(row.amount) }}</span>
    </template>
    <template #cell-loanNumber="{ row }">
      <span dir="ltr">{{ row.loan?.loanNumber || 'ندارد' }}</span>
    </template>
    <template #cell-dueDate="{ row }">
      {{ formatDate(row.dueDate) }}
    </template>
    <template #cell-status="{ row }">
      <BaseStatusBadge :map="INSTALLMENT_STATUS_BADGES" :value="row.status" />
    </template>
    <template #cell-description="{ row }">
      <span class="text-gray-600 text-sm">{{ row.description || '-' }}</span>
    </template>
  </BaseTable>
</template>
