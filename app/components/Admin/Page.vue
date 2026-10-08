<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    mainClass?: string
  }>(),
  {
    mainClass: 'max-w-[1330px] mx-auto px-4 py-8'
  }
)
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <AdminHeader :title="title" />

    <main :class="mainClass">
      <slot />
    </main>

    <slot name="overlays" />
  </div>
</template>
