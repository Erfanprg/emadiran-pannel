<script setup lang="ts">
import { usePaymentForm } from "~/composables/usePaymentForm";
import PaymentDebtTotalCard from "~/components/User/payment/PaymentDebtTotalCard.vue";
import PaymentLoanSelector from "~/components/User/payment/PaymentLoanSelector.vue";
import PaymentAmountField from "~/components/User/payment/PaymentAmountField.vue";
import PaymentAllocationPreview from "~/components/User/payment/PaymentAllocationPreview.vue";
import PaymentBankTransferNotice from "~/components/User/payment/PaymentBankTransferNotice.vue";
import PaymentGatewaySelector from "~/components/User/payment/PaymentGatewaySelector.vue";
import PaymentSummaryCard from "~/components/User/payment/PaymentSummaryCard.vue";
import PaymentSubmitButton from "~/components/User/payment/PaymentSubmitButton.vue";

useHead({
  title: "پرداخت بدهی - عماد ایران",
});

definePageMeta({
  middleware: "auth",
});

const {
  amountInput,
  loading,
  submitting,
  gateways,
  selectedGateway,
  description,
  loanDebtError,
  allocationPreview,
  allocationPreviewError,
  paymentError,
  fieldErrors,
  positiveDebtLoans,
  positiveDebtTotal,
  hasPayableLoans,
  selectedLoan,
  selectedLoanIdModel,
  selectedGatewayDisplayName,
  previewAllocations,
  isPreviewCurrent,
  canSubmitPayment,
  previewHint,
  normalizeAqayePardakhtAmount,
  fillTotalDebt,
  fetchPaymentPageData,
  handlePayment,
} = usePaymentForm();
</script>

<template>
  <UserPage title="پرداخت بدهی" main-class="w-full max-w-[1200px] mx-auto px-3 sm:px-4 pt-5 md:pt-8 pb-28 md:pb-8">
    <StateLoader
      v-if="loading"
      message="در حال آماده‌سازی اطلاعات پرداخت..."
    />

    <StateError
      v-else-if="loanDebtError"
      :message="loanDebtError"
      @retry="fetchPaymentPageData"
    />

    <div v-else class="space-y-3 md:space-y-5">
      <PaymentDebtTotalCard
        :total="positiveDebtTotal"
        :loan-count="positiveDebtLoans.length"
      />

      <template v-if="hasPayableLoans">
        <div
          class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-3 md:gap-4 items-start"
        >
          <div class="space-y-3 md:space-y-4">
            <PaymentLoanSelector
              v-model="selectedLoanIdModel"
              :loans="positiveDebtLoans"
              :selected-loan="selectedLoan"
              :error="fieldErrors.selectedLoanId"
            />

            <PaymentAmountField
              v-model:description="description"
              :display-value="amountInput.displayValue.value"
              :error="fieldErrors.amount"
              @input="(event) => amountInput.handleInput(event)"
              @blur="normalizeAqayePardakhtAmount"
              @fill-total="fillTotalDebt"
            />

            <PaymentAllocationPreview
              :error="allocationPreviewError"
              :visible="isPreviewCurrent && !!allocationPreview"
              :allocations="previewAllocations"
              :hint="previewHint"
            />
          </div>

          <div class="space-y-3 md:space-y-4">
            <PaymentBankTransferNotice />

            <PaymentGatewaySelector
              v-model="selectedGateway"
              :gateways="gateways"
            />

            <PaymentSummaryCard
              :amount="amountInput.rawValue.value"
              :amount-numeric="amountInput.numericValue.value"
              :selected-loan="selectedLoan"
              :gateway-display-name="selectedGatewayDisplayName"
              :description="description"
              :payment-error="paymentError"
              :can-submit="canSubmitPayment"
              :submitting="submitting"
              :is-preview-current="isPreviewCurrent"
              @submit="handlePayment"
            />
          </div>
        </div>
      </template>
    </div>

    <template #overlays>
      <div
        v-if="!loading && !loanDebtError && hasPayableLoans"
        class="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-3 py-3 shadow-[0_-8px_24px_rgba(15,48,87,0.08)]"
      >
        <PaymentSubmitButton
          compact
          :can-submit="canSubmitPayment"
          :submitting="submitting"
          @click="handlePayment"
        />
      </div>
    </template>
  </UserPage>
</template>
