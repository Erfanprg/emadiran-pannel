<script setup lang="ts">
import { formatDate, formatNumber } from "~/utils/formatters";
import { getUserDisplayName } from "~/func/getUserDisplayName";
import { canManageTransaction } from "~/utils/adminTransactionPayload";
import { getTransactionAllocations } from "~/utils/transactionAllocations";
import { ADMIN_TRANSACTION_STATUS_BADGES, ADMIN_TRANSACTION_TYPE_BADGES } from "~/constants/badges";
import type { Transaction } from "~/types/transaction";
import type { TableColumn } from "~/components/Base/Table.vue";

defineProps<{
  transactions: Transaction[];
  expandedId: number | null;
}>();

const emit = defineEmits<{
  toggle: [transactionId: number];
  edit: [transaction: Transaction];
  delete: [transaction: Transaction];
}>();

const columns: TableColumn<Transaction>[] = [
  { key: "id", label: "شناسه", align: "center", class: "align-middle" },
  { key: "userId", label: "کاربر", align: "center", class: "align-middle" },
  {
    key: "amount",
    label: "مبلغ",
    align: "center",
    class: "align-middle",
    format: (val) => formatNumber(val),
  },
  { key: "type", label: "نوع", align: "center", class: "align-middle" },
  { key: "status", label: "وضعیت", align: "center", class: "align-middle" },
  {
    key: "allocationSummary",
    label: "جزئیات تسهیلات",
    align: "center",
    class: "align-middle",
  },
  {
    key: "description",
    label: "توضیحات",
    align: "center",
    class: "align-middle whitespace-normal",
  },
  {
    key: "transactionDate",
    label: "تاریخ",
    align: "center",
    class: "align-middle",
    format: (val) => formatDate(val),
  },
  { key: "actions", label: "عملیات", align: "center", class: "align-middle" },
];

const canExpandTransaction = (transaction: Transaction) =>
  getTransactionAllocations(transaction).length > 0;
</script>

<template>
  <BaseTable
    :columns="columns"
    :data="transactions"
    :expanded-row-key="expandedId"
  >
    <!-- User Cell -->
    <template #cell-userId="{ row }">
      <NuxtLink
        :to="`/admin/users/${row.userId}`"
        class="text-primary hover:underline font-medium"
      >
        {{ row.user ? getUserDisplayName(row.user) : `#${row.userId}` }}
      </NuxtLink>
    </template>

    <!-- Amount Cell -->
    <template #cell-amount="{ value }">
      <div class="font-bold" dir="ltr">{{ value }}</div>
    </template>

    <!-- Type Cell -->
    <template #cell-type="{ row }">
      <BaseStatusBadge :map="ADMIN_TRANSACTION_TYPE_BADGES" :value="row.type" />
    </template>

    <!-- Status Cell -->
    <template #cell-status="{ row }">
      <BaseStatusBadge :map="ADMIN_TRANSACTION_STATUS_BADGES" :value="row.status" />
    </template>

    <!-- Loan Cell -->
    <template #cell-allocationSummary="{ row }">
      <div class="flex justify-center">
        <TransactionAllocationsSummary
          :transaction="row"
          trigger-only
          :expanded="expandedId === row.id"
          @toggle="emit('toggle', row.id)"
        />
      </div>
    </template>

    <template #expanded-row="{ row }">
      <TransactionAllocationsSummary
        v-if="canExpandTransaction(row)"
        :transaction="row"
        default-expanded
      />
    </template>

    <!-- Date Cell -->
    <template #cell-transactionDate="{ value }">
      {{ value }}
    </template>

    <!-- Description Cell -->
    <template #cell-description="{ value }">
      <div
        class="max-w-[280px] mx-auto whitespace-normal break-words text-center leading-6"
      >
        {{ value || "-" }}
      </div>
    </template>

    <!-- Actions Cell -->
    <template #cell-actions="{ row }">
      <div
        v-if="canManageTransaction(row)"
        class="flex items-center justify-center gap-2"
      >
        <button
          @click="emit('edit', row)"
          class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 text-xs font-medium"
        >
          ویرایش
        </button>
        <button
          @click="emit('delete', row)"
          class="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200 text-xs font-medium"
        >
          حذف
        </button>
      </div>
      <span v-else class="text-xs text-gray-400">-</span>
    </template>
  </BaseTable>
</template>
