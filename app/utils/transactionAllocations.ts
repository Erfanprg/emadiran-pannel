import type { Transaction, TransactionAllocation } from '~/types/transaction'
import { formatNumber } from '~/utils/formatters'
import { translate } from '../i18n/translate'

const allocationTypeLabels: Record<string, string> = {
  get SELECTED_LOAN() { return translate('common.allocations.types.selectedLoan') },
  get AUTO_DISTRIBUTED() { return translate('common.allocations.types.autoDistributed') }
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
    return translate('common.allocations.summaryCount', { count: formatNumber(allocations.length) })
  }

  return getTransactionLoanFallback(transaction)
}

export const getTransactionAllocationTypeLabel = (
  allocationType?: string | null,
  allocationRole?: string | null
): string => {
  if (!allocationType && !allocationRole) {
    return translate('common.allocations.types.recorded')
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

  return allocationTypeLabels[allocationType || ''] || translate('common.allocations.types.recorded')
}
