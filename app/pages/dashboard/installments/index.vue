<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { userApi } from '~/services/api/user'
import { formatCurrency, formatDate } from '~/utils/formatters'
import type { Installment } from '~/types/installment'

useHead({
  title: 'اقساط من - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// State
const loading = ref(true)
const installments = ref<Installment[]>([])
const allInstallments = ref<Installment[]>([])
const selectedStatus = ref<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE'>('ALL')
const currentPage = ref(1)
const itemsPerPage = 10
const totalItems = ref(0)

// Stats
const stats = computed(() => {
  const all = allInstallments.value
  return {
    overdue: all.filter(i => i.status === 'OVERDUE').length,
    overdueAmount: all
      .filter(i => i.status === 'OVERDUE')
      .reduce((sum, i) => sum + parseFloat(i.amount), 0)
      .toString(),
    remaining: all.filter(i => i.status === 'PENDING').length,
    paid: all.filter(i => i.status === 'PAID').length
  }
})

// Fetch installments
const fetchInstallments = async () => {
  loading.value = true
  try {
    const params: any = {
      limit: itemsPerPage,
      offset: (currentPage.value - 1) * itemsPerPage
    }
    
    if (selectedStatus.value !== 'ALL') {
      params.status = selectedStatus.value
    }

    const response = await userApi.getInstallments(params)
    installments.value = response.data || []
    totalItems.value = response.total || 0

    // Fetch all installments for stats (without pagination)
    const allResponse = await userApi.getInstallments({})
    allInstallments.value = allResponse.data || []
  } catch (error) {
    console.error('Error fetching installments:', error)
    installments.value = []
  } finally {
    loading.value = false
  }
}

// Status options
const statusOptions = [
  { value: 'ALL', label: 'همه' },
  { value: 'PENDING', label: 'در انتظار' },
  { value: 'PAID', label: 'پرداخت شده' },
  { value: 'OVERDUE', label: 'عقب افتاده' }
]

// Status badge config
const getStatusBadge = (status: string) => {
  const badges = {
    PENDING: { text: 'در انتظار', variant: 'warning' },
    PAID: { text: 'پرداخت شده', variant: 'success' },
    OVERDUE: { text: 'عقب افتاده', variant: 'danger' }
  }
  return badges[status as keyof typeof badges] || { text: status, variant: 'default' }
}

// Table columns
const columns = [
  { key: 'index', label: 'ردیف' },
  { key: 'amount', label: 'مبلغ قسط' },
  { key: 'loanNumber', label: 'شماره تسهیلات' },
  { key: 'dueDate', label: 'تاریخ سررسید' },
  { key: 'status', label: 'وضعیت' },
  { key: 'description', label: 'توضیحات' }
]

// Watch filters
watch([selectedStatus, currentPage], () => {
  fetchInstallments()
})

// Fetch on mount
onMounted(() => {
  fetchInstallments()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <!-- Header -->
    <UserHeader title="اقساط من" />

    <!-- Main Content -->
    <main class="max-w-[1330px] mx-auto px-4 py-8">
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
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-gray-700">وضعیت:</label>
              <select
                v-model="selectedStatus"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
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
          <BaseTable :columns="columns" :data="installments">
            <template #cell-index="{ index }">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </template>
            <template #cell-amount="{ row }">
              <span class="font-medium" dir="ltr">{{ formatCurrency(row.amount) }}</span>
            </template>
            <template #cell-loanNumber="{ row }">
              <span dir="ltr">{{ row.loan?.loanNumber || 'ندارد' }}</span>
            </template>
            <template #cell-dueDate="{ row }">
              {{ formatDate(row.dueDate) }}
            </template>
            <template #cell-status="{ row }">
              <BaseBadge :variant="getStatusBadge(row.status).variant as any">
                {{ getStatusBadge(row.status).text }}
              </BaseBadge>
            </template>
            <template #cell-description="{ row }">
              <span class="text-gray-600 text-sm">{{ row.description || '-' }}</span>
            </template>
          </BaseTable>

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
    </main>
  </div>
</template>
