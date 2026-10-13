<script setup lang="ts">
defineProps<{
  displayValue: string;
  error?: string;
}>();

const emit = defineEmits<{
  input: [event: Event];
  blur: [];
  "fill-total": [];
}>();

const description = defineModel<string>("description", { required: true });
</script>

<template>
  <BaseCard class="!p-4 md:!p-5">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('user.payment.amount.label') }}
        </label>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1 relative">
            <input
              :value="displayValue"
              @input="(event) => emit('input', event)"
              @blur="emit('blur')"
              type="text"
              inputmode="numeric"
              :placeholder="$t('user.payment.amount.placeholder')"
              class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left"
              :class="error ? 'border-red-500' : 'border-gray-300'"
              dir="ltr"
            />
          </div>
          <button
            @click="emit('fill-total')"
            class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors duration-200 whitespace-nowrap"
          >
            {{ $t('user.payment.amount.fillTotal') }}
          </button>
        </div>
        <p v-if="error" class="mt-2 text-sm text-red-600">
          {{ error }}
        </p>
      </div>

      <div class="pt-4 border-t border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('common.fields.descriptionOptional') }}
        </label>
        <textarea
          v-model="description"
          rows="3"
          :placeholder="$t('user.payment.amount.descriptionPlaceholder')"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        ></textarea>
      </div>
    </div>
  </BaseCard>
</template>
