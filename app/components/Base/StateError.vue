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
    <IconsOutline name="exclamation-circle" class="w-12 h-12 text-red-500 mx-auto mb-3" />
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
