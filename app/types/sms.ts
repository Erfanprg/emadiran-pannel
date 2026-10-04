export type SmsEventCode =
  | 'LOGIN_OTP'
  | 'DEBT_ADDED'
  | 'LEGAL_DEBT_ADDED'
  | 'ADMIN_DEBT_REDUCED'
  | 'ONLINE_PAYMENT_CONFIRMED'
  | 'BULK_PAYMENT_CONFIRMED'
  | 'DEADLINE_DUE_NO_PAYMENT'
  | 'DEADLINE_DUE_WITH_PAYMENT'
  | 'PAYMENT_WITHOUT_DEADLINE'

export type SmsDispatchStatus = 'QUEUED' | 'PROCESSING' | 'ACCEPTED' | 'SKIPPED' | 'FAILED'
export type SmsDispatchStatusFilter = SmsDispatchStatus | 'NOT_SENT'
export type SmsDeliveryStatus =
  | 'NOT_CHECKED'
  | 'PENDING'
  | 'DELIVERED'
  | 'NOT_DELIVERED'
  | 'REACHED_TELECOM'
  | 'TELECOM_FAILED'
  | 'BLACKLISTED'
  | 'INVALID_MESSAGE_ID'
export type SmsTemplateFormatter = 'TEXT' | 'RIAL_AMOUNT' | 'INTEGER'

export interface SmsTemplateVariable {
  key: string
  label: string
  required: boolean
  formatter: SmsTemplateFormatter
}

export interface SmsTemplateSummary {
  id: number
  code: string
  title: string
  content: string
  variables: SmsTemplateVariable[]
  version: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  eventBindings?: Array<{ id: number; eventCode: SmsEventCode; isEnabled: boolean }>
  _count?: { dispatches: number }
}

export interface SmsEventBinding {
  eventCode: SmsEventCode
  title: string
  allowedVariables: string[]
  binding: null | {
    id: number
    eventCode: SmsEventCode
    templateId: number
    isEnabled: boolean
    template: SmsTemplateSummary
  }
}

export interface SmsDispatchUser {
  id: number
  fullName: string | null
  firstName: string | null
  lastName: string | null
  phoneNumber: string
  nationalCode?: string
}

export interface SmsDispatch {
  id: number
  eventCode: SmsEventCode
  templateId: number | null
  templateCode: string
  templateVersion: number
  recipient: string
  sender: string
  renderedMessage: string
  variables: Record<string, string>
  status: SmsDispatchStatus
  deliveryStatus: SmsDeliveryStatus
  providerMessageId: string | null
  providerStatusCode: number | null
  attempts: number
  manualRetryCount: number
  statusCheckAttempts: number
  isRetryable: boolean | null
  lastErrorCode: number | null
  lastError: string | null
  transactionId: number | null
  paymentDeadlineId: number | null
  notificationDate: string | null
  scheduledAt: string | null
  lastAttemptAt: string | null
  acceptedAt: string | null
  lastStatusCheckedAt: string | null
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
  user: SmsDispatchUser | null
  template: Pick<SmsTemplateSummary, 'id' | 'code' | 'title'> | null
  transaction?: Record<string, unknown> | null
  paymentDeadline?: Record<string, unknown> | null
}

export interface SmsDispatchQuery {
  limit?: number
  offset?: number
  eventCode?: SmsEventCode
  status?: SmsDispatchStatusFilter
  deliveryStatus?: SmsDeliveryStatus
  userId?: number
  transactionId?: number
  templateId?: number
  recipient?: string
  startDate?: string
  endDate?: string
}

export interface SmsDispatchStats {
  total: number
  byStatus: Partial<Record<SmsDispatchStatus, number>>
  byDeliveryStatus: Partial<Record<SmsDeliveryStatus, number>>
  byEvent: Partial<Record<SmsEventCode, number>>
}

export interface SmsApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface SmsDispatchList {
  items: SmsDispatch[]
  meta: { total: number; limit: number; offset: number; hasMore: boolean }
}

export type SmsTemplatePayload = Pick<SmsTemplateSummary, 'code' | 'title' | 'content' | 'variables' | 'isActive'>
