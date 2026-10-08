<script setup lang="ts">
import { useAdminGuard } from "~/composables/useAdminGuard";
import { adminApi } from "~/services/api/admin";
import { useToast } from "~/composables/useToast";
import { useConfirm } from "~/composables/useConfirm";
import { useApiCall } from "~/composables/useApiCall";
import { usePaymentDeadlines } from "~/composables/usePaymentDeadlines";
import { useContactHistories } from "~/composables/useContactHistories";
import { useUserTransactions } from "~/composables/useUserTransactions";
import { getUserDisplayName } from "~/func/getUserDisplayName";
import UserInfoCard from "~/components/Admin/users/UserInfoCard.vue";
import UserTransactionsCard from "~/components/Admin/users/UserTransactionsCard.vue";
import DebtManagementModal from "~/components/Admin/users/DebtManagementModal.vue";
import PaymentDeadlinesModal from "~/components/Admin/payment-deadlines/PaymentDeadlinesModal.vue";
import PaymentDeadlineCreateModal from "~/components/Admin/payment-deadlines/PaymentDeadlineCreateModal.vue";
import PaymentDeadlineEditModal from "~/components/Admin/payment-deadlines/PaymentDeadlineEditModal.vue";
import ContactHistoriesModal from "~/components/Admin/contact-histories/ContactHistoriesModal.vue";
import ContactHistoryCreateModal from "~/components/Admin/contact-histories/ContactHistoryCreateModal.vue";
import type { LoanDebtBreakdown } from "~/types/debt";

useHead({
  title: "جزئیات کاربر - عماد ایران",
});

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const toast = useToast();
const { confirm } = useConfirm();
const { execute } = useApiCall();

useAdminGuard();

const userId = parseInt(route.params.id as string);

// State
const user = ref<any>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const loanDebtBreakdown = ref<LoanDebtBreakdown | null>(null);
const isLoadingLoanDebtBreakdown = ref(false);
const loanDebtBreakdownError = ref<string | null>(null);

const {
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
} = useUserTransactions(userId);

const {
  currentPaymentDeadline,
  isLoadingPaymentDeadline,
  paymentDeadlineLabel,
  showPaymentDeadlinesModal,
  paymentDeadlines,
  paymentDeadlinesMeta,
  paymentDeadlinesPage,
  paymentDeadlinesLimit,
  isLoadingPaymentDeadlines,
  paymentDeadlinesError,
  showCreatePaymentDeadlineModal,
  createPaymentDeadlineForm,
  createPaymentDeadlineErrors,
  isSubmittingPaymentDeadline,
  showEditPaymentDeadlineModal,
  editPaymentDeadlineForm,
  editPaymentDeadlineErrors,
  editPaymentDeadlineDateDisplay,
  isSubmittingEditPaymentDeadline,
  fetchCurrentPaymentDeadline,
  openPaymentDeadlinesModal,
  closePaymentDeadlinesModal,
  handlePaymentDeadlinesPageChange,
  openCreatePaymentDeadlineModal,
  closeCreatePaymentDeadlineModal,
  handleCreatePaymentDeadline,
  openEditPaymentDeadlineModal,
  closeEditPaymentDeadlineModal,
  handleEditPaymentDeadlineDateChange,
  handleEditPaymentDeadline,
} = usePaymentDeadlines(userId);

const {
  showContactHistoriesModal,
  showCreateContactHistoryModal,
  contactHistories,
  contactHistoriesMeta,
  contactHistoriesLimit,
  isLoadingContactHistories,
  isLoadingMoreContactHistories,
  contactHistoriesError,
  createContactHistoryForm,
  createContactHistoryErrors,
  isSubmittingContactHistory,
  fetchContactHistories,
  openContactHistoriesModal,
  closeContactHistoriesModal,
  handleLoadMoreContactHistories,
  openCreateContactHistoryModal,
  closeCreateContactHistoryModal,
  handleCreateContactHistory,
} = useContactHistories(userId);

// Debt Modal State
const showDebtModal = ref(false);
const debtModalType = ref<"add" | "reduce">("add");

const fetchUserLoanDebtBreakdown = async () => {
  try {
    isLoadingLoanDebtBreakdown.value = true;
    loanDebtBreakdownError.value = null;
    loanDebtBreakdown.value = await adminApi.getUserLoanDebts(userId);
  } catch (err: any) {
    console.error("Error fetching user loan debts:", err);
    loanDebtBreakdown.value = null;
    loanDebtBreakdownError.value =
      err.data?.message || "خطا در دریافت جزئیات بدهی تسهیلات";
  } finally {
    isLoadingLoanDebtBreakdown.value = false;
  }
};

// Fetch user details
const fetchUserDetails = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    loanDebtBreakdownError.value = null;
    user.value = await adminApi.getUserById(userId);
    await fetchUserLoanDebtBreakdown();
  } catch (err: any) {
    error.value = err.data?.message || "خطا در دریافت اطلاعات کاربر";
    console.error("Error fetching user:", err);
  } finally {
    isLoading.value = false;
  }
};

// Toggle status
const handleToggleStatus = async () => {
  if (!user.value) return;

  // Prevent toggling admin users
  if (user.value.role === "ADMIN") {
    toast.error("امکان تغییر وضعیت مدیران وجود ندارد");
    return;
  }

  // Confirm action
  const action = user.value.isActive ? "غیرفعال" : "فعال";
  const confirmed = await confirm({
    message: `آیا از ${action} کردن کاربر "${getUserDisplayName(
      user.value
    )}" اطمینان دارید؟`,
    type: "warning",
  });

  if (!confirmed) return;

  await execute(() => adminApi.toggleUserStatus(userId), {
    successMessage: `وضعیت کاربر با موفقیت ${action} شد`,
    onSuccess: () => fetchUserDetails(),
  });
};

const openDebtModal = (type: "add" | "reduce") => {
  debtModalType.value = type;
  showDebtModal.value = true;
};

const closeDebtModal = () => {
  showDebtModal.value = false;
};

const handleDebtSuccess = () => {
  closeDebtModal();
  fetchUserDetails();
  fetchUserTransactions();
};

// Load user on mount
onMounted(() => {
  fetchUserDetails();
  fetchCurrentPaymentDeadline();
  fetchUserTransactions();
});
</script>

<template>
  <AdminPage title="جزئیات کاربر">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div
        class="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="text-gray-600 mt-4">در حال بارگذاری...</p>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
    >
      <IconsOutline name="exclamation-circle" class="w-12 h-12 text-red-500 mx-auto mb-3" />
      <p class="text-red-600 font-medium">{{ error }}</p>
      <button
        @click="fetchUserDetails"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        تلاش مجدد
      </button>
    </div>

    <!-- User Details -->
    <div v-else-if="user" class="space-y-6">
      <UserInfoCard
        :user="user"
        :payment-deadline-label="paymentDeadlineLabel"
        :has-payment-deadline="Boolean(currentPaymentDeadline)"
        :is-loading-payment-deadline="isLoadingPaymentDeadline"
        @open-payment-deadlines="openPaymentDeadlinesModal"
        @add-debt="openDebtModal('add')"
        @reduce-debt="openDebtModal('reduce')"
        @open-contact-histories="openContactHistoriesModal"
        @toggle-status="handleToggleStatus"
      />

      <LoanDebtBreakdownSection
        title="جزئیات بدهی به تفکیک تسهیلات"
        :breakdown="loanDebtBreakdown"
        :loading="isLoadingLoanDebtBreakdown"
        :error="loanDebtBreakdownError"
        :show-discrepancy-warning="true"
        empty-message="در حال حاضر تسهیلات بدهکاری برای این کاربر ثبت نشده است."
        @retry="fetchUserLoanDebtBreakdown"
      />

      <UserTransactionsCard
        :transactions="userTransactions"
        :loading="isLoadingTransactions"
        :error="transactionsError"
        :page="transactionsPage"
        :total="transactionsTotal"
        :limit="transactionsLimit"
        :expanded-id="expandedTransactionId"
        @retry="fetchUserTransactions"
        @toggle="toggleTransactionDetails"
        @update:page="handleTransactionsPageChange"
      />

      <!-- Installments -->
      <!-- <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-bold text-gray-900">اقساط</h3>
          <p class="text-sm text-gray-600">10 قسط اخیر کاربر</p>
        </div>
        
        <div v-if="user.installments && user.installments.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">شناسه</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">مبلغ</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">شماره تسهیلات</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">تاریخ سررسید</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">وضعیت</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">توضیحات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="installment in user.installments" :key="installment.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{{ installment.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center" dir="ltr">
                  {{ formatCurrency(installment.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center" dir="ltr">
                  {{ installment.loan?.loanNumber || 'ندارد' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                  {{ formatDate(installment.dueDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full inline-block"
                    :class="{
                      'bg-green-100 text-green-800': installment.status === 'PAID',
                      'bg-red-100 text-red-800': installment.status === 'OVERDUE',
                      'bg-yellow-100 text-yellow-800': installment.status === 'PENDING'
                    }"
                  >
                    {{
                      installment.status === 'PAID' ? 'پرداخت شده' :
                      installment.status === 'OVERDUE' ? 'عقب افتاده' :
                      'در انتظار'
                    }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900 text-center">
                  {{ installment.description || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="text-gray-600">قسطی یافت نشد</p>
        </div>
      </div> -->
    </div>

    <template #overlays>
      <ContactHistoriesModal
        v-if="showContactHistoriesModal"
        :items="contactHistories"
        :meta="contactHistoriesMeta"
        :limit="contactHistoriesLimit"
        :is-loading="isLoadingContactHistories"
        :is-loading-more="isLoadingMoreContactHistories"
        :error="contactHistoriesError"
        @close="closeContactHistoriesModal"
        @create="openCreateContactHistoryModal"
        @refresh="fetchContactHistories"
        @loadMore="handleLoadMoreContactHistories"
      />

      <ContactHistoryCreateModal
        v-if="showCreateContactHistoryModal"
        v-model:description="createContactHistoryForm.description"
        :error="createContactHistoryErrors.description"
        :is-submitting="isSubmittingContactHistory"
        @close="closeCreateContactHistoryModal"
        @submit="handleCreateContactHistory"
      />

      <PaymentDeadlinesModal
        v-if="showPaymentDeadlinesModal"
        :items="paymentDeadlines"
        :meta="paymentDeadlinesMeta"
        :page="paymentDeadlinesPage"
        :limit="paymentDeadlinesLimit"
        :current-id="currentPaymentDeadline?.id ?? null"
        :is-loading="isLoadingPaymentDeadlines"
        :error="paymentDeadlinesError"
        :disable-create="Boolean(currentPaymentDeadline)"
        @close="closePaymentDeadlinesModal"
        @create="openCreatePaymentDeadlineModal"
        @edit="openEditPaymentDeadlineModal"
        @update:page="handlePaymentDeadlinesPageChange"
      />

      <PaymentDeadlineCreateModal
        v-if="showCreatePaymentDeadlineModal"
        v-model:deadline-at="createPaymentDeadlineForm.deadlineAt"
        :error="createPaymentDeadlineErrors.deadlineAt"
        :is-submitting="isSubmittingPaymentDeadline"
        @close="closeCreatePaymentDeadlineModal"
        @submit="handleCreatePaymentDeadline"
      />

      <PaymentDeadlineEditModal
        v-if="showEditPaymentDeadlineModal"
        :deadline-at="editPaymentDeadlineForm.deadlineAt"
        :deadline-display="editPaymentDeadlineDateDisplay"
        v-model:edit-reason="editPaymentDeadlineForm.editReason"
        :deadline-error="editPaymentDeadlineErrors.deadlineAt"
        :reason-error="editPaymentDeadlineErrors.editReason"
        :is-submitting="isSubmittingEditPaymentDeadline"
        @close="closeEditPaymentDeadlineModal"
        @update:deadline-at="handleEditPaymentDeadlineDateChange"
        @submit="handleEditPaymentDeadline"
      />

      <DebtManagementModal
        v-if="showDebtModal"
        :user-id="userId"
        :user="user"
        :type="debtModalType"
        @close="closeDebtModal"
        @success="handleDebtSuccess"
      />
    </template>
  </AdminPage>
</template>
