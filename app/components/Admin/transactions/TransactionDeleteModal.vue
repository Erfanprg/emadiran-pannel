<script setup lang="ts">
import { transactionsApi } from "~/services/api/transactions";
import { useApiCall } from "~/composables/useApiCall";
import { formatCurrency } from "~/utils/formatters";
import {
  canManageTransaction,
  getTransactionTypeLabel,
} from "~/utils/adminTransactionPayload";
import type { DebtTransactionType, Transaction } from "~/types/transaction";

const { t } = useI18n()

const props = defineProps<{
  transaction: Transaction;
}>();

const emit = defineEmits<{
  close: [];
  deleted: [];
}>();

const { execute } = useApiCall();

const isDeleting = ref(false);
const deleteReason = ref("");
const deleteError = ref("");

const selectedTransactionTypeLabel = computed(() => {
  if (!canManageTransaction(props.transaction)) {
    return "";
  }

  return getTransactionTypeLabel(props.transaction.type as DebtTransactionType);
});

const selectedTransactionDeleteSummary = computed(
  () =>
    t('admin.transactions.delete.summary', { id: props.transaction.id, amount: formatCurrency(
      props.transaction.amount
    ) })
);

const handleDeleteSubmit = async () => {
  deleteError.value = "";
  const reason = (deleteReason.value || "").trim();
  if (reason.length < 5) {
    deleteError.value = t('admin.common.validation.reasonMin');
    return;
  }

  isDeleting.value = true;
  await execute(
    () =>
      transactionsApi.deleteTransaction(props.transaction.id, {
        reason,
      }),
    {
      successMessage: t('admin.transactions.messages.deleted'),
      onError: (err) => {
        deleteError.value =
          err?.data?.message || err?.message || t('admin.transactions.errors.delete');
      },
      onSuccess: () => {
        emit("deleted");
      },
    }
  );
  isDeleting.value = false;
};
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-2">{{ $t('admin.transactions.delete.title') }}</h3>
      <p class="text-sm text-gray-600 mb-4">
        {{ $t('admin.transactions.delete.confirm', { selectedTransactionTypeLabel: selectedTransactionTypeLabel }) }}
      </p>

      <div class="mb-4 rounded-lg bg-gray-50 border border-gray-200 p-3">
        <p class="text-sm text-gray-700">
          {{ selectedTransactionDeleteSummary }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >{{ $t('admin.transactions.delete.reason') }} <span class="text-red-500">*</span></label
        >
        <textarea
          v-model="deleteReason"
          rows="3"
          class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          :class="deleteError ? 'border-red-500' : 'border-gray-300'"
        ></textarea>
        <p v-if="deleteError" class="text-xs text-red-600 mt-1">
          {{ deleteError }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3 pt-4">
        <button
          @click="handleDeleteSubmit"
          :disabled="isDeleting || deleteReason.trim().length < 5"
          class="py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-medium disabled:opacity-60"
        >
          <span v-if="isDeleting">{{ $t('admin.transactions.delete.deleting') }}</span>
          <span v-else>{{ $t('admin.transactions.delete.submit') }}</span>
        </button>
        <button
          @click="emit('close')"
          :disabled="isDeleting"
          class="py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-60"
        >
          {{ $t('common.actions.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>
