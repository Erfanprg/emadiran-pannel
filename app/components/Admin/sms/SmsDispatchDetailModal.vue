<script setup lang="ts">
import { SMS_DELIVERY_DETAILS, SMS_EVENT_LABELS, SMS_STATUS_DETAILS } from '~/constants/sms'
import { formatDate, formatNumber } from '~/utils/formatters'
import { canCheckSmsStatus, canRetrySms, getSmsUserName } from '~/utils/sms'
import type { SmsDispatch } from '~/types/sms'

defineProps<{ dispatch: SmsDispatch; busyAction?: 'retry' | 'status' | null }>()
const emit = defineEmits<{ close: []; retry: [dispatch: SmsDispatch]; checkStatus: [dispatch: SmsDispatch] }>()
</script>

<template>
  <BaseModal title="جزئیات پیامک" max-width="2xl" @close="emit('close')">
    <div class="max-h-[70vh] space-y-5 overflow-y-auto pl-1">
      <div class="grid gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
        <div><span class="text-xs text-gray-500">رویداد</span><p class="mt-1 font-bold">{{ SMS_EVENT_LABELS[dispatch.eventCode] }}</p></div>
        <div><span class="text-xs text-gray-500">نام گیرنده</span><p class="mt-1 font-bold">{{ getSmsUserName(dispatch) }}</p></div>
        <div><span class="text-xs text-gray-500">شماره موبایل</span><p class="mt-1 font-bold" >{{ dispatch.recipient }}</p></div>
        <div><span class="text-xs text-gray-500">وضعیت ارسال</span><p class="mt-1"><BaseBadge :variant="SMS_STATUS_DETAILS[dispatch.status].variant">{{ SMS_STATUS_DETAILS[dispatch.status].label }}</BaseBadge></p></div>
        <div><span class="text-xs text-gray-500">وضعیت تحویل</span><p class="mt-1"><BaseBadge :variant="SMS_DELIVERY_DETAILS[dispatch.deliveryStatus].variant">{{ SMS_DELIVERY_DETAILS[dispatch.deliveryStatus].label }}</BaseBadge></p></div>
        <div><span class="text-xs text-gray-500">قالب استفاده‌شده</span><p class="mt-1">{{ dispatch.template?.title || dispatch.templateCode }}</p></div>
        <div><span class="text-xs text-gray-500">زمان ارسال</span><p class="mt-1">{{ formatDate(dispatch.createdAt, true) }}</p></div>
      </div>

      <!-- <div>
        <h4 class="mb-2 text-sm font-bold text-gray-900">متن ارسال‌شده</h4>
        <div class="whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-4 text-sm leading-7 text-gray-700">{{ dispatch.renderedMessage }}</div>
      </div> -->



      <div v-if="dispatch.lastError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <strong class="mb-1 block">آخرین خطا<span v-if="dispatch.lastErrorCode">، کد {{ dispatch.lastErrorCode }}</span></strong>
        {{ dispatch.lastError }}
      </div>

      <div class="grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
        <p>شناسه رکورد: {{ formatNumber(dispatch.id) }}</p>
        <p>شناسه پیامک قاصدک: <span dir="ltr">{{ dispatch.providerMessageId || '-' }}</span></p>
        <p>آخرین تلاش: {{ formatDate(dispatch.lastAttemptAt, true) }}</p>
        <p>آخرین استعلام: {{ formatDate(dispatch.lastStatusCheckedAt, true) }}</p>
        <p>زمان دریافت: {{ formatDate(dispatch.acceptedAt, true) }}</p>
        <!-- <p>زمان تحویل: {{ formatDate(dispatch.deliveredAt, true) }}</p> -->
      </div>
    </div>

    <template #footer>
      <div class="flex w-full flex-wrap justify-end gap-2">
        <BaseButton variant="secondary" @click="emit('close')">بستن</BaseButton>
        <BaseButton v-if="canCheckSmsStatus(dispatch)" variant="secondary" :loading="busyAction === 'status'" :disabled="Boolean(busyAction)" @click="emit('checkStatus', dispatch)">استعلام وضعیت تحویل</BaseButton>
        <BaseButton v-if="canRetrySms(dispatch)" variant="warning" :loading="busyAction === 'retry'" :disabled="Boolean(busyAction)" @click="emit('retry', dispatch)">تلاش مجدد</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
