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
    toast.error('لطفاً فقط فایل CSV انتخاب کنید')
    clearFileInput()
    return false
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error('حجم فایل نباید بیشتر از 10 مگابایت باشد')
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
    return `${amount} ریال`
  }

  return `${new Intl.NumberFormat('fa-IR').format(numericAmount)} ریال`
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    toast.error('لطفاً ابتدا فایل را انتخاب کنید')
    return
  }

  try {
    isUploading.value = true
    const result = await adminApi.importPaymentsCsv(selectedFile.value)
    importResult.value = result

    if (result.success) {
      toast.success(result.message || 'عملیات با موفقیت انجام شد')
      emit('success')
    } else {
      toast.error(result.message || 'خطا در آپلود فایل')
    }
  } catch (error: any) {
    console.error('Error uploading payment CSV:', error)
    toast.error(error?.data?.message || 'خطا در آپلود فایل CSV')
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
    title="آپلود گروهی پرداخت‌ها"
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
          <strong>نکات مهم:</strong>
        </p>
        <ul class="list-disc list-inside mt-2 space-y-1 text-sm text-blue-800">
          <li>فایل باید UTF-8 encoded باشد</li>
          <li>تمام کاربران باید از قبل ایجاد شده باشند</li>
          <li>تمام تسهیلات باید از قبل موجود باشند</li>
        </ul>
      </div>

      <div v-if="isUploading" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div class="flex items-center justify-between text-sm text-gray-700 mb-2">
          <span>در حال ارسال و پردازش فایل...</span>
          <span>لطفاً منتظر بمانید</span>
        </div>
        <div class="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div class="h-full w-2/3 animate-pulse bg-gradient-to-r from-primary to-accent"></div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ImportStatCard color="green" label="موفق" bold-label :value="formatNumber(importResult.data.successCount)" />
        <ImportStatCard color="red" label="ناموفق" bold-label :value="formatNumber(importResult.data.failedCount)" />
        <ImportStatCard color="blue" label="کل ردیف‌ها" bold-label :value="formatNumber(importResult.data.metadata.totalRows)" />
        <ImportStatCard color="purple" label="کاربران پردازش شده" bold-label :value="formatNumber(importResult.data.processedUsers)" />
        <ImportStatCard color="yellow" label="مبلغ کل پرداخت" bold-label :value="formatCurrency(importResult.data.metadata.totalPaymentAmount)" />
        <ImportStatCard color="indigo" label="کاهش بدهی" bold-label :value="formatCurrency(importResult.data.metadata.totalDebtReduced)" />
      </div>

      <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
        <p><span class="font-medium">زمان پردازش:</span> {{ importResult.data.metadata.processingTime }}</p>
        <p><span class="font-medium">ردیف‌های رد شده:</span> {{ formatNumber(importResult.data.metadata.skippedRows) }}</p>
      </div>

      <ImportErrorsList
        v-if="importResult.data.errors.length > 0"
        :errors="importResult.data.errors"
        list-class="max-h-64"
        :limit="100"
      />

      <div v-else class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <IconsOutline name="check-circle" class="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p class="text-green-900 font-bold text-lg">همه پرداخت‌ها با موفقیت ثبت شدند!</p>
        <p class="text-green-700 text-sm mt-2">بدهی کاربران کاهش یافته است.</p>
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
