import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useFrameworkStore } from './framework'
import { useOfferStore } from './offer'
import { useScheduleStore } from './schedule'
import { useOpportunityStore } from './opportunity'
import {
  FrameworkStatus,
  OfferStatus,
  ScheduleStatus,
  DEMO_ACT_IDS,
  createEmptyActFeedback,
  createEmptyFeedbackByAct,
  getActFeedbackConfig,
} from '../domain/model'
import { createEmptyContacts, hasAnyContact, normalizeContacts } from '../utils/contacts'
import { submitTesterResponse } from '../utils/netlifySubmit'
import { notifyError, notifySuccess } from '../utils/toast'
import packageJson from '../../package.json'

const FEEDBACK_KEY_LEGACY = 'demo-precurseur.feedback'
/** Ancien format plat : { P: {...}, B: {...}, ... } */
const FEEDBACK_BY_ACT_KEY = 'demo-precurseur.feedbackByAct'
/**
 * Archive regroupée par participante.
 * Shape : {
 *   users: {
 *     [name]: {
 *       name, workplace, contacts, sessionId, startedAt, feedbackByAct,
 *       netlifySubmittedAt, lastNetlifyError
 *     }
 *   },
 *   currentUserName
 * }
 * Les retours soumis sont conservés au reset du parcours (seule la session journey est effacée).
 */
const ARCHIVE_KEY = 'demo-precurseur.feedbackArchive'

const DEFAULT_STYLIST_NAME = 'Sarah'
const DEMO_VERSION = `demo-precurseur@${packageJson.version || '0.0.0'}`

function normalizeActFeedback(actId, raw) {
  const empty = createEmptyActFeedback(actId)
  if (!raw || typeof raw !== 'object') return empty
  return {
    ...empty,
    ...raw,
    actId,
    answers: { ...empty.answers, ...(raw.answers || {}) },
  }
}

function normalizeFeedbackByAct(raw) {
  const empty = createEmptyFeedbackByAct()
  if (!raw || typeof raw !== 'object') return empty
  // Ancien format plat détecté (clés P/B/C/D/E)
  const looksFlat = DEMO_ACT_IDS.some((id) => id in raw)
  if (!looksFlat && raw.feedbackByAct) {
    return normalizeFeedbackByAct(raw.feedbackByAct)
  }
  return Object.fromEntries(
    DEMO_ACT_IDS.map((id) => [id, normalizeActFeedback(id, raw[id])]),
  )
}

function createEmptyArchive() {
  return { users: {}, currentUserName: '' }
}

function userKey(name) {
  return String(name || '').trim()
}

function newSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/** Charge un éventuel plat legacy (feedbackByAct ou feedback E seul). */
function loadLegacyFlatFeedback() {
  try {
    const rawByAct = localStorage.getItem(FEEDBACK_BY_ACT_KEY)
    if (rawByAct) {
      return normalizeFeedbackByAct(JSON.parse(rawByAct))
    }
    const legacy = localStorage.getItem(FEEDBACK_KEY_LEGACY)
    if (legacy) {
      const empty = createEmptyFeedbackByAct()
      empty.E = normalizeActFeedback('E', JSON.parse(legacy))
      return empty
    }
  } catch {
    /* ignore corrupt storage */
  }
  return null
}

function normalizeWorkplace(value) {
  return String(value || '').trim()
}

function normalizeUserEntry(key, entry) {
  if (!entry || typeof entry !== 'object') {
    return {
      name: key,
      workplace: '',
      contacts: createEmptyContacts(),
      sessionId: newSessionId(),
      startedAt: new Date().toISOString(),
      feedbackByAct: createEmptyFeedbackByAct(),
      netlifySubmittedAt: null,
      lastNetlifyError: null,
    }
  }
  return {
    name: entry.name || key,
    workplace: normalizeWorkplace(entry.workplace),
    contacts: normalizeContacts(entry.contacts),
    sessionId: entry.sessionId || newSessionId(),
    startedAt: entry.startedAt || null,
    feedbackByAct: normalizeFeedbackByAct(entry.feedbackByAct),
    netlifySubmittedAt: entry.netlifySubmittedAt || null,
    lastNetlifyError: entry.lastNetlifyError || null,
  }
}

function loadArchive() {
  const empty = createEmptyArchive()
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        // Migration douce si quelqu’un a stocké le plat sous la nouvelle clé
        if (!parsed.users && DEMO_ACT_IDS.some((id) => id in parsed)) {
          return empty
        }
        const users = {}
        const src = parsed.users && typeof parsed.users === 'object' ? parsed.users : {}
        for (const [key, entry] of Object.entries(src)) {
          if (!key || !entry || typeof entry !== 'object') continue
          users[key] = normalizeUserEntry(key, entry)
        }
        return {
          users,
          currentUserName: userKey(parsed.currentUserName || ''),
        }
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return empty
}

function persistArchive(archive) {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive))
}

function ensureUserEntry(archive, name) {
  const key = userKey(name)
  if (!key) return null
  if (!archive.users[key]) {
    archive.users[key] = normalizeUserEntry(key, null)
  } else {
    archive.users[key] = normalizeUserEntry(key, archive.users[key])
  }
  return archive.users[key]
}

export const useDemoStore = defineStore('demo', () => {
  const archive = ref(loadArchive())
  const stylistName = ref(archive.value.currentUserName || '')
  const stylistContacts = ref(
    stylistName.value && archive.value.users[stylistName.value]
      ? normalizeContacts(archive.value.users[stylistName.value].contacts)
      : createEmptyContacts(),
  )
  const stylistWorkplace = ref(
    stylistName.value && archive.value.users[stylistName.value]
      ? normalizeWorkplace(archive.value.users[stylistName.value].workplace)
      : '',
  )
  const researchOpen = ref(false)
  const researchActId = ref('E')
  const netlifySubmitting = ref(false)

  // Feedback de la session courante (bucket de la participante active)
  const feedbackByAct = ref(
    stylistName.value && archive.value.users[stylistName.value]
      ? normalizeFeedbackByAct(archive.value.users[stylistName.value].feedbackByAct)
      : createEmptyFeedbackByAct(),
  )

  /** Session : ne pas re-proposer auto le formulaire après fermeture. */
  const promptedDismissed = ref({})

  /** Nom affiché partout dans l’UI ; fallback Sarah uniquement si vide. */
  const displayName = computed(() => userKey(stylistName.value) || DEFAULT_STYLIST_NAME)

  /** Lieu saisi par la testeuse ; fallback neutre si vide. */
  const displayWorkplace = computed(
    () => normalizeWorkplace(stylistWorkplace.value) || 'lieu non renseigné',
  )

  /** Ligne d’identité : prénom + lieu saisi (pas de persona marketing figée). */
  const identityLine = computed(() => `${displayName.value} — ${displayWorkplace.value}`)

  const hasStylistName = computed(() => userKey(stylistName.value).length > 0)

  const currentUserEntry = computed(() => {
    const key = userKey(stylistName.value)
    if (!key) return null
    return archive.value.users[key] || null
  })

  const netlifySubmittedAt = computed(() => currentUserEntry.value?.netlifySubmittedAt || null)
  const netlifySynced = computed(() => !!netlifySubmittedAt.value)
  const lastNetlifyError = computed(() => currentUserEntry.value?.lastNetlifyError || null)

  /**
   * Étapes grand public (1–8) pour le bandeau — sans « Scène / Acte ».
   * 1–3 création offre ; 4–8 parcours Inès simulée.
   */
  const sceneMeta = computed(() => {
    const opportunity = useOpportunityStore()
    const schedule = useScheduleStore()
    const framework = useFrameworkStore()
    const offer = useOfferStore()

    if (opportunity.isCompleted || opportunity.isSettled) {
      return {
        phase: 'transaction',
        scene: 8,
        of: 8,
        label: 'Inès est une cliente simulée · Étape 8 sur 8',
      }
    }

    if (opportunity.state.dayJAdvanced) {
      return {
        phase: 'transaction',
        scene: 7,
        of: 8,
        label: 'Inès est une cliente simulée · Étape 7 sur 8',
      }
    }

    if (opportunity.isCommitted || opportunity.isReady) {
      return {
        phase: 'transaction',
        scene: 6,
        of: 8,
        label: 'Inès est une cliente simulée · Étape 6 sur 8',
      }
    }

    if (opportunity.hasFirmProposal) {
      return {
        phase: 'transaction',
        scene: 5,
        of: 8,
        label: 'Inès est une cliente simulée · Étape 5 sur 8',
      }
    }

    if (schedule.isActive && opportunity.isInjected) {
      return {
        phase: 'transaction',
        scene: 4,
        of: 8,
        label: 'Inès est une cliente simulée · Étape 4 sur 8',
      }
    }

    if (framework.status !== FrameworkStatus.ACTIVE) {
      return {
        phase: 'precursor',
        scene: 1,
        of: 8,
        label: 'Créez votre offre · Étape 1 sur 8',
      }
    }
    if (offer.status !== OfferStatus.ACTIVE) {
      return {
        phase: 'precursor',
        scene: 2,
        of: 8,
        label: 'Créez votre offre · Étape 2 sur 8',
      }
    }
    return {
      phase: 'precursor',
      scene: 3,
      of: 8,
      label: 'Créez votre offre · Étape 3 sur 8',
    }
  })

  const scene = computed(() => sceneMeta.value.scene)
  const sceneLabel = computed(() => sceneMeta.value.label)

  const researchConfig = computed(() => getActFeedbackConfig(researchActId.value))

  const feedback = computed(() => {
    const id = researchActId.value
    return feedbackByAct.value[id] || createEmptyActFeedback(id)
  })

  const feedbackSubmitted = computed(() => !!feedback.value.submittedAt)

  const canSubmitFeedback = computed(() => {
    const current = feedback.value
    const cfg = getActFeedbackConfig(current.actId || researchActId.value)
    const answers = current.answers || {}
    const structuredOk = cfg.questions.every((q) => !!answers[q.id])
    const artificialOk = String(current.artificialMoment || '').trim().length > 0
    return structuredOk && artificialOk
  })

  const hasAnyFeedbackSubmitted = computed(() =>
    DEMO_ACT_IDS.some((id) => !!feedbackByAct.value[id]?.submittedAt),
  )

  function syncCurrentUserBucket(extra = {}) {
    const key = userKey(stylistName.value)
    if (!key) return
    const next = {
      ...archive.value,
      currentUserName: key,
      users: { ...archive.value.users },
    }
    const entry = ensureUserEntry(next, key)
    entry.feedbackByAct = normalizeFeedbackByAct(feedbackByAct.value)
    entry.contacts = normalizeContacts(stylistContacts.value)
    entry.workplace = normalizeWorkplace(stylistWorkplace.value)
    Object.assign(entry, extra)
    archive.value = next
    persistArchive(next)
  }

  function isFeedbackSubmitted(actId) {
    return !!feedbackByAct.value[actId]?.submittedAt
  }

  function patchCurrentFeedback(partial) {
    const id = researchActId.value
    feedbackByAct.value = {
      ...feedbackByAct.value,
      [id]: {
        ...normalizeActFeedback(id, feedbackByAct.value[id]),
        ...partial,
      },
    }
  }

  function openResearch(actId = 'E') {
    const id = DEMO_ACT_IDS.includes(actId) ? actId : 'E'
    researchActId.value = id
    researchOpen.value = true
  }

  /**
   * Propose le formulaire une fois à la fin d’un acte (si non soumis / non fermé).
   * Ne bloque pas le rail : fermeture possible sans enregistrer.
   */
  function promptActFeedback(actId) {
    const id = DEMO_ACT_IDS.includes(actId) ? actId : 'E'
    if (isFeedbackSubmitted(id)) return false
    if (promptedDismissed.value[id]) return false
    if (researchOpen.value && researchActId.value === id) return false
    openResearch(id)
    return true
  }

  function closeResearch() {
    if (researchOpen.value && researchActId.value) {
      promptedDismissed.value = {
        ...promptedDismissed.value,
        [researchActId.value]: true,
      }
    }
    researchOpen.value = false
  }

  function setAnswer(questionId, value) {
    const id = researchActId.value
    const current = normalizeActFeedback(id, feedbackByAct.value[id])
    patchCurrentFeedback({
      answers: { ...current.answers, [questionId]: value },
      submittedAt: null,
    })
  }

  function setArtificialMoment(value) {
    patchCurrentFeedback({
      artificialMoment: value,
      submittedAt: null,
    })
  }

  function setComment(value) {
    patchCurrentFeedback({ comment: value })
  }

  /** Snapshot JSON cohérent de la session testeuse (identité + tous les actes). */
  function buildSessionPayload() {
    const key = userKey(stylistName.value)
    const entry = key ? archive.value.users[key] : null
    const contacts = normalizeContacts(stylistContacts.value || entry?.contacts)
    const byAct = normalizeFeedbackByAct(feedbackByAct.value)
    const submittedAt = new Date().toISOString()

    const answersByAct = Object.fromEntries(
      DEMO_ACT_IDS.map((id) => {
        const act = byAct[id]
        const cfg = getActFeedbackConfig(id)
        return [
          id,
          {
            actId: id,
            badge: cfg.badge,
            title: cfg.title,
            submittedAt: act.submittedAt || null,
            answers: { ...act.answers },
            artificialMoment: act.artificialMoment || '',
            comment: act.comment || '',
          },
        ]
      }),
    )

    return {
      form: 'tester-responses',
      sessionId: entry?.sessionId || newSessionId(),
      submittedAt,
      demoVersion: DEMO_VERSION,
      identity: {
        name: key || displayName.value,
        workplace: normalizeWorkplace(stylistWorkplace.value || entry?.workplace),
        contacts,
      },
      answersByAct,
      summary: {
        actsRecorded: DEMO_ACT_IDS.filter((id) => !!byAct[id]?.submittedAt),
        actsPending: DEMO_ACT_IDS.filter((id) => !byAct[id]?.submittedAt),
      },
    }
  }

  /**
   * Envoie l’ensemble des réponses vers Netlify Forms.
   * Ne bloque pas le parcours en cas d’échec (toast + retry possible).
   */
  async function submitSessionToNetlify({ silent = false } = {}) {
    const key = userKey(stylistName.value)
    if (!key) {
      if (!silent) notifyError('Indiquez d’abord votre prénom pour envoyer vos réponses.')
      return false
    }
    if (netlifySubmitting.value) return false

    syncCurrentUserBucket()
    const payload = buildSessionPayload()
    netlifySubmitting.value = true

    try {
      await submitTesterResponse(payload)
      syncCurrentUserBucket({
        netlifySubmittedAt: payload.submittedAt,
        lastNetlifyError: null,
        sessionId: payload.sessionId,
      })
      if (!silent) {
        notifySuccess('Vos réponses ont bien été envoyées. Merci !')
      }
      return true
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Envoi impossible pour le moment'
      syncCurrentUserBucket({ lastNetlifyError: message })
      if (!silent) {
        notifyError('Envoi impossible. Vous pouvez réessayer sans quitter la démo.')
      }
      return false
    } finally {
      netlifySubmitting.value = false
    }
  }

  function submitFeedback() {
    if (!canSubmitFeedback.value) return false
    const key = userKey(stylistName.value)
    if (!key) return false
    const id = researchActId.value
    const next = {
      ...normalizeActFeedback(id, feedbackByAct.value[id]),
      submittedAt: new Date().toISOString(),
    }
    feedbackByAct.value = { ...feedbackByAct.value, [id]: next }
    syncCurrentUserBucket()
    // Nettoyage des anciens formats plats une fois migrés / remplacés
    localStorage.removeItem(FEEDBACK_BY_ACT_KEY)
    localStorage.removeItem(FEEDBACK_KEY_LEGACY)

    // À la clôture (acte E), envoi agrégé vers Netlify — non bloquant.
    if (id === 'E') {
      void submitSessionToNetlify()
    }
    return true
  }

  /**
   * Enregistre prénom + lieu de travail + contacts au démarrage
   * et charge le bucket de retours associé.
   * Si un plat legacy existe encore et que l’utilisatrice n’a pas de bucket, on le migre.
   */
  function startAs(name, contacts = {}, workplace = '') {
    const key = userKey(name)
    if (!key) return false
    const place = normalizeWorkplace(workplace)
    if (!place) return false
    const normalized = normalizeContacts(contacts)
    if (!hasAnyContact(normalized)) return false

    const next = {
      ...archive.value,
      currentUserName: key,
      users: { ...archive.value.users },
    }
    const entry = ensureUserEntry(next, key)
    entry.contacts = normalized
    entry.workplace = place
    // Nouvelle session de parcours : nouvel id si pas encore d’envoi Netlify
    if (!entry.netlifySubmittedAt) {
      entry.sessionId = newSessionId()
      entry.startedAt = entry.startedAt || new Date().toISOString()
    }

    const legacyFlat = loadLegacyFlatFeedback()
    const hasAnySubmitted = DEMO_ACT_IDS.some((id) => entry.feedbackByAct?.[id]?.submittedAt)
    if (legacyFlat && !hasAnySubmitted) {
      entry.feedbackByAct = legacyFlat
      localStorage.removeItem(FEEDBACK_BY_ACT_KEY)
      localStorage.removeItem(FEEDBACK_KEY_LEGACY)
    }

    archive.value = next
    persistArchive(next)
    stylistName.value = key
    stylistContacts.value = normalized
    stylistWorkplace.value = place
    feedbackByAct.value = normalizeFeedbackByAct(entry.feedbackByAct)
    promptedDismissed.value = {}
    // Préremplit le lieu planning (modifiable ensuite dans la config planning).
    useScheduleStore().seedPlace(place)
    return true
  }

  /**
   * Wipe explicite de toute l’archive de retours (tous les users).
   * Non branché sur « Réinitialiser » du parcours — réservé debug / besoin fort.
   */
  function clearFeedbackArchive() {
    archive.value = createEmptyArchive()
    localStorage.removeItem(ARCHIVE_KEY)
    localStorage.removeItem(FEEDBACK_BY_ACT_KEY)
    localStorage.removeItem(FEEDBACK_KEY_LEGACY)
    feedbackByAct.value = createEmptyFeedbackByAct()
    promptedDismissed.value = {}
    stylistName.value = ''
    stylistWorkplace.value = ''
    stylistContacts.value = createEmptyContacts()
  }

  /** Alias historique : n’efface plus l’archive multi-users, seulement les drafts session. */
  function clearFeedback() {
    feedbackByAct.value = createEmptyFeedbackByAct()
    promptedDismissed.value = {}
  }

  /** Snapshot JSON de l’archive (console / copier-coller recherche). */
  function exportFeedbackArchive() {
    const payload = {
      exportedAt: new Date().toISOString(),
      demoVersion: DEMO_VERSION,
      currentUserName: archive.value.currentUserName || stylistName.value || null,
      currentSession: buildSessionPayload(),
      users: archive.value.users,
    }
    console.info('[demo-precurseur] feedback archive', payload)
    return payload
  }

  function resetAll(router) {
    useFrameworkStore().reset()
    useOfferStore().reset()
    useScheduleStore().reset()
    useOpportunityStore().reset()
    // Conserve l’archive users + le prénom courant ; recharge le bucket soumis.
    promptedDismissed.value = {}
    researchOpen.value = false
    researchActId.value = 'E'
    const key = userKey(stylistName.value)
    if (key && archive.value.users[key]) {
      feedbackByAct.value = normalizeFeedbackByAct(archive.value.users[key].feedbackByAct)
      stylistContacts.value = normalizeContacts(archive.value.users[key].contacts)
      stylistWorkplace.value = normalizeWorkplace(archive.value.users[key].workplace)
    } else {
      feedbackByAct.value = createEmptyFeedbackByAct()
    }
    router.replace({ name: 'demo-start' })
  }

  function statusSummary() {
    const framework = useFrameworkStore()
    const offer = useOfferStore()
    const schedule = useScheduleStore()
    const opportunity = useOpportunityStore()
    const feedbackStatus = Object.fromEntries(
      DEMO_ACT_IDS.map((id) => [id, isFeedbackSubmitted(id) ? 'RECORDED' : 'NONE']),
    )
    return {
      stylistName: stylistName.value || null,
      displayName: displayName.value,
      workplace: normalizeWorkplace(stylistWorkplace.value) || null,
      contacts: normalizeContacts(stylistContacts.value),
      framework: framework.status,
      offer: offer.status === OfferStatus.NONE ? 'NONE' : offer.status,
      schedule: schedule.status === ScheduleStatus.NONE ? 'NONE' : schedule.status,
      demand: opportunity.isInjected ? opportunity.state.demandStatus : 'NONE',
      invitation: opportunity.state.invitationStatus,
      proposal: opportunity.state.proposalStatus,
      softHold: opportunity.state.softHoldStatus,
      engagement: opportunity.state.engagementStatus,
      readiness: opportunity.state.readinessStatus,
      execution: opportunity.state.executionStatus,
      version: opportunity.state.engagementVersion,
      settlement: opportunity.state.settlementStatus,
      review: opportunity.hasReviewReply ? 'REVIEW_REPLIED' : 'NONE',
      feedback: feedbackStatus,
      feedbackAny: DEMO_ACT_IDS.some((id) => isFeedbackSubmitted(id)) ? 'RECORDED' : 'NONE',
      feedbackUsers: Object.keys(archive.value.users || {}),
      netlifySynced: netlifySynced.value,
      netlifySubmittedAt: netlifySubmittedAt.value,
    }
  }

  return {
    researchOpen,
    researchActId,
    researchConfig,
    feedbackByAct,
    feedback,
    stylistName,
    stylistWorkplace,
    stylistContacts,
    displayName,
    displayWorkplace,
    identityLine,
    hasStylistName,
    sceneMeta,
    scene,
    sceneLabel,
    feedbackSubmitted,
    canSubmitFeedback,
    hasAnyFeedbackSubmitted,
    netlifySubmitting,
    netlifySubmittedAt,
    netlifySynced,
    lastNetlifyError,
    isFeedbackSubmitted,
    openResearch,
    promptActFeedback,
    closeResearch,
    setAnswer,
    setArtificialMoment,
    setComment,
    submitFeedback,
    buildSessionPayload,
    submitSessionToNetlify,
    startAs,
    clearFeedback,
    clearFeedbackArchive,
    exportFeedbackArchive,
    resetAll,
    statusSummary,
  }
})
