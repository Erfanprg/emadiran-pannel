<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
    fullWidth?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
    fullWidth: false
  }
)

const buttonClasses = computed(() => {
  const base = 'rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary via-accent to-secondary text-white hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    success: 'bg-green-50 text-green-600 hover:bg-green-100',
    warning: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
  
  const width = props.fullWidth ? 'w-full' : ''
  
  return `${base} ${variants[props.variant]} ${sizes[props.size]} ${width}`
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
  >
    <span v-if="loading" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
    <slot />
  </button>
</template>
