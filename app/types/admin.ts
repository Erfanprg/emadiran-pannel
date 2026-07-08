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
