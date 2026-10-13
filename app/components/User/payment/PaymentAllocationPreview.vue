<script setup lang="ts">
import { formatCurrency } from "~/utils/formatters";
import type { PaymentAllocationItem } from "~/types/debt";

defineProps<{
  error: string | null;
  visible: boolean;
  allocations: PaymentAllocationItem[];
  hint: string;
}>();
</script>

<template>
  <BaseCard class="!p-4 md:!p-5">
    <div class="mb-4">
      <div>
        <h3 class="text-lg font-bold text-gray-900">
          {{ $t('user.payment.preview.title') }}
        </h3>
      </div>
    </div>

    <StateError v-if="error" :message="error" :retry="false" />

    <div v-else-if="visible" class="space-y-3">
      <div
        v-for="allocation in allocations"
        :key="`${allocation.loanId}-${allocation.allocationOrder}`"
        :class="[
          'rounded-xl border p-4',
          allocation.allocationType === 'SELECTED_LOAN'
            ? 'border-primary/30 bg-primary/5'
            : 'border-gray-200 bg-white',
        ]"
      >
        <div
          class="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4"
        >
          <div>
            <div class="flex items-center gap-2">
              <p class="text-lg font-bold text-gray-900" dir="ltr">
                {{ allocation.loanNumber }}
              </p>
              <BaseBadge
                v-if="allocation.allocationType === 'SELECTED_LOAN'"
                variant="primary"
              >
                {{ $t('user.payment.preview.selected') }}
              </BaseBadge>
            </div>
          </div>

          <div class="text-left">
            <p class="text-lg font-bold text-primary">
              {{ formatCurrency(allocation.allocatedAmount, true) }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="rounded-lg bg-gray-50 border border-gray-200 px-3 py-3">
            <p class="text-xs text-gray-500 mb-1">{{ $t('user.payment.preview.debtBefore') }}</p>
            <p class="font-bold text-gray-900">
              {{ formatCurrency(allocation.currentDebtBeforeAllocation, true) }}
            </p>
          </div>
          <div class="rounded-lg bg-gray-50 border border-gray-200 px-3 py-3">
            <p class="text-xs text-gray-500 mb-1">
              {{ $t('user.payment.preview.debtAfter') }}
            </p>
            <p class="font-bold text-gray-900">
              {{ formatCurrency(allocation.currentDebtAfterAllocation, true) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="py-3 text-sm text-gray-500">
      {{ hint }}
    </div>
  </BaseCard>
</template>
