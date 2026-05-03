<script setup lang="ts">
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
  <div v-if="total > 0" class="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
    <!-- Info -->
    <!-- <div class="text-sm text-gray-600">
      نمایش <span class="font-bold text-gray-900">{{ from.toLocaleString('fa-IR') }}</span> تا 
      <span class="font-bold text-gray-900">{{ to.toLocaleString('fa-IR') }}</span> از 
      <span class="font-bold text-gray-900">{{ total.toLocaleString('fa-IR') }}</span>
    </div> -->

    <!-- Controls -->
    <div class="flex items-center gap-2">
      <BaseButton
        size="sm"
        variant="secondary"
        :disabled="page === 1"
        @click="goToPrevious"
      >
        قبلی
      </BaseButton>
      <span class="text-sm text-gray-700 px-3">
        صفحه <span class="font-bold">{{ page.toLocaleString('fa-IR') }}</span> از 
        <span class="font-bold">{{ totalPages.toLocaleString('fa-IR') }}</span>
      </span>
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
</template>
