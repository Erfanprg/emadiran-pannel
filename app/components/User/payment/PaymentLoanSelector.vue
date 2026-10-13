<script setup lang="ts">
import { formatCurrency } from "~/utils/formatters";
import type { LoanDebtItem } from "~/types/debt";

defineProps<{
  loans: LoanDebtItem[];
  selectedLoan: LoanDebtItem | null;
  error?: string;
}>();

const selectedLoanId = defineModel<string | number>({ required: true });
</script>

<template>
  <BaseCard class="!p-4 md:!p-5">
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-bold text-gray-900">
          انتخاب تسهیلات
        </h3>
      </div>

      <div
        v-if="loans.length === 1 && selectedLoan"
        class="rounded-xl border border-gray-200 bg-white p-4"
      >
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        >
          <div>
            <p class="text-sm text-gray-500 mb-1">
              تسهیلات دارای بدهی
            </p>
            <p class="text-lg font-bold text-gray-900" dir="ltr">
              {{ selectedLoan.loanNumber }}
            </p>
          </div>
          <div class="text-left">
            <p class="text-sm text-gray-500 mb-1">بدهی فعلی</p>
            <p class="text-lg font-bold text-gray-900">
              {{ formatCurrency(selectedLoan.currentDebt, true) }}
            </p>
          </div>
        </div>
      </div>

      <BaseSelect
        v-else
        v-model="selectedLoanId"
        label="تسهیلات موردنظر"
        required
        placeholder="تسهیلات دارای بدهی را انتخاب کنید"
        :error="error"
        :options="
          loans.map((loan) => ({
            value: loan.loanId,
            label: `${loan.loanNumber} - ${formatCurrency(
              loan.currentDebt,
              true
            )}`,
          }))
        "
      />
    </div>
  </BaseCard>
</template>
