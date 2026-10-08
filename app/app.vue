<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const isAuthInitialized = ref(false)
// The landing page renders immediately (also on the server) so search engines see its real content
const isPublicPage = computed(() => route.path === '/')

// Initialize auth before mounting
onBeforeMount(async () => {
  const token = useCookie('auth_token')
  
  if (token.value && !authStore.user) {
    try {
      await authStore.initAuth()
    } catch (error) {
      console.error('Error initializing auth:', error)
    }
  }
  isAuthInitialized.value = true
})
</script>

<template>
  <div class="relative">
    <!-- Loading State During Auth Initialization -->
    <div v-if="!isAuthInitialized && !isPublicPage" class="w-ful flex items-center justify-center min-h-screen bg-gray-50 w-full">
      <div class="text-center">
        <div class="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-600">در حال بارگذاری...</p>
      </div>
    </div>

    <!-- Main App Content -->
    <div v-else>
      <!-- Toast Container -->
      <ToastContainer />
      
      <!-- Confirm Dialog -->
      <BaseConfirmDialog />
      
      <!-- Page Content -->
      <NuxtPage />
    </div>
  </div>
</template>
