<script setup lang="ts" generic="T extends string">
defineProps<{
  label: string
  options: { value: string; label: string }[]
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-sm font-medium text-gray-700">{{ label }}</label>
    <select
      v-model="model"
      class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
