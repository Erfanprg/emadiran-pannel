import { adminApi } from "~/services/api/admin";
import { useToast } from "~/composables/useToast";
import { useApiCall } from "~/composables/useApiCall";
import type { ContactHistoryItem, ContactHistoriesMeta } from "~/types/admin";

/**
 * Contact history list of a user and the flow between its list and create modals.
 */
export const useContactHistories = (userId: number) => {
  const toast = useToast();
  const { execute } = useApiCall();

  const showContactHistoriesModal = ref(false);
  const showCreateContactHistoryModal = ref(false);
  const contactHistories = ref<ContactHistoryItem[]>([]);
  const contactHistoriesMeta = ref<ContactHistoriesMeta>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const contactHistoriesLimit = ref(10);
  const contactHistoriesOffset = ref(0);
  const isLoadingContactHistories = ref(false);
  const isLoadingMoreContactHistories = ref(false);
  const contactHistoriesError = ref<string | null>(null);
  const createContactHistoryForm = ref({
    description: "",
  });
  const createContactHistoryErrors = ref<{ description?: string }>({});
  const isSubmittingContactHistory = ref(false);

  const resetContactHistoriesPagination = () => {
    contactHistoriesOffset.value = 0;
    contactHistoriesMeta.value = {
      total: 0,
      limit: contactHistoriesLimit.value,
      offset: 0,
      hasMore: false,
    };
  };

  const fetchContactHistories = async (append = false) => {
    if (append) {
      isLoadingMoreContactHistories.value = true;
    } else {
      isLoadingContactHistories.value = true;
      contactHistoriesError.value = null;
      resetContactHistoriesPagination();
    }

    try {
      const response = await adminApi.getContactHistories(
        userId,
        contactHistoriesLimit.value,
        contactHistoriesOffset.value
      );

      if (append) {
        contactHistories.value = [
          ...contactHistories.value,
          ...response.data.items,
        ];
      } else {
        contactHistories.value = response.data.items;
      }

      contactHistoriesMeta.value = response.data.meta;
    } catch (err: any) {
      contactHistoriesError.value =
        err?.data?.message || err?.message || "خطا در دریافت تاریخچه تماس";
    } finally {
      isLoadingContactHistories.value = false;
      isLoadingMoreContactHistories.value = false;
    }
  };

  const openContactHistoriesModal = () => {
    showContactHistoriesModal.value = true;
    fetchContactHistories();
  };

  const closeContactHistoriesModal = () => {
    showContactHistoriesModal.value = false;
  };

  const handleLoadMoreContactHistories = () => {
    if (
      !contactHistoriesMeta.value.hasMore ||
      isLoadingMoreContactHistories.value
    )
      return;
    contactHistoriesOffset.value =
      contactHistoriesMeta.value.offset + contactHistoriesMeta.value.limit;
    fetchContactHistories(true);
  };

  const openCreateContactHistoryModal = () => {
    createContactHistoryForm.value.description = "";
    createContactHistoryErrors.value = {};
    showContactHistoriesModal.value = false;
    showCreateContactHistoryModal.value = true;
  };

  const closeCreateContactHistoryModal = () => {
    showCreateContactHistoryModal.value = false;
    createContactHistoryForm.value.description = "";
    createContactHistoryErrors.value = {};
    showContactHistoriesModal.value = true;
    fetchContactHistories();
  };

  const validateContactHistoryDescription = (value: string) => {
    const trimmed = (value || "").trim();
    if (!trimmed) {
      return { isValid: false, error: "توضیحات الزامی است" };
    }
    if (trimmed.length > 2000) {
      return { isValid: false, error: "حداکثر طول توضیحات 2000 کاراکتر است" };
    }
    return { isValid: true, value: trimmed };
  };

  const setCreateContactHistoryErrorsFromBackend = (message: string) => {
    const normalized = (message || "").toLowerCase();
    if (normalized.includes("description") || normalized.includes("توضیح")) {
      createContactHistoryErrors.value.description = message;
    }
  };

  const handleCreateContactHistory = async () => {
    createContactHistoryErrors.value = {};

    const validation = validateContactHistoryDescription(
      createContactHistoryForm.value.description
    );
    if (!validation.isValid) {
      createContactHistoryErrors.value.description = validation.error;
      toast.error(validation.error || "لطفاً خطاهای فرم را برطرف کنید");
      return;
    }

    isSubmittingContactHistory.value = true;

    await execute(
      () =>
        adminApi.createContactHistory(userId, {
          description: validation.value as string,
        }),
      {
        successMessage: "تماس با موفقیت ثبت شد",
        onError: (err) => {
          const message = err?.data?.message || err?.message || "خطا در ثبت تماس";
          setCreateContactHistoryErrorsFromBackend(message);
        },
        onSuccess: () => {
          closeCreateContactHistoryModal();
        },
      }
    );

    isSubmittingContactHistory.value = false;
  };

  return {
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
  };
};
