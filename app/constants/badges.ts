import { translate } from '../i18n/translate'
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'primary' | 'default'

export interface BadgeConfig {
  text: string
  variant: BadgeVariant
}

export type BadgeMap = Record<string, BadgeConfig>

/** Looks up a badge; unknown values fall back to the raw value with the default variant. */
export const getBadge = (map: BadgeMap, value: string | boolean): BadgeConfig =>
  map[String(value)] || { text: String(value), variant: 'default' }

export const INSTALLMENT_STATUS_BADGES: BadgeMap = {
  PENDING: { get text() { return translate('status.pending') }, variant: 'warning' },
  PAID: { get text() { return translate('status.paid') }, variant: 'success' },
  OVERDUE: { get text() { return translate('status.overdue') }, variant: 'danger' }
}

/** User panel transaction statuses */
export const TRANSACTION_STATUS_BADGES: BadgeMap = {
  SUCCESS: { get text() { return translate('status.success') }, variant: 'success' },
  FAILED: { get text() { return translate('status.failed') }, variant: 'danger' },
  PENDING: { get text() { return translate('status.pending') }, variant: 'warning' }
}

/** Admin panel transaction statuses (pending is gray) */
export const ADMIN_TRANSACTION_STATUS_BADGES: BadgeMap = {
  SUCCESS: { get text() { return translate('status.success') }, variant: 'success' },
  FAILED: { get text() { return translate('status.failed') }, variant: 'danger' },
  PENDING: { get text() { return translate('status.pending') }, variant: 'gray' }
}

/** User panel transaction types */
export const TRANSACTION_TYPE_BADGES: BadgeMap = {
  DEBT_PAYMENT: { get text() { return translate('status.transactionType.debtPayment') }, variant: 'success' },
  ADMIN_DEBT_ADD: { get text() { return translate('status.transactionType.debtAdd') }, variant: 'danger' },
  LEGAL_DEBT_ADD: { get text() { return translate('status.transactionType.legalDebtAdd') }, variant: 'danger' },
  ADMIN_DEBT_REDUCE: { get text() { return translate('status.transactionType.debtReduce') }, variant: 'success' }
}

/** Admin panel transaction types */
export const ADMIN_TRANSACTION_TYPE_BADGES: BadgeMap = {
  DEBT_PAYMENT: { get text() { return translate('status.transactionType.payment') }, variant: 'success' },
  ADMIN_DEBT_ADD: { get text() { return translate('status.transactionType.debtAdd') }, variant: 'danger' },
  LEGAL_DEBT_ADD: { get text() { return translate('status.transactionType.legalDebtAdd') }, variant: 'danger' },
  ADMIN_DEBT_REDUCE: { get text() { return translate('status.transactionType.debtReduce') }, variant: 'warning' }
}

/** Admin debt history: every non-increase is shown as a reduction */
export const DEBT_HISTORY_TYPE_BADGES: BadgeMap = {
  DEBT_PAYMENT: { get text() { return translate('status.transactionType.debtReduce') }, variant: 'success' },
  ADMIN_DEBT_ADD: { get text() { return translate('status.transactionType.debtAdd') }, variant: 'danger' },
  LEGAL_DEBT_ADD: { get text() { return translate('status.transactionType.legalDebtAdd') }, variant: 'danger' },
  ADMIN_DEBT_REDUCE: { get text() { return translate('status.transactionType.debtReduce') }, variant: 'success' }
}

/** Active flag of users and gateways */
export const ACTIVE_STATUS_BADGES: BadgeMap = {
  true: { get text() { return translate('status.active') }, variant: 'success' },
  false: { get text() { return translate('status.inactive') }, variant: 'danger' }
}

/** Admin users list */
export const USER_ROLE_BADGES: BadgeMap = {
  ADMIN: { get text() { return translate('status.role.admin') }, variant: 'primary' },
  USER: { get text() { return translate('status.role.user') }, variant: 'info' }
}
