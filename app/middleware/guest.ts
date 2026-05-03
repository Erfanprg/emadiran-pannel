import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  // If already authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }
})
