<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

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
const step = ref<'phone' | 'otp'>('phone')
const phoneNumber = ref('')
const otpCode = ref('')
const countdown = ref(0)
const isSubmitting = ref(false)

// Timer for resend OTP
let countdownInterval: NodeJS.Timeout | null = null

const startCountdown = () => {
  countdown.value = 120 // 2 minutes
  
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval!)
      countdownInterval = null
    }
  }, 1000)
}

const formatCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Validate phone number (simple Iranian phone validation)
const isPhoneValid = computed(() => {
  return /^09\d{9}$/.test(phoneNumber.value)
})

const isOtpValid = computed(() => {
  return /^\d{6}$/.test(otpCode.value)
})

// Request OTP
const handleRequestOtp = async () => {
  if (!isPhoneValid.value) {
    toast.error('شماره موبایل معتبر نیست')
    return
  }

  isSubmitting.value = true
  const success = await authStore.requestOtp(phoneNumber.value)
  isSubmitting.value = false

  if (success) {
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
    // Redirect based on user role
    if (authStore.isAdmin) {
      await router.push('/admin')
    } else {
      await router.push('/dashboard')
    }
  }
}

// Resend OTP
const handleResendOtp = async () => {
  if (countdown.value > 0) return
  
  isSubmitting.value = true
  const success = await authStore.requestOtp(phoneNumber.value)
  isSubmitting.value = false

  if (success) {
    toast.success('کد تایید مجدد ارسال شد')
    otpCode.value = ''
    startCountdown()
  }
}

// Back to phone step
const handleBackToPhone = () => {
  step.value = 'phone'
  otpCode.value = ''
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  countdown.value = 0
}

// Cleanup on unmount
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
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
        <!-- Phone Number Step -->
        <div v-if="step === 'phone'" class="space-y-6">
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
                @keyup.enter="handleRequestOtp"
              />
            </div>

            <button
              @click="handleRequestOtp"
              :disabled="!isPhoneValid || isSubmitting"
              class="w-full py-3 bg-gradient-to-r from-primary via-accent to-secondary text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
            >
              <span v-if="isSubmitting">در حال ارسال...</span>
              <span v-else>دریافت کد تایید</span>
            </button>
          </div>

          <div class="text-center">
            <NuxtLink to="/" class="text-sm text-primary hover:text-accent transition-colors duration-200">
              بازگشت به صفحه اصلی
            </NuxtLink>
          </div>
        </div>

        <!-- OTP Verification Step -->
        <div v-else-if="step === 'otp'" class="space-y-6">
          <div>
            <button
              @click="handleBackToPhone"
              class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              بازگشت
            </button>
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
                @keyup.enter="handleVerifyOtp"
              />
            </div>

            <button
              @click="handleVerifyOtp"
              :disabled="!isOtpValid || isSubmitting"
              class="w-full py-3 bg-gradient-to-r from-primary via-accent to-secondary text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
            >
              <span v-if="isSubmitting">در حال بررسی...</span>
              <span v-else>تایید و ورود</span>
            </button>

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
                @click="handleResendOtp"
                :disabled="isSubmitting"
                class="text-sm text-primary hover:text-accent font-medium transition-colors duration-200"
              >
                ارسال مجدد کد تایید
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>