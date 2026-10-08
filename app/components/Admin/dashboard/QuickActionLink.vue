<script setup lang="ts">
import type { OutlineIconName } from '~/constants/icons'

defineProps<{
  to: string
  title: string
  description: string
  icon: OutlineIconName
  /** Background class of the icon box, e.g. bg-primary */
  iconBg: string
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-200"
  >
    <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="iconBg">
      <IconsOutline :name="icon" class="w-5 h-5 text-white" />
    </div>
    <div>
      <p class="font-bold text-gray-900">{{ title }}</p>
      <p class="text-sm text-gray-600">{{ description }}</p>
    </div>
  </NuxtLink>
</template>
