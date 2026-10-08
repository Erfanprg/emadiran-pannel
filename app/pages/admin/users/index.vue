<script setup lang="ts">
import { useAdminGuard } from '~/composables/useAdminGuard'
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { useApiCall } from '~/composables/useApiCall'
import type { AdminUser, UsersListResponse } from '~/types/admin'
import { formatNumber } from '~/utils/formatters'
import { getUserDisplayName } from '~/func/getUserDisplayName'
import UsersTable from '~/components/Admin/users/UsersTable.vue'

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
      <BaseCardHeader title="لیست کاربران" :subtitle="`تعداد: ${formatNumber(total)} کاربر`">
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
      </BaseCardHeader>

      <!-- Table -->
      <UsersTable
        :users="users"
        @toggle-status="handleToggleStatus"
        @delete="handleDeleteUser"
      />

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
