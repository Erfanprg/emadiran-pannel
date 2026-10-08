import { describe, expect, it } from 'vitest'
import {
  buildEditTransactionPayload,
  validateDebtForm
} from '../app/utils/adminTransactionPayload'
import type { Transaction } from '../app/types/transaction'

describe('admin transaction payload helpers', () => {
  it('rejects non-positive debt amount and invalid date', () => {
    const result = validateDebtForm({
      amount: 0,
      type: 'ADMIN_DEBT_ADD',
      jalaliDate: 'invalid-date'
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.amount).toBeTruthy()
    expect(result.errors.transactionDate).toBeTruthy()
  })

  it('allows admin debt amounts below 1000 rials', () => {
    const result = validateDebtForm({
      amount: 900,
      type: 'ADMIN_DEBT_REDUCE',
      jalaliDate: ''
    })

    expect(result.isValid).toBe(true)
    expect(result.errors.amount).toBeUndefined()
  })

  it('converts valid jalali date to iso for debt payload', () => {
    const result = validateDebtForm({
      amount: 150000,
      type: 'LEGAL_DEBT_ADD',
      jalaliDate: '1405/02/08'
    })

    expect(result.isValid).toBe(true)
    expect(result.transactionDateIso).toMatch(/\d{4}-\d{2}-\d{2}T/)
  })

  it('requires selecting a transaction type', () => {
    const result = validateDebtForm({
      amount: 150000,
      type: '',
      jalaliDate: ''
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.transactionType).toBe('لطفاً نوع تراکنش را مشخص کنید')
  })

  it('creates edit payload with only changed fields and reason', () => {
    const original: Transaction = {
      id: 14,
      userId: 2,
      amount: '100000',
      type: 'ADMIN_DEBT_ADD',
      status: 'SUCCESS',
      description: 'ثبت اولیه',
      transactionDate: '2026-04-20T00:00:00.000Z',
      createdAt: '2026-04-20T00:00:00.000Z'
    }

    const result = buildEditTransactionPayload(original, {
      amount: '120000',
      type: 'LEGAL_DEBT_ADD',
      description: 'ثبت اصلاحی',
      reason: 'اصلاح ثبت اشتباه',
      jalaliDate: '1405/02/02'
    })

    expect(result.isValid).toBe(true)
    expect(result.payload).toBeTruthy()
    expect(result.payload?.reason).toBe('اصلاح ثبت اشتباه')
    expect(result.payload?.amount).toBe('120000')
    expect(result.payload?.type).toBe('LEGAL_DEBT_ADD')
    expect(result.payload?.description).toBe('ثبت اصلاحی')
    expect(result.payload?.transactionDate).toMatch(/\d{4}-\d{2}-\d{2}T/)
  })

  it('rejects edit without valid reason', () => {
    const original: Transaction = {
      id: 15,
      userId: 2,
      amount: '100000',
      type: 'ADMIN_DEBT_ADD',
      status: 'SUCCESS',
      description: 'ثبت اولیه',
      transactionDate: '2026-04-20T00:00:00.000Z',
      createdAt: '2026-04-20T00:00:00.000Z'
    }

    const result = buildEditTransactionPayload(original, {
      amount: '100000',
      type: 'ADMIN_DEBT_ADD',
      description: 'ثبت اولیه',
      reason: 'کم',
      jalaliDate: '1405/02/01'
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.reason).toBeTruthy()
  })
})
