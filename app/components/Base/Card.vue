<script setup lang="ts">
withDefaults(
  defineProps<{
    padding?: boolean
    shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'none'
    hover?: boolean
  }>(),
  {
    padding: true,
    shadow: 'sm',
    hover: false
  }
)
</script>

<template>
  <div
    :class="[
      'bg-white rounded-xl border border-gray-200',
      padding ? 'p-6' : '',
      shadow === 'sm' ? 'shadow-sm' : '',
      shadow === 'md' ? 'shadow-md' : '',
      shadow === 'lg' ? 'shadow-lg' : '',
      shadow === 'xl' ? 'shadow-xl' : '',
      shadow === '2xl' ? 'shadow-2xl' : '',
      hover ? 'hover:shadow-lg transition-shadow duration-200' : ''
    ]"
  >
    <slot />
  </div>
</template>
