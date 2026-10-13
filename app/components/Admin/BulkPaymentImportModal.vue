<script setup lang="ts">
import { ref, watch } from 'vue'
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import type { BulkPaymentImportResponse } from '~/types/admin'
import { formatNumber } from '~/utils/formatters'
import FileDropZone from '~/components/Admin/import/FileDropZone.vue'
import ImportStatCard from '~/components/Admin/import/ImportStatCard.vue'
import ImportErrorsList from '~/components/Admin/import/ImportErrorsList.vue'
import ImportModalFooter from '~/components/Admin/import/ImportModalFooter.vue'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const toast = useToast()

const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const importResult = ref<BulkPaymentImportResponse | null>(null)
const dropZoneRef = ref<InstanceType<typeof FileDropZone> | null>(null)
const isDragging = ref(false)

const clearFileInput = () => {
  dropZoneRef.value?.clear()
}

const resetState = () => {
  selectedFile.value = null
  importResult.value = null
  isDragging.value = false
  clearFileInput()
}

const validateAndSetFile = (file?: File) => {
  if (!file) return false

  if (!file.name.toLowerCase().endsWith('.csv')) {
    toast.error(t('admin.import.errors.csvOnly'))
    clearFileInput()
    return false
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error(t('admin.import.errors.fileTooLarge'))
    clearFileInput()
    return false
  }

  selectedFile.value = file
  importResult.value = null
  return true
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  validateAndSetFile(target.files?.[0])
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const formatCurrency = (amount: string) => {
  const numericAmount = Number(amount)
  if (Number.isNaN(numericAmount)) {
    return t('admin.import.amountRial', { amount: amount })
  }

  return t('admin.import.amountRial', { amount: new Intl.NumberFormat('fa-IR').format(numericAmount) })
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    toast.error(t('admin.import.errors.noFile'))
    return
  }

  try {
    isUploading.value = true
    const result = await adminApi.importPaymentsCsv(selectedFile.value)
    importResult.value = result

    if (result.success) {
      toast.success(result.message || t('common.messages.success'))
      emit('success')
    } else {
      toast.error(result.message || t('admin.import.errors.upload'))
    }
  } catch (error: any) {
    console.error('Error uploading payment CSV:', error)
    toast.error(error?.data?.message || t('admin.import.errors.uploadCsv'))
  } finally {
    isUploading.value = false
  }
}

const handleClose = () => {
  resetState()
  emit('update:modelValue', false)
}

const handleNewUpload = () => {
  importResult.value = null
  selectedFile.value = null
  clearFileInput()
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      resetState()
    }
  }
)
</script>

<template>
  <BaseModal
    v-if="modelValue"
    :title="$t('admin.import.bulkPayment.title')"
    max-width="2xl"
    @close="handleClose"
  >
    <div v-if="!importResult" class="space-y-6">
      <FileDropZone
        ref="dropZoneRef"
        input-id="payment-csv-input"
        :selected-file="selectedFile"
        :dragging="isDragging"
        @change="handleFileSelect"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      />

      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="text-sm text-blue-800">
          <strong>{{ $t('common.labels.importantNotes') }}</strong>
        </p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-sm text-blue-800">
          <li>{{ $t('admin.import.bulkPayment.notes.utf8') }}</li>
          <li>{{ $t('admin.import.bulkPayment.notes.usersExist') }}</li>
          <li>{{ $t('admin.import.bulkPayment.notes.loansExist') }}</li>
        </ul>
      </div>

      <div v-if="isUploading" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div class="flex items-center justify-between text-sm text-gray-700 mb-2">
          <span>{{ $t('admin.import.bulkPayment.uploadingTitle') }}</span>
          <span>{{ $t('admin.import.bulkPayment.pleaseWait') }}</span>
        </div>
        <div class="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div class="h-full w-2/3 animate-pulse bg-gradient-to-r from-primary to-accent"></div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ImportStatCard color="green" :label="$t('status.success')" bold-label :value="formatNumber(importResult.data.successCount)" />
        <ImportStatCard color="red" :label="$t('status.failed')" bold-label :value="formatNumber(importResult.data.failedCount)" />
        <ImportStatCard color="blue" :label="$t('admin.import.stats.totalRows')" bold-label :value="formatNumber(importResult.data.metadata.totalRows)" />
        <ImportStatCard color="purple" :label="$t('admin.import.stats.processedUsers')" bold-label :value="formatNumber(importResult.data.processedUsers)" />
        <ImportStatCard color="yellow" :label="$t('admin.import.stats.totalPaymentAmount')" bold-label :value="formatCurrency(importResult.data.metadata.totalPaymentAmount)" />
        <ImportStatCard color="indigo" :label="$t('admin.import.stats.debtReduced')" bold-label :value="formatCurrency(importResult.data.metadata.totalDebtReduced)" />
      </div>

      <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
        <p><span class="font-medium">{{ $t('admin.import.meta.processingTime') }}</span> {{ importResult.data.metadata.processingTime }}</p>
        <p><span class="font-medium">{{ $t('admin.import.meta.skippedRows') }}</span> {{ formatNumber(importResult.data.metadata.skippedRows) }}</p>
      </div>

      <ImportErrorsList
        v-if="importResult.data.errors.length > 0"
        :errors="importResult.data.errors"
        list-class="max-h-64"
        :limit="100"
      />

      <div v-else class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <IconsOutline name="check-circle" class="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p class="text-green-900 font-bold text-lg">{{ $t('admin.import.bulkPayment.allSucceeded') }}</p>
        <p class="text-green-700 text-sm mt-2">{{ $t('admin.import.bulkPayment.debtsReduced') }}</p>
      </div>
    </div>

    <template #footer>
      <ImportModalFooter
        :has-result="!!importResult"
        :upload-disabled="!selectedFile || isUploading"
        :is-uploading="isUploading"
        @upload="handleUpload"
        @new-upload="handleNewUpload"
        @close="handleClose"
      />
    </template>
  </BaseModal>
</template>
