<script setup lang="ts">
import { formatCurrency, formatDate } from '~/utils/formatters'
import type { Installment } from '~/types/installment'
import { INSTALLMENT_STATUS_BADGES } from '~/constants/badges'

const { t } = useI18n()

defineProps<{
  installments: Installment[]
  /** Row number of the first item minus one (pagination offset) */
  offset: number
}>()

// Table columns
const columns = [
  { key: 'index', label: t('common.table.row') },
  { key: 'amount', label: t('user.common.installmentAmount') },
  { key: 'loanNumber', label: t('common.fields.loanNumber') },
  { key: 'dueDate', label: t('common.fields.dueDate') },
  { key: 'status', label: t('common.fields.status') },
  { key: 'description', label: t('common.fields.description') }
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
      <span dir="ltr">{{ row.loan?.loanNumber || $t('common.labels.none') }}</span>
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
