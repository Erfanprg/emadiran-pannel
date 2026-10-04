import { defineStore } from 'pinia'
import type { User, AuthResponse, LoginMethod } from '~/types/auth'
import { authApi } from '~/services/api/auth'
import { userApi } from '~/services/api/user'
import { useToast } from '~/composables/useToast'
import { getUserDisplayName } from '~/func/getUserDisplayName'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'ADMIN',
    userFullName: (state) => state.user ? getUserDisplayName(state.user) : 'کاربر',
    totalDebt: (state) => state.user?.totalDebt || '0'
  },

  actions: {
    /**
     * Request OTP Code
     * Returns the login method for this phone ('password' = no OTP sent), or null on error
     */
    async requestOtp(phoneNumber: string): Promise<LoginMethod | null> {
      try {
        this.isLoading = true
        const response = await authApi.requestOtp(phoneNumber)
        if (!response.ok) return null
        return response.method ?? 'otp'
      } catch (error: any) {
        const toast = useToast()
        toast.error(error.data?.message || 'خطا در ارسال کد تایید')
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Verify OTP and Login
     */
    async verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
      try {
        this.isLoading = true
        const response: AuthResponse = await authApi.verifyOtp(phoneNumber, code)
        await this.completeLogin(response)
        return true
      } catch (error: any) {
        const toast = useToast()
        toast.error(error.data?.message || 'کد تایید نامعتبر است')
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Login with Password (allow-listed admins only)
     */
    async loginWithPassword(phoneNumber: string, password: string): Promise<boolean> {
      try {
        this.isLoading = true
        const response: AuthResponse = await authApi.loginWithPassword(phoneNumber, password)
        await this.completeLogin(response)
        return true
      } catch (error: any) {
        const toast = useToast()
        toast.error(error.data?.message || 'شماره موبایل یا رمز عبور اشتباه است')
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Store token and load profile after a successful login
     */
    async completeLogin(response: AuthResponse): Promise<void> {
      // Save token in cookie FIRST
      const tokenCookie = useCookie('auth_token', {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax'
      })
      tokenCookie.value = response.accessToken

      // Update state
      this.token = response.accessToken
      this.isAuthenticated = true

      // Wait a bit for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 100))

      // Fetch complete user profile from /me endpoint
      const userProfile = await userApi.getProfile()
      this.user = userProfile as any

      const toast = useToast()
      toast.success('ورود موفقیت‌آمیز بود')
    },

    /**
     * Fetch user profile
     */
    async fetchProfile(): Promise<void> {
      try {
        this.isLoading = true
        const user = await userApi.getProfile()
        this.user = user as any
        this.isAuthenticated = true
      } catch (error: any) {
        this.logout()
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Logout user
     */
    logout(): void {
      // Clear cookie
      const tokenCookie = useCookie('auth_token')
      tokenCookie.value = null

      // Clear state
      this.user = null
      this.token = null
      this.isAuthenticated = false

      // Redirect to login
      navigateTo('/auth')
    },

    /**
     * Initialize auth state from cookie
     */
    async initAuth(): Promise<void> {
      const tokenCookie = useCookie('auth_token')
      
      if (tokenCookie.value) {
        this.token = tokenCookie.value
        try {
          await this.fetchProfile()
        } catch (error) {
          // Token invalid, clear it
          this.logout()
        }
      }
    }
  }
})
