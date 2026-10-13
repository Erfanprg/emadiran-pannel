<script setup lang="ts">
import { formatCurrency, formatNumber } from "~/utils/formatters";

defineProps<{
  total: string;
  loanCount: number;
}>();
</script>

<template>
  <BaseCard class="!p-4 md:!p-6 bg-gradient-to-r from-red-500 to-red-600">
    <div class="text-white">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm opacity-90 mb-1">{{ $t('user.payment.total.label') }}</p>
          <div
            class="inline-flex flex-row-reverse items-baseline gap-1 text-3xl font-bold"
          >
            <span>{{ formatCurrency(total) }}</span>
            <span class="text-lg">{{ $t('global.currency.rial') }}</span>
          </div>
        </div>
        <div class="text-left">
          <p class="text-sm opacity-90 mb-1">{{ $t('user.payment.total.loansWithDebt') }}</p>
          <p class="text-2xl font-bold">
            {{ formatNumber(loanCount) }}
          </p>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
