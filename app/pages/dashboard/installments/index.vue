<script setup lang="ts">
import { formatCurrency } from '~/utils/formatters'
import { useMyInstallments } from '~/composables/useMyInstallments'
import UserInstallmentsTable from '~/components/User/installments/UserInstallmentsTable.vue'
import FilterSelect from '~/components/User/FilterSelect.vue'

useHead({
  title: 'اقساط من - عماد ایران'
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
  { value: 'ALL', label: 'همه' },
  { value: 'PENDING', label: 'در انتظار' },
  { value: 'PAID', label: 'پرداخت شده' },
  { value: 'OVERDUE', label: 'عقب افتاده' }
]
</script>

<template>
  <UserPage title="اقساط من">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <BaseStatsCard
        title="اقساط عقب افتاده"
        :value="stats.overdue.toString()"
        unit="قسط"
        icon="mdi:alert-circle"
        color="red"
      />
      <BaseStatsCard
        title="مبلغ اقساط عقب افتاده"
        :value="formatCurrency(stats.overdueAmount)"
        unit="ریال"
        icon="mdi:cash-remove"
        color="orange"
      />
      <BaseStatsCard
        title="اقساط باقی‌مانده"
        :value="stats.remaining.toString()"
        unit="قسط"
        icon="mdi:calendar-clock"
        color="blue"
      />
      <BaseStatsCard
        title="اقساط پرداخت شده"
        :value="stats.paid.toString()"
        unit="قسط"
        icon="mdi:check-circle"
        color="green"
      />
    </div>

    <!-- Filters & Table Card -->
    <BaseCard>
      <template #header>
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 class="text-xl font-bold text-gray-900">لیست اقساط</h2>

          <!-- Status Filter -->
          <FilterSelect v-model="selectedStatus" label="وضعیت:" :options="statusOptions" />
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
        <p class="text-gray-500 text-lg font-medium mb-2">هیچ قسطی یافت نشد</p>
        <p class="text-gray-400 text-sm">در حال حاضر قسطی برای نمایش وجود ندارد</p>
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
