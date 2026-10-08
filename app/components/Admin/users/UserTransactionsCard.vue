<script setup lang="ts">
import { formatDate, formatCurrency } from "~/utils/formatters";
import { getTransactionAllocations } from "~/utils/transactionAllocations";
import { ADMIN_TRANSACTION_STATUS_BADGES, ADMIN_TRANSACTION_TYPE_BADGES } from "~/constants/badges";
import type { Transaction } from "~/types/transaction";
import type { TableColumn } from "~/components/Base/Table.vue";

defineProps<{
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  limit: number;
  expandedId: number | null;
}>();

const emit = defineEmits<{
  retry: [];
  toggle: [transactionId: number];
  "update:page": [page: number];
}>();

const canExpandTransaction = (transaction: any) =>
  getTransactionAllocations(transaction).length > 0;

const transactionColumns: TableColumn<Transaction>[] = [
  { key: "id", label: "شناسه", align: "center" },
  { key: "amount", label: "مبلغ", align: "center" },
  { key: "type", label: "نوع", align: "center" },
  { key: "allocationSummary", label: "جزئیات تسهیلات", align: "center" },
  { key: "status", label: "وضعیت", align: "center" },
  { key: "transactionDate", label: "تاریخ", align: "center" },
  {
    key: "description",
    label: "توضیحات",
    align: "center",
    class: "whitespace-normal"
  }
];
</script>

<template>
  <BaseCard :padding="false">
    <div class="flex items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
      <div>
        <h3 class="text-lg font-bold text-gray-900">
          تاریخچه تراکنش‌های کاربر
        </h3>
      </div>
    </div>

    <StateLoader
      v-if="loading"
      message="در حال بارگذاری تاریخچه تراکنش‌ها..."
    />

    <StateError
      v-else-if="error"
      :message="error"
      @retry="emit('retry')"
    />

    <template v-else>
      <BaseTable
        v-if="transactions.length > 0"
        :columns="transactionColumns"
        :data="transactions"
        :expanded-row-key="expandedId"
      >
        <template #cell-amount="{ row }">
          <span class="font-medium" dir="ltr">{{ formatCurrency(row.amount) }}</span>
        </template>

        <template #cell-type="{ row }">
          <BaseStatusBadge :map="ADMIN_TRANSACTION_TYPE_BADGES" :value="row.type" />
        </template>

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

        <template #cell-status="{ row }">
          <BaseStatusBadge :map="ADMIN_TRANSACTION_STATUS_BADGES" :value="row.status" />
        </template>

        <template #cell-transactionDate="{ row }">
          {{ formatDate(row.transactionDate) }}
        </template>

        <template #cell-description="{ row }">
          <div class="max-w-[230px] mx-auto whitespace-normal break-words text-center leading-6">
            {{ row.description || "-" }}
          </div>
        </template>
      </BaseTable>

      <StateEmpty
        v-else
        icon="document"
        message="تراکنشی برای این کاربر یافت نشد"
      />

      <BasePagination
        v-if="total > 0"
        :page="page"
        :total="total"
        :limit="limit"
        @update:page="(value) => emit('update:page', value)"
      />
    </template>
  </BaseCard>
</template>
