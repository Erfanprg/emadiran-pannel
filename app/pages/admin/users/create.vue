<script setup lang="ts">
import { useAdminGuard } from '~/composables/useAdminGuard'
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import { useApiCall } from '~/composables/useApiCall'
import { useCurrencyInput } from '~/composables/useCurrencyInput'
import { formatNumber } from '~/utils/formatters'

useHead({
  title: 'ایجاد کاربر جدید - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const toast = useToast()
const { execute } = useApiCall()

useAdminGuard()

// Currency input for initial debt
const initialDebtInput = useCurrencyInput()

// Form state
const formData = ref({
  firstName: '',
  lastName: '',
  phoneNumber: '',
  nationalCode: '',
  role: 'USER' as 'USER' | 'ADMIN'
})

const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

// Validate form
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.firstName.trim()) {
    errors.value.firstName = 'نام الزامی است'
  }
  
  if (!formData.value.lastName.trim()) {
    errors.value.lastName = 'نام خانوادگی الزامی است'
  }
  
  if (!formData.value.phoneNumber.trim()) {
    errors.value.phoneNumber = 'شماره موبایل الزامی است'
  } else if (!/^09\d{9}$/.test(formData.value.phoneNumber)) {
    errors.value.phoneNumber = 'شماره موبایل معتبر نیست (09123456789)'
  }
  
  if (!formData.value.nationalCode.trim()) {
    errors.value.nationalCode = 'کد ملی الزامی است'
  } else if (!/^\d{10}$/.test(formData.value.nationalCode)) {
    errors.value.nationalCode = 'کد ملی باید 10 رقم باشد'
  }
  
  return Object.keys(errors.value).length === 0
}

// Handle submit
const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('لطفاً خطاهای فرم را برطرف کنید')
    return
  }
  
  isSubmitting.value = true
  
  // Create user - only send required fields
  const { data: response, success } = await execute(
    () => adminApi.createUser({
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      phoneNumber: formData.value.phoneNumber,
      nationalCode: formData.value.nationalCode,
      role: formData.value.role
    }),
    {
      successMessage: 'کاربر با موفقیت ایجاد شد',
      showSuccessToast: false // Show custom message after debt
    }
  )
  
  if (!success) {
    isSubmitting.value = false
    return
  }
  
  // Add initial debt if specified
  if (initialDebtInput.rawValue.value && initialDebtInput.numericValue.value > 0) {
    const userId = response?.data?.id
    if (userId) {
      await execute(
        () => adminApi.addDebt(userId, initialDebtInput.rawValue.value, 'بدهی اولیه'),
        {
          successMessage: `کاربر با بدهی اولیه ${formatNumber(initialDebtInput.numericValue.value)} ریال ثبت شد`,
          errorMessage: 'کاربر ایجاد شد اما خطا در ثبت بدهی اولیه'
        }
      )
    }
  } else {
    toast.success('کاربر با موفقیت ایجاد شد')
  }
  
  isSubmitting.value = false
  router.push('/admin/users')
}
</script>

<template>
  <AdminPage title="ایجاد کاربر جدید">
    <div class="max-w-2xl mx-auto">
      <!-- Form Card -->
      <BaseCard>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- First Name -->
          <BaseInput
            v-model="formData.firstName"
            label="نام"
            required
            placeholder="علی"
            :error="errors.firstName"
          />

          <!-- Last Name -->
          <BaseInput
            v-model="formData.lastName"
            label="نام خانوادگی"
            required
            placeholder="احمدی"
            :error="errors.lastName"
          />

          <!-- Phone Number -->
          <BaseInput
            v-model="formData.phoneNumber"
            label="شماره موبایل"
            type="tel"
            required
            placeholder="09123456789"
            dir="ltr"
            :error="errors.phoneNumber"
          />

          <!-- National Code -->
          <BaseInput
            v-model="formData.nationalCode"
            label="کد ملی"
            required
            placeholder="1234567890"
            dir="ltr"
            :error="errors.nationalCode"
          />

          <!-- Initial Debt -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              میزان بدهی اولیه (اختیاری)
            </label>
            <input
              :value="initialDebtInput.displayValue.value"
              @input="initialDebtInput.handleInput"
              type="text"
              inputmode="numeric"
              placeholder="0"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left"
              dir="ltr"
            />
            <p class="text-xs text-gray-600 mt-1">در صورت خالی گذاشتن، بدهی اولیه صفر خواهد بود</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4 pt-4">
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              full-width
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              ایجاد کاربر
            </BaseButton>
            <NuxtLink
              to="/admin/users"
              class="flex-1"
            >
              <BaseButton
                variant="secondary"
                size="lg"
                full-width
              >
                انصراف
              </BaseButton>
            </NuxtLink>
          </div>
        </form>
      </BaseCard>

      <!-- Info Box -->
      <BaseCard class="mt-6 bg-blue-50 border-blue-200">
        <div class="flex items-start gap-3">
          <IconsOutline name="information-circle" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div class="text-sm text-blue-800">
            <p class="font-medium mb-1">نکات مهم:</p>
            <ul class="list-disc list-inside space-y-1 text-blue-700">
              <li>شماره موبایل باید یکتا باشد و قبلاً ثبت نشده باشد</li>
              <li>کد ملی باید 10 رقم و یکتا باشد</li>
              <li>کاربر پس از ایجاد به صورت خودکار فعال خواهد بود</li>
              <li>در صورت وارد کردن بدهی اولیه، بعد از ایجاد کاربر به صورت خودکار ثبت می‌شود</li>
            </ul>
          </div>
        </div>
      </BaseCard>
    </div>
  </AdminPage>
</template>
