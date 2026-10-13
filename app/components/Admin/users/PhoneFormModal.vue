<script setup lang="ts">
defineProps<{
  title: string
  submitText: string
  phonePlaceholder: string
  phoneNumber: string
  label: string
  errors: Record<string, string>
}>()

const emit = defineEmits<{
  'update:phoneNumber': [value: string | number]
  'update:label': [value: string | number]
  submit: []
  close: []
}>()
</script>

<template>
  <BaseModal :title="title" @close="emit('close')">
    <form @submit.prevent="emit('submit')" class="space-y-4">
      <BaseInput
        :model-value="phoneNumber"
        @update:model-value="emit('update:phoneNumber', $event)"
        :label="$t('common.fields.phone')"
        required
        :placeholder="phonePlaceholder"
        dir="ltr"
        :error="errors.phoneNumber"
      />

      <BaseInput
        :model-value="label"
        @update:model-value="emit('update:label', $event)"
        :label="$t('admin.users.phones.fields.labelOptional')"
        :placeholder="$t('admin.users.phones.fields.labelPlaceholder')"
        :error="errors.label"
      />

      <div class="flex items-center gap-3 pt-4">
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          full-width
        >
          {{ submitText }}
        </BaseButton>
        <BaseButton
          type="button"
          variant="secondary"
          size="lg"
          full-width
          @click="emit('close')"
        >
          {{ $t('common.actions.cancel') }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
