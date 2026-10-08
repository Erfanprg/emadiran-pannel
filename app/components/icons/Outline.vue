<script setup lang="ts">
import { OUTLINE_ICONS, type OutlineIconName } from '~/constants/icons'

defineProps<{
  name: OutlineIconName
}>()
</script>

<template>
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="OUTLINE_ICONS[name]" />
  </svg>
</template>
