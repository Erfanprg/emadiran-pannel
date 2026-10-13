<script setup lang="ts">
import type { Gateway } from "~/types/gateway";

defineProps<{
  gateways: Gateway[];
}>();

const selectedGateway = defineModel<string>({ required: true });
</script>

<template>
  <BaseCard class="!p-4 md:!p-5 bg-gray-50">
    <h3 class="text-sm font-bold text-gray-900 mb-3">
      {{ $t('user.payment.gateway.title') }}
    </h3>

    <StateEmpty
      v-if="gateways.length === 0"
      icon="document"
      :message="$t('user.payment.gateway.empty')"
    />

    <div v-else class="space-y-2">
      <label
        v-for="gateway in gateways"
        :key="gateway.name"
        :class="[
          'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
          selectedGateway === gateway.name
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50 bg-white',
        ]"
      >
        <input
          type="radio"
          :value="gateway.name"
          v-model="selectedGateway"
          class="w-4 h-4 text-primary focus:ring-primary"
        />
        <Icon
          name="mdi:credit-card"
          size="20"
          :class="
            selectedGateway === gateway.name ? 'text-primary' : 'text-gray-400'
          "
        />
        <span
          :class="
            selectedGateway === gateway.name
              ? 'text-primary font-bold'
              : 'text-gray-700'
          "
        >
          {{ gateway.displayName }}
        </span>
      </label>
    </div>
  </BaseCard>
</template>
