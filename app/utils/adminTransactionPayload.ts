import type { DebtTransactionType, Transaction, UpdateTransactionRequest } from '../types/transaction'
import { convertJalaliDateToIso, isValidJalaliDate } from '../func/GenerateDate'
import { translate } from '../i18n/translate'

export const ADD_DEBT_TRANSACTION_TYPES: Array<{ value: Extract<DebtTransactionType, 'ADMIN_DEBT_ADD' | 'LEGAL_DEBT_ADD'>; label: string }> = [
  { value: 'ADMIN_DEBT_ADD', get label() { return translate('status.transactionType.debtAdd') } },
  { value: 'LEGAL_DEBT_ADD', get label() { return translate('status.transactionType.legalDebtAdd') } }
]

export const REDUCE_DEBT_TRANSACTION_TYPES: Array<{ value: Extract<DebtTransactionType, 'ADMIN_DEBT_REDUCE'>; label: string }> = [
  { value: 'ADMIN_DEBT_REDUCE', get label() { return translate('status.transactionType.debtPayment') } }
]

export const EDITABLE_TRANSACTION_TYPES: DebtTransactionType[] = [
  'ADMIN_DEBT_ADD',
  'LEGAL_DEBT_ADD',
  'ADMIN_DEBT_REDUCE'
]

/** Only admin debt transactions can be edited or deleted */
export const canManageTransaction = (transaction: Pick<Transaction, 'type'>): boolean =>
  EDITABLE_TRANSACTION_TYPES.includes(transaction.type as DebtTransactionType)

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
  if (type === 'ADMIN_DEBT_ADD') return translate('status.transactionType.debtAdd')
  if (type === 'LEGAL_DEBT_ADD') return translate('status.transactionType.legalDebtAdd')
  return translate('status.transactionType.debtPayment')
}

export const validateDebtForm = (input: DebtFormInput): DebtFormValidationResult => {
  const errors: DebtFormValidationResult['errors'] = {}

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    errors.amount = translate('admin.transactions.validation.amountPositive')
  }

  if (!input.type) {
    errors.transactionType = translate('admin.transactions.validation.typeRequired')
  } else if (!EDITABLE_TRANSACTION_TYPES.includes(input.type)) {
    errors.transactionType = translate('admin.transactions.validation.typeInvalid')
  }

  let transactionDateIso: string | undefined
  if (input.jalaliDate && input.jalaliDate.trim()) {
    if (!isValidJalaliDate(input.jalaliDate)) {
      errors.transactionDate = translate('admin.transactions.validation.dateInvalid')
    } else {
      const iso = convertJalaliDateToIso(input.jalaliDate)
      if (!iso) {
        errors.transactionDate = translate('admin.transactions.validation.dateInvalid')
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
    errors.amount = translate('admin.transactions.validation.minAmount')
  } else if (nextAmount !== originalAmount) {
    payload.amount = String(nextAmount)
  }

  if (!EDITABLE_TRANSACTION_TYPES.includes(form.type)) {
    errors.type = translate('admin.transactions.validation.typeInvalid')
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
      errors.transactionDate = translate('admin.transactions.validation.dateInvalid')
    } else {
      const iso = convertJalaliDateToIso(form.jalaliDate)
      if (!iso) {
        errors.transactionDate = translate('admin.transactions.validation.dateInvalid')
      } else {
        const originalIso = original.transactionDate ? new Date(original.transactionDate).toISOString() : ''
        if (!originalIso || originalIso !== iso) {
          payload.transactionDate = iso
        }
      }
    }
  }

  if (payload.reason.length < 5) {
    errors.reason = translate('admin.common.validation.reasonMin')
  }

  const changedFieldsCount = Object.keys(payload).filter((key) => key !== 'reason').length
  if (changedFieldsCount === 0 && Object.keys(errors).length === 0) {
    errors.reason = translate('admin.transactions.validation.noChanges')
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
