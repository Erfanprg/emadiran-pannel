import { transactionsApi } from "~/services/api/transactions";
import type { Transaction } from "~/types/transaction";

/**
 * Paginated transaction history of a single user (admin panel).
 */
export const useUserTransactions = (userId: number) => {
  const userTransactions = ref<Transaction[]>([]);
  const isLoadingTransactions = ref(false);
  const transactionsError = ref<string | null>(null);
  const transactionsPage = ref(1);
  const transactionsLimit = 10;
  const transactionsTotal = ref(0);
  const expandedTransactionId = ref<number | null>(null);

  const toggleTransactionDetails = (transactionId: number) => {
    expandedTransactionId.value =
      expandedTransactionId.value === transactionId ? null : transactionId;
  };

  const fetchUserTransactions = async () => {
    try {
      isLoadingTransactions.value = true;
      transactionsError.value = null;
      expandedTransactionId.value = null;

      const offset = (transactionsPage.value - 1) * transactionsLimit;
      const response = await transactionsApi.getTransactions({
        userId,
        limit: transactionsLimit,
        offset,
      });

      userTransactions.value = response.data.data || response.data.items || [];
      transactionsTotal.value = response.data.meta?.total || response.data.total || 0;
    } catch (err: any) {
      console.error("Error fetching user transactions:", err);
      userTransactions.value = [];
      transactionsTotal.value = 0;
      transactionsError.value =
        err.data?.message || err.message || "خطا در دریافت تاریخچه تراکنش‌ها";
    } finally {
      isLoadingTransactions.value = false;
    }
  };

  const handleTransactionsPageChange = (page: number) => {
    transactionsPage.value = page;
    fetchUserTransactions();
  };

  return {
    userTransactions,
    isLoadingTransactions,
    transactionsError,
    transactionsPage,
    transactionsLimit,
    transactionsTotal,
    expandedTransactionId,
    toggleTransactionDetails,
    fetchUserTransactions,
    handleTransactionsPageChange,
  };
};
