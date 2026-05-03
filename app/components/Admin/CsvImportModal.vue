<script setup lang="ts">
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import type { CsvImportResponse } from '~/types/admin'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const toast = useToast()

// State
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const importResult = ref<CsvImportResponse | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast.error('لطفاً فقط فایل CSV انتخاب کنید')
      if (fileInputRef.value) fileInputRef.value.value = ''
      return
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم فایل نباید بیشتر از 10 مگابایت باشد')
      if (fileInputRef.value) fileInputRef.value.value = ''
      return
    }
    
    selectedFile.value = file
    importResult.value = null
  }
}

// Handle file upload
const handleUpload = async () => {
  if (!selectedFile.value) {
    toast.error('لطفاً ابتدا فایل را انتخاب کنید')
    return
  }

  try {
    isUploading.value = true
    const result = await adminApi.importCsv(selectedFile.value)
    
    importResult.value = result
    
    if (result.success) {
      toast.success(result.message || 'عملیات با موفقیت انجام شد.')
      
      // If all succeeded, close modal after a delay
      if (result.data.failedCount === 0) {
        setTimeout(() => {
          handleClose()
          emit('success')
        }, 2000)
      }
    } else {
      toast.error(result.message || 'خطا در آپلود فایل')
    }
  } catch (error: any) {
    console.error('Error uploading CSV:', error)
    toast.error(error.data?.message || 'خطا در آپلود فایل CSV')
  } finally {
    isUploading.value = false
  }
}

// Handle close
const handleClose = () => {
  selectedFile.value = null
  importResult.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
  emit('update:modelValue', false)
}

// Reset when modal opens
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedFile.value = null
    importResult.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
})
</script>

<template>
  <BaseModal
    v-if="modelValue"
    title="افزودن گروهی بدهی"
    max-width="2xl"
    @close="handleClose"
  >
    <!-- Upload Section -->
    <div v-if="!importResult" class="space-y-6">
      <!-- File Input -->1
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
        <input
          ref="fileInputRef"
          type="file"
          accept=".csv"
          @change="handleFileSelect"
          class="hidden"
          id="csv-file-input"
        />
        <label
          for="csv-file-input"
          class="cursor-pointer flex flex-col items-center gap-3"
        >
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
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
    </div>

    <!-- Results Section -->
    <div v-else class="space-y-6">
      <!-- Summary -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-sm text-green-700 mb-1">موفق</p>
          <p class="text-2xl font-bold text-green-900">{{ importResult.data.successCount.toLocaleString('fa-IR') }}</p>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-700 mb-1">ناموفق</p>
          <p class="text-2xl font-bold text-red-900">{{ importResult.data.failedCount.toLocaleString('fa-IR') }}</p>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-700 mb-1">کل ردیف‌ها</p>
          <p class="text-2xl font-bold text-blue-900">{{ importResult.data.metadata.totalRows.toLocaleString('fa-IR') }}</p>
        </div>
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p class="text-sm text-purple-700 mb-1">کاربران پردازش شده</p>
          <p class="text-2xl font-bold text-purple-900">{{ importResult.data.processedUsers.toLocaleString('fa-IR') }}</p>
        </div>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-sm text-yellow-700 mb-1">کاربران جدید</p>
          <p class="text-2xl font-bold text-yellow-900">{{ importResult.data.newUsers.toLocaleString('fa-IR') }}</p>
        </div>
        <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p class="text-sm text-indigo-700 mb-1">تسهیلات جدید</p>
          <p class="text-2xl font-bold text-indigo-900">{{ importResult.data.newLoans.toLocaleString('fa-IR') }}</p>
        </div>
      </div>

      <!-- Metadata -->
      <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
        <p><span class="font-medium">زمان پردازش:</span> {{ importResult.data.metadata.processingTime }}</p>
        <p><span class="font-medium">ردیف‌های رد شده:</span> {{ importResult.data.metadata.skippedRows.toLocaleString('fa-IR') }}</p>
      </div>

      <!-- Errors List -->
      <div v-if="importResult.data.errors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 class="font-bold text-red-900 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          خطاها ({{ importResult.data.errors.length.toLocaleString('fa-IR') }})
        </h4>
        <div class="max-h-60 overflow-y-auto space-y-2">
          <div
            v-for="(error, index) in importResult.data.errors"
            :key="index"
            class="bg-white rounded p-3 text-sm text-red-800 border border-red-100"
          >
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-else class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <svg class="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-green-900 font-bold">همه تراکنش‌ها با موفقیت ثبت شدند!</p>
      </div>
    </div>

    <!-- Footer -->
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
          @click="() => { importResult = null; }"
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
