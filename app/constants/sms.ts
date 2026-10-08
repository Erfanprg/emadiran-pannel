import type { SmsDeliveryStatus, SmsDispatchStatus, SmsEventCode, SmsTemplateFormatter } from '~/types/sms'

export type SmsBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'primary'

export const SMS_EVENT_LABELS: Record<SmsEventCode, string> = {
  LOGIN_OTP: 'کد ورود',
  DEBT_ADDED: 'ثبت بدهی',
  LEGAL_DEBT_ADDED: 'ثبت هزینه حقوقی',
  ADMIN_DEBT_REDUCED: 'کاهش بدهی توسط مدیر',
  ONLINE_PAYMENT_CONFIRMED: 'تأیید پرداخت آنلاین',
  BULK_PAYMENT_CONFIRMED: 'تأیید پرداخت گروهی',
  DEADLINE_DUE_NO_PAYMENT: 'پایان مهلت بدون پرداخت',
  DEADLINE_DUE_WITH_PAYMENT: 'پایان مهلت همراه با پرداخت',
  PAYMENT_WITHOUT_DEADLINE: 'پرداخت بدون مهلت فعال',
}

export const SMS_STATUS_DETAILS: Record<SmsDispatchStatus, { label: string; variant: SmsBadgeVariant }> = {
  QUEUED: { label: 'در صف ارسال', variant: 'warning' },
  PROCESSING: { label: 'در حال ارسال', variant: 'info' },
  ACCEPTED: { label: 'موفق', variant: 'success' },
  SKIPPED: { label: 'لغو ارسال', variant: 'gray' },
  FAILED: { label: 'ناموفق', variant: 'danger' },
}

export const SMS_DELIVERY_DETAILS: Record<SmsDeliveryStatus, { label: string; variant: SmsBadgeVariant }> = {
  NOT_CHECKED: { label: 'بدون بررسی', variant: 'gray' },
  PENDING: { label: 'در حال ارسال', variant: 'warning' },
  DELIVERED: { label: 'تحویل به گیرنده', variant: 'success' },
  NOT_DELIVERED: { label: 'ناموفق', variant: 'danger' },
  REACHED_TELECOM: { label: 'ارسال به مخابرات', variant: 'info' },
  TELECOM_FAILED: { label: 'عدم ارسال به مخابرات', variant: 'danger' },
  BLACKLISTED: { label: 'بلاک شده', variant: 'danger' },
  INVALID_MESSAGE_ID: { label: 'شناسه پیامک نامعتبر', variant: 'danger' },
}

export const SMS_FORMATTER_LABELS: Record<SmsTemplateFormatter, string> = {
  TEXT: 'متن',
  RIAL_AMOUNT: 'مبلغ ریالی',
  INTEGER: 'عدد صحیح',
}

export const SMS_VARIABLE_LABELS: Record<string, string> = {
  otpCode: 'کد ورود',
  customerFullName: 'نام و نام خانوادگی مشتری',
  amount: 'مبلغ',
  loanNumber: 'شماره تسهیلات',
  paymentDeadlineDays: 'تعداد روزهای مهلت پرداخت',
  description: 'توضیحات',
  remainingDebt: 'باقی‌مانده بدهی',
  paidAmount: 'مبلغ پرداخت‌شده',
}
