<script setup lang="ts">
import { SMS_VARIABLE_LABELS } from '~/constants/sms'
import { useToast } from '~/composables/useToast'
import { smsApi } from '~/services/api/sms'
import { getSmsApiError } from '~/utils/sms'
import type { SmsEventBinding, SmsTemplateSummary } from '~/types/sms'

const { t } = useI18n()

const toast = useToast()
const events = ref<SmsEventBinding[]>([])
const templates = ref<SmsTemplateSummary[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const savingCode = ref<string | null>(null)
const selectedTemplates = reactive<Record<string, string>>({})
const enabledStates = reactive<Record<string, boolean>>({})

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const [eventsResponse, templatesResponse] = await Promise.all([smsApi.listEvents(), smsApi.listTemplates()])
    events.value = eventsResponse.data
    templates.value = templatesResponse.data
    events.value.forEach(event => {
      selectedTemplates[event.eventCode] = event.binding ? String(event.binding.templateId) : ''
      enabledStates[event.eventCode] = event.binding?.isEnabled ?? false
    })
  } catch (apiError) {
    error.value = getSmsApiError(apiError, t('admin.sms.errors.fetchEvents'))
  } finally {
    loading.value = false
  }
}

const compatibleTemplates = (event: SmsEventBinding) => {
  const allowed = new Set(event.allowedVariables)
  return templates.value.filter(template => template.variables.every(variable => allowed.has(variable.key)))
}

const saveEvent = async (event: SmsEventBinding) => {
  const templateId = Number(selectedTemplates[event.eventCode])
  if (!templateId) {
    toast.error(t('admin.sms.events.selectTemplateFirst'))
    return
  }
  savingCode.value = event.eventCode
  try {
    await smsApi.updateEvent(event.eventCode, { templateId, isEnabled: enabledStates[event.eventCode] })
    toast.success(t('admin.sms.events.saved', { title: event.title }))
    await fetchData()
  } catch (apiError) {
    toast.error(getSmsApiError(apiError, t('admin.sms.errors.saveEvent')))
  } finally {
    savingCode.value = null
  }
}

onMounted(fetchData)
</script>

<template>
  <section>
    <StateLoader v-if="loading" :message="$t('admin.sms.events.loading')" />
    <StateError v-else-if="error" :message="error" @retry="fetchData" />
    <div v-else class="grid gap-4 lg:grid-cols-2">
      <BaseCard v-for="event in events" :key="event.eventCode" class="relative overflow-hidden">
        <div class="mb-4 flex items-start justify-between gap-4">
          <div><h3 class="font-bold text-gray-900">{{ event.title }}</h3><code class="mt-1 block text-xs text-gray-400">{{ event.eventCode }}</code></div>
          <BaseBadge :variant="enabledStates[event.eventCode] ? 'success' : 'gray'">{{ enabledStates[event.eventCode] ? $t('admin.sms.events.sendingEnabled') : $t('admin.sms.events.sendingDisabled') }}</BaseBadge>
        </div>
        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700">{{ $t('admin.sms.events.template') }}</label>
          <select v-model="selectedTemplates[event.eventCode]" class="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-primary">
            <option value="">{{ $t('admin.sms.events.selectTemplate') }}</option>
            <option v-for="template in compatibleTemplates(event)" :key="template.id" :value="String(template.id)">{{ template.title }}{{ template.isActive ? '' : $t('admin.sms.events.inactiveSuffix') }}</option>
          </select>
        </div>
        <div class="mb-5">
          <p class="mb-2 text-xs font-bold text-gray-600">{{ $t('admin.sms.events.availableVariables') }}</p>
          <div class="flex flex-wrap gap-2"><span v-for="variable in event.allowedVariables" :key="variable" class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">{{ SMS_VARIABLE_LABELS[variable] || variable }} <code class="mr-1 text-[10px] text-gray-400">{{ variable }}</code></span></div>
        </div>
        <div class="flex items-center justify-between border-t border-gray-100 pt-4">
          <label class="flex cursor-pointer items-center gap-2 text-sm font-bold text-gray-700"><input v-model="enabledStates[event.eventCode]" type="checkbox" class="h-5 w-5 accent-primary" />{{ $t('admin.sms.events.enableSending') }}</label>
          <BaseButton size="sm" :loading="savingCode === event.eventCode" :disabled="savingCode !== null" @click="saveEvent(event)">{{ $t('global.button.save') }}</BaseButton>
        </div>
      </BaseCard>
    </div>
  </section>
</template>
