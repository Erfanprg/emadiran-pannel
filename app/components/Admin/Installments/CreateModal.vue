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

const { t } = useI18n()

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
    toast.error(t('admin.installments.errors.fetchUsers'))
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
    toast.error(t('admin.common.errors.fetchLoans'))
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
    toast.error(t('admin.common.loans.numberRequired'))
    return false
  }
  
  try {
    isLoadingLoans.value = true
    const response = await loansApi.createLoan({ 
      userId: formData.value.userId,
      loanNumber: formData.value.newLoanNumber.trim()
    })
    toast.success(t('admin.common.loans.created'))
    // دوباره لیست تسهیلات را بارگذاری کن
    await fetchUserLoans(formData.value.userId)
    return true
  } catch (err: any) {
    console.error('Error creating loan:', err)
    toast.error(err.data?.message || err.message || t('admin.common.loans.createFailed'))
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
    errors.value.userId = t('admin.installments.validation.userRequired')
  }
  
  if ((showLoanWarning.value || showNewLoanInput.value) && !formData.value.newLoanNumber.trim()) {
    errors.value.newLoanNumber = t('admin.installments.validation.loanNumberRequired')
  }
  
  if (!showLoanWarning.value && !showNewLoanInput.value && !formData.value.loanId) {
    errors.value.loanId = t('admin.installments.validation.userNeedsLoan')
  }
  
  if (!amountInput.rawValue.value || amountInput.numericValue.value < 1000) {
    errors.value.amount = t('admin.installments.validation.minAmount')
  }
  
  if (!formData.value.dueDate) {
    errors.value.dueDate = t('admin.installments.validation.dueDateRequired')
  }
  
  return Object.keys(errors.value).length === 0
}

// Handle submit
const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error(t('common.validation.fixErrors'))
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
        toast.error(t('admin.common.loans.createFailed'))
        isSubmitting.value = false
        return
      }
    }
    
    if (!formData.value.loanId) {
      toast.error(t('admin.installments.create.needLoanFirst'))
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
    toast.error(err.data?.message || err.message || t('admin.installments.errors.create'))
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
  <BaseModal :title="$t('admin.installments.create.title')" @close="emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- User Selection -->
      <BaseSelect
        v-model="formData.userId"
        :label="$t('admin.installments.fields.user')"
        required
        :disabled="isLoadingUsers"
        :error="errors.userId"
        :placeholder="$t('admin.installments.create.selectUser')"
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
          :label="$t('common.fields.loanNumber')"
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
            :label="$t('common.fields.selectLoan')"
            required
            :disabled="isLoadingLoans || loans.length === 0"
            :error="errors.loanId"
            :placeholder="$t('admin.installments.create.selectLoanPlaceholder')"
            :options="loans.map(loan => ({
              value: loan.id,
              label: formatLoanOption(loan)
            }))"
          />
        </div>
        
        <div v-if="showNewLoanInput" >     
          <BaseInput
            v-model="formData.newLoanNumber"
            :label="$t('admin.common.loans.newNumber')"
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
          <IconsOutline name="plus" v-if="!showNewLoanInput" class="w-4 h-4" />
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span v-if="!showNewLoanInput">{{ $t('admin.common.loans.createNew') }}</span>
          <span v-else>{{ $t('admin.installments.create.backToLoans') }}</span>
        </button>
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('common.fields.amountRial') }} <span class="text-red-500">*</span>
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
        :label="$t('common.fields.dueDate')"
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
        :label="$t('common.fields.descriptionOptional')"
        :placeholder="$t('admin.installments.form.descriptionPlaceholder')"
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
        {{ $t('admin.installments.create.submit') }}
      </BaseButton>
      <BaseButton
        variant="secondary"
        size="lg"
        full-width
        :disabled="isSubmitting"
        @click="emit('close')"
      >
        {{ $t('common.actions.cancel') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
