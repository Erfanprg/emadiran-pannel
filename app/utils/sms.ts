import type { SmsDispatch } from '~/types/sms'
import { translate } from '../i18n/translate'

export const getSmsApiError = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') return fallback
  const normalized = error as { data?: { message?: string | string[] }; message?: string }
  const message = normalized.data?.message
  if (Array.isArray(message)) return message[0] || fallback
  return message || normalized.message || fallback
}

export const getSmsUserName = (dispatch: SmsDispatch): string => {
  const user = dispatch.user
  if (!user) return translate('admin.sms.recipient.unknown')
  return user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || translate('admin.sms.recipient.noName')
}

export const canRetrySms = (dispatch: SmsDispatch): boolean =>
  dispatch.eventCode !== 'LOGIN_OTP' &&
  dispatch.sender !== 'MIGRATED_LEGACY' &&
  dispatch.status === 'FAILED' &&
  dispatch.isRetryable === true

export const canCheckSmsStatus = (dispatch: SmsDispatch): boolean =>
  dispatch.status === 'ACCEPTED' && Boolean(dispatch.providerMessageId)
