import { useToast } from 'vue-toastification'
import { TOAST_MIN_MS } from './toast'

const PREFIX = 'Simulation :'

/**
 * Toast discret pour signaler une réaction simulée d’Inès (cliente).
 * Ne pas utiliser pour les actions de Sarah.
 */
export function notifySimulation(message) {
  const text = String(message || '').trim()
  if (!text) return

  const content = text.startsWith(PREFIX) ? text : `${PREFIX} ${text}`

  try {
    const toast = useToast()
    toast.info(content, {
      timeout: TOAST_MIN_MS,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      icon: false,
      closeButton: 'button',
      toastClassName: ['demo-toast', 'demo-toast--sim'],
      bodyClassName: 'demo-toast__body',
    })
  } catch {
    // Plugin pas encore prêt (HMR / hors app) — silencieux.
  }
}
