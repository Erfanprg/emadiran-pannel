<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import { useOtpCountdown } from '~/composables/useOtpCountdown'
import AuthPhoneStep from '~/components/auth/AuthPhoneStep.vue'
import AuthOtpStep from '~/components/auth/AuthOtpStep.vue'
import AuthPasswordStep from '~/components/auth/AuthPasswordStep.vue'

useHead({
  title: 'ورود - عماد ایران'
})

// Define page meta for layout
definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

// Form state
const step = ref<'phone' | 'otp' | 'password'>('phone')
const phoneNumber = ref('')
const otpCode = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)

// Timer for resend OTP
const { countdown, formatCountdown, startCountdown, stopCountdown } = useOtpCountdown()

// Validate phone number (simple Iranian phone validation)
const isPhoneValid = computed(() => {
  return /^09\d{9}$/.test(phoneNumber.value)
})

const isOtpValid = computed(() => {
  return /^\d{6}$/.test(otpCode.value)
})

const isPasswordValid = computed(() => {
  return password.value.length > 0
})

// Redirect based on user role
const redirectAfterLogin = async () => {
  if (authStore.isAdmin) {
    await router.push('/admin')
  } else {
    await router.push('/dashboard')
  }
}

// Request OTP (allow-listed admins are sent to the password step instead)
const handleRequestOtp = async () => {
  if (!isPhoneValid.value) {
    toast.error('شماره موبایل معتبر نیست')
    return
  }

  isSubmitting.value = true
  const method = await authStore.requestOtp(phoneNumber.value)
  isSubmitting.value = false

  if (method === 'password') {
    step.value = 'password'
  } else if (method === 'otp') {
    toast.success('کد تایید ارسال شد')
    step.value = 'otp'
    startCountdown()
  }
}

// Verify OTP
const handleVerifyOtp = async () => {
  if (!isOtpValid.value) {
    toast.error('کد تایید باید 6 رقم باشد')
    return
  }

  isSubmitting.value = true
  const success = await authStore.verifyOtp(phoneNumber.value, otpCode.value)
  isSubmitting.value = false

  if (success) {
    await redirectAfterLogin()
  }
}

// Login with password
const handlePasswordLogin = async () => {
  if (!isPasswordValid.value) {
    toast.error('رمز عبور را وارد کنید')
    return
  }

  isSubmitting.value = true
  const success = await authStore.loginWithPassword(phoneNumber.value, password.value)
  isSubmitting.value = false

  if (success) {
    await redirectAfterLogin()
  } else {
    password.value = ''
  }
}

// Resend OTP
const handleResendOtp = async () => {
  if (countdown.value > 0) return

  isSubmitting.value = true
  const method = await authStore.requestOtp(phoneNumber.value)
  isSubmitting.value = false

  if (method === 'otp') {
    toast.success('کد تایید مجدد ارسال شد')
    otpCode.value = ''
    startCountdown()
  }
}

// Back to phone step
const handleBackToPhone = () => {
  step.value = 'phone'
  otpCode.value = ''
  password.value = ''
  showPassword.value = false
  stopCountdown()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full flex items-center justify-center p-4 w-[95%] md:w-[450px]">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-4">
        <img src="/emad-logo-p.png" alt="عماد" class="h-16 mx-auto mb-4" />
        <h1 class="text-3xl font-bold text-gray-900 mb-2">ورود به پنل</h1>
        <p class="text-gray-600">عماد، نماد اعتماد</p>
      </div>

      <!-- Auth Card -->
      <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <AuthPhoneStep
          v-if="step === 'phone'"
          v-model="phoneNumber"
          :is-phone-valid="isPhoneValid"
          :is-submitting="isSubmitting"
          @submit="handleRequestOtp"
        />

        <AuthOtpStep
          v-else-if="step === 'otp'"
          v-model="otpCode"
          :phone-number="phoneNumber"
          :is-otp-valid="isOtpValid"
          :is-submitting="isSubmitting"
          :countdown="countdown"
          :format-countdown="formatCountdown"
          @submit="handleVerifyOtp"
          @resend="handleResendOtp"
          @back="handleBackToPhone"
        />

        <!-- Password Step (allow-listed admins) -->
        <AuthPasswordStep
          v-else-if="step === 'password'"
          v-model="password"
          v-model:show="showPassword"
          :phone-number="phoneNumber"
          :is-password-valid="isPasswordValid"
          :is-submitting="isSubmitting"
          @submit="handlePasswordLogin"
          @back="handleBackToPhone"
        />
      </div>
    </div>
  </div>
</template>
