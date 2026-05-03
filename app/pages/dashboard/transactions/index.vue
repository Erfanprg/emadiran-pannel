<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { userApi } from '~/services/api/user'
import { formatCurrency, formatDate } from '~/utils/formatters'
import type { Transaction } from '~/types/transaction'

useHead({
  title: 'تاریخچه بدهی‌ها - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// State
const loading = ref(true)
const transactions = ref<Transaction[]>([])
const allTransactions = ref<Transaction[]>([])
const selectedStatus = ref<'ALL' | 'SUCCESS' | 'FAILED' | 'PENDING'>('ALL')
const selectedType = ref<'ALL' | 'DEBT_PAYMENT' | 'ADMIN_DEBT_ADD' | 'LEGAL_DEBT_ADD' | 'ADMIN_DEBT_REDUCE'>('ALL')
const currentPage = ref(1)
const itemsPerPage = 10
const totalItems = ref(0)

// Stats
const stats = computed(() => {
  const successful = allTransactions.value.filter(t => t.status === 'SUCCESS' && t.type === 'DEBT_PAYMENT')
  const lastPayment = successful.length > 0 
    ? successful.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null

  return {
    successfulCount: successful.length,
    successfulAmount: successful
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      .toString(),
    lastPaymentDate: lastPayment ? formatDate(lastPayment.createdAt) : '-',
    lastPaymentAmount: lastPayment ? lastPayment.amount : '0'
  }
})

// Fetch transactions
const fetchTransactions = async () => {
  loading.value = true
  try {
    const params: any = {
      limit: itemsPerPage,
      offset: (currentPage.value - 1) * itemsPerPage
    }
    
    if (selectedStatus.value !== 'ALL') {
      params.status = selectedStatus.value
    }
    if (selectedType.value !== 'ALL') {
      params.type = selectedType.value
    }

    const response = await userApi.getTransactions(params)
    transactions.value = response.data || []
    totalItems.value = response.total || 0

    // Fetch all transactions for stats (without pagination)
    const allResponse = await userApi.getTransactions({})
    allTransactions.value = allResponse.data || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
    transactions.value = []
  } finally {
    loading.value = false
  }
}

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

// Status badge config
const getStatusBadge = (status: string) => {
  const badges = {
    SUCCESS: { text: 'موفق', variant: 'success' },
    FAILED: { text: 'ناموفق', variant: 'danger' },
    PENDING: { text: 'در انتظار', variant: 'warning' }
  }
  return badges[status as keyof typeof badges] || { text: status, variant: 'default' }
}

// Type badge config
const getTypeBadge = (type: string) => {
  const badges = {
    DEBT_PAYMENT: { text: 'پرداخت بدهی', variant: 'success' },
    ADMIN_DEBT_ADD: { text: 'افزایش بدهی', variant: 'danger' },
    LEGAL_DEBT_ADD: { text: 'افزایش بدهی حقوقی', variant: 'danger' },
    ADMIN_DEBT_REDUCE: { text: 'کاهش بدهی', variant: 'success' }
  }
  return badges[type as keyof typeof badges] || { text: type, variant: 'default' }
}

// Table columns
const columns = [
  { key: 'index', label: 'ردیف' },
  { key: 'amount', label: 'مبلغ' },
  { key: 'type', label: 'نوع' },
  { key: 'loanNumber', label: 'شماره تسهیلات' },
  { key: 'status', label: 'وضعیت' },
  { key: 'createdAt', label: 'تاریخ' },
  { key: 'description', label: 'توضیحات' }
]

// Watch filters
watch([selectedStatus, selectedType, currentPage], () => {
  fetchTransactions()
})

// Fetch on mount
onMounted(() => {
  fetchTransactions()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <!-- Header -->
    <UserHeader title="تاریخچه بدهی‌های من" />

    <!-- Main Content -->
    <main class="max-w-[1330px] mx-auto px-4 py-8">
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
              
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">نوع:</label>
                <select
                  v-model="selectedType"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!transactions || transactions.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Icon name="mdi:receipt-text-outline" size="32" class="text-gray-400" />
          </div>
          <p class="text-gray-500 text-lg font-medium mb-2">هیچ موردی یافت نشد</p>
          <p class="text-gray-400 text-sm">در حال حاضر موردی برای نمایش وجود ندارد</p>
        </div>

        <!-- Table -->
        <div v-else>
          <BaseTable :columns="columns" :data="transactions">
            <template #cell-index="{ index }">
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </template>
            <template #cell-amount="{ row }">
              <span class="font-medium" dir="ltr">{{ formatCurrency(row.amount) }}</span>
            </template>
            <template #cell-type="{ row }">
              <BaseBadge :variant="getTypeBadge(row.type).variant as any">
                {{ getTypeBadge(row.type).text }}
              </BaseBadge>
            </template>
            <template #cell-loanNumber="{ row }">
              <span dir="ltr">{{ row.loanNumber ?? row.loan?.loanNumber ?? '-' }}</span>
            </template>
            <template #cell-status="{ row }">
              <BaseBadge :variant="getStatusBadge(row.status).variant as any">
                {{ getStatusBadge(row.status).text }}
              </BaseBadge>
            </template>
            <template #cell-createdAt="{ row }">
              {{ formatDate(row.transactionDate) }}
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
