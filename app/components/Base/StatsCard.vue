<script setup lang="ts">
import { formatNumber } from '~/utils/formatters'

interface Props {
  title: string
  value: string | number
  description?: string
  icon?: string
  iconColor?: 'primary' | 'success' | 'danger' | 'warning' | 'gray'
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  icon: 'chart'
})

const iconColors = {
  primary: 'from-primary to-accent',
  success: 'from-green-500 to-green-600',
  danger: 'from-red-500 to-red-600',
  warning: 'from-yellow-500 to-yellow-600',
  gray: 'from-gray-500 to-gray-600'
}

// Icon paths based on icon name
const iconPaths = {
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  close: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  admin: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  money: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
}

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return formatNumber(props.value)
  }
  return props.value
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium text-gray-600">{{ title }}</h3>
      <div 
        class="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br"
        :class="iconColors[iconColor]"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            :d="iconPaths[icon as keyof typeof iconPaths] || iconPaths.chart" 
          />
        </svg>
      </div>
    </div>
    
    <p class="text-4xl font-bold text-gray-900 mb-2">{{ formattedValue }}</p>
    
    <div class="flex items-center justify-between">
      <p v-if="description" class="text-sm text-gray-600">{{ description }}</p>
      
      <div 
        v-if="trend" 
        class="flex items-center gap-1 text-sm font-medium"
        :class="trend.isPositive ? 'text-green-600' : 'text-red-600'"
      >
        <svg 
          class="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            v-if="trend.isPositive"
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
          />
          <path 
            v-else
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" 
          />
        </svg>
        <span>{{ trend.value }}%</span>
        <span class="text-gray-500">{{ trend.label }}</span>
      </div>
    </div>
  </div>
</template>
