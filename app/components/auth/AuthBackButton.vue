<script setup lang="ts">
const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    @click="emit('click')"
    class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
  >
    <IconsOutline name="chevron-left" class="w-5 h-5" />
    بازگشت
  </button>
</template>
