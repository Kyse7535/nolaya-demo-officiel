/** Nom du formulaire Netlify Forms (doit matcher index.html). */
export const TESTER_FORM_NAME = 'tester-responses'

/**
 * Envoie le payload agrégé via Netlify Forms (application/x-www-form-urlencoded).
 * Les champs plats aident la lecture dans l’UI Netlify ; `payload` contient le JSON complet.
 *
 * @param {object} sessionPayload
 * @returns {Promise<void>}
 */
export async function submitTesterResponse(sessionPayload) {
  const identity = sessionPayload?.identity || {}
  const contacts = identity.contacts || {}

  const body = new URLSearchParams()
  body.set('form-name', TESTER_FORM_NAME)
  body.set('bot-field', '')
  body.set('prenom', String(identity.name || '').trim())
  body.set('instagram', String(contacts.instagram || '').trim())
  body.set('tiktok', String(contacts.tiktok || '').trim())
  body.set('telephone', String(contacts.phone || '').trim())
  body.set('email', String(contacts.email || '').trim())
  body.set('whatsapp', String(contacts.whatsapp || '').trim())
  body.set('session-id', String(sessionPayload.sessionId || ''))
  body.set('submitted-at', String(sessionPayload.submittedAt || new Date().toISOString()))
  body.set('demo-version', String(sessionPayload.demoVersion || ''))
  body.set('payload', JSON.stringify(sessionPayload))

  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  // Netlify renvoie souvent 200 ; en local (pas de Forms), on tolère le 404 HTML.
  if (!res.ok && res.status !== 404) {
    throw new Error(`Envoi Netlify échoué (${res.status})`)
  }

  // En local Vite, POST / renvoie souvent l’index 200 sans enregistrer — OK pour ne pas bloquer.
  return undefined
}
