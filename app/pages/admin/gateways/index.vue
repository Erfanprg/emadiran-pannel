
<script setup lang="ts">
import type { Gateway } from "~/types/gateway";
import { gatewaysApi } from "~/services/api/gateways";
import { useApiCall } from "~/composables/useApiCall";
import { useConfirm } from "~/composables/useConfirm";
import { ACTIVE_STATUS_BADGES } from "~/constants/badges";

const { t } = useI18n()

useHead({
  title: t('seo.admin.gateways')
})

definePageMeta({
  middleware: "auth",
});

// Table columns
const columns = [
  { key: "index", label: t('common.table.row'), align: "center" as const },
  { key: "displayName", label: t('admin.gateways.table.name'), align: "center" as const },
  { key: "isActive", label: t('common.fields.status'), align: "center" as const },
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
      err.data?.message || err.message || t('admin.gateways.errors.fetch');
  } finally {
    loading.value = false;
  }
};

// Handle toggle gateway status
const handleToggle = async (gateway: Gateway) => {
  const newStatus = !gateway.isActive;
  const action = newStatus ? t('status.active') : t('status.inactive');

  const confirmed = await confirm({
    title: t('admin.gateways.toggle.title', { action: action }),
    message: t('admin.gateways.toggle.confirm', { action: action, displayName: gateway.displayName }),
    type: newStatus ? "info" : "warning",
    confirmText: t('admin.common.confirmYesAction', { action: action }),
  });

  if (!confirmed) return;

  await execute(() => gatewaysApi.toggle(gateway.name, newStatus), {
    successMessage: t('admin.gateways.messages.toggled', { displayName: gateway.displayName, action: action }),
    errorMessage: t('admin.gateways.errors.toggle', { action: action }),
    onSuccess: () => fetchGateways(),
  });
};

// Initialize
onMounted(() => {
  fetchGateways();
});
</script>

<template>
  <AdminPage :title="$t('admin.common.gateways')">
    <!-- Content -->
    <BaseCard class="mt-6">
      <StateLoader v-if="loading" />
      <StateError v-else-if="error" :message="error" @retry="fetchGateways" />
      <StateEmpty
        v-else-if="!gateways.length"
        :message="$t('admin.gateways.empty')"
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
          <BaseStatusBadge :map="ACTIVE_STATUS_BADGES" :value="row.isActive" />
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
              :title="row.isActive ? $t('admin.common.deactivate') : $t('admin.common.activate')"
            >
              <Icon
                :name="
                  row.isActive
                    ? 'mdi:toggle-switch'
                    : 'mdi:toggle-switch-off-outline'
                "
                size="18"
              />
              {{ row.isActive ? $t('admin.common.deactivate') : $t('admin.common.activate') }}
            </button>
          </div>
        </template>
      </BaseTable>
    </BaseCard>
  </AdminPage>
</template>
