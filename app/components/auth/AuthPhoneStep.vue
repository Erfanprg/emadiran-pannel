<script setup lang="ts">
import AuthSubmitButton from '~/components/auth/AuthSubmitButton.vue'

defineProps<{
  isPhoneValid: boolean
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  submit: []
}>()

const phoneNumber = defineModel<string>({ required: true })
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-bold text-gray-900 mb-2">شماره موبایل خود را وارد کنید</h2>
      <p class="text-sm text-gray-600">کد تایید به شماره شما ارسال خواهد شد</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">شماره موبایل</label>
        <input
          v-model="phoneNumber"
          type="tel"
          inputmode="numeric"
          maxlength="11"
          placeholder="09123456789"
          class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors duration-200"
          @keyup.enter="emit('submit')"
        />
      </div>

      <AuthSubmitButton
        :disabled="!isPhoneValid || isSubmitting"
        :loading="isSubmitting"
        loading-text="در حال ارسال..."
        @click="emit('submit')"
      >دریافت کد تایید</AuthSubmitButton>
    </div>

    <div class="text-center">
      <NuxtLink to="/" class="text-sm text-primary hover:text-accent transition-colors duration-200">
        بازگشت به صفحه اصلی
      </NuxtLink>
    </div>
  </div>
</template>
