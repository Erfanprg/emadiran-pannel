<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    message?: string
    retry?: boolean
  }>(),
  {
    message: 'خطایی رخ داده است',
    retry: true
  }
)

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
    <svg class="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p class="text-red-600 font-medium mb-4">{{ message }}</p>
    <slot />
    <BaseButton
      v-if="retry"
      variant="danger"
      size="md"
      @click="emit('retry')"
    >
      تلاش مجدد
    </BaseButton>
  </div>
</template>
