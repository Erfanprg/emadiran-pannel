import type {
  TransactionsListResponse,
  GetTransactionsQuery,
  UpdateTransactionRequest,
  DeleteTransactionRequest
} from '~/types/transaction'

/**
 * Transactions API Service
 */
export const transactionsApi = {
  /**
   * Get Admin Transactions List
   * GET /admin/transactions
   */
  async getTransactions(query: GetTransactionsQuery = {}): Promise<TransactionsListResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')


    const params = new URLSearchParams()
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.offset) params.append('offset', query.offset.toString())
    if (query.userId) params.append('userId', query.userId.toString())
    if (query.status) params.append('status', query.status)
    if (query.type) params.append('type', query.type)
    if (query.phoneNumber) params.append('phoneNumber', query.phoneNumber)
    if (query.nationalCode) params.append('nationalCode', query.nationalCode)
    if (query.firstName) params.append('firstName', query.firstName)
    if (query.lastName) params.append('lastName', query.lastName)
    if (query.startDate) params.append('startDate', query.startDate)
    if (query.endDate) params.append('endDate', query.endDate)
    if (query.minAmount) params.append('minAmount', query.minAmount)
    if (query.maxAmount) params.append('maxAmount', query.maxAmount)
    if (query.loanNumber) params.append('loanNumber', query.loanNumber)

    const url = `${baseURL}/admin/transactions?${params.toString()}`

    const response = await $fetch<TransactionsListResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Export Transactions to Excel
   * GET /admin/transactions/export
   */
  async exportTransactions(query: GetTransactionsQuery = {}): Promise<void> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const params = new URLSearchParams()
    if (query.userId) params.append('userId', query.userId.toString())
    if (query.status) params.append('status', query.status)
    if (query.type) params.append('type', query.type)
    if (query.phoneNumber) params.append('phoneNumber', query.phoneNumber)
    if (query.nationalCode) params.append('nationalCode', query.nationalCode)
    if (query.firstName) params.append('firstName', query.firstName)
    if (query.lastName) params.append('lastName', query.lastName)
    if (query.loanNumber) params.append('loanNumber', query.loanNumber)
    if (query.startDate) params.append('startDate', query.startDate)
    if (query.endDate) params.append('endDate', query.endDate)

    const url = `${baseURL}/admin/transactions/export?${params.toString()}`
    
    // Download file
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transactions-${Date.now()}.xlsx`)
    link.style.display = 'none'
    
    // Add auth header via fetch and create blob
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    link.href = blobUrl
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  },

  /**
   * Edit Admin Transaction
   * PUT /admin/transactions/:id
   */
  async updateTransaction(transactionId: number, body: UpdateTransactionRequest): Promise<{ success: boolean; message: string; data: any }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    return await $fetch<{ success: boolean; message: string; data: any }>(`${baseURL}/admin/transactions/${transactionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body
    })
  },

  /**
   * Delete Admin Transaction
   * DELETE /admin/transactions/:id
   */
  async deleteTransaction(transactionId: number, body: DeleteTransactionRequest): Promise<{ success: boolean; message: string; data: any }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    return await $fetch<{ success: boolean; message: string; data: any }>(`${baseURL}/admin/transactions/${transactionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body
    })
  }
}
