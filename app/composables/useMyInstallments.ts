import { userApi } from '~/services/api/user'
import type { Installment } from '~/types/installment'

/**
 * Filtered, paginated installments of the logged-in user, plus status stats.
 */
export const useMyInstallments = () => {
  const loading = ref(true)
  const installments = ref<Installment[]>([])
  const allInstallments = ref<Installment[]>([])
  const selectedStatus = ref<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE'>('ALL')
  const currentPage = ref(1)
  const itemsPerPage = 10
  const totalItems = ref(0)

  // Stats
  const stats = computed(() => {
    const all = allInstallments.value
    return {
      overdue: all.filter(i => i.status === 'OVERDUE').length,
      overdueAmount: all
        .filter(i => i.status === 'OVERDUE')
        .reduce((sum, i) => sum + parseFloat(i.amount), 0)
        .toString(),
      remaining: all.filter(i => i.status === 'PENDING').length,
      paid: all.filter(i => i.status === 'PAID').length
    }
  })

  // Fetch installments
  const fetchInstallments = async () => {
    loading.value = true
    try {
      const params: any = {
        limit: itemsPerPage,
        offset: (currentPage.value - 1) * itemsPerPage
      }

      if (selectedStatus.value !== 'ALL') {
        params.status = selectedStatus.value
      }

      const response = await userApi.getInstallments(params)
      installments.value = response.data || []
      totalItems.value = response.total || 0

      // Fetch all installments for stats (without pagination)
      const allResponse = await userApi.getInstallments({})
      allInstallments.value = allResponse.data || []
    } catch (error) {
      console.error('Error fetching installments:', error)
      installments.value = []
    } finally {
      loading.value = false
    }
  }

  // Watch filters
  watch([selectedStatus, currentPage], () => {
    fetchInstallments()
  })

  // Fetch on mount
  onMounted(() => {
    fetchInstallments()
  })

  return {
    loading,
    installments,
    selectedStatus,
    currentPage,
    itemsPerPage,
    totalItems,
    stats
  }
}
