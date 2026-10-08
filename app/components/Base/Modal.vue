<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    showClose?: boolean
  }>(),
  {
    maxWidth: 'md',
    showClose: true
  }
)

const emit = defineEmits<{
  close: []
}>()

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl'
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div :class="['bg-white rounded-xl shadow-2xl w-full p-6', maxWidthClasses[maxWidth]]">
      <!-- Header -->
      <div v-if="title || showClose || $slots.header" class="relative flex items-center justify-between mb-6">
        <slot name="header">
          <h3 v-if="title" class="text-xl font-bold text-gray-900">{{ title }}</h3>
        </slot>
        <button
          v-if="showClose"
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors absolute top-3 left-3"
        >
          <IconsOutline name="x" class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="mb-6">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="flex items-center gap-3 pt-4 border-t border-gray-100">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
