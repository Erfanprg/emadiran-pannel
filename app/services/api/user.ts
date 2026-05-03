import type { Installment } from '~/types/installment'
import type { Transaction } from '~/types/transaction'

export interface UserProfile {
  id: number
  firstName: string | null
  lastName: string | null
  fullName: string | null
  phoneNumber: string
  nationalCode: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  totalDebt: string
  createdAt: string
  updatedAt: string
}

export interface UserInstallmentsResponse {
  data: Installment[]
  limit: number
  offset: number
  total: number
}

export interface UserTransactionsResponse {
  data: Transaction[]
  limit: number
  offset: number
  total: number
}

/**
 * User API Service
 */
export const userApi = {
  /**
   * Get User Profile
   * GET /me
   */
  async getProfile(): Promise<UserProfile> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: UserProfile }>(`${baseURL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response.data
  },

  /**
   * Get User Installments
   * GET /me/installments
   */
  async getInstallments(params: {
    limit?: number
    offset?: number
    status?: 'PENDING' | 'PAID' | 'OVERDUE'
  } = {}): Promise<UserInstallmentsResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const queryParams = new URLSearchParams()
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())
    if (params.status) queryParams.append('status', params.status)

    const url = `${baseURL}/me/installments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await $fetch<UserInstallmentsResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Get Upcoming Installments
   * GET /me/installments/upcoming
   */
  async getUpcomingInstallments(): Promise<Installment[]> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ data: Installment[] }>(`${baseURL}/me/installments/upcoming`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response.data || []
  },

  /**
   * Get User Transactions
   * GET /me/transactions
   */
  async getTransactions(params: {
    limit?: number
    offset?: number
    status?: 'SUCCESS' | 'FAILED' | 'PENDING'
    type?: 'DEBT_PAYMENT' | 'ADMIN_DEBT_ADD' | 'LEGAL_DEBT_ADD' | 'ADMIN_DEBT_REDUCE'
  } = {}): Promise<UserTransactionsResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const queryParams = new URLSearchParams()
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())
    if (params.status) queryParams.append('status', params.status)
    if (params.type) queryParams.append('type', params.type)

    const url = `${baseURL}/me/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await $fetch<UserTransactionsResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  }
}
