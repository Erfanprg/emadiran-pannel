<script setup lang="ts">
import { formatDate } from '~/utils/formatters'
import type { ContactHistoryItem, ContactHistoriesMeta } from '~/types/admin'

const props = withDefaults(
  defineProps<{
    items: ContactHistoryItem[]
    meta: ContactHistoriesMeta
    limit: number
    isLoading?: boolean
    isLoadingMore?: boolean
    error?: string | null
  }>(),
  {
    isLoading: false,
    isLoadingMore: false,
    error: null
  }
)

const emit = defineEmits<{
  close: []
  create: []
  refresh: []
  loadMore: []
}>()

const columns = [
  { key: 'index', label: 'ردیف', align: 'center', width: '80px' },
  { key: 'description', label: 'توضیحات', align: 'center', class: 'whitespace-normal max-w-[420px]' },
  { key: 'admin', label: 'اپراتور', align: 'center', format: (val: ContactHistoryItem['admin']) => val?.fullName || '-' },
  { key: 'createdAt', label: 'تاریخ و ساعت', align: 'center', format: (val: string) => formatDate(val, true) }
]
</script>

<template>
  <BaseModal title="تاریخچه تماس‌ها" max-width="2xl" @close="emit('close')">
    <div class="space-y-4">
      <StateLoader v-if="isLoading" message="در حال بارگذاری..." />

      <StateError
        v-else-if="error"
        :message="error"
        @retry="emit('refresh')"
      />

      <BaseTable
        v-else
        :columns="columns"
        :data="items"
      >
        <template #cell-index="{ index }">
          {{ index + 1 }}
        </template>

        <template #empty>
          <div class="py-12 text-center text-gray-600 font-medium">
            تاریخچه تماسی ثبت نشده.
          </div>
        </template>
      </BaseTable>

      <div v-if="meta.hasMore && !isLoading" class="flex justify-center">
        <button
          type="button"
          class="px-4 py-2.5 rounded-lg font-medium text-sm border transition-colors duration-200"
          :class="isLoadingMore
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'"
          :disabled="isLoadingMore"
          @click="emit('loadMore')"
        >
          <span v-if="isLoadingMore">در حال بارگذاری...</span>
          <span v-else>نمایش بیشتر</span>
        </button>
      </div>
    </div>

    <template #footer>
      <div class="w-full flex justify-center">
        <button
          type="button"
          class="px-6 py-2.5 rounded-lg font-medium text-sm bg-primary text-white hover:bg-accent transition-colors duration-200"
          @click="emit('create')"
        >
         <span class="pt-[4px] ml-1 "> + </span> افزودن 
        </button>
      </div>
    </template>
  </BaseModal>
</template>
