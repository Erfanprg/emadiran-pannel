<script setup lang="ts">
import { formatCurrency } from "~/utils/formatters";
import PaymentSubmitButton from "~/components/User/payment/PaymentSubmitButton.vue";
import type { LoanDebtItem } from "~/types/debt";

defineProps<{
  amount: string;
  amountNumeric: number;
  selectedLoan: LoanDebtItem | null;
  gatewayDisplayName: string;
  description: string;
  paymentError: string | null;
  canSubmit: boolean;
  submitting: boolean;
  isPreviewCurrent: boolean;
}>();

const emit = defineEmits<{
  submit: [];
}>();
</script>

<template>
  <BaseCard class="!p-4 md:!p-5 bg-blue-50 border-blue-200">
    <div class="space-y-3">
      <h3
        v-if="amountNumeric > 0 && selectedLoan"
        class="font-bold text-gray-900"
      >
        خلاصه پرداخت
      </h3>

      <div v-if="amountNumeric > 0 && selectedLoan" class="space-y-2">
        <div class="flex justify-between text-sm gap-4">
          <span class="text-gray-600">تسهیلات:</span>
          <span class="font-bold" dir="ltr">
            {{ selectedLoan.loanNumber }}
          </span>
        </div>
        <div class="flex justify-between text-sm gap-4">
          <span class="text-gray-600">مبلغ:</span>
          <span class="font-bold">
            {{ formatCurrency(amount, true) }}
          </span>
        </div>
        <div v-if="gatewayDisplayName" class="flex justify-between text-sm gap-4">
          <span class="text-gray-600">درگاه:</span>
          <span class="font-bold">{{ gatewayDisplayName }}</span>
        </div>
        <div v-if="description" class="flex justify-between text-sm gap-4">
          <span class="text-gray-600">توضیحات:</span>
          <span class="font-bold">{{ description }}</span>
        </div>
      </div>

      <StateError v-if="paymentError" :message="paymentError" :retry="false" />

      <div class="hidden md:block">
        <PaymentSubmitButton
          :can-submit="canSubmit"
          :submitting="submitting"
          @click="emit('submit')"
        />

        <p v-if="!isPreviewCurrent" class="text-sm text-center text-gray-500 mt-3">
          ابتدا پیش‌نمایش تخصیص مبلغ را بررسی کنید.
        </p>
      </div>
    </div>
  </BaseCard>
</template>
