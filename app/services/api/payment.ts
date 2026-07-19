import type { PaymentAllocationPreview, PaymentAllocationPreviewRequest } from '~/types/debt'
import type { Transaction } from '~/types/transaction'

export interface PaymentInitiateRequest {
  amount: string
  gatewayName: string
  description?: string
  loanId: number
}

export interface PaymentInitiateResponse {
  paymentUrl: string
  transactionId: number
}

export interface PaymentInitiateApiResponse {
  success: boolean
  data: PaymentInitiateResponse
  message?: string
}

/**
 * Payment API Service
 */
export const paymentApi = {
  /**
   * Initiate Payment
   * POST /payments/me/initiate
   */
  async initiatePayment(data: PaymentInitiateRequest): Promise<PaymentInitiateApiResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<PaymentInitiateApiResponse>(`${baseURL}/payments/me/initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: data
    })

    return response
  },

  /**
   * Get Transaction Detail
   * GET /me/transactions/:id
   */
  async getTransactionDetail(transactionId: number) {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: Transaction }>(`${baseURL}/me/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Preview payment allocation across loans
   * POST /payments/me/allocation-preview
   */
  async getAllocationPreview(data: PaymentAllocationPreviewRequest): Promise<PaymentAllocationPreview> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: PaymentAllocationPreview }>(`${baseURL}/payments/me/allocation-preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: data
    })

    return response.data
  }
}
