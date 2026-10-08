<script setup lang="ts">
import { useAdminGuard } from '~/composables/useAdminGuard'
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { useApiCall } from '~/composables/useApiCall'
import type { AdminUser, UsersListResponse } from '~/types/admin'
import type { TableColumn } from '~/components/Base/Table.vue'
import { formatNumber } from '~/utils/formatters'
import { getUserDisplayName } from '~/func/getUserDisplayName'
import { ACTIVE_STATUS_BADGES, USER_ROLE_BADGES } from '~/constants/badges'

useHead({
  title: 'مدیریت کاربران - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()
const { confirm } = useConfirm()
const { execute } = useApiCall()

useAdminGuard()

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
// مرتب‌سازی بر اساس میزان بدهی: '' = پیش‌فرض، 'debt_desc' = بیشترین، 'debt_asc' = کمترین
const sortFilter = ref<'' | 'debt_desc' | 'debt_asc'>('')

// Filter fields definition
const filterFields = computed(() => [
  {
    key: 'status',
    label: 'وضعیت',
    type: 'select' as const,
    modelValue: statusFilter.value,
    options: [
      { label: 'همه وضعیت‌ها', value: '' },
      { label: 'فعال', value: true },
      { label: 'غیرفعال', value: false }
    ]
  },
  {
    key: 'sort',
    label: 'مرتب سازی بر اساس',
    type: 'select' as const,
    modelValue: sortFilter.value,
    options: [
      { label: 'جدیدترین', value: '' },
      { label: 'بیشترین بدهی', value: 'debt_desc' },
      { label: 'کمترین بدهی', value: 'debt_asc' }
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
    if (sortFilter.value !== '') {
      query.sortBy = 'totalDebt'
      query.sortOrder = sortFilter.value === 'debt_desc' ? 'desc' : 'asc'
    }

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
  <AdminPage title="مدیریت کاربران">
    <!-- Filters Section -->
    <BaseFiltersBar
      title=""
      :show-search="true"
      search-placeholder="جستجو در نام، موبایل یا کد ملی..."
      :search-value="search"
      :fields="filterFields"
      @search="(val) => { search = val; handleSearch() }"
      @apply="handleFilterChange"
      @reset="() => { search = ''; statusFilter = ''; sortFilter = ''; handleFilterChange() }"
      @update:field="(key, val) => {
        if (key === 'status') statusFilter = val === '' ? '' : val === 'true'
        if (key === 'sort') sortFilter = val
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
          <p class="text-sm text-gray-600">تعداد: {{ formatNumber(total) }} کاربر</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- <button
            @click="showCsvImportModal = true"
            class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <IconsOutline name="upload" class="w-5 h-5" />
            بدهی گروهی
          </button> -->
          <NuxtLink
            to="/admin/users/create"
            class="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
          >
            <IconsOutline name="plus-large" class="w-5 h-5" />
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
          <BaseStatusBadge :map="USER_ROLE_BADGES" :value="row.role" />
        </template>

        <!-- Total Debt Cell -->
        <template #cell-totalDebt="{ value }">
          <div dir="ltr">{{ value }}</div>
        </template>

        <!-- Status Cell -->
        <template #cell-isActive="{ row }">
          <BaseStatusBadge :map="ACTIVE_STATUS_BADGES" :value="row.isActive" />
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
              <IconsOutline name="edit" class="w-5 h-5" />
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
              <IconsOutline name="trash" class="w-5 h-5" />
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

    <template #overlays>
      <!-- CSV Import Modal -->
      <AdminCsvImportModal
        v-model="showCsvImportModal"
        @success="handleCsvImportSuccess"
      />
    </template>
  </AdminPage>
</template>
