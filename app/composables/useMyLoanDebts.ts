import { userApi } from '~/services/api/user'
import type { LoanDebtBreakdown } from '~/types/debt'

/**
 * Per-loan debt breakdown of the logged-in user.
 */
export const useMyLoanDebts = (errorMessage: string) => {
  const loanDebtBreakdown = ref<LoanDebtBreakdown | null>(null)
  const isLoadingLoanDebts = ref(false)
  const loanDebtError = ref<string | null>(null)

  const fetchLoanDebts = async () => {
    try {
      isLoadingLoanDebts.value = true
      loanDebtError.value = null
      loanDebtBreakdown.value = await userApi.getLoanDebts()
    } catch (error: any) {
      console.error('Error fetching loan debts:', error)
      loanDebtBreakdown.value = null
      loanDebtError.value = error.data?.message || error.message || errorMessage
    } finally {
      isLoadingLoanDebts.value = false
    }
  }

  return { loanDebtBreakdown, isLoadingLoanDebts, loanDebtError, fetchLoanDebts }
}
