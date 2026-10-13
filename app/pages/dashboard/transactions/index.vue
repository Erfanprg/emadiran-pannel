<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'
import { useMyTransactions } from '~/composables/useMyTransactions'
import UserTransactionsTable from '~/components/User/transactions/UserTransactionsTable.vue'
import FilterSelect from '~/components/User/FilterSelect.vue'

const { t } = useI18n()

useHead({
  title: t('seo.user.transactions')
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
  { value: 'ALL', label: t('common.filters.all') },
  { value: 'SUCCESS', label: t('status.success') },
  { value: 'FAILED', label: t('status.failed') },
  { value: 'PENDING', label: t('status.pending') }
]

// Type options
const typeOptions = [
  { value: 'ALL', label: t('common.filters.all') },
  { value: 'DEBT_PAYMENT', label: t('user.common.payDebt') },
  { value: 'ADMIN_DEBT_ADD', label: t('status.transactionType.debtAdd') },
  { value: 'LEGAL_DEBT_ADD', label: t('status.transactionType.legalDebtAdd') },
  { value: 'ADMIN_DEBT_REDUCE', label: t('status.transactionType.debtReduce') }
]
</script>

<template>
  <UserPage :title="$t('user.transactions.title')">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <BaseStatsCard
        :title="$t('user.transactions.stats.successCount')"
        :value="stats.successfulCount.toString()"
        :unit="$t('common.units.item')"
        icon="mdi:check-circle"
        color="green"
      />
      <BaseStatsCard
        :title="$t('user.transactions.stats.paidTotal')"
        :value="formatCurrency(stats.successfulAmount)"
        :unit="$t('global.currency.rial')"
        icon="mdi:cash-check"
        color="blue"
      />
      <BaseStatsCard
        :title="$t('user.transactions.stats.lastPaid')"
        :value="formatCurrency(stats.lastPaymentAmount)"
        :unit="$t('global.currency.rial')"
        icon="mdi:calendar-check"
        color="purple"
      />
    </div>

    <!-- Filters & Table Card -->
    <BaseCard>
      <template #header>
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 class="text-xl font-bold text-gray-900">{{ $t('user.transactions.list.title') }}</h2>

          <!-- Filters -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <FilterSelect v-model="selectedStatus" :label="$t('common.fields.statusLabel')" :options="statusOptions" />
            <FilterSelect v-model="selectedType" :label="$t('user.transactions.filters.type')" :options="typeOptions" />
          </div>
        </div>
      </template>

      <!-- Loading State -->
      <StateLoader v-if="loading" :message="$t('common.states.loading')" />

      <StateError
        v-else-if="error"
        :message="error"
        @retry="fetchTransactions"
      />

      <!-- Empty State -->
      <StateEmpty
        v-else-if="!transactions || transactions.length === 0"
        icon="document"
        :message="$t('common.states.nothingToShow')"
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
