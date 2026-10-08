<script setup lang="ts">
import { useAdminGuard } from '~/composables/useAdminGuard'
import { userPhonesApi } from '~/services/api/userPhones'
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { useApiCall } from '~/composables/useApiCall'
import { getUserDisplayName } from '~/func/getUserDisplayName'
import type { UserPhone } from '~/types/userPhone'
import type { AdminUser } from '~/types/admin'

useHead({
  title: 'مدیریت شماره تلفن‌ها - عماد ایران'
})

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const toast = useToast()
const { confirm } = useConfirm()
const { execute } = useApiCall()

useAdminGuard()

const userId = parseInt(route.params.id as string)

// State
const user = ref<AdminUser | null>(null)
const phones = ref<UserPhone[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingPhone = ref<UserPhone | null>(null)

// Form states
const addForm = ref({
  phoneNumber: '',
  label: ''
})

const editForm = ref({
  phoneNumber: '',
  label: ''
})

const errors = ref<Record<string, string>>({})

// Fetch user info
const fetchUser = async () => {
  try {
    user.value = await adminApi.getUserById(userId)
  } catch (err: any) {
    console.error('Error fetching user:', err)
  }
}

// Fetch phones
const fetchPhones = async () => {
  try {
    isLoading.value = true
    error.value = null
    phones.value = await userPhonesApi.getUserPhones(userId)
  } catch (err: any) {
    error.value = err.data?.message || 'خطا در دریافت شماره تلفن‌ها'
    console.error('Error fetching phones:', err)
  } finally {
    isLoading.value = false
  }
}

// Validate add form
const validateAddForm = () => {
  errors.value = {}
  
  if (!addForm.value.phoneNumber.trim()) {
    errors.value.phoneNumber = 'شماره تلفن الزامی است'
    return false
  }
  
  // Simple phone validation (can be more strict)
  if (!/^[\d\s\-\+()]+$/.test(addForm.value.phoneNumber)) {
    errors.value.phoneNumber = 'شماره تلفن معتبر نیست'
    return false
  }
  
  return true
}

// Validate edit form
const validateEditForm = () => {
  errors.value = {}
  
  if (editForm.value.phoneNumber && !editForm.value.phoneNumber.trim()) {
    errors.value.phoneNumber = 'شماره تلفن نمی‌تواند خالی باشد'
    return false
  }
  
  if (editForm.value.phoneNumber && !/^[\d\s\-\+()]+$/.test(editForm.value.phoneNumber)) {
    errors.value.phoneNumber = 'شماره تلفن معتبر نیست'
    return false
  }
  
  return true
}

// Add phone
const handleAddPhone = async () => {
  if (!validateAddForm()) {
    toast.error('لطفاً خطاهای فرم را برطرف کنید')
    return
  }
  
  const { success } = await execute(
    () => userPhonesApi.addUserPhone(userId, {
      phoneNumber: addForm.value.phoneNumber.trim(),
      label: addForm.value.label.trim() || undefined
    }),
    {
      successMessage: 'شماره تلفن با موفقیت اضافه شد',
      onSuccess: () => {
        showAddModal.value = false
        addForm.value = { phoneNumber: '', label: '' }
        fetchPhones()
      }
    }
  )
}

// Open edit modal
const openEditModal = (phone: UserPhone) => {
  editingPhone.value = phone
  editForm.value = {
    phoneNumber: phone.phoneNumber,
    label: phone.label || ''
  }
  showEditModal.value = true
}

// Update phone
const handleUpdatePhone = async () => {
  if (!editingPhone.value) return
  
  if (!validateEditForm()) {
    toast.error('لطفاً خطاهای فرم را برطرف کنید')
    return
  }
  
  const { success } = await execute(
    () => userPhonesApi.updateUserPhone(editingPhone.value!.id, {
      phoneNumber: editForm.value.phoneNumber.trim() || undefined,
      label: editForm.value.label.trim() || undefined
    }),
    {
      successMessage: 'شماره تلفن با موفقیت به‌روزرسانی شد',
      onSuccess: () => {
        showEditModal.value = false
        editingPhone.value = null
        fetchPhones()
      }
    }
  )
}

// Delete phone
const handleDeletePhone = async (phone: UserPhone) => {
  const confirmed = await confirm({
    title: 'حذف شماره تلفن',
    message: `آیا از حذف شماره "${phone.phoneNumber}" اطمینان دارید؟`,
    type: 'danger',
    confirmText: 'بله، حذف شود'
  })
  
  if (!confirmed) return
  
  const { success } = await execute(
    () => userPhonesApi.deleteUserPhone(phone.id),
    {
      successMessage: 'شماره تلفن با موفقیت حذف شد',
      onSuccess: () => fetchPhones()
    }
  )
}

// Load data on mount
onMounted(() => {
  fetchUser()
  fetchPhones()
})
</script>

<template>
  <AdminPage title="مدیریت شماره تلفن‌ها">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- User Info Card -->
      <BaseCard v-if="user" class="bg-gradient-to-r from-primary/5 to-accent/5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
              <IconsOutline name="user" class="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">{{ getUserDisplayName(user) }}</h2>
              <p class="text-sm text-gray-600">شماره اصلی: <span class="font-medium" dir="ltr">{{ user.phoneNumber }}</span></p>
            </div>
          </div>
          <NuxtLink
            :to="`/admin/users/${userId}`"
            class="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            بازگشت به جزئیات کاربر
          </NuxtLink>
        </div>
      </BaseCard>

      <!-- Actions Bar -->
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900">شماره تلفن‌های اضافی</h3>
        <BaseButton
          @click="showAddModal = true"
          variant="primary"
          size="md"
        >
          <IconsOutline name="plus-large" class="w-5 h-5 ml-2" />
          افزودن شماره جدید
        </BaseButton>
      </div>

      <!-- Loading State -->
      <StateLoader v-if="isLoading" message="در حال بارگذاری..." />

      <!-- Error State -->
      <StateError v-else-if="error" :message="error" @retry="fetchPhones" />

      <!-- Empty State -->
      <BaseCard v-else-if="phones.length === 0">
        <div class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <IconsOutline name="phone" class="w-10 h-10 text-gray-400" />
          </div>
          <p class="text-gray-600 mb-2">هیچ شماره اضافی ثبت نشده</p>
        </div>
      </BaseCard>

      <!-- Phones List -->
      <div v-else class="space-y-3">
        <BaseCard v-for="phone in phones" :key="phone.id">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 flex-1">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <IconsOutline name="phone" class="w-6 h-6 text-blue-600" />
              </div>
              <div class="flex-1">
                <p class="text-lg font-bold text-gray-900">{{ phone.phoneNumber }}</p>
                <p class="text-sm text-gray-600">
                  {{ phone.label || 'بدون برچسب' }}
                </p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button
                @click="openEditModal(phone)"
                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="ویرایش"
              >
                <IconsOutline name="edit" class="w-5 h-5" />
              </button>
              <button
                @click="handleDeletePhone(phone)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="حذف"
              >
                <IconsOutline name="trash" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <template #overlays>
      <!-- Add Phone Modal -->
      <BaseModal v-if="showAddModal" title="افزودن شماره تلفن جدید" @close="showAddModal = false">
        <form @submit.prevent="handleAddPhone" class="space-y-4">
          <BaseInput
            v-model="addForm.phoneNumber"
            label="شماره تلفن"
            required
            placeholder="09123456789 "
            dir="ltr"
            :error="errors.phoneNumber"
          />
          
          <BaseInput
            v-model="addForm.label"
            label="برچسب (اختیاری)"
            placeholder="مثلاً: تلفن منزل، شماره پدر، شماره دوم"
            :error="errors.label"
          />
          
          <div class="flex items-center gap-3 pt-4">
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              full-width
            >
              افزودن شماره
            </BaseButton>
            <BaseButton
              type="button"
              variant="secondary"
              size="lg"
              full-width
              @click="showAddModal = false"
            >
              انصراف
            </BaseButton>
          </div>
        </form>
      </BaseModal>

      <!-- Edit Phone Modal -->
      <BaseModal v-if="showEditModal" title="ویرایش شماره تلفن" @close="showEditModal = false">
        <form @submit.prevent="handleUpdatePhone" class="space-y-4">
          <BaseInput
            v-model="editForm.phoneNumber"
            label="شماره تلفن"
            required
            placeholder="09123456789 یا 02188776655"
            dir="ltr"
            :error="errors.phoneNumber"
          />
          
          <BaseInput
            v-model="editForm.label"
            label="برچسب (اختیاری)"
            placeholder="مثلاً: تلفن منزل، شماره پدر، شماره دوم"
            :error="errors.label"
          />
          
          <div class="flex items-center gap-3 pt-4">
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              full-width
            >
              ذخیره تغییرات
            </BaseButton>
            <BaseButton
              type="button"
              variant="secondary"
              size="lg"
              full-width
              @click="showEditModal = false"
            >
              انصراف
            </BaseButton>
          </div>
        </form>
      </BaseModal>
    </template>
  </AdminPage>
</template>
