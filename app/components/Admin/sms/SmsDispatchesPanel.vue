<script setup lang="ts">
import { SMS_DELIVERY_DETAILS, SMS_EVENT_LABELS, SMS_STATUS_DETAILS } from '~/constants/sms'
import { useConfirm } from '~/composables/useConfirm'
import { useToast } from '~/composables/useToast'
import { smsApi } from '~/services/api/sms'
import { formatDate, formatNumber } from '~/utils/formatters'
import { canCheckSmsStatus, canRetrySms, getSmsApiError, getSmsUserName } from '~/utils/sms'
import type { TableColumn } from '~/components/Base/Table.vue'
import type { SmsDeliveryStatus, SmsDispatch, SmsDispatchQuery, SmsDispatchStats, SmsEventCode } from '~/types/sms'

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
  { key: 'startDate', label: 'از تاریخ', type: 'date' as const, modelValue: filters.value.startDate },
  { key: 'endDate', label: 'تا تاریخ', type: 'date' as const, modelValue: filters.value.endDate },
  { key: 'recipient', label: 'شماره گیرنده', type: 'text' as const, placeholder: 'مثلاً 0912...', modelValue: filters.value.recipient },
  { key: 'eventCode', label: 'نوع پیامک', type: 'select' as const, modelValue: filters.value.eventCode, options: [{ label: 'همه رویدادها', value: '' }, ...Object.entries(SMS_EVENT_LABELS).map(([value, label]) => ({ value, label }))] },
  { key: 'status', label: 'وضعیت ارسال', type: 'select' as const, modelValue: filters.value.status, options: [{ label: 'همه وضعیت‌ها', value: '' }, { label: 'ارسال‌نشده‌ها', value: 'NOT_SENT' }, ...Object.entries(SMS_STATUS_DETAILS).filter(([value]) => value !== 'PROCESSING').map(([value, item]) => ({ value, label: item.label }))] },
  { key: 'deliveryStatus', label: 'وضعیت تحویل', type: 'select' as const, modelValue: filters.value.deliveryStatus, options: [{ label: 'همه وضعیت‌ها', value: '' }, ...Object.entries(SMS_DELIVERY_DETAILS).filter(([value]) => value !== 'PENDING').map(([value, item]) => ({ value, label: item.label }))] },
])

const columns: TableColumn<SmsDispatch>[] = [
  { key: 'id', label: 'شناسه', align: 'center' },
  { key: 'user', label: 'گیرنده', align: 'center' },
  { key: 'eventCode', label: 'نوع پیامک', align: 'center', class: 'whitespace-normal' },
  { key: 'status', label: 'وضعیت ارسال', align: 'center' },
  { key: 'deliveryStatus', label: 'وضعیت تحویل', align: 'center' },
  { key: 'attempts', label: 'تلاش‌ها', align: 'center' },
  { key: 'createdAt', label: 'زمان ثبت', align: 'center' },
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
    error.value = getSmsApiError(apiError, 'دریافت آرشیو پیامک‌ها انجام نشد')
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
    toast.error(getSmsApiError(apiError, 'دریافت جزئیات پیامک انجام نشد'))
  } finally {
    detailLoading.value = false
  }
}

const retryDispatch = async (dispatch: SmsDispatch) => {
  if (!canRetrySms(dispatch)) return
  const approved = await confirm({
    title: 'تلاش مجدد',
    message: 'پیش از ارسال مجدد، سامانه شناسه قبلی را در قاصدک بررسی می‌کند تا پیامک تکراری ارسال نشود. ادامه می‌دهید؟',
    type: 'warning',
    confirmText: 'بله، تلاش مجدد',
  })
  if (!approved) return
  busyAction.value = 'retry'
  try {
    const updated = (await smsApi.retryDispatch(dispatch.id)).data
    selected.value = preserveDispatchRelations(updated, dispatch)
    toast.success('پیامک دوباره در صف ارسال قرار گرفت')
    await fetchData()
  } catch (apiError) {
    toast.error(getSmsApiError(apiError, 'تلاش مجدد برای ارسال انجام نشد'))
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
    toast.success('وضعیت تحویل از قاصدک به‌روز شد')
    await fetchData()
  } catch (apiError) {
    toast.error(getSmsApiError(apiError, 'استعلام وضعیت تحویل انجام نشد'))
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
      <BaseStatsCard title="کل پیامک‌ها" :value="stats?.total || 0" icon="document" icon-color="primary" />
      <BaseStatsCard title="ارسال‌شده" :value="sentCount" icon="check" icon-color="success" />
      <BaseStatsCard title="در انتظار ارسال" :value="queuedCount" icon="chart" icon-color="warning" />
      <BaseStatsCard title="ناموفق" :value="failedCount" icon="close" icon-color="danger" />
    </div>

    <BaseFiltersBar :fields="filterFields" reset-label="پاک کردن فیلترها" @apply="applyFilters" @reset="resetFilters" @update:field="updateFilter" />

    <BaseCard :padding="false">
      <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div><h3 class="font-bold text-gray-900">آرشیو ارسال پیامک</h3><p class="mt-1 text-xs text-gray-500">{{ formatNumber(total) }} رکورد</p></div>
        <BaseButton size="sm" variant="secondary" :loading="loading" @click="fetchData"><Icon name="mdi:refresh" class="ml-1" />به‌روزرسانی</BaseButton>
      </div>
      <StateLoader v-if="loading" message="در حال دریافت پیامک‌ها..." />
      <StateError v-else-if="error" :message="error" @retry="fetchData" />
      <BaseTable v-else :columns="columns" :data="items">
        <template #cell-user="{ row }"><div class="min-w-[145px]"><NuxtLink v-if="row.user" :to="`/admin/users/${row.user.id}`" class="font-bold text-primary hover:underline">{{ getSmsUserName(row) }}</NuxtLink><span v-else class="text-gray-600">{{ getSmsUserName(row) }}</span><p class="mt-1 text-xs text-gray-500" dir="ltr">{{ row.recipient }}</p></div></template>
        <template #cell-eventCode="{ row }"><div class="min-w-[150px] leading-6">{{ SMS_EVENT_LABELS[row.eventCode] }}</div></template>
        <template #cell-status="{ row }"><BaseBadge :variant="SMS_STATUS_DETAILS[row.status].variant">{{ SMS_STATUS_DETAILS[row.status].label }}</BaseBadge></template>
        <template #cell-deliveryStatus="{ row }"><BaseBadge :variant="SMS_DELIVERY_DETAILS[row.deliveryStatus].variant">{{ SMS_DELIVERY_DETAILS[row.deliveryStatus].label }}</BaseBadge></template>
        <template #cell-attempts="{ row }">{{ formatNumber(row.attempts) }}</template>
        <template #cell-createdAt="{ row }"><span class="whitespace-nowrap">{{ formatDate(row.createdAt, true) }}</span></template>
        <template #actions="{ row }"><div class="flex min-w-[170px] justify-center gap-2"><BaseButton size="sm" variant="secondary" :loading="detailLoading && selected?.id === row.id" @click="openDetail(row)">جزئیات</BaseButton><BaseButton v-if="canRetrySms(row)" size="sm" variant="warning" :loading="busyAction === 'retry' && selected?.id === row.id" @click="retryDispatch(row)">تلاش مجدد</BaseButton></div></template>
      </BaseTable>
      <BasePagination v-if="!loading && !error" :page="page" :total="total" :limit="LIMIT" @update:page="page = $event" />
    </BaseCard>

    <AdminSmsDispatchDetailModal v-if="selected" :dispatch="selected" :busy-action="busyAction" @close="selected = null" @retry="retryDispatch" @check-status="checkStatus" />
  </section>
</template>
