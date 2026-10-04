<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { smsApi } from '~/services/api/sms'
import { formatDate } from '~/utils/formatters'
import { getSmsApiError } from '~/utils/sms'
import type { TableColumn } from '~/components/Base/Table.vue'
import type { SmsTemplatePayload, SmsTemplateSummary } from '~/types/sms'

const toast = useToast()
const templates = ref<SmsTemplateSummary[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const editorOpen = ref(false)
const editing = ref<SmsTemplateSummary | null>(null)

const columns: TableColumn<SmsTemplateSummary>[] = [
  { key: 'title', label: 'قالب', align: 'right' },
  { key: 'content', label: 'پیش‌نمایش متن', align: 'right', class: 'whitespace-normal' },
  { key: 'eventBindings', label: 'رویدادهای متصل', align: 'center' },
  { key: 'isActive', label: 'وضعیت', align: 'center' },
  { key: 'updatedAt', label: 'آخرین ویرایش', align: 'center' },
]

const fetchTemplates = async () => {
  loading.value = true
  error.value = null
  try {
    templates.value = (await smsApi.listTemplates()).data
  } catch (apiError) {
    error.value = getSmsApiError(apiError, 'دریافت قالب‌های پیامک انجام نشد')
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
    toast.success(editing.value ? 'قالب پیامک ویرایش شد' : 'قالب پیامک ساخته شد')
    editorOpen.value = false
    await fetchTemplates()
  } catch (apiError) {
    toast.error(getSmsApiError(apiError, 'ذخیره قالب پیامک انجام نشد'))
  } finally {
    saving.value = false
  }
}

onMounted(fetchTemplates)
</script>

<template>
  <BaseCard :padding="false">
    <div class="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <h3 class="font-bold text-gray-900">قالب‌های پیامک</h3>
      <!-- <BaseButton size="sm" @click="openCreate"><Icon name="mdi:plus" class="ml-1" />قالب جدید</BaseButton> -->
    </div>
    <StateLoader v-if="loading" message="در حال دریافت قالب‌ها..." />
    <StateError v-else-if="error" :message="error" @retry="fetchTemplates" />
    <BaseTable v-else :columns="columns" :data="templates">
      <template #cell-title="{ row }"><div class="min-w-[155px]"><p class="font-bold">{{ row.title }}</p><code class="mt-1 block text-xs text-gray-500">{{ row.code }}</code></div></template>
      <template #cell-content="{ row }"><p class="max-w-[370px] whitespace-pre-line leading-6 text-gray-600 line-clamp-3">{{ row.content }}</p></template>
      <template #cell-eventBindings="{ row }">{{ (row.eventBindings?.length || 0).toLocaleString('fa-IR') }}</template>
      <template #cell-isActive="{ row }"><BaseBadge :variant="row.isActive ? 'success' : 'gray'">{{ row.isActive ? 'فعال' : 'غیرفعال' }}</BaseBadge></template>
      <template #cell-updatedAt="{ row }"><span class="whitespace-nowrap">{{ formatDate(row.updatedAt, true) }}</span></template>
      <template #actions="{ row }"><BaseButton size="sm" variant="secondary" @click="openEdit(row)">ویرایش</BaseButton></template>
    </BaseTable>
  </BaseCard>
  <AdminSmsTemplateFormModal v-if="editorOpen" :template="editing" :saving="saving" @close="editorOpen = false" @save="saveTemplate" />
</template>
