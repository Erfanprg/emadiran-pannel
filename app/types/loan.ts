/**
 * Loan Types and Interfaces
 */

export interface Loan {
  id: number
  loanNumber: string
  userId: number
  createdAt: string
  updatedAt: string
}

export interface LoanListItem {
  id: number
  loanNumber: string
  createdAt: string
}

export interface GetLoansQuery {
  limit?: number
  offset?: number
  userId?: number
  phoneNumber?: string
  firstName?: string
  lastName?: string
  loanNumber?: string
}

export interface LoansListResponse {
  success: boolean
  data: Loan[]
  meta?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface CreateLoanDto {
  userId: number
  loanNumber?: string
}

export interface CreateLoanResponse {
  success: boolean
  message: string
  data: Loan
}
