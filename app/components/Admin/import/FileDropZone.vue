<script setup lang="ts">
/**
 * Dashed CSV picker of the import modals. Drag listeners passed by the parent
 * fall through to the root element; `dragging` only switches the highlight.
 */
defineProps<{
  inputId: string
  selectedFile: File | null
  dragging?: boolean
}>()

const emit = defineEmits<{
  change: [event: Event]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const clear = () => {
  if (inputRef.value) inputRef.value.value = ''
}

defineExpose({ clear })
</script>

<template>
  <div
    class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
    :class="dragging ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'"
  >
    <input
      ref="inputRef"
      type="file"
      accept=".csv"
      @change="emit('change', $event)"
      class="hidden"
      :id="inputId"
    />
    <label :for="inputId" class="cursor-pointer flex flex-col items-center gap-3">
      <IconsOutline name="upload" class="w-16 h-16 text-gray-400" />
      <div>
        <p class="text-lg font-medium text-gray-700">
          {{ selectedFile ? selectedFile.name : $t('admin.import.dropZone.title') }}
        </p>
        <p class="text-sm text-gray-500 mt-1">
          {{ selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : $t('admin.import.dropZone.hint') }}
        </p>
      </div>
    </label>
  </div>
</template>
