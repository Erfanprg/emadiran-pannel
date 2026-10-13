<script setup lang="ts">
import { adminApi } from '~/services/api/admin'
import { useToast } from '~/composables/useToast'
import type { CsvImportResponse } from '~/types/admin'
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

// State
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const importResult = ref<CsvImportResponse | null>(null)
const dropZoneRef = ref<InstanceType<typeof FileDropZone> | null>(null)

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast.error(t('admin.import.errors.csvOnly'))
      dropZoneRef.value?.clear()
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('admin.import.errors.fileTooLarge'))
      dropZoneRef.value?.clear()
      return
    }

    selectedFile.value = file
    importResult.value = null
  }
}

// Handle file upload
const handleUpload = async () => {
  if (!selectedFile.value) {
    toast.error(t('admin.import.errors.noFile'))
    return
  }

  try {
    isUploading.value = true
    const result = await adminApi.importCsv(selectedFile.value)

    importResult.value = result

    if (result.success) {
      toast.success(result.message || t('admin.import.csv.success'))

      // If all succeeded, close modal after a delay
      if (result.data.failedCount === 0) {
        setTimeout(() => {
          handleClose()
          emit('success')
        }, 2000)
      }
    } else {
      toast.error(result.message || t('admin.import.errors.upload'))
    }
  } catch (error: any) {
    console.error('Error uploading CSV:', error)
    toast.error(error.data?.message || t('admin.import.errors.uploadCsv'))
  } finally {
    isUploading.value = false
  }
}

// Handle close
const handleClose = () => {
  selectedFile.value = null
  importResult.value = null
  dropZoneRef.value?.clear()
  emit('update:modelValue', false)
}

// Reset when modal opens
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedFile.value = null
    importResult.value = null
    dropZoneRef.value?.clear()
  }
})
</script>

<template>
  <BaseModal
    v-if="modelValue"
    :title="$t('admin.import.csv.title')"
    max-width="2xl"
    @close="handleClose"
  >
    <!-- Upload Section -->
    <div v-if="!importResult" class="space-y-6">
      <FileDropZone
        ref="dropZoneRef"
        input-id="csv-file-input"
        :selected-file="selectedFile"
        @change="handleFileSelect"
      />
    </div>

    <!-- Results Section -->
    <div v-else class="space-y-6">
      <!-- Summary -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ImportStatCard color="green" :label="$t('status.success')" :value="formatNumber(importResult.data.successCount)" />
        <ImportStatCard color="red" :label="$t('status.failed')" :value="formatNumber(importResult.data.failedCount)" />
        <ImportStatCard color="blue" :label="$t('admin.import.stats.totalRows')" :value="formatNumber(importResult.data.metadata.totalRows)" />
        <ImportStatCard color="purple" :label="$t('admin.import.stats.processedUsers')" :value="formatNumber(importResult.data.processedUsers)" />
        <ImportStatCard color="yellow" :label="$t('admin.import.stats.newUsers')" :value="formatNumber(importResult.data.newUsers)" />
        <ImportStatCard color="indigo" :label="$t('admin.import.stats.newLoans')" :value="formatNumber(importResult.data.newLoans)" />
      </div>

      <!-- Metadata -->
      <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
        <p><span class="font-medium">{{ $t('admin.import.meta.processingTime') }}</span> {{ importResult.data.metadata.processingTime }}</p>
        <p><span class="font-medium">{{ $t('admin.import.meta.skippedRows') }}</span> {{ formatNumber(importResult.data.metadata.skippedRows) }}</p>
      </div>

      <!-- Errors List -->
      <ImportErrorsList
        v-if="importResult.data.errors.length > 0"
        :errors="importResult.data.errors"
        list-class="max-h-60"
      />

      <!-- Success Message -->
      <div v-else class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <IconsOutline name="check-circle" class="w-12 h-12 text-green-600 mx-auto mb-2" />
        <p class="text-green-900 font-bold">{{ $t('admin.import.csv.allSucceeded') }}</p>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <ImportModalFooter
        :has-result="!!importResult"
        :upload-disabled="!selectedFile || isUploading"
        :is-uploading="isUploading"
        @upload="handleUpload"
        @new-upload="importResult = null"
        @close="handleClose"
      />
    </template>
  </BaseModal>
</template>
