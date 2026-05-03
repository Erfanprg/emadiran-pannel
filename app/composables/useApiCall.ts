import { useToast } from './useToast'

interface ApiCallOptions<T> {
  onSuccess?: (data: T) => void | Promise<void>
  onError?: (error: any) => void
  successMessage?: string
  errorMessage?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

export const useApiCall = () => {
  const toast = useToast()

  const execute = async <T = any>(
    apiFunction: () => Promise<T>,
    options: ApiCallOptions<T> = {}
  ): Promise<{ data: T | null; error: any | null; success: boolean }> => {
    const {
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      showSuccessToast = true,
      showErrorToast = true
    } = options

    try {
      const data = await apiFunction()

      // Show success toast
      if (showSuccessToast && successMessage) {
        toast.success(successMessage)
      }

      // Execute success callback
      if (onSuccess) {
        await onSuccess(data)
      }

      return { data, error: null, success: true }
    } catch (err: any) {
      console.error('API call error:', err)

      // Show error toast
      if (showErrorToast) {
        const message = errorMessage || err.data?.message || err.message || 'خطا در انجام عملیات'
        toast.error(message)
      }

      // Execute error callback
      if (onError) {
        onError(err)
      }

      return { data: null, error: err, success: false }
    }
  }

  return {
    execute
  }
}
