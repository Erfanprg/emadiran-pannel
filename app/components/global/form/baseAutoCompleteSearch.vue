<script lang="ts" setup>
import type { CheckBox } from '~/types/global'

const props = defineProps<CheckBox>()

const emit = defineEmits<{
  'update:model-value': [value: string | number | boolean]
}>()

const idValue = computed({
  get(): string | number | boolean {
    return props.modelValue
  },
  set(value: string | number | boolean): void {
    emit('update:model-value', value)
  },
})
</script>

<template>
  <label class="radio-container" :class="{ 'radio-checked': idValue === value }">
    <input type="radio" :name="name" :value="value" :checked="idValue === value" @change="idValue = value" />
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
