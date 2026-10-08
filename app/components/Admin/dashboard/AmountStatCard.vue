<script setup lang="ts">
import type { OutlineIconName } from '~/constants/icons'

const props = withDefaults(
  defineProps<{
    label: string
    value: string
    icon: OutlineIconName
    color: 'red' | 'orange' | 'yellow' | 'green'
    large?: boolean
  }>(),
  {
    large: false
  }
)

// Full class names so Tailwind keeps them
const colorClasses = {
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' }
}

const colors = computed(() => colorClasses[props.color])
</script>

<template>
  <BaseCard>
    <div class="text-center">
      <div class="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center" :class="colors.bg">
        <IconsOutline :name="icon" class="w-8 h-8" :class="colors.text" />
      </div>
      <p class="text-sm text-gray-600 mb-2">{{ label }}</p>
      <p class="font-bold" :class="[large ? 'text-3xl' : 'text-2xl', colors.text]" dir="ltr">{{ value }}</p>
      <p class="text-xs text-gray-500 mt-1">ریال</p>
    </div>
  </BaseCard>
</template>
