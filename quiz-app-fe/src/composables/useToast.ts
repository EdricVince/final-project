import { ref } from 'vue'

export interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const isVisible = ref(false)
const message = ref('')
const type = ref<ToastOptions['type']>('success')

let timeoutId: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  const show = (options: ToastOptions | string) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Handle string or options object
    if (typeof options === 'string') {
      message.value = options
      type.value = 'success'
    } else {
      message.value = options.message
      type.value = options.type || 'success'
    }

    isVisible.value = true

    // Auto hide
    const duration = typeof options === 'object' ? options.duration || 3000 : 3000
    timeoutId = setTimeout(() => {
      hide()
    }, duration)
  }

  const hide = () => {
    isVisible.value = false
    message.value = ''
  }

  const success = (msg: string, duration?: number) => {
    show({ message: msg, type: 'success', duration })
  }

  const error = (msg: string, duration?: number) => {
    show({ message: msg, type: 'error', duration })
  }

  const warning = (msg: string, duration?: number) => {
    show({ message: msg, type: 'warning', duration })
  }

  const info = (msg: string, duration?: number) => {
    show({ message: msg, type: 'info', duration })
  }

  return {
    isVisible,
    message,
    type,
    show,
    hide,
    success,
    error,
    warning,
    info,
  }
}
