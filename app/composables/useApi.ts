import { useToast } from "./useToast"
import { translate } from '~/i18n/translate'

interface ApiError {
  statusCode: number
  message: string
  data?: any
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

/**
 * Custom API composable for making POST requests to Emad backend
 * All API endpoints use POST method with body parameters
 * 
 * @example
 * const api = useApi()
 * const result = await api.post('/user/sendOTP', { email, action: 'register' })
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  const { locale } = useI18n()
  
  const baseURL: string = (config.public.apiBaseUrl as string)

  /**
   * Get auth token from cookie or store
   */
  const getAuthToken = (): string | null => {
    // Try to get from cookie first
    const tokenCookie = useCookie('auth_token')
    return tokenCookie.value || null
  }

  /**
   * Build request headers
   */
  const buildHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'accept-language': locale.value || 'fa',
    }

    const token = getAuthToken()
    if (token) {
      headers.authorization = token
    }

    return headers
  }

  /**
   * Handle API errors with user-friendly messages
   */
  const handleError = (error: any): never => {
    const apiError: ApiError = {
      statusCode: error.statusCode || error.status || 500,
      message: error.data?.message || error.message || translate('common.errors.generic'),
      data: error.data
    }

    // Show toast notification
    const toast = useToast()
    
    switch (apiError.statusCode) {
      case 401:
        toast.error(translate('common.errors.unauthorized'))
        // Clear auth and redirect to login
        const tokenCookie = useCookie('auth_token')
        tokenCookie.value = null
        navigateTo('/auth/login')
        break
      case 403:
        toast.error(translate('common.errors.forbidden'))
        break
      case 404:
        toast.error(translate('common.errors.notFound'))
        break
      case 422:
        // Validation errors
        if (apiError.data?.errors) {
          const firstError = Object.values(apiError.data.errors)[0]
          if (Array.isArray(firstError) && firstError[0]) {
            toast.error(firstError[0])
          } else {
            toast.error(apiError.message)
          }
        } else {
          toast.error(apiError.message)
        }
        break
      case 429:
        toast.error(translate('common.errors.tooManyRequests'))
        break
      case 500:
      case 502:
      case 503:
        toast.error(translate('common.errors.server'))
        break
      default:
        toast.error(apiError.message)
    }

    throw apiError
  }

  /**
   * POST request - Main method for all API calls
   * @param endpoint - API endpoint (e.g., '/user/sendOTP')
   * @param body - Request body parameters
   * @param customHeaders - Optional custom headers
   */
  const post = async <T = any>(
    endpoint: string,
    body?: Record<string, any>,
    customHeaders?: HeadersInit
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await $fetch<ApiResponse<T>>(endpoint, {
        baseURL,
        method: 'POST',
        headers: {
          ...buildHeaders(),
          ...customHeaders,
        },
        body: body || {},
        retry: 1,
        retryDelay: 500,
      })

      return response
    } catch (error: any) {
      return handleError(error)
    }
  }

  /**
   * Upload file with FormData
   * @param endpoint - API endpoint
   * @param formData - FormData object with files
   */
  const upload = async <T = any>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> => {
    try {
      const token = getAuthToken()
      const headers: HeadersInit = {
        'accept-language': locale.value || 'fa',
      }

      if (token) {
        headers.authorization = token
      }

      const response = await $fetch<ApiResponse<T>>(endpoint, {
        baseURL,
        method: 'POST',
        headers,
        body: formData,
      })

      return response
    } catch (error: any) {
      return handleError(error)
    }
  }

  return {
    /**
     * POST request - All API endpoints use POST
     */
    post,

    /**
     * Upload files with FormData
     */
    upload,
  }
}
