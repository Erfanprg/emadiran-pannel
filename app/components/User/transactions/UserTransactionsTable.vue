<script setup lang="ts">
import { formatCurrency, formatDate } from '~/utils/formatters'
import type { Transaction } from '~/types/transaction'
import { getTransactionAllocations } from '~/utils/transactionAllocations'
import { TRANSACTION_STATUS_BADGES, TRANSACTION_TYPE_BADGES } from '~/constants/badges'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    transactions: Transaction[]
    /** Row number of the first item minus one (pagination offset) */
    offset?: number
    showDescription?: boolean
  }>(),
  {
    offset: 0,
    showDescription: false
  }
)

const expandedTransactionId = ref<number | null>(null)

const canExpandTransaction = (transaction: Transaction) => getTransactionAllocations(transaction).length > 0

const toggleTransactionDetails = (transactionId: number) => {
  expandedTransactionId.value = expandedTransactionId.value === transactionId ? null : transactionId
}

const columns = [
  { key: 'index', label: t('common.table.row') },
  { key: 'amount', label: t('common.fields.amount') },
  { key: 'type', label: t('common.fields.type') },
  { key: 'allocationSummary', label: t('common.fields.loanDetails') },
  { key: 'status', label: t('common.fields.status') },
  { key: 'createdAt', label: t('common.fields.date') },
  ...(props.showDescription ? [{ key: 'description', label: t('common.fields.description') }] : [])
]
</script>

<template>
  <BaseTable
    :columns="columns"
    :data="transactions"
    :expanded-row-key="expandedTransactionId"
  >
    <template #cell-index="{ index }">
      {{ offset + index + 1 }}
    </template>
    <template #cell-amount="{ row }">
      <span class="font-medium" dir="ltr">{{ formatCurrency(row.amount) }}</span>
    </template>
    <template #cell-type="{ row }">
      <BaseStatusBadge :map="TRANSACTION_TYPE_BADGES" :value="row.type" />
    </template>
    <template #cell-allocationSummary="{ row }">
      <TransactionAllocationsSummary
        :transaction="row"
        trigger-only
        :expanded="expandedTransactionId === row.id"
        @toggle="toggleTransactionDetails(row.id)"
      />
    </template>
    <template #expanded-row="{ row }">
      <TransactionAllocationsSummary
        v-if="canExpandTransaction(row)"
        :transaction="row"
        default-expanded
      />
    </template>
    <template #cell-status="{ row }">
      <BaseStatusBadge :map="TRANSACTION_STATUS_BADGES" :value="row.status" />
    </template>
    <template #cell-createdAt="{ row }">
      {{ formatDate(row.transactionDate) }}
    </template>
    <template #cell-description="{ row }">
      <span class="text-gray-600 text-sm">{{ row.description || '-' }}</span>
    </template>
  </BaseTable>
</template>
