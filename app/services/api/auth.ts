import type { AuthResponse, User } from '~/types/auth'

/**
 * Auth API Service
 * Handles OTP-based authentication
 */
export const authApi = {
  /**
   * Request OTP Code
   * POST /auth/otp/request
   */
  async requestOtp(phoneNumber: string): Promise<{ ok: boolean }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 

    const response = await $fetch<{ ok: boolean }>(`${baseURL}/auth/otp/request`, {
      method: 'POST',
      body: { phoneNumber }
    })

    return response
  },

  /**
   * Verify OTP Code and Login
   * POST /auth/otp/verify
   */
  async verifyOtp(phoneNumber: string, code: string): Promise<AuthResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 

    const response = await $fetch<AuthResponse>(`${baseURL}/auth/otp/verify`, {
      method: 'POST',
      body: { phoneNumber, code }
    })

    return response
  },

  /**
   * Get Current User Profile
   * GET /me
   */
  async getProfile(): Promise<User> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<User>(`${baseURL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  }
}
