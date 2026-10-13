<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'
import { useMyInstallments } from '~/composables/useMyInstallments'
import UserInstallmentsTable from '~/components/User/installments/UserInstallmentsTable.vue'
import FilterSelect from '~/components/User/FilterSelect.vue'

const { t } = useI18n()

useHead({
  title: t('seo.user.installments')
})

definePageMeta({
  middleware: 'auth'
})

const {
  loading,
  installments,
  selectedStatus,
  currentPage,
  itemsPerPage,
  totalItems,
  stats
} = useMyInstallments()

// Status options
const statusOptions = [
  { value: 'ALL', label: t('common.filters.all') },
  { value: 'PENDING', label: t('status.pending') },
  { value: 'PAID', label: t('status.paid') },
  { value: 'OVERDUE', label: t('status.overdue') }
]
</script>

<template>
  <UserPage :title="$t('user.installments.title')">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <BaseStatsCard
        :title="$t('user.installments.stats.overdue')"
        :value="stats.overdue.toString()"
        :unit="$t('user.installments.stats.unit')"
        icon="mdi:alert-circle"
        color="red"
      />
      <BaseStatsCard
        :title="$t('user.installments.stats.overdueAmount')"
        :value="formatCurrency(stats.overdueAmount)"
        :unit="$t('global.currency.rial')"
        icon="mdi:cash-remove"
        color="orange"
      />
      <BaseStatsCard
        :title="$t('user.installments.stats.remaining')"
        :value="stats.remaining.toString()"
        :unit="$t('user.installments.stats.unit')"
        icon="mdi:calendar-clock"
        color="blue"
      />
      <BaseStatsCard
        :title="$t('user.installments.stats.paid')"
        :value="stats.paid.toString()"
        :unit="$t('user.installments.stats.unit')"
        icon="mdi:check-circle"
        color="green"
      />
    </div>

    <!-- Filters & Table Card -->
    <BaseCard>
      <template #header>
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 class="text-xl font-bold text-gray-900">{{ $t('common.labels.installmentsList') }}</h2>

          <!-- Status Filter -->
          <FilterSelect v-model="selectedStatus" :label="$t('common.fields.statusLabel')" :options="statusOptions" />
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!installments || installments.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Icon name="mdi:calendar-blank" size="32" class="text-gray-400" />
        </div>
        <p class="text-gray-500 text-lg font-medium mb-2">{{ $t('user.installments.empty.title') }}</p>
        <p class="text-gray-400 text-sm">{{ $t('user.installments.empty.subtitle') }}</p>
      </div>

      <!-- Table -->
      <div v-else>
        <UserInstallmentsTable
          :installments="installments"
          :offset="(currentPage - 1) * itemsPerPage"
        />

        <!-- Pagination -->
        <div class="mt-6 flex justify-center">
          <BasePagination
            :current-page="currentPage"
            :total-items="totalItems"
            :items-per-page="itemsPerPage"
            @update:current-page="currentPage = $event"
          />
        </div>
      </div>
    </BaseCard>
  </UserPage>
</template>
