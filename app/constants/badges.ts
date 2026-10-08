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
  PENDING: { text: 'در انتظار', variant: 'warning' },
  PAID: { text: 'پرداخت شده', variant: 'success' },
  OVERDUE: { text: 'عقب افتاده', variant: 'danger' }
}

/** User panel transaction statuses */
export const TRANSACTION_STATUS_BADGES: BadgeMap = {
  SUCCESS: { text: 'موفق', variant: 'success' },
  FAILED: { text: 'ناموفق', variant: 'danger' },
  PENDING: { text: 'در انتظار', variant: 'warning' }
}

/** Admin panel transaction statuses (pending is gray) */
export const ADMIN_TRANSACTION_STATUS_BADGES: BadgeMap = {
  SUCCESS: { text: 'موفق', variant: 'success' },
  FAILED: { text: 'ناموفق', variant: 'danger' },
  PENDING: { text: 'در انتظار', variant: 'gray' }
}

/** User panel transaction types */
export const TRANSACTION_TYPE_BADGES: BadgeMap = {
  DEBT_PAYMENT: { text: 'پرداخت بدهی', variant: 'success' },
  ADMIN_DEBT_ADD: { text: 'افزایش بدهی', variant: 'danger' },
  LEGAL_DEBT_ADD: { text: 'افزایش بدهی حقوقی', variant: 'danger' },
  ADMIN_DEBT_REDUCE: { text: 'کاهش بدهی', variant: 'success' }
}

/** Admin panel transaction types */
export const ADMIN_TRANSACTION_TYPE_BADGES: BadgeMap = {
  DEBT_PAYMENT: { text: 'پرداخت', variant: 'success' },
  ADMIN_DEBT_ADD: { text: 'افزایش بدهی', variant: 'danger' },
  LEGAL_DEBT_ADD: { text: 'افزایش بدهی حقوقی', variant: 'danger' },
  ADMIN_DEBT_REDUCE: { text: 'کاهش بدهی', variant: 'warning' }
}

/** Admin debt history: every non-increase is shown as a reduction */
export const DEBT_HISTORY_TYPE_BADGES: BadgeMap = {
  DEBT_PAYMENT: { text: 'کاهش بدهی', variant: 'success' },
  ADMIN_DEBT_ADD: { text: 'افزایش بدهی', variant: 'danger' },
  LEGAL_DEBT_ADD: { text: 'افزایش بدهی حقوقی', variant: 'danger' },
  ADMIN_DEBT_REDUCE: { text: 'کاهش بدهی', variant: 'success' }
}

/** Active flag of users and gateways */
export const ACTIVE_STATUS_BADGES: BadgeMap = {
  true: { text: 'فعال', variant: 'success' },
  false: { text: 'غیرفعال', variant: 'danger' }
}

/** Admin users list */
export const USER_ROLE_BADGES: BadgeMap = {
  ADMIN: { text: 'مدیر', variant: 'primary' },
  USER: { text: 'کاربر', variant: 'info' }
}
