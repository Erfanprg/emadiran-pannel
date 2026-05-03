<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    type?: string
    placeholder?: string
    disabled?: boolean
    error?: string
    label?: string
    required?: boolean
    dir?: 'ltr' | 'rtl' | 'auto'
  }>(),
  {
    type: 'text',
    disabled: false,
    dir: 'rtl'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputClasses = computed(() => {
  const base = 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors'
  const errorClass = props.error ? 'border-red-500' : 'border-gray-300'
  return `${base} ${errorClass}`
})
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-900 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      :disabled="disabled"
      :dir="dir"
      :class="inputClasses"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
