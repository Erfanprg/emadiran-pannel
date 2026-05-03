<script setup lang="ts">
import type { RadioBtn } from "~/types/global"

const emit = defineEmits<{
  'update:model-value': [payload: string | number]
  'change': [payload: Event]
}>()

const props = defineProps<RadioBtn>()

const radioValue = computed({
  get(): string | number | undefined {
    return props.modelValue
  },
  set(value: string | number): void {
    emit('update:model-value', value)
  },
})

const handleChange = (e: Event): void => {
  emit('change', e)
}
</script>

<template>
    <div class="container-radio">
        <label v-if="label" class="label-radio">{{ label }}
            <span v-if="mandatory">*</span>
            <span class="mr-[2px]" v-if="optional">({{ $t('global.optional') }})</span>
        </label>

        <div class="flex gap-x-4" :class="{ 'flex-col gap-y-3': vertical }">
            <label v-for="(option, index) in options" :key="index" class="radio-label">
                <input type="radio" :name="name" :value="option.value" v-model="radioValue" @change="handleChange"
                    :disabled="disabled" class="hidden" />
                <span class="radio-custom"></span>
                <span class="text-gray-900">{{ option.label }}</span>
            </label>
        </div>
    </div>
</template>

<style scoped>
.container-radio {
  @apply w-full flex flex-col relative gap-y-1;
}

.radio-label {
  @apply flex items-center gap-x-2 cursor-pointer;
}

.radio-custom {
  @apply w-4 h-4 rounded-full border-2 border-gray-500 flex items-center justify-center;
}

.radio-label input:checked + .radio-custom {
  @apply border-primary;
}

.radio-label input:checked + .radio-custom::after {
  @apply w-2 h-2 rounded-full bg-primary content-[''];
}

.radio-label input:disabled + .radio-custom {
  @apply opacity-50 cursor-not-allowed;
}
</style>