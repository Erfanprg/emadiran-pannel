import type { Transaction, TransactionAllocation } from '~/types/transaction'
import { formatNumber } from '~/utils/formatters'

const allocationTypeLabels: Record<string, string> = {
  SELECTED_LOAN: 'تسهیلات انتخاب‌شده',
  AUTO_DISTRIBUTED: 'تخصیص خودکار'
}

export const getTransactionAllocations = (
  transaction?: Transaction | null
): TransactionAllocation[] => {
  return [...(transaction?.allocations || [])].sort(
    (first, second) => first.allocationOrder - second.allocationOrder
  )
}

export const getTransactionLoanFallback = (
  transaction?: Transaction | null
): string => {
  return transaction?.loanNumber ?? transaction?.loan?.loanNumber ?? '-'
}

export const getTransactionLoanSummary = (
  transaction?: Transaction | null
): string => {
  const allocations = getTransactionAllocations(transaction)

  if (allocations.length > 0) {
    return `${formatNumber(allocations.length)} تسهیلات`
  }

  return getTransactionLoanFallback(transaction)
}

export const getTransactionAllocationTypeLabel = (
  allocationType?: string | null,
  allocationRole?: string | null
): string => {
  if (!allocationType && !allocationRole) {
    return 'تخصیص ثبت‌شده'
  }

  if (allocationRole === 'SELECTED_LOAN' || allocationType === 'SELECTED_LOAN') {
    return allocationTypeLabels.SELECTED_LOAN
  }

  if (
    allocationRole === 'AUTO_DISTRIBUTED' ||
    allocationType === 'AUTO_DISTRIBUTED'
  ) {
    return allocationTypeLabels.AUTO_DISTRIBUTED
  }

  return allocationTypeLabels[allocationType || ''] || 'تخصیص ثبت‌شده'
}
