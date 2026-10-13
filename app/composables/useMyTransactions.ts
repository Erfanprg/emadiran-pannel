import { userApi } from '~/services/api/user'
import { formatDate } from '~/utils/formatters'
import type { Transaction } from '~/types/transaction'
import { translate } from '~/i18n/translate'

/**
 * Filtered, paginated transaction history of the logged-in user, plus payment stats.
 */
export const useMyTransactions = () => {
  const loading = ref(true)
  const error = ref<string | null>(null)
  const transactions = ref<Transaction[]>([])
  const allTransactions = ref<Transaction[]>([])
  const selectedStatus = ref<'ALL' | 'SUCCESS' | 'FAILED' | 'PENDING'>('ALL')
  const selectedType = ref<'ALL' | 'DEBT_PAYMENT' | 'ADMIN_DEBT_ADD' | 'LEGAL_DEBT_ADD' | 'ADMIN_DEBT_REDUCE'>('ALL')
  const currentPage = ref(1)
  const itemsPerPage = 10
  const totalItems = ref(0)

  // Stats
  const stats = computed(() => {
    const successful = allTransactions.value.filter(t => t.status === 'SUCCESS' && t.type === 'DEBT_PAYMENT')
    const lastPayment = successful.length > 0
      ? successful.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null

    return {
      successfulCount: successful.length,
      successfulAmount: successful
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        .toString(),
      lastPaymentDate: lastPayment ? formatDate(lastPayment.createdAt) : '-',
      lastPaymentAmount: lastPayment ? lastPayment.amount : '0'
    }
  })

  // Fetch transactions
  const fetchTransactions = async () => {
    loading.value = true
    error.value = null
    try {
      const params: any = {
        limit: itemsPerPage,
        offset: (currentPage.value - 1) * itemsPerPage
      }

      if (selectedStatus.value !== 'ALL') {
        params.status = selectedStatus.value
      }
      if (selectedType.value !== 'ALL') {
        params.type = selectedType.value
      }

      const response = await userApi.getTransactions(params)
      transactions.value = response.data || []
      totalItems.value = response.total || 0

      // Fetch all transactions for stats (without pagination)
      const allResponse = await userApi.getTransactions({})
      allTransactions.value = allResponse.data || []
    } catch (err) {
      console.error('Error fetching transactions:', err)
      const apiError = err as { data?: { message?: string }; message?: string }
      error.value = apiError.data?.message || apiError.message || translate('common.errors.fetchTransactions')
      transactions.value = []
    } finally {
      loading.value = false
    }
  }

  // Watch filters
  watch([selectedStatus, selectedType, currentPage], () => {
    fetchTransactions()
  })

  // Fetch on mount
  onMounted(() => {
    fetchTransactions()
  })

  return {
    loading,
    error,
    transactions,
    selectedStatus,
    selectedType,
    currentPage,
    itemsPerPage,
    totalItems,
    stats,
    fetchTransactions
  }
}
