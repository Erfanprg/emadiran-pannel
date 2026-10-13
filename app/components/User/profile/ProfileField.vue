<script setup lang="ts">
defineProps<{
  label: string
  value: string
  ltr?: boolean
}>()
</script>

<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-gray-600">{{ label }}</label>
    <div class="p-3 bg-gray-50 rounded-lg" :dir="ltr ? 'ltr' : undefined">
      <p class="text-gray-900 font-medium">{{ value }}</p>
    </div>
  </div>
</template>
