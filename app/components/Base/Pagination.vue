<script setup lang="ts">
import { formatNumber } from '~/utils/formatters'

const props = withDefaults(
  defineProps<{
    page: number
    total: number
    limit?: number
  }>(),
  {
    limit: 20
  }
)

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const totalPages = computed(() => Math.ceil(props.total / props.limit))
const from = computed(() => ((props.page - 1) * props.limit) + 1)
const to = computed(() => Math.min(props.page * props.limit, props.total))

const goToPrevious = () => {
  if (props.page > 1) {
    emit('update:page', props.page - 1)
  }
}

const goToNext = () => {
  if (props.page < totalPages.value) {
    emit('update:page', props.page + 1)
  }
}
</script>

<template>
  <div
    v-if="total > 0"
    class="w-full border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="text-sm text-gray-600 text-center md:text-right">
        نمایش ردیف
        <span class="font-bold text-gray-900">{{ formatNumber(from) }}</span>
        تا
        <span class="font-bold text-gray-900">{{ formatNumber(to) }}</span>
        از
        <span class="font-bold text-gray-900">{{ formatNumber(total) }}</span>
        مورد
      </div>

      <div class="flex items-center justify-center gap-2 self-center md:self-auto">
        <BaseButton
          size="sm"
          variant="secondary"
          :disabled="page === 1"
          @click="goToPrevious"
        >
          قبلی
        </BaseButton>
        <div class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
          صفحه
          <span class="font-bold text-gray-900">{{ formatNumber(page) }}</span>
          از
          <span class="font-bold text-gray-900">{{ formatNumber(totalPages) }}</span>
        </div>
        <BaseButton
          size="sm"
          variant="secondary"
          :disabled="page >= totalPages"
          @click="goToNext"
        >
          بعدی
        </BaseButton>
      </div>
    </div>
  </div>
</template>
