import type { InstallmentsListResponse, GetInstallmentsQuery, CreateInstallmentDto, UpdateInstallmentDto, ChangeInstallmentStatusDto, InstallmentStats } from '~/types/installment'

/**
 * Installments API Service
 */
export const installmentsApi = {
  /**
   * Get Admin Installments List
   * GET /admin/installments
   */
  async getInstallments(query: GetInstallmentsQuery = {}): Promise<InstallmentsListResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    console.log('[INSTALLMENTS API] Received query:', query)

    const params = new URLSearchParams()
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.offset) params.append('offset', query.offset.toString())
    if (query.userId) params.append('userId', query.userId.toString())
    if (query.status) params.append('status', query.status)
    if (query.phoneNumber) params.append('phoneNumber', query.phoneNumber)
    if (query.firstName) params.append('firstName', query.firstName)
    if (query.lastName) params.append('lastName', query.lastName)
    if (query.loanNumber) params.append('loanNumber', query.loanNumber)

    const url = `${baseURL}/admin/installments?${params.toString()}`
    console.log('[INSTALLMENTS API] Final URL:', url)

    const response = await $fetch<InstallmentsListResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Get Installment Statistics
   * GET /admin/installments/stats
   */
  async getStats(): Promise<{ success: boolean; data: InstallmentStats }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: InstallmentStats }>(`${baseURL}/admin/installments/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Create Installment
   * POST /admin/installments/create
   */
  async createInstallment(data: CreateInstallmentDto): Promise<{ success: boolean; message: string; data: any }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; message: string; data: any }>(`${baseURL}/admin/installments/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: data
    })

    return response
  },

  /**
   * Update Installment
   * PUT /admin/installments/:id
   */
  async updateInstallment(id: number, data: UpdateInstallmentDto): Promise<{ success: boolean; message: string; data: any }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; message: string; data: any }>(`${baseURL}/admin/installments/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: data
    })

    return response
  },

  /**
   * Change Installment Status
   * PUT /admin/installments/:id/status
   */
  async changeStatus(id: number, data: ChangeInstallmentStatusDto): Promise<{ success: boolean; message: string; data: any }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; message: string; data: any }>(`${baseURL}/admin/installments/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: data
    })

    return response
  },

  /**
   * Delete Installment
   * DELETE /admin/installments/:id
   */
  async deleteInstallment(id: number): Promise<{ success: boolean; message: string }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; message: string }>(`${baseURL}/admin/installments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  }
}
