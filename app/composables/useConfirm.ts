interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'danger' | 'success'
}

interface ConfirmState {
  isOpen: boolean
  options: ConfirmOptions | null
  resolve: ((value: boolean) => void) | null
}

const state = reactive<ConfirmState>({
  isOpen: false,
  options: null,
  resolve: null
})

export const useConfirm = () => {
  const confirm = (options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      state.isOpen = true
      state.options = typeof options === 'string' 
        ? { message: options } 
        : options
      state.resolve = resolve
    })
  }

  const handleConfirm = () => {
    if (state.resolve) {
      state.resolve(true)
    }
    closeDialog()
  }

  const handleCancel = () => {
    if (state.resolve) {
      state.resolve(false)
    }
    closeDialog()
  }

  const closeDialog = () => {
    state.isOpen = false
    state.options = null
    state.resolve = null
  }

  return {
    confirm,
    state: readonly(state),
    handleConfirm,
    handleCancel
  }
}
