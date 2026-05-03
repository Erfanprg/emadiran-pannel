<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    error?: string
    label?: string
    required?: boolean
    rows?: number
  }>(),
  {
    disabled: false,
    rows: 3
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaClasses = computed(() => {
  const base = 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-colors'
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
    <textarea
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :class="textareaClasses"
    ></textarea>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
