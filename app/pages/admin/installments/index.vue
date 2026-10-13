<script setup lang="ts">
import { useAdminGuard } from '~/composables/useAdminGuard'
import { useListFilters } from '~/composables/useListFilters'
import { installmentsApi } from '~/services/api/installments'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { useApiCall } from '~/composables/useApiCall'
import type { Installment, GetInstallmentsQuery } from '~/types/installment'
import { formatDate, formatNumber, formatCurrency } from '~/utils/formatters'
import { getUserDisplayName } from '~/func/getUserDisplayName'
import { INSTALLMENT_STATUS_BADGES } from '~/constants/badges'

const { t } = useI18n()

useHead({
  title: t('seo.admin.installments')
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
const {
  filters,
  updateFilter: handleFilterUpdate,
  resetFilterValues,
  getCleanedFilters
} = useListFilters<GetInstallmentsQuery>(
  () => ({
    limit: 20,
    offset: 0,
    status: undefined,
    phoneNumber: undefined,
    firstName: undefined,
    lastName: undefined,
    loanNumber: undefined
  }),
  ['phoneNumber', 'firstName', 'lastName', 'loanNumber'],
  ['status']
)

// Filter fields definition
const filterFields = computed(() => [
  {
    key: 'phoneNumber',
    label: t('common.fields.phone'),
    type: 'text' as const,
    placeholder: '09123456789',
    modelValue: filters.value.phoneNumber
  },
  {
    key: 'firstName',
    label: t('common.fields.name'),
    type: 'text' as const,
    placeholder: t('common.fields.name'),
    modelValue: filters.value.firstName
  },
  {
    key: 'lastName',
    label: t('common.fields.lastName'),
    type: 'text' as const,
    placeholder: t('common.fields.lastName'),
    modelValue: filters.value.lastName
  },
  {
    key: 'loanNumber',
    label: t('common.fields.loanNumber'),
    type: 'text' as const,
    placeholder: 'LN_0000000001',
    modelValue: filters.value.loanNumber
  },
  {
    key: 'status',
    label: t('common.fields.status'),
    type: 'select' as const,
    modelValue: filters.value.status,
    options: [
      { label: t('common.filters.all'), value: undefined },
      { label: t('status.pending'), value: 'PENDING' },
      { label: t('status.paid'), value: 'PAID' },
      { label: t('status.overdue'), value: 'OVERDUE' }
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

    const response = await installmentsApi.getInstallments(getCleanedFilters() as GetInstallmentsQuery)
    installments.value = response.data.data || []
    total.value = response.data.meta?.total || 0
  } catch (err: any) {
    error.value = err.data?.message || err.message || t('admin.installments.errors.fetch')
    console.error('Error fetching installments:', err)
  } finally {
    isLoading.value = false
  }
}

// Handle search
const handleSearch = () => {
  page.value = 1
  fetchInstallments()
}

// Reset filters
const resetFilters = () => {
  resetFilterValues()
  page.value = 1
  fetchInstallments()
}

// Handle edit
const handleEdit = (installment: Installment) => {
  if (installment.status === 'PAID') {
    toast.error(t('admin.installments.errors.paidNotEditable'))
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
    message: t('admin.installments.confirm.toggleStatus'),
    type: 'warning'
  })

  if (!confirmed) return
  
  await execute(
    () => installmentsApi.changeStatus(installment.id, { status: newStatus }),
    {
      successMessage: t('admin.installments.messages.statusChanged'),
      onSuccess: () => fetchInstallments()
    }
  )
}

// Handle delete
const handleDelete = async (installment: Installment) => {
  if (installment.status === 'PAID') {
    toast.error(t('admin.installments.errors.paidNotDeletable'))
    return
  }
  
  const confirmed = await confirm({
    message: t('admin.installments.confirm.delete', { id: installment.id }),
    type: 'danger',
    confirmText: t('global.button.delete')
  })

  if (!confirmed) return
  
  await execute(
    () => installmentsApi.deleteInstallment(installment.id),
    {
      successMessage: t('admin.installments.messages.deleted'),
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
  <AdminPage :title="$t('admin.installments.title')">
    <!-- Filters -->
    <BaseFiltersBar
      :fields="filterFields"
      @apply="handleSearch"
      @reset="resetFilters"
      @update:field="handleFilterUpdate"
    />

    <!-- Table -->
    <BaseCard :padding="false">
      <BaseCardHeader :title="$t('common.labels.installmentsList')" :subtitle="$t('admin.installments.list.count', { total: formatNumber(total) })">
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-medium"
        >
          <IconsOutline name="plus" class="w-5 h-5" />
          {{ $t('admin.installments.create.title') }}
        </button>
      </BaseCardHeader>

      <!-- Loading State -->
      <StateLoader v-if="isLoading" :message="$t('common.states.loading')" />

      <!-- Error State -->
      <StateError v-else-if="error" :message="error" @retry="fetchInstallments" />

      <!-- Table -->
      <BaseTable v-else-if="installments.length > 0" :columns="[
        { key: 'id', label: $t('common.fields.id'), align: 'center' },
        { key: 'userId', label: $t('admin.installments.fields.user'), align: 'center' },
        { key: 'amount', label: $t('common.fields.amountRial'), align: 'center', format: (val) => formatCurrency(val) },
        { key: 'loan', label: $t('common.fields.loanNumber'), align: 'center' },
        { key: 'dueDate', label: $t('common.fields.dueDate'), align: 'center', format: (val) => formatDate(val) },
        { key: 'status', label: $t('common.fields.status'), align: 'center' },
        { key: 'description', label: $t('common.fields.description'), align: 'center', format: (val) => val || '-' }
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
            {{ row.loan?.loanNumber || $t('common.labels.none') }}
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
              :title="$t('global.button.edit')"
              class="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <IconsOutline name="edit" class="w-5 h-5" />
            </button>
            <button
              @click="handleChangeStatus(row)"
              :title="$t('admin.installments.actions.toggleStatus')"
              class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
            >
              <IconsOutline name="check-circle" class="w-5 h-5" />
            </button>
            <button
              v-if="row.status !== 'PAID'"
              @click="handleDelete(row)"
              :title="$t('global.button.delete')"
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
        :message="$t('admin.installments.list.empty')"
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
