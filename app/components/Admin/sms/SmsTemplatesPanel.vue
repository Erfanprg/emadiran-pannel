<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { smsApi } from '~/services/api/sms'
import { formatDate, formatNumber } from '~/utils/formatters'
import { getSmsApiError } from '~/utils/sms'
import type { TableColumn } from '~/components/Base/Table.vue'
import type { SmsTemplatePayload, SmsTemplateSummary } from '~/types/sms'

const { t } = useI18n()

const toast = useToast()
const templates = ref<SmsTemplateSummary[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const editorOpen = ref(false)
const editing = ref<SmsTemplateSummary | null>(null)

const columns: TableColumn<SmsTemplateSummary>[] = [
  { key: 'title', label: t('admin.sms.templates.table.template'), align: 'right' },
  { key: 'content', label: t('admin.sms.templates.table.preview'), align: 'right', class: 'whitespace-normal' },
  { key: 'eventBindings', label: t('admin.sms.templates.table.events'), align: 'center' },
  { key: 'isActive', label: t('common.fields.status'), align: 'center' },
  { key: 'updatedAt', label: t('admin.sms.templates.table.updatedAt'), align: 'center' },
]

const fetchTemplates = async () => {
  loading.value = true
  error.value = null
  try {
    templates.value = (await smsApi.listTemplates()).data
  } catch (apiError) {
    error.value = getSmsApiError(apiError, t('admin.sms.errors.fetchTemplates'))
  } finally {
    loading.value = false
  }
}

const openCreate = () => { editing.value = null; editorOpen.value = true }
const openEdit = (template: SmsTemplateSummary) => { editing.value = template; editorOpen.value = true }

const saveTemplate = async (payload: SmsTemplatePayload) => {
  saving.value = true
  try {
    if (editing.value) await smsApi.updateTemplate(editing.value.id, payload)
    else await smsApi.createTemplate(payload)
    toast.success(editing.value ? t('admin.sms.templates.updated') : t('admin.sms.templates.created'))
    editorOpen.value = false
    await fetchTemplates()
  } catch (apiError) {
    toast.error(getSmsApiError(apiError, t('admin.sms.errors.saveTemplate')))
  } finally {
    saving.value = false
  }
}

onMounted(fetchTemplates)
</script>

<template>
  <BaseCard :padding="false">
    <div class="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <h3 class="font-bold text-gray-900">{{ $t('admin.sms.templates.title') }}</h3>
      <!-- <BaseButton size="sm" @click="openCreate"><Icon name="mdi:plus" class="ml-1" />قالب جدید</BaseButton> -->
    </div>
    <StateLoader v-if="loading" :message="$t('admin.sms.templates.loading')" />
    <StateError v-else-if="error" :message="error" @retry="fetchTemplates" />
    <BaseTable v-else :columns="columns" :data="templates">
      <template #cell-title="{ row }"><div class="min-w-[155px]"><p class="font-bold">{{ row.title }}</p><code class="mt-1 block text-xs text-gray-500">{{ row.code }}</code></div></template>
      <template #cell-content="{ row }"><p class="max-w-[370px] whitespace-pre-line leading-6 text-gray-600 line-clamp-3">{{ row.content }}</p></template>
      <template #cell-eventBindings="{ row }">{{ formatNumber(row.eventBindings?.length || 0) }}</template>
      <template #cell-isActive="{ row }"><BaseBadge :variant="row.isActive ? 'success' : 'gray'">{{ row.isActive ? $t('status.active') : $t('status.inactive') }}</BaseBadge></template>
      <template #cell-updatedAt="{ row }"><span class="whitespace-nowrap">{{ formatDate(row.updatedAt, true) }}</span></template>
      <template #actions="{ row }"><BaseButton size="sm" variant="secondary" @click="openEdit(row)">{{ $t('global.button.edit') }}</BaseButton></template>
    </BaseTable>
  </BaseCard>
  <AdminSmsTemplateFormModal v-if="editorOpen" :template="editing" :saving="saving" @close="editorOpen = false" @save="saveTemplate" />
</template>
