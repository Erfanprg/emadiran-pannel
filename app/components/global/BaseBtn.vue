<script setup lang="ts">
import type { BaseButton } from '~/types/button'

const props = defineProps<BaseButton>()

const styleData: Record<BaseButton['typeDesign'], string> = {
  'primary': 'btn-primary',
  'outline': 'btn-outline',
  'full': 'btn-full',
} as const

const style = computed((): string => styleData[props.typeDesign])
</script>

<template>
  <button :type="type" :class="[style, customDesign]" :disabled="loading || disabled">
    <div class="container-flex-center">
      <span v-if="loading" class="loader-btn"></span>
      <div v-else class="flex gap-x-2 items-center">
        <NuxtImg v-if="icon" :src="icon" :alt="alt" class="w-6 h-6 object-cover" />
        <span v-if="text">{{ text }}</span>
      </div>
    </div>
  </button>
</template>

<style>
@import '~/assets/css/btn.css';
</style>