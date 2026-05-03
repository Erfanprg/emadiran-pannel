export interface ApiError {
  statusCode: number
  message: string
  data?: any
  errors?: Record<string, string[]>
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  data?: T
  error?: {
    code?: number
    message: string
  } | null
  message?: string
}