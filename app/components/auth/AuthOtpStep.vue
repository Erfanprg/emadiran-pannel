<script setup lang="ts">
import AuthBackButton from '~/components/auth/AuthBackButton.vue'
import AuthSubmitButton from '~/components/auth/AuthSubmitButton.vue'

defineProps<{
  phoneNumber: string
  isOtpValid: boolean
  isSubmitting: boolean
  countdown: number
  formatCountdown: string
}>()

const emit = defineEmits<{
  submit: []
  resend: []
  back: []
}>()

const otpCode = defineModel<string>({ required: true })
</script>

<template>
  <div class="space-y-6">
    <div>
      <AuthBackButton @click="emit('back')" />
      <h2 class="text-xl font-bold text-gray-900 mb-2">کد تایید را وارد کنید</h2>
      <p class="text-sm text-gray-600">
        کد 6 رقمی به شماره
        <span class="font-bold text-gray-900" dir="ltr">{{ phoneNumber }}</span>
        ارسال شد
      </p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">کد تایید</label>
        <input
          v-model="otpCode"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="••••••"
          class="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 text-center text-2xl tracking-widest placeholder:text-gray-400 focus:border-primary focus:outline-none transition-colors duration-200"
          @keyup.enter="emit('submit')"
        />
      </div>

      <AuthSubmitButton
        :disabled="!isOtpValid || isSubmitting"
        :loading="isSubmitting"
        loading-text="در حال بررسی..."
        @click="emit('submit')"
      >تایید و ورود</AuthSubmitButton>

      <!-- Resend OTP -->
      <div class="text-center">
        <button
          v-if="countdown > 0"
          disabled
          class="text-sm text-gray-500 cursor-not-allowed"
        >
          ارسال مجدد کد ({{ formatCountdown }})
        </button>
        <button
          v-else
          @click="emit('resend')"
          :disabled="isSubmitting"
          class="text-sm text-primary hover:text-accent font-medium transition-colors duration-200"
        >
          ارسال مجدد کد تایید
        </button>
      </div>
    </div>
  </div>
</template>
