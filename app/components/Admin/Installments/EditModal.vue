<script setup lang="ts">
import { installmentsApi } from '~/services/api/installments'
import { useToast } from '~/composables/useToast'
import { useCurrencyInput } from '~/composables/useCurrencyInput'
import type { Installment } from '~/types/installment'
import { getUserDisplayName } from '~/func/getUserDisplayName'

const { t } = useI18n()

const props = defineProps<{
  installment: Installment
}>()

const emit = defineEmits(['close', 'updated'])
const toast = useToast()

// Currency input
const amountInput = useCurrencyInput(props.installment.amount)

// State
const isSubmitting = ref(false)
const errors = ref<Record<string, string>>({})

// Form data
const formData = ref({
  dueDate: props.installment.dueDate.split('T')[0], // Extract date only
  description: props.installment.description || ''
})

// Validate form
const validateForm = () => {
  errors.value = {}
  
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
    const response = await installmentsApi.updateInstallment(props.installment.id, {
      amount: amountInput.rawValue.value,
      dueDate: formData.value.dueDate,
      description: formData.value.description
    })
    toast.success(response.message)
    emit('updated')
    emit('close')
  } catch (err: any) {
    console.error('Update error:', err)
    toast.error(err.data?.message || err.message || t('admin.installments.errors.update'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal :title="$t('admin.installments.edit.title')" @close="emit('close')">
    <!-- User Info -->
    <BaseCard :padding="true" class="mb-6 bg-gray-50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <IconsOutline name="user" class="w-5 h-5 text-primary" />
        </div>
        <div>
          <p class="text-sm text-gray-600">{{ $t('admin.installments.fields.user') }}</p>
          <p class="font-bold text-gray-900">{{ installment.user ? getUserDisplayName(installment.user) : `#${installment.userId}` }}</p>
        </div>
      </div>
    </BaseCard>

    <form @submit.prevent="handleSubmit" class="space-y-4">
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
        class="installment-edit-duedate"
        :error="errors.dueDate"
      />
      <date-picker 
        v-model="formData.dueDate" 
        custom-input=".installment-edit-duedate input"
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
        {{ $t('common.actions.saveChanges') }}
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
