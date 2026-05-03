import type { ToastMessage, ToastType, ToastOptions } from '~/types/toast'

// Global toast state (shared across all components)
const toasts = ref<ToastMessage[]>([])

/**
 * Toast notification composable
 * Provides methods to show success, error, warning, and info messages
 * 
 * @example
 * const toast = useToast()
 * toast.success('عملیات با موفقیت انجام شد')
 * toast.error('خطایی رخ داده است')
 */
export const useToast = () => {
  /**
   * Generate unique ID for toast
   */
  const generateId = (): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Add a new toast notification
   */
  const addToast = (type: ToastType, options: ToastOptions) => {
    const id = generateId()
    const duration = options.duration ?? 3000

    const toast: ToastMessage = {
      id,
      type,
      message: options.message,
      duration,
    }

    toasts.value.push(toast)

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  /**
   * Remove toast by ID
   */
  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Remove all toasts
   */
  const clearAll = () => {
    toasts.value = []
  }

  return {
    // State (readonly)
    toasts: readonly(toasts),

    // Methods
    success: (message: string, duration?: number) =>
      addToast('success', { message, duration }),

    error: (message: string, duration?: number) =>
      addToast('error', { message, duration }),

    warning: (message: string, duration?: number) =>
      addToast('warning', { message, duration }),

    info: (message: string, duration?: number) =>
      addToast('info', { message, duration }),

    remove: removeToast,
    clearAll,
  }
}
