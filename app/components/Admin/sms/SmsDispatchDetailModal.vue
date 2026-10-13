<script setup lang="ts">
import { SMS_DELIVERY_DETAILS, SMS_EVENT_LABELS, SMS_STATUS_DETAILS } from '~/constants/sms'
import { formatDate, formatNumber } from '~/utils/formatters'
import { canCheckSmsStatus, canRetrySms, getSmsUserName } from '~/utils/sms'
import type { SmsDispatch } from '~/types/sms'

defineProps<{ dispatch: SmsDispatch; busyAction?: 'retry' | 'status' | null }>()
const emit = defineEmits<{ close: []; retry: [dispatch: SmsDispatch]; checkStatus: [dispatch: SmsDispatch] }>()
</script>

<template>
  <BaseModal :title="$t('admin.sms.detail.title')" max-width="2xl" @close="emit('close')">
    <div class="max-h-[70vh] space-y-5 overflow-y-auto pl-1">
      <div class="grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
        <div><span class="text-xs text-gray-500">{{ $t('admin.sms.fields.event') }}</span><p class="mt-1 font-bold">{{ SMS_EVENT_LABELS[dispatch.eventCode] }}</p></div>
        <div><span class="text-xs text-gray-500">{{ $t('admin.sms.fields.recipientName') }}</span><p class="mt-1 font-bold">{{ getSmsUserName(dispatch) }}</p></div>
        <div><span class="text-xs text-gray-500">{{ $t('global.form.mobile_number') }}</span><p class="mt-1 font-bold" >{{ dispatch.recipient }}</p></div>
        <div><span class="text-xs text-gray-500">{{ $t('admin.sms.fields.sendStatus') }}</span><p class="mt-1"><BaseBadge :variant="SMS_STATUS_DETAILS[dispatch.status].variant">{{ SMS_STATUS_DETAILS[dispatch.status].label }}</BaseBadge></p></div>
        <div><span class="text-xs text-gray-500">{{ $t('admin.sms.fields.deliveryStatus') }}</span><p class="mt-1"><BaseBadge :variant="SMS_DELIVERY_DETAILS[dispatch.deliveryStatus].variant">{{ SMS_DELIVERY_DETAILS[dispatch.deliveryStatus].label }}</BaseBadge></p></div>
        <div><span class="text-xs text-gray-500">{{ $t('admin.sms.fields.templateUsed') }}</span><p class="mt-1">{{ dispatch.template?.title || dispatch.templateCode }}</p></div>
        <div><span class="text-xs text-gray-500">{{ $t('admin.sms.fields.sentAt') }}</span><p class="mt-1">{{ formatDate(dispatch.createdAt, true) }}</p></div>
      </div>

      <!-- <div>
        <h4 class="mb-2 text-sm font-bold text-gray-900">متن ارسال‌شده</h4>
        <div class="whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-4 text-sm leading-7 text-gray-700">{{ dispatch.renderedMessage }}</div>
      </div> -->



      <div v-if="dispatch.lastError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <strong class="mb-1 block">{{ $t('admin.sms.fields.lastError') }}<span v-if="dispatch.lastErrorCode">{{ $t('admin.sms.detail.errorCode', { lastErrorCode: dispatch.lastErrorCode }) }}</span></strong>
        {{ dispatch.lastError }}
      </div>

      <div class="grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
        <p>{{ $t('admin.sms.detail.recordId', { id: formatNumber(dispatch.id) }) }}</p>
        <p>{{ $t('admin.sms.detail.ghasedakId') }} <span dir="ltr">{{ dispatch.providerMessageId || '-' }}</span></p>
        <p>{{ $t('admin.sms.detail.lastAttempt', { lastAttemptAt: formatDate(dispatch.lastAttemptAt, true) }) }}</p>
        <p>{{ $t('admin.sms.detail.lastCheck', { lastStatusCheckedAt: formatDate(dispatch.lastStatusCheckedAt, true) }) }}</p>
        <p>{{ $t('admin.sms.detail.deliveredAt', { acceptedAt: formatDate(dispatch.acceptedAt, true) }) }}</p>
        <!-- <p>زمان تحویل: {{ formatDate(dispatch.deliveredAt, true) }}</p> -->
      </div>
    </div>

    <template #footer>
      <div class="flex w-full flex-wrap justify-end gap-2">
        <BaseButton variant="secondary" @click="emit('close')">{{ $t('global.button.close') }}</BaseButton>
        <BaseButton v-if="canCheckSmsStatus(dispatch)" variant="secondary" :loading="busyAction === 'status'" :disabled="Boolean(busyAction)" @click="emit('checkStatus', dispatch)">{{ $t('admin.sms.actions.checkDelivery') }}</BaseButton>
        <BaseButton v-if="canRetrySms(dispatch)" variant="warning" :loading="busyAction === 'retry'" :disabled="Boolean(busyAction)" @click="emit('retry', dispatch)">{{ $t('common.actions.retry') }}</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
