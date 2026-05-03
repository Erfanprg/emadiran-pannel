<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

interface Props {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: 'عماد، نماد اعتماد',
  backTo: '/admin',
  backLabel: 'داشبورد'
})

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/auth/login')
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Right side: Logo and Title -->
        <div class="flex items-center gap-4">
          <img src="/emad-logo-p.png" alt="عماد" class="h-10" />
          <div>
            <h1 class="text-lg font-bold text-gray-900">{{ title }}</h1>
            <p class="text-sm text-gray-600">{{ subtitle }}</p>
          </div>
        </div>

        <!-- Left side: Actions slot or Back button, User info, Logout -->
        <div class="flex items-center gap-4">
          <!-- Custom actions slot (for buttons) -->
          <slot name="actions">
            <!-- Default: Back button -->
            <NuxtLink
              v-if="backTo"
              :to="backTo"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
            >
              {{ backLabel }}
            </NuxtLink>
          </slot>
          
          <div class="text-right">
            <p class="text-sm text-gray-600">{{ authStore.isAdmin ? 'مدیر' : 'کاربر' }}</p>
            <p class="font-bold text-gray-900">{{ authStore.userFullName }}</p>
          </div>
          
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
          >
            خروج
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
