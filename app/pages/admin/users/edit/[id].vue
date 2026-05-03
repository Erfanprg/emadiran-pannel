<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import { useApiCall } from '~/composables/useApiCall'
import type { AdminUser } from '~/types/admin'

useHead({
  title: 'ویرایش کاربر - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const { execute } = useApiCall()

// Check if user is admin
if (!authStore.isAdmin) {
  router.push('/dashboard')
}

const userId = parseInt(route.params.id as string)

// State
const user = ref<AdminUser | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const errors = ref<Record<string, string>>({})

// Form state
const formData = ref({
  firstName: '',
  lastName: '',
  role: 'USER' as 'USER' | 'ADMIN',
  isActive: true
})

// Fetch user details
const fetchUserDetails = async () => {
  try {
    isLoading.value = true
    error.value = null
    user.value = await adminApi.getUserById(userId)
    
    // Populate form
    formData.value = {
      firstName: user.value.firstName || '',
      lastName: user.value.lastName || '',
      role: user.value.role,
      isActive: user.value.isActive
    }
  } catch (err: any) {
    error.value = err.data?.message || 'خطا در دریافت اطلاعات کاربر'
    console.error('Error fetching user:', err)
  } finally {
    isLoading.value = false
  }
}

// Validate form
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.firstName.trim()) {
    errors.value.firstName = 'نام الزامی است'
  }
  
  if (!formData.value.lastName.trim()) {
    errors.value.lastName = 'نام خانوادگی الزامی است'
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
  
  const { success } = await execute(
    () => adminApi.updateUser(userId, formData.value),
    {
      successMessage: 'اطلاعات کاربر با موفقیت ویرایش شد',
      onSuccess: () => router.push(`/admin/users/${userId}`)
    }
  )
  
  isSubmitting.value = false
}

// Load user on mount
onMounted(() => {
  fetchUserDetails()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <!-- Header -->
    <AdminHeader title="ویرایش کاربر" />

    <!-- Main Content -->
    <main class="max-w-[1330px] mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <!-- Loading State -->
        <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div class="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-gray-600 mt-4">در حال بارگذاری...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg class="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-600 font-medium">{{ error }}</p>
          <button
            @click="fetchUserDetails"
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            تلاش مجدد
          </button>
        </div>

        <!-- Form Card -->
        <BaseCard v-else-if="user">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- User Info Box -->
            <BaseCard class="bg-gray-50" :padding="true">
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">شماره موبایل (غیرقابل تغییر)</p>
                    <p class="text-lg font-bold text-gray-900" dir="ltr">{{ user.phoneNumber }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">کد ملی (غیرقابل تغییر)</p>
                    <p class="text-lg font-bold text-gray-900" dir="ltr">{{ user.nationalCode }}</p>
                  </div>
                </div>
              </div>
            </BaseCard>

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

            <!-- Active Status -->
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="formData.isActive"
                  type="checkbox"
                  class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                />
                <span class="text-sm font-medium text-gray-900">کاربر فعال است</span>
              </label>
              <p class="text-xs text-gray-600 mt-1 mr-8">در صورت غیرفعال بودن، کاربر نمی‌تواند وارد سیستم شود</p>
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
                ذخیره تغییرات
              </BaseButton>
              <NuxtLink
                :to="`/admin/users/${userId}`"
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
      </div>
    </main>
  </div>
</template>
