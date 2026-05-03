<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'primary'
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    variant: 'gray',
    size: 'md'
  }
)

const badgeClasses = computed(() => {
  const base = 'inline-flex items-center justify-center rounded-full font-bold'
  
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary/10 text-primary'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }
  
  return `${base} ${variants[props.variant]} ${sizes[props.size]}`
})
</script>

<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>
