<script setup lang="ts">
type StatColor = 'green' | 'red' | 'blue' | 'purple' | 'yellow' | 'indigo'

defineProps<{
  color: StatColor
  label: string
  value: string
  boldLabel?: boolean
}>()

const COLOR_CLASSES: Record<StatColor, { box: string; label: string; value: string }> = {
  green: { box: 'bg-green-50 border-green-200', label: 'text-green-700', value: 'text-green-900' },
  red: { box: 'bg-red-50 border-red-200', label: 'text-red-700', value: 'text-red-900' },
  blue: { box: 'bg-blue-50 border-blue-200', label: 'text-blue-700', value: 'text-blue-900' },
  purple: { box: 'bg-purple-50 border-purple-200', label: 'text-purple-700', value: 'text-purple-900' },
  yellow: { box: 'bg-yellow-50 border-yellow-200', label: 'text-yellow-700', value: 'text-yellow-900' },
  indigo: { box: 'bg-indigo-50 border-indigo-200', label: 'text-indigo-700', value: 'text-indigo-900' }
}
</script>

<template>
  <div class="border rounded-lg p-4" :class="COLOR_CLASSES[color].box">
    <p class="text-sm mb-1" :class="[COLOR_CLASSES[color].label, { 'font-medium': boldLabel }]">{{ label }}</p>
    <p class="text-2xl font-bold" :class="COLOR_CLASSES[color].value">{{ value }}</p>
  </div>
</template>
