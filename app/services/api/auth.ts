import type { AuthResponse, OtpRequestResponse, User } from '~/types/auth'

/**
 * Auth API Service
 * Handles OTP-based authentication (and password login for allow-listed admins)
 */
export const authApi = {
  /**
   * Request OTP Code
   * POST /auth/otp/request
   * method === 'password' means no OTP was sent; ask for the password instead
   */
  async requestOtp(phoneNumber: string): Promise<OtpRequestResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl

    const response = await $fetch<OtpRequestResponse>(`${baseURL}/auth/otp/request`, {
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
   * Login with Password
   * POST /auth/password/login
   */
  async loginWithPassword(phoneNumber: string, password: string): Promise<AuthResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl

    const response = await $fetch<AuthResponse>(`${baseURL}/auth/password/login`, {
      method: 'POST',
      body: { phoneNumber, password }
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
