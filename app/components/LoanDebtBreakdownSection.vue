<script setup lang="ts">
import type { LoanDebtBreakdown, LoanDebtItem } from "~/types/debt";
import { formatCurrency, formatDate } from "~/utils/formatters";

const props = withDefaults(
  defineProps<{
    title?: string;
    breakdown?: LoanDebtBreakdown | null;
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
    showDiscrepancyWarning?: boolean;
  }>(),
  {
    title: "بدهی به تفکیک تسهیلات",
    breakdown: null,
    loading: false,
    error: null,
    emptyMessage: "موردی برای نمایش وجود ندارد",
    showDiscrepancyWarning: false,
  }
);

const emit = defineEmits<{
  retry: [];
}>();

const parseAmount = (value: string | number | null | undefined) => {
  return Number(value || 0);
};

const positiveLoans = computed(() => {
  return (props.breakdown?.loans || []).filter(
    (loan) => parseAmount(loan.currentDebt) > 0
  );
});

const loansWithWarnings = computed(() => {
  return (props.breakdown?.loans || []).filter((loan) => loan.hasNegativeDebt);
});

const sortedLoans = computed(() => {
  return [...(props.breakdown?.loans || [])].sort((first, second) => {
    const firstDebt = parseAmount(first.currentDebt);
    const secondDebt = parseAmount(second.currentDebt);

    if (first.hasNegativeDebt !== second.hasNegativeDebt) {
      return first.hasNegativeDebt ? -1 : 1;
    }

    if (firstDebt > 0 !== secondDebt > 0) {
      return firstDebt > 0 ? -1 : 1;
    }

    return secondDebt - firstDebt;
  });
});

const totalPositiveDebt = computed(() => {
  return positiveLoans.value
    .reduce((sum, loan) => sum + parseAmount(loan.currentDebt), 0)
    .toString();
});

const discrepancyAmount = computed(() => {
  return parseAmount(props.breakdown?.differenceFromStoredTotalDebt);
});

const hasDiscrepancy = computed(() => discrepancyAmount.value !== 0);

const hasMissingTransactions = computed(() => {
  return (props.breakdown?.missingLoanTransactions?.length || 0) > 0;
});

const shouldShowEmptyState = computed(() => {
  if (!props.breakdown) return true;

  return (
    positiveLoans.value.length === 0 &&
    loansWithWarnings.value.length === 0 &&
    !hasMissingTransactions.value
  );
});

const getLoanBadge = (loan: LoanDebtItem) => {
  if (loan.hasNegativeDebt) {
    return {
      label: "نیازمند بررسی",
      variant: "warning" as const,
    };
  }

  if (parseAmount(loan.currentDebt) > 0) {
    return {
      label: "بدهکار",
      variant: "danger" as const,
    };
  }

  return {
    label: "تسویه",
    variant: "gray" as const,
  };
};
</script>

<template>
  <BaseCard>
    <div class="flex items-center justify-between gap-3 mb-6">
      <div>
        <h3 class="text-xl font-bold text-gray-900">{{ title }}</h3>
      </div>
    </div>

    <StateLoader v-if="loading" message="در حال بارگذاری بدهی تسهیلات..." />

    <StateError v-else-if="error" :message="error" @retry="emit('retry')" />

    <StateEmpty
      v-else-if="shouldShowEmptyState"
      icon="document"
      :message="emptyMessage"
    />

    <div v-else class="space-y-4">
      <div
        v-if="showDiscrepancyWarning && hasDiscrepancy"
        class="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-900"
      >
        <p class="font-bold mb-2">اختلاف در جمع مبالغ</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p class="text-yellow-700">مبلغ ثبت‌شده</p>
            <p class="font-semibold" dir="ltr">
              {{ formatCurrency(breakdown?.storedTotalDebt, true) }}
            </p>
          </div>
          <div>
            <p class="text-yellow-700">مبلغ محاسبه‌شده</p>
            <p class="font-semibold" dir="ltr">
              {{ formatCurrency(breakdown?.computedTotalDebt, true) }}
            </p>
          </div>
          <div>
            <p class="text-yellow-700">اختلاف</p>
            <p class="font-semibold" dir="ltr">
              {{
                formatCurrency(breakdown?.differenceFromStoredTotalDebt, true)
              }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div
          v-for="loan in sortedLoans"
          :key="loan.loanId"
          :class="[
            'rounded-xl border p-4',
            loan.hasNegativeDebt
              ? 'border-yellow-200 bg-yellow-50'
              : parseAmount(loan.currentDebt) > 0
              ? 'border-gray-200 bg-white'
              : 'border-gray-200 bg-gray-50',
          ]"
        >
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <p class="text-sm text-gray-500 mb-1">شماره تسهیلات</p>
              <p class="text-lg font-bold text-gray-900" dir="ltr">
                {{ loan.loanNumber }}
              </p>
            </div>

            <!-- <BaseBadge :variant="getLoanBadge(loan).variant">
              {{ getLoanBadge(loan).label }}
            </BaseBadge> -->
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              class="rounded-lg bg-white/70 px-3 py-3 border border-gray-100"
            >
              <p class="text-xs text-gray-500 mb-1">مبلغی بدهی</p>
              <p
                :class="[
                  'text-lg font-bold',
                  loan.hasNegativeDebt
                    ? 'text-yellow-700'
                    : parseAmount(loan.currentDebt) > 0
                    ? 'text-red-600'
                    : 'text-gray-700',
                ]"
                dir="ltr"
              >
                {{ formatCurrency(loan.currentDebt, true) }}
              </p>
            </div>

            <div
              class="rounded-lg bg-white/70 px-3 py-3 border border-gray-100"
            >
              <p class="text-xs text-gray-500 mb-1">تعداد تراکنش</p>
              <p class="text-lg font-bold text-gray-900">
                {{ loan.transactionCount.toLocaleString("fa-IR") }}
              </p>
            </div>
          </div>

          <div
            class="mt-3 rounded-lg bg-white/70 px-3 py-3 border border-gray-100"
          >
            <p class="text-xs text-gray-500 mb-1">آخرین تراکنش</p>
            <p class="text-sm font-medium text-gray-900">
              {{
                loan.lastTransactionDate
                  ? formatDate(loan.lastTransactionDate)
                  : "ثبت نشده"
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
