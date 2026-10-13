<script setup lang="ts">import { translate } from '~/i18n/translate'

withDefaults(
  defineProps<{
    message?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    message: () => translate('common.states.loading'),
    size: 'md'
  }
)

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
}
</script>

<template>
  <div class="text-center py-12">
    <div :class="['inline-block border-4 border-primary border-t-transparent rounded-full animate-spin', sizeClasses[size]]"></div>
    <p class="text-gray-600 mt-4">{{ message }}</p>
  </div>
</template>
