<script lang="ts" setup>
import type { CheckBox } from "~/types/global"

const props = defineProps<CheckBox>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
}>()

const handleChange = (value: string | number | boolean): void => {
  emit('update:modelValue', value)
}
</script>

<template>
  <label
    class="radio-container"
    :class="{ 'radio-checked': modelValue === value }"
  >
    <input
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      @change="handleChange(value)"
    />
    <span class="checkmark"></span>
    <span class="label-text">{{ label }}</span>
  </label>
</template>

<style scoped>
.radio-container {
  @apply flex items-center cursor-pointer text-sm gap-x-2;
}

.radio-container .label-text {
  @apply text-gray-900;
}

.radio-container.radio-checked .label-text {
  @apply text-primary;
}

input[type='radio'] {
  @apply hidden;
}

.checkmark {
  @apply h-[18px] w-[18px] border-2 rounded-full relative border-primary;
}

input[type='radio']:checked + .checkmark {
  @apply border-primary;
}
</style>

  