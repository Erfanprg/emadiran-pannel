<script setup lang="ts">
import { ref, watch } from 'vue'
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import type { BulkPaymentImportResponse } from '~/types/admin'
import { formatNumber } from '~/utils/formatters'

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
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const clearFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
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
      <div
        class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
        :class="isDragging ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".csv"
          @change="handleFileSelect"
          class="hidden"
          id="payment-csv-input"
        />
        <label for="payment-csv-input" class="cursor-pointer flex flex-col items-center gap-3">
          <IconsOutline name="upload" class="w-16 h-16 text-gray-400" />
          <div>
            <p class="text-lg font-medium text-gray-700">
              {{ selectedFile ? selectedFile.name : 'انتخاب فایل CSV' }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              {{ selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'کلیک کنید یا فایل را اینجا بکشید' }}
            </p>
          </div>
        </label>
      </div>

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
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-sm text-green-700 mb-1 font-medium">موفق</p>
          <p class="text-2xl font-bold text-green-900">{{ formatNumber(importResult.data.successCount) }}</p>
        </div>

        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-700 mb-1 font-medium">ناموفق</p>
          <p class="text-2xl font-bold text-red-900">{{ formatNumber(importResult.data.failedCount) }}</p>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-700 mb-1 font-medium">کل ردیف‌ها</p>
          <p class="text-2xl font-bold text-blue-900">{{ formatNumber(importResult.data.metadata.totalRows) }}</p>
        </div>

        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p class="text-sm text-purple-700 mb-1 font-medium">کاربران پردازش شده</p>
          <p class="text-2xl font-bold text-purple-900">{{ formatNumber(importResult.data.processedUsers) }}</p>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-sm text-yellow-700 mb-1 font-medium">مبلغ کل پرداخت</p>
          <p class="text-2xl font-bold text-yellow-900">{{ formatCurrency(importResult.data.metadata.totalPaymentAmount) }}</p>
        </div>

        <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p class="text-sm text-indigo-700 mb-1 font-medium">کاهش بدهی</p>
          <p class="text-2xl font-bold text-indigo-900">{{ formatCurrency(importResult.data.metadata.totalDebtReduced) }}</p>
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
        <p><span class="font-medium">زمان پردازش:</span> {{ importResult.data.metadata.processingTime }}</p>
        <p><span class="font-medium">ردیف‌های رد شده:</span> {{ formatNumber(importResult.data.metadata.skippedRows) }}</p>
      </div>

      <div v-if="importResult.data.errors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 class="font-bold text-red-900 mb-3 flex items-center gap-2">
          <IconsOutline name="exclamation-circle" class="w-5 h-5" />
          خطاها ({{ formatNumber(importResult.data.errors.length) }})
        </h4>
        <div class="max-h-64 overflow-y-auto space-y-2">
          <div
            v-for="(error, index) in importResult.data.errors.slice(0, 100)"
            :key="index"
            class="bg-white rounded p-3 text-sm text-red-800 border border-red-100"
          >
            {{ error }}
          </div>
          <p v-if="importResult.data.errors.length > 100" class="text-gray-600 text-xs p-2">
            و {{ importResult.data.errors.length - 100 }} خطای دیگر...
          </p>
        </div>
      </div>

      <div v-else class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <IconsOutline name="check-circle" class="w-12 h-12 text-green-600 mx-auto mb-3" />
        <p class="text-green-900 font-bold text-lg">همه پرداخت‌ها با موفقیت ثبت شدند!</p>
        <p class="text-green-700 text-sm mt-2">بدهی کاربران کاهش یافته است.</p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center gap-3 w-full">
        <button
          v-if="!importResult"
          @click="handleUpload"
          :disabled="!selectedFile || isUploading"
          class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          <svg v-if="isUploading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isUploading ? 'در حال آپلود...' : 'آپلود و پردازش' }}
        </button>

        <button
          v-if="importResult"
          @click="handleNewUpload"
          class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          آپلود فایل جدید
        </button>

        <button
          @click="handleClose"
          class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          {{ importResult ? 'بستن' : 'انصراف' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>