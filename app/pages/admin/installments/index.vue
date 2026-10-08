<script setup lang="ts">
import { useAdminGuard } from '~/composables/useAdminGuard'
import { installmentsApi } from '~/services/api/installments'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { useApiCall } from '~/composables/useApiCall'
import type { Installment, GetInstallmentsQuery } from '~/types/installment'
import { formatDate, formatNumber, formatCurrency } from '~/utils/formatters'
import { getUserDisplayName } from '~/func/getUserDisplayName'
import { INSTALLMENT_STATUS_BADGES } from '~/constants/badges'

useHead({
  title: 'مدیریت اقساط - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()
const { confirm } = useConfirm()
const { execute } = useApiCall()

useAdminGuard()

// State
const installments = ref<Installment[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Filters
const filters = ref<GetInstallmentsQuery>({
  limit: 20,
  offset: 0,
  status: undefined,
  phoneNumber: undefined,
  firstName: undefined,
  lastName: undefined,
  loanNumber: undefined
})

// Filter fields definition
const filterFields = computed(() => [
  {
    key: 'phoneNumber',
    label: 'شماره تلفن',
    type: 'text' as const,
    placeholder: '09123456789',
    modelValue: filters.value.phoneNumber
  },
  {
    key: 'firstName',
    label: 'نام',
    type: 'text' as const,
    placeholder: 'نام',
    modelValue: filters.value.firstName
  },
  {
    key: 'lastName',
    label: 'نام خانوادگی',
    type: 'text' as const,
    placeholder: 'نام خانوادگی',
    modelValue: filters.value.lastName
  },
  {
    key: 'loanNumber',
    label: 'شماره تسهیلات',
    type: 'text' as const,
    placeholder: 'LN_0000000001',
    modelValue: filters.value.loanNumber
  },
  {
    key: 'status',
    label: 'وضعیت',
    type: 'select' as const,
    modelValue: filters.value.status,
    options: [
      { label: 'همه', value: undefined },
      { label: 'در انتظار', value: 'PENDING' },
      { label: 'پرداخت شده', value: 'PAID' },
      { label: 'عقب افتاده', value: 'OVERDUE' }
    ]
  }
])

// Pagination
const page = ref(1)
const total = ref(0)

// Modal States
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingInstallment = ref<Installment | null>(null)

// Fetch installments
const fetchInstallments = async () => {
  try {
    isLoading.value = true
    error.value = null
    filters.value.offset = (page.value - 1) * (filters.value.limit || 20)
        
    // Clean filters - remove undefined/empty values
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters.value).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    )
    
    
    const response = await installmentsApi.getInstallments(cleanedFilters as GetInstallmentsQuery)
    installments.value = response.data.data || []
    total.value = response.data.meta?.total || 0
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'خطا در دریافت لیست اقساط'
    console.error('Error fetching installments:', err)
  } finally {
    isLoading.value = false
  }
}

// Handle filter field updates
const handleFilterUpdate = (key: string, val: any) => {
  
  if (key === 'phoneNumber') {
    const trimmed = val?.trim()
    filters.value.phoneNumber = trimmed || undefined
  }
  else if (key === 'firstName') {
    const trimmed = val?.trim()
    filters.value.firstName = trimmed || undefined
  }
  else if (key === 'lastName') {
    const trimmed = val?.trim()
    filters.value.lastName = trimmed || undefined
  }
  else if (key === 'loanNumber') {
    const trimmed = val?.trim()
    filters.value.loanNumber = trimmed || undefined
  }
  else if (key === 'status') {
    filters.value.status = val === 'undefined' ? undefined : val
  }
  
}

// Handle search
const handleSearch = () => {
  page.value = 1
  fetchInstallments()
}

// Reset filters
const resetFilters = () => {
  filters.value = {
    limit: 20,
    offset: 0,
    status: undefined,
    phoneNumber: undefined,
    firstName: undefined,
    lastName: undefined,
    loanNumber: undefined
  }
  page.value = 1
  fetchInstallments()
}

// Handle edit
const handleEdit = (installment: Installment) => {
  if (installment.status === 'PAID') {
    toast.error('قسط پرداخت شده قابل ویرایش نیست')
    return
  }
  editingInstallment.value = installment
  showEditModal.value = true
}

// Handle change status
const handleChangeStatus = async (installment: Installment) => {
  const newStatus = installment.status === 'PENDING' ? 'PAID' : 
                    installment.status === 'PAID' ? 'PENDING' : 'PENDING'
  
  const confirmed = await confirm({
    message: 'آیا از تغییر وضعیت این قسط اطمینان دارید؟',
    type: 'warning'
  })

  if (!confirmed) return
  
  await execute(
    () => installmentsApi.changeStatus(installment.id, { status: newStatus }),
    {
      successMessage: 'وضعیت قسط با موفقیت تغییر کرد',
      onSuccess: () => fetchInstallments()
    }
  )
}

// Handle delete
const handleDelete = async (installment: Installment) => {
  if (installment.status === 'PAID') {
    toast.error('قسط پرداخت شده قابل حذف نیست')
    return
  }
  
  const confirmed = await confirm({
    message: `آیا از حذف قسط شماره ${installment.id} اطمینان دارید؟`,
    type: 'danger',
    confirmText: 'حذف'
  })

  if (!confirmed) return
  
  await execute(
    () => installmentsApi.deleteInstallment(installment.id),
    {
      successMessage: 'قسط با موفقیت حذف شد',
      onSuccess: () => fetchInstallments()
    }
  )
}

// Load data on mount
onMounted(() => {
  fetchInstallments()
})

// Watch page changes
watch(page, () => {
  fetchInstallments()
})
</script>

<template>
  <AdminPage title="مدیریت اقساط">
    <!-- Filters -->
    <BaseFiltersBar
      :fields="filterFields"
      @apply="handleSearch"
      @reset="resetFilters"
      @update:field="handleFilterUpdate"
    />

    <!-- Table -->
    <BaseCard :padding="false">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900">لیست اقساط</h3>
          <p class="text-sm text-gray-600">تعداد: {{ formatNumber(total) }} قسط</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
        >
          <IconsOutline name="plus" class="w-5 h-5" />
          ایجاد قسط جدید
        </button>
      </div>

      <!-- Loading State -->
      <StateLoader v-if="isLoading" message="در حال بارگذاری..." />

      <!-- Error State -->
      <StateError v-else-if="error" :message="error" @retry="fetchInstallments" />

      <!-- Table -->
      <BaseTable v-else-if="installments.length > 0" :columns="[
        { key: 'id', label: 'شناسه', align: 'center' },
        { key: 'userId', label: 'کاربر', align: 'center' },
        { key: 'amount', label: 'مبلغ (ریال)', align: 'center', format: (val) => formatCurrency(val) },
        { key: 'loan', label: 'شماره تسهیلات', align: 'center' },
        { key: 'dueDate', label: 'تاریخ سررسید', align: 'center', format: (val) => formatDate(val) },
        { key: 'status', label: 'وضعیت', align: 'center' },
        { key: 'description', label: 'توضیحات', align: 'center', format: (val) => val || '-' }
      ]" :data="installments">
        <!-- User Cell -->
        <template #cell-userId="{ row }">
          <NuxtLink
            :to="`/admin/users/${row.userId}`"
            class="text-primary hover:underline font-medium"
          >
            {{ row.user ? getUserDisplayName(row.user) : `#${row.userId}` }}
          </NuxtLink>
        </template>

        <!-- Amount Cell -->
        <template #cell-amount="{ value }">
          <div class="font-bold" dir="ltr">{{ value }}</div>
        </template>

        <!-- Loan Cell -->
        <template #cell-loan="{ row }">
          <div dir="ltr" class="font-medium">
            {{ row.loan?.loanNumber || 'ندارد' }}
          </div>
        </template>

        <!-- Status Cell -->
        <template #cell-status="{ row }">
          <BaseStatusBadge :map="INSTALLMENT_STATUS_BADGES" :value="row.status" />
        </template>

        <!-- Actions -->
        <template #actions="{ row }">
          <div class="flex items-center justify-center gap-2">
            <button
              v-if="row.status !== 'PAID'"
              @click="handleEdit(row)"
              title="ویرایش"
              class="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <IconsOutline name="edit" class="w-5 h-5" />
            </button>
            <button
              @click="handleChangeStatus(row)"
              title="تغییر وضعیت"
              class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
            >
              <IconsOutline name="check-circle" class="w-5 h-5" />
            </button>
            <button
              v-if="row.status !== 'PAID'"
              @click="handleDelete(row)"
              title="حذف"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <IconsOutline name="trash" class="w-5 h-5" />
            </button>
          </div>
        </template>
      </BaseTable>

      <!-- Empty State -->
      <StateEmpty
        v-else
        icon="document"
        message="قسطی یافت نشد"
      />

      <!-- Pagination -->
      <BasePagination
        v-if="!isLoading"
        :page="page"
        :total="total"
        :limit="filters.limit || 20"
        @update:page="(newPage) => page = newPage"
      />
    </BaseCard>

    <template #overlays>
      <!-- Create Modal -->
      <AdminInstallmentsCreateModal
        v-if="showCreateModal"
        @close="showCreateModal = false"
        @created="fetchInstallments"
      />

      <!-- Edit Modal -->
      <AdminInstallmentsEditModal
        v-if="showEditModal && editingInstallment"
        :installment="editingInstallment"
        @close="showEditModal = false; editingInstallment = null"
        @updated="fetchInstallments"
      />
    </template>
  </AdminPage>
</template>
