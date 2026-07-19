import type {
  UserStats,
  AdminUser,
  UsersListResponse,
  GetUsersQuery,
  CreateUserDto,
  UpdateUserDto,
  BulkPaymentImportResponse,
  DebtReportResponse,
  PaymentDeadlineCurrentResponse,
  PaymentDeadlinesListResponse,
  CreatePaymentDeadlineDto,
  UpdatePaymentDeadlineDto,
  PaymentDeadlineMutationResponse,
  ContactHistoriesListResponse,
  CreateContactHistoryDto,
  ContactHistoryMutationResponse
} from '~/types/admin'
import type { AddDebtRequest, ReduceDebtRequest } from '~/types/transaction'
import type { LoanDebtBreakdown } from '~/types/debt'

/**
 * Admin API Service
 * Handles admin operations (requires ADMIN role)
 */
export const adminApi = {
  /**
   * Get User Statistics
   * GET /admin/users/stats
   */
  async getUserStats(): Promise<UserStats> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<UserStats>(`${baseURL}/admin/users/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Get Users List with Filters
   * GET /admin/users
   */
  async getUsers(query: GetUsersQuery = {}): Promise<UsersListResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const params = new URLSearchParams()
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.offset) params.append('offset', query.offset.toString())
    if (query.search) params.append('search', query.search)
    if (query.role) params.append('role', query.role)
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString())
    if (query.sortBy) params.append('sortBy', query.sortBy)
    if (query.sortOrder) params.append('sortOrder', query.sortOrder)

    const response = await $fetch<UsersListResponse>(`${baseURL}/admin/users?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Get User Details by ID
   * GET /admin/users/:id
   */
  async getUserById(userId: number): Promise<AdminUser> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<AdminUser>(`${baseURL}/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Create New User
   * POST /admin/users
   */
  async createUser(data: CreateUserDto): Promise<{ success: boolean; data: AdminUser; message: string }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: AdminUser; message: string }>(`${baseURL}/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: data
    })

    return response
  },

  /**
   * Update User
   * PUT /admin/users/:id
   */
  async updateUser(userId: number, data: UpdateUserDto): Promise<{ success: boolean; data: AdminUser; message: string }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: AdminUser; message: string }>(`${baseURL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: data
    })

    return response
  },

  /**
   * Toggle User Status (Active/Inactive)
   * PUT /admin/users/:id/toggle-status
   */
  async toggleUserStatus(userId: number): Promise<{ success: boolean; data: AdminUser; message: string }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: AdminUser; message: string }>(`${baseURL}/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Delete User (Soft Delete)
   * DELETE /admin/users/:id
   */
  async deleteUser(userId: number): Promise<{ success: boolean; data: AdminUser; message: string }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: AdminUser; message: string }>(`${baseURL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Add Debt to User
   * POST /admin/users/debts/add
   */
  async addDebt(
    userId: number,
    amount: string,
    description?: string,
    loanId?: number,
    transactionType: 'ADMIN_DEBT_ADD' | 'LEGAL_DEBT_ADD' = 'ADMIN_DEBT_ADD',
    transactionDate?: string,
    sendSms: boolean = true
  ): Promise<{ success: boolean; message: string; data: any }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const body: AddDebtRequest = {
      userId,
      amount,
      description,
      loanId,
      transactionType,
      transactionDate,
      sendSms
    }

    const response = await $fetch<{ success: boolean; message: string; data: any }>(`${baseURL}/admin/users/debts/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body
    })

    return response
  },

  /**
   * Reduce Debt from User
   * POST /admin/users/debts/reduce
   */
  async reduceDebt(
    userId: number,
    amount: string,
    description?: string,
    loanId?: number,
    transactionType: 'ADMIN_DEBT_REDUCE' = 'ADMIN_DEBT_REDUCE',
    transactionDate?: string,
    sendSms: boolean = true
  ): Promise<{ success: boolean; message: string; data: any }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const body: ReduceDebtRequest = {
      userId,
      amount,
      description,
      loanId,
      transactionType,
      transactionDate,
      sendSms
    }

    const response = await $fetch<{ success: boolean; message: string; data: any }>(`${baseURL}/admin/users/debts/reduce`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body
    })

    return response
  },

  /**
   * Get Debt History for User
   * GET /admin/users/debts/history/:userId
   */
  async getDebtHistory(userId: number, limit: number = 20, offset: number = 0): Promise<{ success: boolean; data: any }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    params.append('offset', offset.toString())

    const response = await $fetch<{ success: boolean; data: any }>(`${baseURL}/admin/users/debts/history/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Get Debt Report
   * GET /admin/users/debts/report
   */
  async getDebtReport(): Promise<DebtReportResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<DebtReportResponse>(`${baseURL}/admin/users/debts/report`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Get Admin Dashboard Statistics
   * GET /admin/users/dashboard
   */
  async getDashboard(): Promise<{ success: boolean; data: any }> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: any }>(`${baseURL}/admin/users/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Get Current Payment Deadline
   * GET /admin/users/:userId/payment-deadlines/current
   */
  async getCurrentPaymentDeadline(userId: number): Promise<PaymentDeadlineCurrentResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<PaymentDeadlineCurrentResponse>(`${baseURL}/admin/users/${userId}/payment-deadlines/current`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Get Payment Deadlines List
   * GET /admin/users/:userId/payment-deadlines
   */
  async getPaymentDeadlines(userId: number, limit: number = 10, offset: number = 0): Promise<PaymentDeadlinesListResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    params.append('offset', offset.toString())

    const response = await $fetch<PaymentDeadlinesListResponse>(`${baseURL}/admin/users/${userId}/payment-deadlines?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Create Payment Deadline
   * POST /admin/users/:userId/payment-deadlines
   */
  async createPaymentDeadline(userId: number, data: CreatePaymentDeadlineDto): Promise<PaymentDeadlineMutationResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<PaymentDeadlineMutationResponse>(`${baseURL}/admin/users/${userId}/payment-deadlines`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: data
    })

    return response
  },

  /**
   * Update Payment Deadline
   * PUT /admin/users/:userId/payment-deadlines/:id
   */
  async updatePaymentDeadline(userId: number, deadlineId: number, data: UpdatePaymentDeadlineDto): Promise<PaymentDeadlineMutationResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<PaymentDeadlineMutationResponse>(`${baseURL}/admin/users/${userId}/payment-deadlines/${deadlineId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: data
    })

    return response
  },

  /**
   * Get Contact Histories List
   * GET /admin/users/:userId/contact-histories
   */
  async getContactHistories(userId: number, limit: number = 10, offset: number = 0): Promise<ContactHistoriesListResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    params.append('offset', offset.toString())

    const response = await $fetch<ContactHistoriesListResponse>(`${baseURL}/admin/users/${userId}/contact-histories?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response
  },

  /**
   * Get User Loan Debt Breakdown
   * GET /admin/users/:id/loan-debts
   */
  async getUserLoanDebts(userId: number): Promise<LoanDebtBreakdown> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const response = await $fetch<{ success: boolean; data: LoanDebtBreakdown }>(`${baseURL}/admin/users/${userId}/loan-debts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })

    return response.data
  },

  /**
   * Create Contact History
   * POST /admin/users/:userId/contact-histories
   */
  async createContactHistory(userId: number, data: CreateContactHistoryDto): Promise<ContactHistoryMutationResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const response = await $fetch<ContactHistoryMutationResponse>(`${baseURL}/admin/users/${userId}/contact-histories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: data
    })

    return response
  },

  /**
   * Import CSV File for Bulk Debt Addition
   * POST /admin/users/import-csv
   */
  async importCsv(file: File): Promise<import('~/types/admin').CsvImportResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl 
    const token = useCookie('auth_token')

    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch<import('~/types/admin').CsvImportResponse>(`${baseURL}/admin/users/import-csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: formData
    })

    return response
  },

  /**
   * Import CSV File for Bulk Payment Processing
   * POST /admin/payments/import-csv
   */
  async importPaymentsCsv(file: File): Promise<BulkPaymentImportResponse> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl
    const token = useCookie('auth_token')

    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch<BulkPaymentImportResponse>(`${baseURL}/admin/payments/import-csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: formData
    })

    return response
  }
}
