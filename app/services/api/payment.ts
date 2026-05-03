export interface PaymentInitiateRequest {
  amount: string
  gatewayName: string
  description?: string
}

export interface PaymentInitiateResponse {
  paymentUrl: string
  transactionId: number
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
  async initiatePayment(data: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<PaymentInitiateResponse>(`${baseURL}/payments/me/initiate`, {
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
  }
}
