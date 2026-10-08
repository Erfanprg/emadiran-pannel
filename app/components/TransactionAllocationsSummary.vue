<script setup lang="ts">
import type { Transaction } from '~/types/transaction'
import { formatCurrency, formatNumber } from '~/utils/formatters'
import {
  getTransactionAllocations,
  getTransactionAllocationTypeLabel,
  getTransactionLoanFallback,
  getTransactionLoanSummary
} from '~/utils/transactionAllocations'

const props = withDefaults(
  defineProps<{
    transaction: Transaction | null | undefined
    defaultExpanded?: boolean
    triggerOnly?: boolean
    expanded?: boolean
  }>(),
  {
    defaultExpanded: false,
    triggerOnly: false,
    expanded: false
  }
)

const emit = defineEmits<{
  toggle: []
}>()

const allocations = computed(() => getTransactionAllocations(props.transaction))
const hasAllocations = computed(() => allocations.value.length > 0)
const fallbackLoan = computed(() => getTransactionLoanFallback(props.transaction))
const summaryLabel = computed(() => getTransactionLoanSummary(props.transaction))
const allocationsCountLabel = computed(() => `${formatNumber(allocations.value.length)} تسهیلات`)

const handleToggle = () => {
  if (hasAllocations.value) {
    emit('toggle')
  }
}
</script>

<template>
  <div class="whitespace-normal">
    <button
      v-if="triggerOnly && hasAllocations"
      type="button"
      class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
      :aria-expanded="expanded"
      aria-label="مشاهده جزئیات تسهیلات"
      @click="handleToggle"
    >
      <span class="text-[10px] font-medium text-gray-500 md:text-[11px]">
        {{ allocationsCountLabel }}
      </span>
      <span class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-transform duration-200"
        :class="expanded ? 'rotate-180 text-primary border-primary/30 bg-primary/5' : ''"
      >
        <IconsArrowDown />
      </span>
    </button>

    <span
      v-else-if="triggerOnly"
      class="inline-flex items-center rounded-full bg-white shadow-sm border border-gray-100 px-3 py-3 text-sm font-medium text-gray-700"
      dir="ltr"
    >
      {{ fallbackLoan }}
    </span>

    <div
      v-else-if="hasAllocations"
      class="rounded-2xl border border-gray-200 bg-white p-4 text-right shadow-sm"
    >
      <div class="flex flex-col gap-3 border-b border-gray-100 pb-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-bold text-gray-900">جزئیات تسهیلات</p>
          <p class="mt-1 text-xs text-gray-500">{{ allocationsCountLabel }}</p>
        </div>
     
      </div>

      <div class="mt-4 grid gap-3 lg:grid-cols-2">
        <div
          v-for="allocation in allocations"
          :key="`${allocation.loanId}-${allocation.allocationOrder}`"
          class="rounded-xl border border-gray-200 bg-gray-50 p-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs text-gray-500">شماره تسهیلات</p>
              <p class="mt-1 font-semibold text-gray-900" dir="ltr">
                {{ allocation.loanNumber }}
              </p>
            </div>
            <div class="shrink-0 text-left">
              <p class="text-xs text-gray-500">مبلغ تخصیص</p>
              <p class="mt-1 font-bold text-gray-900" dir="ltr">
                {{ formatCurrency(allocation.amount) }}
              </p>
            </div>
          </div>
          <div class="mt-3 rounded-lg bg-white px-3 py-2 text-xs text-gray-600">
            {{
              getTransactionAllocationTypeLabel(
                allocation.allocationType,
                transaction?.allocationRole
              )
            }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="inline-flex items-center rounded-full bg-white shadow-sm px-3 py-4 text-sm font-medium text-gray-700"
      dir="ltr"
    >
      {{ fallbackLoan }}
    </div>
  </div>
</template>
