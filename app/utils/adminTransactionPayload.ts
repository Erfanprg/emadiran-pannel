import type { DebtTransactionType, Transaction, UpdateTransactionRequest } from '../types/transaction'
import { convertJalaliDateToIso, isValidJalaliDate } from '../func/GenerateDate'

export const ADD_DEBT_TRANSACTION_TYPES: Array<{ value: Extract<DebtTransactionType, 'ADMIN_DEBT_ADD' | 'LEGAL_DEBT_ADD'>; label: string }> = [
  { value: 'ADMIN_DEBT_ADD', label: 'افزایش بدهی' },
  { value: 'LEGAL_DEBT_ADD', label: 'افزایش بدهی حقوقی' }
]

export const REDUCE_DEBT_TRANSACTION_TYPES: Array<{ value: Extract<DebtTransactionType, 'ADMIN_DEBT_REDUCE'>; label: string }> = [
  { value: 'ADMIN_DEBT_REDUCE', label: 'پرداخت بدهی' }
]

export const EDITABLE_TRANSACTION_TYPES: DebtTransactionType[] = [
  'ADMIN_DEBT_ADD',
  'LEGAL_DEBT_ADD',
  'ADMIN_DEBT_REDUCE'
]

export interface DebtFormInput {
  amount: number
  type: DebtTransactionType | ''
  jalaliDate?: string
}

export interface DebtFormValidationResult {
  isValid: boolean
  errors: {
    amount?: string
    transactionType?: string
    transactionDate?: string
  }
  transactionDateIso?: string
}

export interface EditTransactionFormInput {
  amount: string
  type: DebtTransactionType
  description: string
  reason: string
  jalaliDate: string
}

export interface EditValidationResult {
  isValid: boolean
  errors: {
    amount?: string
    type?: string
    reason?: string
    transactionDate?: string
  }
  payload?: UpdateTransactionRequest
}

export const getTransactionTypeLabel = (type: DebtTransactionType): string => {
  if (type === 'ADMIN_DEBT_ADD') return 'افزایش بدهی'
  if (type === 'LEGAL_DEBT_ADD') return 'افزایش بدهی حقوقی'
  return 'پرداخت بدهی'
}

export const validateDebtForm = (input: DebtFormInput): DebtFormValidationResult => {
  const errors: DebtFormValidationResult['errors'] = {}

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    errors.amount = 'مبلغ باید بیشتر از صفر باشد'
  }

  if (!input.type) {
    errors.transactionType = 'لطفاً نوع تراکنش را مشخص کنید'
  } else if (!EDITABLE_TRANSACTION_TYPES.includes(input.type)) {
    errors.transactionType = 'نوع تراکنش معتبر نیست'
  }

  let transactionDateIso: string | undefined
  if (input.jalaliDate && input.jalaliDate.trim()) {
    if (!isValidJalaliDate(input.jalaliDate)) {
      errors.transactionDate = 'تاریخ تراکنش معتبر نیست'
    } else {
      const iso = convertJalaliDateToIso(input.jalaliDate)
      if (!iso) {
        errors.transactionDate = 'تاریخ تراکنش معتبر نیست'
      } else {
        transactionDateIso = iso
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    transactionDateIso
  }
}

export const buildEditTransactionPayload = (
  original: Transaction,
  form: EditTransactionFormInput
): EditValidationResult => {
  const errors: EditValidationResult['errors'] = {}
  const payload: UpdateTransactionRequest = {
    reason: form.reason.trim()
  }

  const nextAmount = Number((form.amount || '').replace(/,/g, ''))
  const originalAmount = Number(original.amount)
  if (!Number.isFinite(nextAmount) || nextAmount < 1000) {
    errors.amount = 'حداقل مبلغ باید ۱,۰۰۰ ریال باشد'
  } else if (nextAmount !== originalAmount) {
    payload.amount = String(nextAmount)
  }

  if (!EDITABLE_TRANSACTION_TYPES.includes(form.type)) {
    errors.type = 'نوع تراکنش معتبر نیست'
  } else if (form.type !== original.type) {
    payload.type = form.type
  }

  const nextDescription = (form.description || '').trim()
  const originalDescription = (original.description || '').trim()
  if (nextDescription !== originalDescription) {
    payload.description = nextDescription || undefined
  }

  const dateHasValue = Boolean(form.jalaliDate && form.jalaliDate.trim())
  if (dateHasValue) {
    if (!isValidJalaliDate(form.jalaliDate)) {
      errors.transactionDate = 'تاریخ تراکنش معتبر نیست'
    } else {
      const iso = convertJalaliDateToIso(form.jalaliDate)
      if (!iso) {
        errors.transactionDate = 'تاریخ تراکنش معتبر نیست'
      } else {
        const originalIso = original.transactionDate ? new Date(original.transactionDate).toISOString() : ''
        if (!originalIso || originalIso !== iso) {
          payload.transactionDate = iso
        }
      }
    }
  }

  if (payload.reason.length < 5) {
    errors.reason = 'دلیل باید حداقل ۵ کاراکتر باشد'
  }

  const changedFieldsCount = Object.keys(payload).filter((key) => key !== 'reason').length
  if (changedFieldsCount === 0 && Object.keys(errors).length === 0) {
    errors.reason = 'حداقل یک فیلد را تغییر دهید'
  }

  if (Object.keys(errors).length > 0) {
    return {
      isValid: false,
      errors
    }
  }

  return {
    isValid: true,
    errors: {},
    payload
  }
}
