<script setup lang="ts">
import { formatDate } from '~/utils/formatters'
import type { PaymentDeadline, PaymentDeadlinesMeta } from '~/types/admin'

const props = withDefaults(
  defineProps<{
    items: PaymentDeadline[]
    meta: PaymentDeadlinesMeta
    page: number
    limit: number
    currentId?: number | null
    isLoading?: boolean
    error?: string | null
    disableCreate?: boolean
  }>(),
  {
    currentId: null,
    isLoading: false,
    error: null,
    disableCreate: false
  }
)

const emit = defineEmits<{
  close: []
  create: []
  edit: [deadline: PaymentDeadline]
  'update:page': [page: number]
}>()

const columns = [
  { key: 'deadlineAt', label: 'تاریخ مهلت', align: 'center', format: (val: string) => formatDate(val) },
  { key: 'editReason', label: 'دلیل ویرایش', align: 'center', format: (val: string | null) => val || '-' }
]

const handleEdit = (deadline: PaymentDeadline) => {
  emit('edit', deadline)
}
</script>

<template>
  <BaseModal title="مهلت‌های پرداخت" max-width="2xl" @close="emit('close')">
    <template #header>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 class="text-xl font-bold text-gray-900">مهلت‌های پرداخت</h3>
        <button
          type="button"
          class="px-4 py-2.5 rounded-lg font-medium text-sm border transition-colors duration-200"
          :class="disableCreate
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-primary text-white border-primary hover:bg-accent'"
          :disabled="disableCreate"
          @click="emit('create')"
        >
          ثبت مهلت پرداخت
        </button>
      </div>
    </template>

    <div class="space-y-4">
      <StateLoader v-if="isLoading" message="در حال بارگذاری..." />

      <StateError
        v-else-if="error"
        :message="error"
        @retry="emit('update:page', page)"
      />

      <BaseTable
        v-else
        :columns="columns"
        :data="items"
      >
        <template #cell-deadlineAt="{ row }">
          <div class="flex items-center justify-center gap-2">
            <span>{{ formatDate(row.deadlineAt) }}</span>
            <span
              v-if="currentId === row.id"
              class="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700"
            >
              فعلی
            </span>
          </div>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center justify-center">
            <button
              type="button"
              class="p-2 rounded-lg border transition-colors duration-200"
              :class="currentId === row.id
                ? 'border-blue-200 text-blue-600 hover:bg-blue-50'
                : 'border-gray-200 text-gray-400 cursor-not-allowed'"
              :disabled="currentId !== row.id"
              @click="handleEdit(row)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4h2M12 2v2m7.071 1.929a2 2 0 010 2.828l-8.485 8.485a2 2 0 01-1.414.586H6a1 1 0 01-1-1v-3.172a2 2 0 01.586-1.414l8.485-8.485a2 2 0 012.828 0z" />
              </svg>
            </button>
          </div>
        </template>

        <template #empty>
          <div class="py-12 text-center text-gray-600 font-medium">
            مهلت پرداخت ثبت نشده.
          </div>
        </template>
      </BaseTable>

      <BasePagination
        v-if="!isLoading && meta.total > 0"
        :page="page"
        :total="meta.total"
        :limit="limit"
        @update:page="emit('update:page', $event)"
      />
    </div>
  </BaseModal>
</template>
