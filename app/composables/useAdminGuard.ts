import { useAuthStore } from '~/stores/auth'

/**
 * Redirects non-admin users to the user dashboard.
 * Call it at the top of an admin page's setup.
 */
export const useAdminGuard = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  if (!authStore.isAdmin) {
    router.push('/dashboard')
  }
}
