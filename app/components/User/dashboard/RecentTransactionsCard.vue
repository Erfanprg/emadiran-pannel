<script setup lang="ts">
import type { Transaction } from "~/types/transaction";
import UserTransactionsTable from "~/components/User/transactions/UserTransactionsTable.vue";

defineProps<{
  transactions: Transaction[];
}>();
</script>

<template>
  <BaseCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-900">
          آخرین تاریخچه بدهی‌ها
        </h2>
        <NuxtLink
          to="/dashboard/transactions"
          class="text-primary hover:text-accent transition-colors duration-200 text-sm font-medium flex items-center gap-1"
        >
          مشاهده همه
          <Icon name="mdi:chevron-left" size="20" />
        </NuxtLink>
      </div>
    </template>

    <div
      v-if="!transactions || transactions.length === 0"
      class="text-center py-8 text-gray-500"
    >
      هیچ موردی یافت نشد
    </div>

    <UserTransactionsTable v-else :transactions="transactions" />
  </BaseCard>
</template>
