<script setup lang="ts">
import { SMS_DELIVERY_DETAILS, SMS_EVENT_LABELS, SMS_STATUS_DETAILS } from '~/constants/sms'
import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '~/composables/useToast'
import { smsApi } from '~/services/api/sms'
import { formatDate, formatNumber } from '~/utils/formatters'
import { canCheckSmsStatus, canRetrySms, getSmsApiError, getSmsUserName } from '~/utils/sms'
import type { TableColumn } from '~/components/Base/Table.vue'
import type { SmsDeliveryStatus, SmsDispatch, SmsDispatchQuery, SmsDispatchStats, SmsEventCode } from '~/types/sms'

const { t } = useI18n()

const LIMIT = 20
const toast = useToast()
const { confirm } = useConfirm()
const items = ref<SmsDispatch[]>([])
const stats = ref<SmsDispatchStats | null>(null)
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const error = ref<string | null>(null)
const selected = ref<SmsDispatch | null>(null)
const detailLoading = ref(false)
const busyAction = ref<'retry' | 'status' | null>(null)

const filters = ref<SmsDispatchQuery>({ limit: LIMIT, offset: 0 })

const filterFields = computed(() => [
  { key: 'startDate', label: t('admin.sms.filters.fromDate'), type: 'date' as const, modelValue: filters.value.startDate },
  { key: 'endDate', label: t('admin.sms.filters.toDate'), type: 'date' as const, modelValue: filters.value.endDate },
  { key: 'recipient', label: t('admin.sms.filters.recipientPhone'), type: 'text' as const, placeholder: t('admin.sms.filters.recipientPhonePlaceholder'), modelValue: filters.value.recipient },
  { key: 'eventCode', label: t('admin.sms.filters.smsType'), type: 'select' as const, modelValue: filters.value.eventCode, options: [{ label: t('admin.sms.filters.allEvents'), value: '' }, ...Object.entries(SMS_EVENT_LABELS).map(([value, label]) => ({ value, label }))] },
  { key: 'status', label: t('admin.sms.fields.sendStatus'), type: 'select' as const, modelValue: filters.value.status, options: [{ label: t('common.filters.allStatuses'), value: '' }, { label: t('admin.sms.filters.unsent'), value: 'NOT_SENT' }, ...Object.entries(SMS_STATUS_DETAILS).filter(([value]) => value !== 'PROCESSING').map(([value, item]) => ({ value, label: item.label }))] },
  { key: 'deliveryStatus', label: t('admin.sms.fields.deliveryStatus'), type: 'select' as const, modelValue: filters.value.deliveryStatus, options: [{ label: t('common.filters.allStatuses'), value: '' }, ...Object.entries(SMS_DELIVERY_DETAILS).filter(([value]) => value !== 'PENDING').map(([value, item]) => ({ value, label: item.label }))] },
])

const columns: TableColumn<SmsDispatch>[] = [
  { key: 'id', label: t('common.fields.id'), align: 'center' },
  { key: 'user', label: t('admin.sms.table.recipient'), align: 'center' },
  { key: 'eventCode', label: t('admin.sms.filters.smsType'), align: 'center', class: 'whitespace-normal' },
  { key: 'status', label: t('admin.sms.fields.sendStatus'), align: 'center' },
  { key: 'deliveryStatus', label: t('admin.sms.fields.deliveryStatus'), align: 'center' },
  { key: 'attempts', label: t('admin.sms.table.attempts'), align: 'center' },
  { key: 'createdAt', label: t('admin.sms.table.createdAt'), align: 'center' },
]

const sentCount = computed(() => stats.value?.byStatus.ACCEPTED || 0)
const failedCount = computed(() => stats.value?.byStatus.FAILED || 0)
const queuedCount = computed(() => (stats.value?.byStatus.QUEUED || 0) + (stats.value?.byStatus.PROCESSING || 0))
const fetchData = async () => {
  loading.value = true
  error.value = null
  filters.value.offset = (page.value - 1) * LIMIT
  try {
    const query = { ...filters.value }
    const [listResponse, statsResponse] = await Promise.all([smsApi.listDispatches(query), smsApi.getStats(query)])
    items.value = listResponse.data.items
    total.value = listResponse.data.meta.total
    stats.value = statsResponse.data
  } catch (apiError) {
    error.value = getSmsApiError(apiError, t('admin.sms.errors.fetchDispatches'))
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const updateFilter = (key: string, value: unknown) => {
  const normalized = typeof value === 'string' && value.trim() ? value.trim() : undefined
  ;(filters.value as Record<string, unknown>)[key] = normalized
}

const applyFilters = () => {
  if (page.value === 1) fetchData()
  else page.value = 1
}

const resetFilters = () => {
  filters.value = { limit: LIMIT, offset: 0 }
  applyFilters()
}

const preserveDispatchRelations = (updated: SmsDispatch, current: SmsDispatch): SmsDispatch => ({
  ...current,
  ...updated,
  user: updated.user ?? current.user,
  template: updated.template ?? current.template,
})

const openDetail = async (dispatch: SmsDispatch) => {
  detailLoading.value = true
  try {
    const detail = (await smsApi.getDispatch(dispatch.id)).data
    selected.value = preserveDispatchRelations(detail, dispatch)
  } catch (apiError) {
    toast.error(getSmsApiError(apiError, t('admin.sms.errors.fetchDispatch')))
  } finally {
    detailLoading.value = false
  }
}

const retryDispatch = async (dispatch: SmsDispatch) => {
  if (!canRetrySms(dispatch)) return
  const approved = await confirm({
    title: t('common.actions.retry'),
    message: t('admin.sms.confirm.retryMessage'),
    type: 'warning',
    confirmText: t('admin.sms.confirm.retryConfirm'),
  })
  if (!approved) return
  busyAction.value = 'retry'
  try {
    const updated = (await smsApi.retryDispatch(dispatch.id)).data
    selected.value = preserveDispatchRelations(updated, dispatch)
    toast.success(t('admin.sms.messages.requeued'))
    await fetchData()
  } catch (apiError) {
    toast.error(getSmsApiError(apiError, t('admin.sms.errors.retry')))
  } finally {
    busyAction.value = null
  }
}

const checkStatus = async (dispatch: SmsDispatch) => {
  if (!canCheckSmsStatus(dispatch)) return
  busyAction.value = 'status'
  try {
    const updated = (await smsApi.checkStatus(dispatch.id)).data
    selected.value = preserveDispatchRelations(updated, dispatch)
    toast.success(t('admin.sms.messages.deliveryUpdated'))
    await fetchData()
  } catch (apiError) {
    toast.error(getSmsApiError(apiError, t('admin.sms.errors.checkDelivery')))
  } finally {
    busyAction.value = null
  }
}

onMounted(fetchData)
watch(page, fetchData)
</script>

<template>
  <section>
    <div class="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <BaseStatsCard :title="$t('admin.sms.stats.total')" :value="stats?.total || 0" icon="document" icon-color="primary" />
      <BaseStatsCard :title="$t('admin.sms.stats.sent')" :value="sentCount" icon="check" icon-color="success" />
      <BaseStatsCard :title="$t('admin.sms.stats.pending')" :value="queuedCount" icon="chart" icon-color="warning" />
      <BaseStatsCard :title="$t('status.failed')" :value="failedCount" icon="close" icon-color="danger" />
    </div>

    <BaseFiltersBar :fields="filterFields" :reset-label="$t('admin.sms.filters.clear')" @apply="applyFilters" @reset="resetFilters" @update:field="updateFilter" />

    <BaseCard :padding="false">
      <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div><h3 class="font-bold text-gray-900">{{ $t('admin.sms.dispatches.title') }}</h3><p class="mt-1 text-xs text-gray-500">{{ $t('admin.sms.dispatches.count', { total: formatNumber(total) }) }}</p></div>
        <BaseButton size="sm" variant="secondary" :loading="loading" @click="fetchData"><Icon name="mdi:refresh" class="ml-1" />{{ $t('admin.sms.actions.refresh') }}</BaseButton>
      </div>
      <StateLoader v-if="loading" :message="$t('admin.sms.dispatches.loading')" />
      <StateError v-else-if="error" :message="error" @retry="fetchData" />
      <BaseTable v-else :columns="columns" :data="items">
        <template #cell-user="{ row }"><div class="min-w-[145px]"><NuxtLink v-if="row.user" :to="`/admin/users/${row.user.id}`" class="font-bold text-primary hover:underline">{{ getSmsUserName(row) }}</NuxtLink><span v-else class="text-gray-600">{{ getSmsUserName(row) }}</span><p class="mt-1 text-xs text-gray-500" dir="ltr">{{ row.recipient }}</p></div></template>
        <template #cell-eventCode="{ row }"><div class="min-w-[150px] leading-6">{{ SMS_EVENT_LABELS[row.eventCode] }}</div></template>
        <template #cell-status="{ row }"><BaseBadge :variant="SMS_STATUS_DETAILS[row.status].variant">{{ SMS_STATUS_DETAILS[row.status].label }}</BaseBadge></template>
        <template #cell-deliveryStatus="{ row }"><BaseBadge :variant="SMS_DELIVERY_DETAILS[row.deliveryStatus].variant">{{ SMS_DELIVERY_DETAILS[row.deliveryStatus].label }}</BaseBadge></template>
        <template #cell-attempts="{ row }">{{ formatNumber(row.attempts) }}</template>
        <template #cell-createdAt="{ row }"><span class="whitespace-nowrap">{{ formatDate(row.createdAt, true) }}</span></template>
        <template #actions="{ row }"><div class="flex min-w-[170px] justify-center gap-2"><BaseButton size="sm" variant="secondary" :loading="detailLoading && selected?.id === row.id" @click="openDetail(row)">{{ $t('admin.sms.actions.details') }}</BaseButton><BaseButton v-if="canRetrySms(row)" size="sm" variant="warning" :loading="busyAction === 'retry' && selected?.id === row.id" @click="retryDispatch(row)">{{ $t('common.actions.retry') }}</BaseButton></div></template>
      </BaseTable>
      <BasePagination v-if="!loading && !error" :page="page" :total="total" :limit="LIMIT" @update:page="page = $event" />
    </BaseCard>

    <AdminSmsDispatchDetailModal v-if="selected" :dispatch="selected" :busy-action="busyAction" @close="selected = null" @retry="retryDispatch" @check-status="checkStatus" />
  </section>
</template>
