export type DebtTransactionType = 'ADMIN_DEBT_ADD' | 'LEGAL_DEBT_ADD' | 'ADMIN_DEBT_REDUCE'
export type TransactionType = 'DEBT_PAYMENT' | DebtTransactionType

export interface Transaction {
  id: number
  userId: number
  loanId?: number
  loanNumber?: string | null
  amount: string
  type: TransactionType
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  gatewayName?: string
  description?: string
  refId?: string
  transactionDate?: string
  createdAt: string
  updatedAt?: string
  user?: {
    id: number
    firstName?: string | null
    lastName?: string | null
    fullName?: string | null
    phoneNumber: string
  }
  loan?: {
    id: number
    loanNumber: string
  }
}

export interface TransactionsListResponse {
  success: boolean
  data: {
    data: Transaction[]
    total: number
  }
}

export interface GetTransactionsQuery {
  limit?: number
  offset?: number
  userId?: number
  status?: 'SUCCESS' | 'FAILED' | 'PENDING'
  type?: TransactionType
  phoneNumber?: string
  nationalCode?: string
  firstName?: string
  lastName?: string
  loanNumber?: string
  startDate?: string
  endDate?: string
  minAmount?: string
  maxAmount?: string
}

export interface AddDebtRequest {
  userId: number
  amount: string
  loanId?: number
  description?: string
  transactionType?: Extract<DebtTransactionType, 'ADMIN_DEBT_ADD' | 'LEGAL_DEBT_ADD'>
  transactionDate?: string
}

export interface ReduceDebtRequest {
  userId: number
  amount: string
  loanId?: number
  description?: string
  transactionType?: Extract<DebtTransactionType, 'ADMIN_DEBT_REDUCE'>
  transactionDate?: string
}

export interface UpdateTransactionRequest {
  amount?: string
  type?: DebtTransactionType
  transactionDate?: string
  description?: string
  reason: string
}

export interface DeleteTransactionRequest {
  reason: string
}
