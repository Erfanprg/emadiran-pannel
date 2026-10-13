<script setup lang="ts">
defineProps<{
  hasResult: boolean
  uploadDisabled: boolean
  isUploading: boolean
}>()

const emit = defineEmits<{
  upload: []
  'new-upload': []
  close: []
}>()
</script>

<template>
  <div class="flex items-center gap-3 w-full">
    <button
      v-if="!hasResult"
      @click="emit('upload')"
      :disabled="uploadDisabled"
      class="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
    >
      <svg v-if="isUploading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {{ isUploading ? $t('admin.import.footer.uploading') : $t('admin.import.footer.upload') }}
    </button>

    <button
      v-if="hasResult"
      @click="emit('new-upload')"
      class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      {{ $t('admin.import.footer.newUpload') }}
    </button>

    <button
      @click="emit('close')"
      class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
    >
      {{ hasResult ? $t('global.button.close') : $t('common.actions.cancel') }}
    </button>
  </div>
</template>
