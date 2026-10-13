import type { SmsDeliveryStatus, SmsDispatchStatus, SmsEventCode, SmsTemplateFormatter } from '~/types/sms'
import { translate } from '../i18n/translate'

export type SmsBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'primary'

export const SMS_EVENT_LABELS: Record<SmsEventCode, string> = {
  get LOGIN_OTP() { return translate('admin.sms.events.names.loginOtp') },
  get DEBT_ADDED() { return translate('admin.sms.events.names.debtAdded') },
  get LEGAL_DEBT_ADDED() { return translate('admin.sms.events.names.legalDebtAdded') },
  get ADMIN_DEBT_REDUCED() { return translate('admin.sms.events.names.adminDebtReduced') },
  get ONLINE_PAYMENT_CONFIRMED() { return translate('admin.sms.events.names.onlinePaymentConfirmed') },
  get BULK_PAYMENT_CONFIRMED() { return translate('admin.sms.events.names.bulkPaymentConfirmed') },
  get DEADLINE_DUE_NO_PAYMENT() { return translate('admin.sms.events.names.deadlineDueNoPayment') },
  get DEADLINE_DUE_WITH_PAYMENT() { return translate('admin.sms.events.names.deadlineDueWithPayment') },
  get PAYMENT_WITHOUT_DEADLINE() { return translate('admin.sms.events.names.paymentWithoutDeadline') },
}

export const SMS_STATUS_DETAILS: Record<SmsDispatchStatus, { label: string; variant: SmsBadgeVariant }> = {
  QUEUED: { get label() { return translate('admin.sms.dispatchStatus.queued') }, variant: 'warning' },
  PROCESSING: { get label() { return translate('admin.sms.dispatchStatus.sending') }, variant: 'info' },
  ACCEPTED: { get label() { return translate('status.success') }, variant: 'success' },
  SKIPPED: { get label() { return translate('admin.sms.dispatchStatus.skipped') }, variant: 'gray' },
  FAILED: { get label() { return translate('status.failed') }, variant: 'danger' },
}

export const SMS_DELIVERY_DETAILS: Record<SmsDeliveryStatus, { label: string; variant: SmsBadgeVariant }> = {
  NOT_CHECKED: { get label() { return translate('admin.sms.deliveryStatus.notChecked') }, variant: 'gray' },
  PENDING: { get label() { return translate('admin.sms.dispatchStatus.sending') }, variant: 'warning' },
  DELIVERED: { get label() { return translate('admin.sms.deliveryStatus.delivered') }, variant: 'success' },
  NOT_DELIVERED: { get label() { return translate('status.failed') }, variant: 'danger' },
  REACHED_TELECOM: { get label() { return translate('admin.sms.deliveryStatus.reachedTelecom') }, variant: 'info' },
  TELECOM_FAILED: { get label() { return translate('admin.sms.deliveryStatus.telecomFailed') }, variant: 'danger' },
  BLACKLISTED: { get label() { return translate('admin.sms.deliveryStatus.blacklisted') }, variant: 'danger' },
  INVALID_MESSAGE_ID: { get label() { return translate('admin.sms.deliveryStatus.invalidMessageId') }, variant: 'danger' },
}

export const SMS_FORMATTER_LABELS: Record<SmsTemplateFormatter, string> = {
  get TEXT() { return translate('admin.sms.formatters.text') },
  get RIAL_AMOUNT() { return translate('admin.sms.formatters.rialAmount') },
  get INTEGER() { return translate('admin.sms.formatters.integer') },
}

export const SMS_VARIABLE_LABELS: Record<string, string> = {
  get otpCode() { return translate('admin.sms.events.names.loginOtp') },
  get customerFullName() { return translate('admin.sms.variables.customerFullName') },
  get amount() { return translate('common.fields.amount') },
  get loanNumber() { return translate('common.fields.loanNumber') },
  get paymentDeadlineDays() { return translate('admin.sms.variables.paymentDeadlineDays') },
  get description() { return translate('common.fields.description') },
  get remainingDebt() { return translate('admin.sms.variables.remainingDebt') },
  get paidAmount() { return translate('admin.sms.variables.paidAmount') },
}
