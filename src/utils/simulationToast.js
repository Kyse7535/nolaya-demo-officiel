import { useToast } from 'vue-toastification'
import { TOAST_MIN_MS } from './toast'

const PREFIX = 'Simulation : Inès (la cliente)'

/**
 * Toast discret pour signaler une réaction simulée d’Inès (la cliente).
 * Ne pas utiliser pour les actions de Sarah.
 */
export function notifySimulation(message) {
  let text = String(message || '').trim()
  if (!text) return

  // Évite « Inès Inès… » si le message commence déjà par le prénom.
  text = text.replace(/^Inès\s+/i, '')

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
