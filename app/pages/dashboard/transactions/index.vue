<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'
import { useMyTransactions } from '~/composables/useMyTransactions'
import UserTransactionsTable from '~/components/User/transactions/UserTransactionsTable.vue'
import FilterSelect from '~/components/User/FilterSelect.vue'

useHead({
  title: 'تاریخچه بدهی‌ها - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const {
  loading,
  error,
  transactions,
  selectedStatus,
  selectedType,
  currentPage,
  itemsPerPage,
  totalItems,
  stats,
  fetchTransactions
} = useMyTransactions()

// Status options
const statusOptions = [
  { value: 'ALL', label: 'همه' },
  { value: 'SUCCESS', label: 'موفق' },
  { value: 'FAILED', label: 'ناموفق' },
  { value: 'PENDING', label: 'در انتظار' }
]

// Type options
const typeOptions = [
  { value: 'ALL', label: 'همه' },
  { value: 'DEBT_PAYMENT', label: 'پرداخت بدهی' },
  { value: 'ADMIN_DEBT_ADD', label: 'افزایش بدهی' },
  { value: 'LEGAL_DEBT_ADD', label: 'افزایش بدهی حقوقی' },
  { value: 'ADMIN_DEBT_REDUCE', label: 'کاهش بدهی' }
]
</script>

<template>
  <UserPage title="تاریخچه بدهی‌های من">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <BaseStatsCard
        title="تعداد پرداخت‌های موفق"
        :value="stats.successfulCount.toString()"
        unit="مورد"
        icon="mdi:check-circle"
        color="green"
      />
      <BaseStatsCard
        title="مجموع بدهی‌های پرداخت شده"
        :value="formatCurrency(stats.successfulAmount)"
        unit="ریال"
        icon="mdi:cash-check"
        color="blue"
      />
      <BaseStatsCard
        title="آخرین بدهی پرداخت شده"
        :value="formatCurrency(stats.lastPaymentAmount)"
        unit="ریال"
        icon="mdi:calendar-check"
        color="purple"
      />
    </div>

    <!-- Filters & Table Card -->
    <BaseCard>
      <template #header>
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 class="text-xl font-bold text-gray-900">لیست تاریخچه بدهی‌ها</h2>

          <!-- Filters -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <FilterSelect v-model="selectedStatus" label="وضعیت:" :options="statusOptions" />
            <FilterSelect v-model="selectedType" label="نوع:" :options="typeOptions" />
          </div>
        </div>
      </template>

      <!-- Loading State -->
      <StateLoader v-if="loading" message="در حال بارگذاری..." />

      <StateError
        v-else-if="error"
        :message="error"
        @retry="fetchTransactions"
      />

      <!-- Empty State -->
      <StateEmpty
        v-else-if="!transactions || transactions.length === 0"
        icon="document"
        message="موردی برای نمایش وجود ندارد"
      />

      <!-- Table -->
      <div v-else>
        <UserTransactionsTable
          :transactions="transactions"
          :offset="(currentPage - 1) * itemsPerPage"
          show-description
        />

        <!-- Pagination -->
        <div class="mt-6">
          <BasePagination
            :page="currentPage"
            :total="totalItems"
            :limit="itemsPerPage"
            @update:page="currentPage = $event"
          />
        </div>
      </div>
    </BaseCard>
  </UserPage>
</template>
