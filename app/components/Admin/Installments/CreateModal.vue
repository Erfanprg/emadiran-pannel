<script setup lang="ts">
import { installmentsApi } from '~/services/api/installments'
import { loansApi } from '~/services/api/loans'
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import { useCurrencyInput } from '~/composables/useCurrencyInput'
import type { AdminUser } from '~/types/admin'
import type { LoanListItem } from '~/types/loan'
import { getUserDisplayName } from '~/func/getUserDisplayName'
import { formatDate } from '~/utils/formatters'

const emit = defineEmits(['close', 'created'])
const toast = useToast()

// Currency input
const amountInput = useCurrencyInput()

// State
const users = ref<AdminUser[]>([])
const loans = ref<LoanListItem[]>([])
const isLoadingUsers = ref(false)
const isLoadingLoans = ref(false)
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})
const showLoanWarning = ref(false)
const showNewLoanInput = ref(false)

// Form data
const formData = ref({
  userId: undefined as number | undefined,
  loanId: undefined as number | undefined,
  newLoanNumber: '',
  dueDate: '',
  description: ''
})

// Fetch users for dropdown
const fetchUsers = async () => {
  try {
    isLoadingUsers.value = true
    const response = await adminApi.getUsers({ limit: 1000 })
    users.value = response.data
  } catch (err: any) {
    console.error('Error fetching users:', err)
    toast.error('خطا در دریافت لیست کاربران')
  } finally {
    isLoadingUsers.value = false
  }
}

// Fetch loans for selected user
const fetchUserLoans = async (userId: number) => {
  try {
    isLoadingLoans.value = true
    showLoanWarning.value = false
    showNewLoanInput.value = false
    loans.value = []
    formData.value.loanId = undefined
    
    const response = await loansApi.getUserLoans(userId)
    loans.value = response.data
    
    if (loans.value.length > 0) {
      // انتخاب خودکار آخرین تسهیلات (اولین آیتم در لیست)
      formData.value.loanId = loans.value[0].id
    } else {
      // نمایش هشدار که تسهیلات وجود ندارد و باید ایجاد شود
      showLoanWarning.value = true
    }
  } catch (err: any) {
    console.error('Error fetching loans:', err)
    toast.error('خطا در دریافت لیست تسهیلات')
  } finally {
    isLoadingLoans.value = false
  }
}

// Format loan option for display
const formatLoanOption = (loan: LoanListItem) => {
  return loan.loanNumber
}

// Create loan for user with custom loan number
const createLoanForUser = async () => {
  if (!formData.value.userId || !formData.value.newLoanNumber.trim()) {
    toast.error('لطفاً شماره تسهیلات را وارد کنید')
    return false
  }
  
  try {
    isLoadingLoans.value = true
    const response = await loansApi.createLoan({ 
      userId: formData.value.userId,
      loanNumber: formData.value.newLoanNumber.trim()
    })
    toast.success('تسهیلات جدید با موفقیت ایجاد شد')
    // دوباره لیست تسهیلات را بارگذاری کن
    await fetchUserLoans(formData.value.userId)
    return true
  } catch (err: any) {
    console.error('Error creating loan:', err)
    toast.error(err.data?.message || err.message || 'خطا در ایجاد تسهیلات')
    return false
  } finally {
    isLoadingLoans.value = false
  }
}

// Toggle new loan input
const toggleNewLoanInput = () => {
  showNewLoanInput.value = !showNewLoanInput.value
  if (showNewLoanInput.value) {
    formData.value.loanId = undefined
    formData.value.newLoanNumber = ''
  } else {
    formData.value.newLoanNumber = ''
    if (loans.value.length > 0) {
      formData.value.loanId = loans.value[0].id
    }
  }
}

// Validate form
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.userId) {
    errors.value.userId = 'انتخاب کاربر الزامی است'
  }
  
  if ((showLoanWarning.value || showNewLoanInput.value) && !formData.value.newLoanNumber.trim()) {
    errors.value.newLoanNumber = 'شماره تسهیلات الزامی است'
  }
  
  if (!showLoanWarning.value && !showNewLoanInput.value && !formData.value.loanId) {
    errors.value.loanId = 'کاربر باید حداقل یک تسهیلات داشته باشد'
  }
  
  if (!amountInput.rawValue.value || amountInput.numericValue.value < 1000) {
    errors.value.amount = 'مبلغ باید حداقل 1000 ریال باشد'
  }
  
  if (!formData.value.dueDate) {
    errors.value.dueDate = 'تاریخ سررسید الزامی است'
  }
  
  return Object.keys(errors.value).length === 0
}

// Handle submit
const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('لطفاً خطاهای فرم را برطرف کنید')
    return
  }
  
  try {
    isSubmitting.value = true
    
    if ((showLoanWarning.value || showNewLoanInput.value) && formData.value.newLoanNumber.trim()) {
      const created = await createLoanForUser()
      if (!created) {
        isSubmitting.value = false
        return
      }
      if (!formData.value.loanId) {
        toast.error('خطا در ایجاد تسهیلات')
        isSubmitting.value = false
        return
      }
    }
    
    if (!formData.value.loanId) {
      toast.error('ابتدا باید یک تسهیلات برای این کاربر ایجاد شود')
      isSubmitting.value = false
      return
    }
    
    const response = await installmentsApi.createInstallment({
      userId: formData.value.userId!,
      amount: amountInput.rawValue.value,
      dueDate: formData.value.dueDate,
      loanId: formData.value.loanId,
      description: formData.value.description
    })
    toast.success(response.message)
    emit('created')
    emit('close')
  } catch (err: any) {
    console.error('Create error:', err)
    toast.error(err.data?.message || err.message || 'خطا در ایجاد قسط')
  } finally {
    isSubmitting.value = false
  }
}

// Watch for user selection changes
watch(() => formData.value.userId, (newUserId) => {
  if (newUserId) {
    fetchUserLoans(newUserId)
  } else {
    loans.value = []
    formData.value.loanId = undefined
    formData.value.newLoanNumber = ''
    showLoanWarning.value = false
    showNewLoanInput.value = false
  }
})

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <BaseModal title="ایجاد قسط جدید" @close="emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- User Selection -->
      <BaseSelect
        v-model="formData.userId"
        label="کاربر"
        required
        :disabled="isLoadingUsers"
        :error="errors.userId"
        placeholder="انتخاب کاربر..."
        :options="users.map(user => ({
          value: user.id,
          label: `${getUserDisplayName(user)} - ${user.phoneNumber}`
        }))"
      />

      <!-- Loan Warning -->
      <div v-if="showLoanWarning" class="mb-2">
        
        <!-- New Loan Number Input -->
        <BaseInput
          v-model="formData.newLoanNumber"
          label="شماره تسهیلات"
          type="text"
          required
          placeholder="LN_0000000001"
          dir="ltr"
          :error="errors.newLoanNumber"
        />
      </div>

      <!-- Loan Selection -->
      <div v-if="formData.userId && !showLoanWarning" class="space-y-3">
        <!-- انتخاب از تسهیلات موجود -->
        <div v-if="!showNewLoanInput">
          <BaseSelect
            v-model="formData.loanId"
            label="انتخاب تسهیلات"
            required
            :disabled="isLoadingLoans || loans.length === 0"
            :error="errors.loanId"
            placeholder="انتخاب تسهیلات..."
            :options="loans.map(loan => ({
              value: loan.id,
              label: formatLoanOption(loan)
            }))"
          />
        </div>
        
        <div v-if="showNewLoanInput" >     
          <BaseInput
            v-model="formData.newLoanNumber"
            label="شماره تسهیلات جدید"
            type="text"
            required
            placeholder="LN_0000000001"
            dir="ltr"
            :error="errors.newLoanNumber"
          />
        </div>
        
        <button
          type="button"
          @click="toggleNewLoanInput"
          class="text-sm text-primary hover:text-accent transition-colors duration-200 flex items-center gap-2 font-medium"
        >
          <svg v-if="!showNewLoanInput" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span v-if="!showNewLoanInput">ایجاد تسهیلات جدید</span>
          <span v-else>بازگشت به لیست تسهیلات</span>
        </button>
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          مبلغ (ریال) <span class="text-red-500">*</span>
        </label>
        <input
          :value="amountInput.displayValue.value"
          @input="amountInput.handleInput"
          type="text"
          inputmode="numeric"
          placeholder="1,000,000"
          class="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left"
          :class="errors.amount ? 'border-red-500' : 'border-gray-300'"
          dir="ltr"
        />
        <p v-if="errors.amount" class="mt-1 text-sm text-red-600">{{ errors.amount }}</p>
      </div>

      <!-- Due Date -->
      <BaseInput
        v-model="formData.dueDate"
        label="تاریخ سررسید"
        type="text"
        required
        class="installment-create-duedate"
        :error="errors.dueDate"
      />
      <date-picker 
        v-model="formData.dueDate" 
        custom-input=".installment-create-duedate input"
      />

      <!-- Description -->
      <BaseTextarea
        v-model="formData.description"
        label="توضیحات (اختیاری)"
        placeholder="توضیحات مربوط به این قسط..."
      />
    </form>

    <template #footer>
      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        full-width
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="handleSubmit"
      >
        ایجاد قسط
      </BaseButton>
      <BaseButton
        variant="secondary"
        size="lg"
        full-width
        :disabled="isSubmitting"
        @click="emit('close')"
      >
        انصراف
      </BaseButton>
    </template>
  </BaseModal>
</template>
