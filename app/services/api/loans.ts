import type { LoanListItem, CreateLoanDto, CreateLoanResponse } from '~/types/loan'

/**
 * Loans API Service
 */
export const loansApi = {
  /**
   * Get User Loans List (for select box)
   * GET /admin/loans/user/:userId
   */
  async getUserLoans(userId: number): Promise<{ success: boolean; data: LoanListItem[] }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: LoanListItem[] }>(
      `${baseURL}/admin/loans/user/${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      }
    )

    return response
  },

  /**
   * Create Loan for User
   * POST /admin/loans/create
   */
  async createLoan(data: CreateLoanDto): Promise<CreateLoanResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<CreateLoanResponse>(
      `${baseURL}/admin/loans/create`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`
        },
        body: data
      }
    )

    return response
  }
}
