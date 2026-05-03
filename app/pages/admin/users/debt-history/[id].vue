<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import { formatDate, formatCurrency } from '~/utils/formatters'
import { getUserDisplayName } from '~/func/getUserDisplayName'

useHead({
  title: 'تاریخچه بدهی - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

// Check if user is admin
if (!authStore.isAdmin) {
  router.push('/dashboard')
}

const userId = parseInt(route.params.id as string)

// State
const user = ref<any>(null)
const history = ref<any[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Pagination
const page = ref(1)
const limit = 20
const total = ref(0)

// Fetch user info
const fetchUserInfo = async () => {
  try {
    user.value = await adminApi.getUserById(userId)
  } catch (err: any) {
    console.error('Error fetching user:', err)
  }
}

// Fetch debt history
const fetchDebtHistory = async () => {
  try {
    isLoading.value = true
    error.value = null
    const offset = (page.value - 1) * limit
    const response = await adminApi.getDebtHistory(userId, limit, offset)
    history.value = response.data.transactions || []
    total.value = response.data.meta?.total || 0
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'خطا در دریافت تاریخچه بدهی'
    console.error('Error fetching debt history:', err)
  } finally {
    isLoading.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchUserInfo()
  fetchDebtHistory()
})

// Watch page changes
watch(page, () => {
  fetchDebtHistory()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <!-- Header -->
    <AdminHeader title="تاریخچه بدهی" />

    <!-- Main Content -->
    <main class="max-w-[1330px] mx-auto px-4 py-8">
      <!-- User Info Card -->
      <div v-if="user" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">{{ getUserDisplayName(user) }}</h2>
              <p class="text-sm text-gray-600" dir="ltr">{{ user.phoneNumber }}</p>
            </div>
          </div>
          <div class="text-left">
            <p class="text-sm text-gray-600 mb-1">بدهی فعلی</p>
            <p class="text-2xl font-bold" :class="parseInt(user.totalDebt) > 0 ? 'text-red-600' : 'text-green-600'" dir="ltr">
              {{ formatCurrency(user.totalDebt, true) }}
            </p>
          </div>
        </div>
      </div>

      <!-- History Table -->
      <BaseCard :padding="false">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-bold text-gray-900">تاریخچه تغییرات بدهی</h3>
          <p class="text-sm text-gray-600">تمام عملیات افزایش و کاهش بدهی</p>
        </div>

        <!-- Loading State -->
        <StateLoader v-if="isLoading" message="در حال بارگذاری..." />

        <!-- Error State -->
        <StateError v-else-if="error" :message="error" @retry="fetchDebtHistory" />

        <!-- Table -->
        <BaseTable v-else-if="history.length > 0" :columns="[
          { key: 'id', label: 'شناسه', align: 'center' },
          { key: 'type', label: 'نوع عملیات', align: 'center' },
          { key: 'amount', label: 'مبلغ', align: 'center' },
          { key: 'loanNumber', label: 'شماره تسهیلات', align: 'center' },
          { key: 'status', label: 'وضعیت', align: 'center' },
          { key: 'description', label: 'توضیحات', align: 'center', format: (val) => val || '-' },
          { key: 'transactionDate', label: 'تاریخ', align: 'center', format: (val) => formatDate(val) }
        ]" :data="history">
          <!-- Type Cell -->
          <template #cell-type="{ row }">
            <BaseBadge
              :variant="row.type === 'ADMIN_DEBT_ADD' || row.type === 'LEGAL_DEBT_ADD' ? 'danger' : 'success'"
            >
              {{
                row.type === 'ADMIN_DEBT_ADD' ? 'افزایش بدهی' :
                row.type === 'LEGAL_DEBT_ADD' ? 'افزایش بدهی حقوقی' :
                'کاهش بدهی'
              }}
            </BaseBadge>
          </template>

          <!-- Amount Cell -->
          <template #cell-amount="{ row }">
            <div dir="ltr" :class="row.type === 'ADMIN_DEBT_ADD' || row.type === 'LEGAL_DEBT_ADD' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">
              {{ row.type === 'ADMIN_DEBT_ADD' || row.type === 'LEGAL_DEBT_ADD' ? '+' : '-' }}{{ formatCurrency(row.amount) }}
            </div>
          </template>

          <!-- Loan Cell -->
          <template #cell-loanNumber="{ row }">
            <div dir="ltr" class="font-medium">
              {{ row.loanNumber ?? row.loan?.loanNumber ?? '-' }}
            </div>
          </template>

          <!-- Status Cell -->
          <template #cell-status="{ row }">
            <BaseBadge
              :variant="row.status === 'SUCCESS' ? 'success' : row.status === 'FAILED' ? 'danger' : 'gray'"
            >
              {{
                row.status === 'SUCCESS' ? 'موفق' :
                row.status === 'FAILED' ? 'ناموفق' :
                'در انتظار'
              }}
            </BaseBadge>
          </template>
        </BaseTable>

        <!-- Empty State -->
        <StateEmpty
          v-else
          icon="document"
          message="تاریخچه‌ای یافت نشد"
        />

        <!-- Pagination -->
        <BasePagination
          v-if="!isLoading"
          :page="page"
          :total="total"
          :limit="limit"
          @update:page="(newPage) => page = newPage"
        />
      </BaseCard>
    </main>
  </div>
</template>
