/** Canaux de contact collectés au démarrage (PII minimal demandé). */
export function createEmptyContacts() {
  return {
    instagram: '',
    tiktok: '',
    phone: '',
    email: '',
    whatsapp: '',
  }
}

export function normalizeContacts(raw) {
  const empty = createEmptyContacts()
  if (!raw || typeof raw !== 'object') return empty
  return {
    instagram: String(raw.instagram || '').trim(),
    tiktok: String(raw.tiktok || '').trim(),
    phone: String(raw.phone || '').trim(),
    email: String(raw.email || '').trim(),
    whatsapp: String(raw.whatsapp || '').trim(),
  }
}

/** Au moins un canal renseigné. */
export function hasAnyContact(contacts) {
  const c = normalizeContacts(contacts)
  return Boolean(c.instagram || c.tiktok || c.phone || c.email || c.whatsapp)
}
