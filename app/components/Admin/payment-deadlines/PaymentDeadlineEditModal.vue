<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    deadlineAt: string;
    deadlineDisplay: string;
    editReason: string;
    deadlineError?: string | null;
    reasonError?: string | null;
    isSubmitting?: boolean;
  }>(),
  {
    deadlineError: null,
    reasonError: null,
    isSubmitting: false,
  }
);

const emit = defineEmits<{
  "update:deadlineAt": [value: string];
  "update:editReason": [value: string];
  close: [];
  submit: [];
}>();

const localEditReason = computed({
  get: () => props.editReason,
  set: (value: string) => emit("update:editReason", value),
});
</script>

<template>
  <BaseModal title="ویرایش مهلت پرداخت" max-width="md" @close="emit('close')">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">
          تاریخ مهلت <span class="text-red-500">*</span>
        </label>
        <input
          :value="deadlineDisplay"
          type="text"
          readonly
          placeholder="1405/02/08"
          class="payment-deadline-edit-input w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          :class="deadlineError ? 'border-red-500' : 'border-gray-300'"
          dir="ltr"
        />
        <date-picker
          :model-value="deadlineAt"
          @update:model-value="(value) => emit('update:deadlineAt', value || '')"
          custom-input=".payment-deadline-edit-input"
          format="YYYY-MM-DD"
          display-format="jYYYY/jMM/jDD"
        />
        <p v-if="deadlineError" class="mt-1 text-xs text-red-600">
          {{ deadlineError }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">
          دلیل ویرایش <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="localEditReason"
          rows="3"
          placeholder="علت ویرایش مهلت پرداخت را بنویسید"
          class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          :class="reasonError ? 'border-red-500' : 'border-gray-300'"
        ></textarea>
        <p v-if="reasonError" class="mt-1 text-xs text-red-600">
          {{ reasonError }}
        </p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="flex-1 py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-accent"
        :disabled="isSubmitting"
        @click="emit('submit')"
      >
        <span v-if="isSubmitting">در حال ثبت...</span>
        <span v-else>ذخیره تغییرات</span>
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
