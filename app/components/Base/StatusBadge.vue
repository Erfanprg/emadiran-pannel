<script setup lang="ts">
import { getBadge, type BadgeMap } from '~/constants/badges'

const props = defineProps<{
  map: BadgeMap
  value: string | boolean
}>()

const badge = computed(() => getBadge(props.map, props.value))
</script>

<template>
  <BaseBadge :variant="badge.variant as any">
    {{ badge.text }}
  </BaseBadge>
</template>
