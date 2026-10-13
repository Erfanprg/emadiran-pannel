<script setup lang="ts">
import { formatNumber } from '~/utils/formatters'

const props = defineProps<{
  errors: string[]
  /** Height limit class of the scrollable list, e.g. max-h-60 */
  listClass: string
  /** Show at most this many errors, then a "… more" line */
  limit?: number
}>()

const visibleErrors = computed(() => (props.limit ? props.errors.slice(0, props.limit) : props.errors))
</script>

<template>
  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
    <h4 class="font-bold text-red-900 mb-3 flex items-center gap-2">
      <IconsOutline name="exclamation-circle" class="w-5 h-5" />
      {{ $t('admin.import.errorsList.title', { count: formatNumber(errors.length) }) }}
    </h4>
    <div class="overflow-y-auto space-y-2" :class="listClass">
      <div
        v-for="(error, index) in visibleErrors"
        :key="index"
        class="bg-white rounded p-3 text-sm text-red-800 border border-red-100"
      >
        {{ error }}
      </div>
      <p v-if="limit && errors.length > limit" class="text-gray-600 text-xs p-2">
        {{ $t('admin.import.errorsList.more', { value: errors.length - limit }) }}
      </p>
    </div>
  </div>
</template>
