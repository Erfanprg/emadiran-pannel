export interface Installment {
  id: number
  userId: number
  amount: string
  dueDate: string
  status: 'PENDING' | 'PAID' | 'OVERDUE'
  description?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    firstName?: string | null
    lastName?: string | null
    fullName?: string | null
    phoneNumber: string
  }
  loan?: {
    loanNumber: string
  }
}

export interface InstallmentsListResponse {
  success: boolean
  data: {
    data: Installment[]
    meta: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}

export interface GetInstallmentsQuery {
  limit?: number
  offset?: number
  userId?: number
  status?: 'PENDING' | 'PAID' | 'OVERDUE'
  phoneNumber?: string
  firstName?: string
  lastName?: string
  loanNumber?: string
}

export interface CreateInstallmentDto {
  userId: number
  amount: string
  dueDate: string
  loanId?: number
  description?: string
}

export interface UpdateInstallmentDto {
  amount?: string
  dueDate?: string
  description?: string
}

export interface ChangeInstallmentStatusDto {
  status: 'PENDING' | 'PAID' | 'OVERDUE'
}

export interface InstallmentStats {
  total: number
  pending: number
  paid: number
  overdue: number
  totalAmount: string
  pendingAmount: string
  paidAmount: string
  overdueAmount: string
}
