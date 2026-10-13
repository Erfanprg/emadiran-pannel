<script setup lang="ts">
defineProps<{
  disabled: boolean
  loading: boolean
  loadingText: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    @click="emit('click')"
    :disabled="disabled"
    class="w-full py-3 bg-gradient-to-r from-primary via-accent to-secondary text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
  >
    <span v-if="loading">{{ loadingText }}</span>
    <span v-else><slot /></span>
  </button>
</template>
