<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
    <div>
      <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
      <p class="text-sm text-gray-600">{{ subtitle }}</p>
    </div>

    <slot />
  </div>
</template>
