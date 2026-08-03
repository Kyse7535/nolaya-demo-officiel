import { useToast } from 'vue-toastification'

/** Durée minimale et par défaut des toasts (ms). */
export const TOAST_MIN_MS = 10000

const BASE = {
  timeout: TOAST_MIN_MS,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  icon: false,
  closeButton: 'button',
}

/**
 * Toast feedback pour une action de Sarah (pro).
 * @param {'success'|'info'|'error'} [variant]
 */
export function notifyToast(message, variant = 'success') {
  const text = String(message || '').trim()
  if (!text) return

  try {
    const toast = useToast()
    const opts = {
      ...BASE,
      timeout: Math.max(TOAST_MIN_MS, Number(BASE.timeout) || TOAST_MIN_MS),
      toastClassName: ['demo-toast', `demo-toast--${variant}`],
      bodyClassName: 'demo-toast__body',
    }
    if (variant === 'error') toast.error(text, opts)
    else if (variant === 'info') toast.info(text, opts)
    else toast.success(text, opts)
  } catch {
    // Plugin pas encore prêt (HMR / hors app) — silencieux.
  }
}

export function notifySuccess(message) {
  notifyToast(message, 'success')
}

export function notifyInfo(message) {
  notifyToast(message, 'info')
}

export function notifyError(message) {
  notifyToast(message, 'error')
}
