<script setup lang="ts">
export type SmsSection = 'dispatches' | 'templates' | 'events'

defineProps<{ modelValue: SmsSection }>()
const emit = defineEmits<{ 'update:modelValue': [value: SmsSection] }>()

const items: Array<{ key: SmsSection; label: string; iconPath: string }> = [
  {
    key: 'dispatches',
    label: 'آرشیو پیامک‌ها',
    iconPath: 'M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8ZM8 9h8M8 13h5',
  },
  {
    key: 'templates',
    label: 'قالب‌ها',
    iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h6',
  },
  {
    key: 'events',
    label: 'رویدادها',
    iconPath: 'M8 7h8M8 17h8M6 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm16 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM4 7v4a2 2 0 0 0 2 2h12a2 2 0 0 1 2 2v2',
  },
]
</script>

<template>
  <div class="mb-6 grid gap-3 md:grid-cols-3">
    <button
      v-for="item in items"
      :key="item.key"
      class="group flex items-center gap-4 rounded-xl border bg-white p-4 text-right shadow-sm transition-all"
      :class="modelValue === item.key ? 'border-primary ring-2 ring-primary/10' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'"
      @click="emit('update:modelValue', item.key)"
    >
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" :class="modelValue === item.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:text-primary'">
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path :d="item.iconPath" />
        </svg>
      </span>
      <strong class="block text-sm text-gray-900">{{ item.label }}</strong>
    </button>
  </div>
</template>
