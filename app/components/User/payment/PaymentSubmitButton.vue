<script setup lang="ts">
/** Gradient "pay" button; `compact` is the variant used in the mobile bottom bar. */
defineProps<{
  canSubmit: boolean;
  submitting: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    @click="emit('click')"
    :disabled="!canSubmit"
    :class="[
      'w-full rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2',
      compact ? 'py-3.5 text-base' : 'py-4 text-lg',
      canSubmit
        ? compact
          ? 'bg-gradient-to-r from-primary to-accent text-white'
          : 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed',
    ]"
  >
    <Icon
      v-if="submitting"
      name="mdi:loading"
      :size="compact ? '22' : '24'"
      class="animate-spin"
    />
    <Icon v-else name="mdi:credit-card-check" :size="compact ? '22' : '24'" />
    {{ submitting ? "در حال انتقال..." : "پرداخت" }}
  </button>
</template>
