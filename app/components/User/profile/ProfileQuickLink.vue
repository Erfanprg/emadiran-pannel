<script setup lang="ts">
defineProps<{
  to: string
  icon: string
  title: string
  description: string
  /** Classes of the icon box, e.g. bg-green-100 group-hover:bg-green-200 */
  iconBoxClass: string
  /** Color class of the icon, e.g. text-green-600 */
  iconClass: string
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 group"
  >
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-lg flex items-center justify-center transition-colors" :class="iconBoxClass">
        <Icon :name="icon" size="24" :class="iconClass" />
      </div>
      <div>
        <p class="font-bold text-gray-900">{{ title }}</p>
        <p class="text-sm text-gray-600">{{ description }}</p>
      </div>
    </div>
  </NuxtLink>
</template>
