<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { useApiCall } from '~/composables/useApiCall'
import type { AdminUser, UsersListResponse } from '~/types/admin'
import type { TableColumn } from '~/components/Base/Table.vue'
import { formatNumber } from '~/utils/formatters'
import { getUserDisplayName } from '~/func/getUserDisplayName'

useHead({
  title: 'مدیریت کاربران - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const { confirm } = useConfirm()
const { execute } = useApiCall()

// Check if user is admin
if (!authStore.isAdmin) {
  router.push('/dashboard')
}

// State
const users = ref<AdminUser[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const showCsvImportModal = ref(false)

// Pagination & Filters
const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)
const search = ref('')
const statusFilter = ref<boolean | ''>('')

// Filter fields definition
const filterFields = computed(() => [
  {
    key: 'status',
    type: 'select' as const,
    modelValue: statusFilter.value,
    options: [
      { label: 'همه وضعیت‌ها', value: '' },
      { label: 'فعال', value: true },
      { label: 'غیرفعال', value: false }
    ]
  }
])

// Table columns
const columns: TableColumn<AdminUser>[] = [
  { key: 'id', label: 'شناسه', align: 'center' },
  { 
    key: 'fullName', 
    label: 'نام', 
    align: 'center', 
    format: (val, row) => getUserDisplayName(row)
  },
  { key: 'phoneNumber', label: 'موبایل', align: 'center' },
  { key: 'nationalCode', label: 'کد ملی', align: 'center' },
  { key: 'role', label: 'نقش', align: 'center' },
  { 
    key: 'totalDebt', 
    label: 'بدهی', 
    align: 'center',
    format: (val) => formatNumber(val)
  },
  { key: 'isActive', label: 'وضعیت', align: 'center' }
]

// Computed
const totalPages = computed(() => Math.ceil(total.value / limit.value))
const offset = computed(() => (currentPage.value - 1) * limit.value)
const totalUsers = computed(() => total.value)

// Fetch users
const fetchUsers = async () => {
  try {
    isLoading.value = true
    error.value = null

    const query: any = {
      limit: limit.value,
      offset: offset.value
    }

    if (search.value) query.search = search.value
    if (statusFilter.value !== '') query.isActive = statusFilter.value

    const response: UsersListResponse = await adminApi.getUsers(query)
    users.value = response.data
    total.value = response.meta.total
  } catch (err: any) {
    error.value = err.data?.message || 'خطا در دریافت کاربران'
    console.error('Error fetching users:', err)
  } finally {
    isLoading.value = false
  }
}

// Handle search
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

// Handle filter change
const handleFilterChange = () => {
  currentPage.value = 1
  fetchUsers()
}

// Handle page change
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchUsers()
}

// Toggle user status
const handleToggleStatus = async (user: AdminUser) => {
  // Prevent toggling admin users
  if (user.role === 'ADMIN') {
    toast.error('امکان تغییر وضعیت مدیران وجود ندارد')
    return
  }

  // Confirm action
  const action = user.isActive ? 'غیرفعال' : 'فعال'
  const confirmed = await confirm({
    title: `${action} کردن کاربر`,
    message: `آیا از ${action} کردن کاربر "${getUserDisplayName(user)}" اطمینان دارید؟`,
    type: 'warning',
    confirmText: `بله، ${action} شود`
  })

  if (!confirmed) return

  await execute(
    () => adminApi.toggleUserStatus(user.id),
    {
      successMessage: 'وضعیت کاربر با موفقیت تغییر کرد',
      onSuccess: () => fetchUsers()
    }
  )
}

// Delete user
const handleDeleteUser = async (user: AdminUser) => {
  const confirmed = await confirm({
    title: 'حذف کاربر',
    message: `آیا از حذف کاربر "${getUserDisplayName(user)}" اطمینان دارید؟`,
    type: 'danger',
    confirmText: 'بله، حذف شود'
  })

  if (!confirmed) return

  await execute(
    () => adminApi.deleteUser(user.id),
    {
      successMessage: 'کاربر با موفقیت حذف شد',
      onSuccess: () => fetchUsers()
    }
  )
}

// Handle CSV import success
const handleCsvImportSuccess = () => {
  fetchUsers() // Refresh the users list
}

// Load users on mount
onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <!-- Header -->
    <AdminHeader title="مدیریت کاربران" />

    <!-- Main Content -->
    <main class="max-w-[1330px] mx-auto px-4 py-8">
      <!-- Filters Section -->
      <BaseFiltersBar
        title=""
        :show-search="true"
        search-placeholder="جستجو در نام، موبایل یا کد ملی..."
        :search-value="search"
        :fields="filterFields"
        @search="(val) => { search = val; handleSearch() }"
        @apply="handleFilterChange"
        @reset="() => { search = ''; statusFilter = ''; handleFilterChange() }"
        @update:field="(key, val) => {
          if (key === 'status') statusFilter = val === '' ? '' : val === 'true'
        }"
      />

      <!-- Loading State -->
      <BaseCard v-if="isLoading">
        <StateLoader message="در حال بارگذاری کاربران..." />
      </BaseCard>

      <!-- Error State -->
      <StateError
        v-else-if="error"
        :message="error"
        @retry="fetchUsers"
      />

      <!-- Users Table -->
      <BaseCard v-else :padding="false">
        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-900">لیست کاربران</h3>
            <p class="text-sm text-gray-600">تعداد: {{ total.toLocaleString('fa-IR') }} کاربر</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="showCsvImportModal = true"
              class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              افزودن گروهی
            </button>
            <NuxtLink
              to="/admin/users/create"
              class="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              ایجاد کاربر جدید
            </NuxtLink>
          </div>
        </div>

        <!-- Table -->
        <BaseTable :columns="columns" :data="users">
          <!-- Phone Number Cell -->
          <template #cell-phoneNumber="{ value }">
            <div class="text-sm text-gray-900" dir="ltr">{{ value }}</div>
          </template>

          <!-- Role Cell -->
          <template #cell-role="{ row }">
            <BaseBadge :variant="row.role === 'ADMIN' ? 'primary' : 'info'">
              {{ row.role === 'ADMIN' ? 'مدیر' : 'کاربر' }}
            </BaseBadge>
          </template>

          <!-- Total Debt Cell -->
          <template #cell-totalDebt="{ value }">
            <div dir="ltr">{{ value }}</div>
          </template>

          <!-- Status Cell -->
          <template #cell-isActive="{ row }">
            <BaseBadge :variant="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? 'فعال' : 'غیرفعال' }}
            </BaseBadge>
          </template>

          <!-- Actions -->
          <template #actions="{ row }">
            <div class="flex items-center justify-center gap-2">
              <NuxtLink
                :to="`/admin/users/${row.id}`"
                title="مشاهده جزئیات"
                class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </NuxtLink>
              <NuxtLink
                :to="`/admin/users/edit/${row.id}`"
                title="ویرایش"
                class="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </NuxtLink>
              <button
                v-if="row.role !== 'ADMIN'"
                @click="handleToggleStatus(row)"
                :title="row.isActive ? 'غیرفعال کردن' : 'فعال کردن'"
                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
              <button
                @click="handleDeleteUser(row)"
                title="حذف"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </template>
        </BaseTable>

        <!-- Pagination -->
        <BasePagination
          :page="currentPage"
          :total="totalUsers"
          :limit="limit"
          @update:page="goToPage"
        />
      </BaseCard>
    </main>

    <!-- CSV Import Modal -->
    <AdminCsvImportModal
      v-model="showCsvImportModal"
      @success="handleCsvImportSuccess"
    />
  </div>
</template>
