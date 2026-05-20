
<script setup lang="ts">
import type { Gateway } from "~/types/gateway";
import { gatewaysApi } from "~/services/api/gateways";
import { useApiCall } from "~/composables/useApiCall";
import { useConfirm } from "~/composables/useConfirm";

useHead({
  title: 'مدیریت درگاه‌های پرداخت - عماد ایران'
})

definePageMeta({
  middleware: "auth",
});

// Table columns
const columns = [
  { key: "index", label: "ردیف", align: "center" as const },
  { key: "displayName", label: "نام درگاه", align: "center" as const },
  { key: "isActive", label: "وضعیت", align: "center" as const },
];

// State
const gateways = ref<Gateway[]>([]);

// Add index to gateways
const gatewaysWithIndex = computed(() => 
  gateways.value.map((gateway, index) => ({ ...gateway, index: index + 1 }))
);
const loading = ref(false);
const error = ref("");

// Composables
const { confirm } = useConfirm();
const { execute } = useApiCall();

// Fetch gateways
const fetchGateways = async () => {
  loading.value = true;
  error.value = "";

  try {
    const data = await gatewaysApi.getAll();
    gateways.value = data;
  } catch (err: any) {
    console.error("Error:", err);
    error.value =
      err.data?.message || err.message || "خطا در دریافت لیست درگاه‌ها";
  } finally {
    loading.value = false;
  }
};

// Handle toggle gateway status
const handleToggle = async (gateway: Gateway) => {
  const newStatus = !gateway.isActive;
  const action = newStatus ? "فعال" : "غیرفعال";

  const confirmed = await confirm({
    title: `${action} کردن درگاه`,
    message: `آیا از ${action} کردن درگاه ${gateway.displayName} اطمینان دارید؟`,
    type: newStatus ? "info" : "warning",
    confirmText: `بله، ${action} شود`,
  });

  if (!confirmed) return;

  await execute(() => gatewaysApi.toggle(gateway.name, newStatus), {
    successMessage: `درگاه ${gateway.displayName} با موفقیت ${action} شد`,
    errorMessage: `خطا در ${action} کردن درگاه`,
    onSuccess: () => fetchGateways(),
  });
};

// Initialize
onMounted(() => {
  fetchGateways();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 w-full">
    <!-- Header -->
    <AdminHeader title="درگاه‌های پرداخت" />

    <!-- Main Content -->
    <main class="max-w-[1330px] mx-auto px-4 py-8">
      <!-- Content -->
      <BaseCard class="mt-6">
        <StateLoader v-if="loading" />
        <StateError v-else-if="error" :message="error" @retry="fetchGateways" />
        <StateEmpty
          v-else-if="!gateways.length"
          message="درگاه پرداختی یافت نشد"
        />

        <BaseTable v-else :columns="columns" :data="gatewaysWithIndex">
          <!-- Gateway Name -->
          <template #cell-displayName="{ row }">
            <div class="text-center">
              <div class="font-medium text-gray-900">
                {{ row.displayName }}
              </div>
            </div>
          </template>

          <!-- Status Badge -->
          <template #cell-isActive="{ row }">
            <BaseBadge :variant="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? 'فعال' : 'غیرفعال' }}
            </BaseBadge>
          </template>

          <!-- Actions -->
          <template #actions="{ row }">
            <div class="flex items-center justify-center gap-2">
              <button
                @click="handleToggle(row)"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-transparent active:translate-y-0"
                :class="
                  row.isActive
                    ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(220,38,38,0.3)]'
                    : 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(22,163,74,0.3)]'
                "
                :title="row.isActive ? 'غیرفعال کردن' : 'فعال کردن'"
              >
                <Icon
                  :name="
                    row.isActive
                      ? 'mdi:toggle-switch'
                      : 'mdi:toggle-switch-off-outline'
                  "
                  size="18"
                />
                {{ row.isActive ? "غیرفعال کردن" : "فعال کردن" }}
              </button>
            </div>
          </template>
        </BaseTable>
      </BaseCard>
    </main>
  </div>
</template>
