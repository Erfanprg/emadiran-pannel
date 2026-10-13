<script setup lang="ts">
import AuthBackButton from '~/components/auth/AuthBackButton.vue'
import AuthPasswordInput from '~/components/auth/AuthPasswordInput.vue'
import AuthSubmitButton from '~/components/auth/AuthSubmitButton.vue'

defineProps<{
  phoneNumber: string
  isPasswordValid: boolean
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  submit: []
  back: []
}>()

const password = defineModel<string>({ required: true })
const showPassword = defineModel<boolean>('show', { required: true })
</script>

<template>
  <div class="space-y-6">
    <div>
      <AuthBackButton @click="emit('back')" />
      <h2 class="text-xl font-bold text-gray-900 mb-2">رمز عبور را وارد کنید</h2>
      <p class="text-sm text-gray-600">
        ورود با شماره
        <span class="font-bold text-gray-900" dir="ltr">{{ phoneNumber }}</span>
      </p>
    </div>

    <div class="space-y-4">
      <div>
        <label for="login-password" class="block text-sm font-medium text-gray-900 mb-2">رمز عبور</label>
        <AuthPasswordInput
          v-model="password"
          v-model:show="showPassword"
          @enter="emit('submit')"
        />
      </div>

      <AuthSubmitButton
        :disabled="!isPasswordValid || isSubmitting"
        :loading="isSubmitting"
        loading-text="در حال بررسی..."
        @click="emit('submit')"
      >ورود</AuthSubmitButton>
    </div>
  </div>
</template>
