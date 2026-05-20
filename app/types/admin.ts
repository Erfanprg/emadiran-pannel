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
