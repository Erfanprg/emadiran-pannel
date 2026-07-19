export type DebtTransactionType = 'ADMIN_DEBT_ADD' | 'LEGAL_DEBT_ADD' | 'ADMIN_DEBT_REDUCE'
export type TransactionType = 'DEBT_PAYMENT' | DebtTransactionType
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING'

export interface TransactionAllocation {
  loanId: number
  loanNumber: string
  amount: string
  allocationOrder: number
  allocationType: string
  paymentTransactionId?: number | null
  allocatedTransactionId?: number | null
}

export interface Transaction {
  id: number
  userId: number
  loanId?: number | null
  loanNumber?: string | null
  amount: string
  type: TransactionType
  status: TransactionStatus
  gatewayName?: string | null
  description?: string | null
  refId?: string | null
  transactionDate?: string | null
  createdAt: string
  updatedAt?: string
  allocationRole?: string | null
  allocationSummary?: string | null
  allocations?: TransactionAllocation[]
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
    data?: Transaction[]
    items?: Transaction[]
    total?: number
    meta?: {
      total: number
      limit?: number
      offset?: number
      hasMore?: boolean
    }
  }
}

export interface GetTransactionsQuery {
  limit?: number
  offset?: number
  userId?: number
  status?: TransactionStatus
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
  sendSms?: boolean
}

export interface ReduceDebtRequest {
  userId: number
  amount: string
  loanId?: number
  description?: string
  transactionType?: Extract<DebtTransactionType, 'ADMIN_DEBT_REDUCE'>
  transactionDate?: string
  sendSms?: boolean
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
