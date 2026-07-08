export interface LoanDebtItem {
  loanId: number
  loanNumber: string
  currentDebt: string
  transactionCount: number
  lastTransactionDate: string | null
  hasNegativeDebt: boolean
}

export interface MissingLoanTransaction {
  transactionId: number
  transactionType: string
  amount: string
  transactionDate: string
  description: string | null
}

export interface LoanDebtBreakdown {
  storedTotalDebt: string
  computedTotalDebt: string
  differenceFromStoredTotalDebt: string
  loans: LoanDebtItem[]
  missingLoanTransactions: MissingLoanTransaction[]
}

export interface PaymentAllocationPreviewRequest {
  amount: number
  loanId: number
}

export interface PaymentAllocationItem {
  loanId: number
  loanNumber: string
  allocatedAmount: string
  allocationOrder: number
  allocationType: 'SELECTED_LOAN' | 'AUTO_DISTRIBUTED' | string
  currentDebtBeforeAllocation: string
  currentDebtAfterAllocation: string
}

export interface PaymentAllocationPreview {
  userId: number
  selectedLoanId: number
  selectedLoanNumber: string
  paymentAmount: string
  storedTotalDebt: string
  computedTotalDebt: string
  totalPositiveLoanDebt: string
  allocations: PaymentAllocationItem[]
}
