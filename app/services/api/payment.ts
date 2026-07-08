import type { PaymentAllocationPreview, PaymentAllocationPreviewRequest } from '~/types/debt'

export interface PaymentInitiateRequest {
  amount: string
  gatewayName: string
  description?: string
  selectedLoanId?: number
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

export interface PaymentTransactionDetail {
  id: number
  userId: number
  loanId?: number
  amount: string
  gatewayName: string
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  description: string | null
  refId?: string | null
  transactionDate?: string | null
  createdAt: string
  updatedAt: string
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
   * GET /payments/me/transaction/:id
   */
  async getTransactionDetail(transactionId: number) {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: PaymentTransactionDetail }>(`${baseURL}/payments/me/transaction/${transactionId}`, {
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
