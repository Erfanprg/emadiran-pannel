<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    description: string
    error?: string | null
    isSubmitting?: boolean
  }>(),
  {
    error: null,
    isSubmitting: false
  }
)

const emit = defineEmits<{
  'update:description': [value: string]
  close: []
  submit: []
}>()

const localDescription = computed({
  get: () => props.description,
  set: (value: string) => emit('update:description', value)
})
</script>

<template>
  <BaseModal title="ثبت تماس جدید" max-width="md" @close="emit('close')">
    <div class="space-y-4">
      <BaseTextarea
        v-model="localDescription"
        label="توضیحات"
        placeholder="توضیحات تماس را وارد کنید"
        :error="error || undefined"
        :rows="5"
        required
      />
    </div>

    <template #footer>
      <button
        type="button"
        class="flex-1 py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-accent"
        :disabled="isSubmitting"
        @click="emit('submit')"
      >
        <span v-if="isSubmitting">در حال ثبت...</span>
        <span v-else>ثبت تماس</span>
      </button>
      <button
        type="button"
        class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
        :disabled="isSubmitting"
        @click="emit('close')"
      >
        انصراف
      </button>
    </template>
  </BaseModal>
</template>
