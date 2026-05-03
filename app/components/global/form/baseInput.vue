<script setup lang="ts">
import { conv2EnNum } from "~/func/conv2EnNum";
import type { Input } from "~/types/global";

const emit = defineEmits<{
  'update:model-value': [payload: string | number]
  'change': [payload: Event]
  'click': [payload: MouseEvent]
  'focus': []
  'onFocus': []
  'input': [payload: string | number]
}>()

const props = defineProps<Input>()

const inputElement = ref<HTMLInputElement | null>(null)
const borderInputColor = ref<string>('')

const showPassword = ref<boolean>(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const inputValue = computed({
  get(): string | number | undefined {
    return props.modelValue
  },
  set(value: string | number) {
    emit('update:model-value', value)
  },
})

const borderInputData = {
  defult: 'border-gray-600',
  focus: 'border-primary',
  error: '!border-red-500',
} as const

const focusedInput = () => {
  emit('focus')
  borderInputColor.value = borderInputData.focus
}

const focusOut = () => {
  emit('onFocus')
  borderInputColor.value = borderInputData.defult
}

const handlePaste = (e: ClipboardEvent): void => {
  let pastedData = e.clipboardData?.getData('text') || ''
  if (props.type === 'number') {
    pastedData = conv2EnNum(pastedData).replace(/[^0-9۰-۹٠-٩]/g, '')
  }
  inputValue.value = pastedData
  emit('update:model-value', pastedData)
  e.preventDefault()
}

const handleInputUpdate = (e: Event): void => {
  let value = (e.target as HTMLInputElement).value
  if (props.type === 'number') {
    value = conv2EnNum(value)
    value = value.replace(/[^0-9۰-۹٠-٩]/g, '')
  }
  inputValue.value = value
  emit('input', value)
}
</script>

<template>
  <div class="container-input">
    <label v-if="label" :for="id" class="label-input">
      {{ label }}
      <span v-if="mandatory">*</span>
      <span class="mr-[2px]" v-if="optional">({{ $t('global.optional') }})</span>
    </label>

    <!-- Input Field -->
    <input v-if="type !== 'textarea'" ref="inputElement" :id="id"
      :type="type === 'password' ? (showPassword ? 'text' : 'password') : (type === 'number' ? 'text' : type)"
      class="input-global"
      :class="[classInput, borderInputColor, { 'dir-ltr': type === 'number' || type === 'tel' }, error ? borderInputData.error : '']"
      v-model="inputValue" @input="handleInputUpdate" @paste="handlePaste" @focus="focusedInput" @focusout="focusOut"
      spellcheck="false" :disabled="disabled" :placeholder="placeholder"
      :inputmode="type === 'number' ? 'numeric' : undefined" />

    <!-- Textarea Field -->
    <textarea v-else ref="inputElement" :id="id" :type="type" class="input-global pb-6 !h-auto pt-4"
      v-model="inputValue" @input="handleInputUpdate" @focus="focusedInput" @focusout="focusOut" spellcheck="false"
      :disabled="disabled" :placeholder="placeholder" :rows="row" :maxlength="110" />

    <!-- Calendar Icon -->
    <div class="input-floating-icon" v-if="calender">
      <IconCalender />
    </div>

    <!-- Password Eye Toggle -->
    <div class="input-floating-icon"
      v-if="type === 'password' && String(inputValue).length > 0 && inputValue !== undefined">
      <IconOpenEye v-if="!showPassword" @click="togglePassword" class="icon-eye-password " />
      <IconCloseEye v-else @click="togglePassword" class="icon-eye-password" />
    </div>

    <!-- Error Message -->
    <span class="err-input" v-if="error">{{ error }}</span>
  </div>
</template>

<style scoped>
@import '~/assets/css/form.css';

.container-input {
  @apply w-full flex flex-col relative gap-y-2;
}

.input-floating-icon {
  @apply absolute  left-[10px] top-3;
}

.icon-eye-password {
  @apply cursor-pointer !w-[25px] !h-[25px]
}
</style>
