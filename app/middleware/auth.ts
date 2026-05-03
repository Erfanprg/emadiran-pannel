import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client side to avoid SSR issues
  if (process.server) {
    return
  }

  const authStore = useAuthStore()
  const token = useCookie('auth_token')
  
  // If token exists but user not loaded yet, try to load
  if (token.value && !authStore.isAuthenticated) {
    try {
      await authStore.initAuth()
    } catch (error) {
      // Token is invalid, redirect to login
      return navigateTo('/auth')
    }
  }
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Redirect to login
    return navigateTo('/auth')
  }
})
