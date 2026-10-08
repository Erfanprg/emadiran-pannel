export interface UserStats {
  total: number
  active: number
  inactive: number
  admins: number
  usersWithDebt: number
  totalDebt: string
}

export interface AdminUser {
  id: number
  firstName: string | null
  lastName: string | null
  fullName: string | null
  phoneNumber: string
  nationalCode: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  totalDebt: string
  createdAt: string
  updatedAt: string
}

export interface UsersListResponse {
  data: AdminUser[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface GetUsersQuery {
  limit?: number
  offset?: number
  search?: string
  role?: 'USER' | 'ADMIN'
  isActive?: boolean
  sortBy?: 'totalDebt' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateUserDto {
  firstName: string
  lastName: string
  phoneNumber: string
  nationalCode: string
  role?: 'USER' | 'ADMIN'
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  nationalCode?: string
  role?: 'USER' | 'ADMIN'
  isActive?: boolean
}

export interface CsvImportResponse {
  success: boolean
  message: string
  data: {
    successCount: number
    failedCount: number
    processedUsers: number
    newUsers: number
    newLoans: number
    errors: string[]
    metadata: {
      totalRows: number
      skippedRows: number
      processingTime: string
    }
  }
}

export interface BulkPaymentImportResponse {
  success: boolean
  message: string
  data: {
    successCount: number
    failedCount: number
    processedUsers: number
    errors: string[]
    metadata: {
      totalRows: number
      skippedRows: number
      processingTime: string
      totalPaymentAmount: string
      totalDebtReduced: string
    }
  }
}

export interface DebtReport {
  summary: {
    totalDebt: string
    averageDebt: string
    maxDebt: string
    usersWithDebt: number
    totalPaymentTransactions: number
    totalPaymentAmount: string
  }
  recentChanges: Array<{
    type: string
    totalAmount: string
    count: number
  }>
  topDebtors: Array<{
    id: number
    firstName: string | null
    lastName: string | null
    fullName: string | null
    phoneNumber: string
    totalDebt: string
  }>
}

export interface DebtReportResponse {
  success: boolean
  data: DebtReport
}

export interface PaymentDeadline {
  id: number
  userId: number
  deadlineAt: string
  createdByAdminId: number
  createdAt: string
  updatedAt: string
  editReason: string | null
  editedByAdminId: number | null
  editedAt: string | null
}

export interface PaymentDeadlinesMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface PaymentDeadlinesListResponse {
  success: boolean
  data: {
    items: PaymentDeadline[]
    meta: PaymentDeadlinesMeta
  }
}

export interface PaymentDeadlineCurrentResponse {
  success: boolean
  data: PaymentDeadline | null
}

export interface CreatePaymentDeadlineDto {
  deadlineAt: string
}

export interface UpdatePaymentDeadlineDto {
  deadlineAt: string
  editReason: string
}

export interface PaymentDeadlineMutationResponse {
  success: boolean
  message: string
  data: PaymentDeadline
}

export interface ContactHistoryAdmin {
  id: number
  fullName: string
}

export interface ContactHistoryItem {
  id: number
  description: string
  createdAt: string
  admin: ContactHistoryAdmin
}

export interface ContactHistoriesMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface ContactHistoriesListResponse {
  success: boolean
  data: {
    items: ContactHistoryItem[]
    meta: ContactHistoriesMeta
  }
}

export interface CreateContactHistoryDto {
  description: string
}

export interface ContactHistoryMutationResponse {
  success: boolean
  message: string
  data: ContactHistoryItem
}

export type SystemSmsType =
  | 'DEADLINE_DUE_NO_PAYMENT'
  | 'DEADLINE_DUE_WITH_PAYMENT'
  | 'PAYMENT_WITHOUT_DEADLINE'

export type SystemSmsStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'SENT'
  | 'SKIPPED'
  | 'FAILED'

export type SystemSmsFilterStatus = SystemSmsStatus | 'NOT_SENT'

export interface SystemSmsUser {
  id: number
  firstName: string | null
  lastName: string | null
  fullName: string | null
  phoneNumber: string
  nationalCode: string
}

export interface SystemSmsPaymentDeadline {
  id: number
  deadlineAt: string
  createdAt: string
}

export interface SystemSmsItem {
  id: number
  type: SystemSmsType
  templateName: string
  status: SystemSmsStatus
  notificationDate: string
  paidAmount: string
  remainingDebt: string
  attempts: number
  lastError: string | null
  sentAt: string | null
  createdAt: string
  updatedAt: string
  user: SystemSmsUser
  paymentDeadline: SystemSmsPaymentDeadline | null
}

export interface SystemSmsMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface SystemSmsListResponse {
  success: boolean
  data: {
    items: SystemSmsItem[]
    meta: SystemSmsMeta
  }
}

export interface RetrySystemSmsResponse {
  success: boolean
  message: string
  data: {
    id: number
    status: 'QUEUED'
  }
}

export interface GetSystemSmsQuery {
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
  type?: SystemSmsType
  status?: SystemSmsFilterStatus
}
