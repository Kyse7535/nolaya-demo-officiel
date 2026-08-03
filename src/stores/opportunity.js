import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  CLARIFICATION_QUESTIONS,
  DemandStatus,
  ENGAGEMENT_SEQUENCE,
  EngagementStatus,
  EngagementVersion,
  ExecutionStatus,
  EXTRA_DURATION_OPTIONS,
  FEASIBILITY_CHECKS,
  INES_CHECKLIST,
  INES_RAIL,
  InvitationStatus,
  MODIFICATION_SEQUENCE,
  ProposalStatus,
  REVIEW_REPLY_MAX,
  REVIEW_TONES,
  ReadinessStatus,
  SARAH_CHECKLIST,
  SETTLEMENT_SEQUENCE,
  SettlementStatus,
  SoftHoldStatus,
  SUPPLEMENT_OPTIONS,
  createEmptyOpportunity,
} from '../domain/model'
import { notifySimulation } from '../utils/simulationToast'
import { notifyError, notifySuccess } from '../utils/toast'

const STORAGE_KEY = 'demo-precurseur.opportunity'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyOpportunity()
    return { ...createEmptyOpportunity(), ...JSON.parse(raw) }
  } catch {
    return createEmptyOpportunity()
  }
}

function nowLabel() {
  return new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const useOpportunityStore = defineStore('opportunity', () => {
  const state = ref(load())

  const rail = computed(() => INES_RAIL)

  const isInjected = computed(() => state.value.injected)
  const invitationActive = computed(
    () => state.value.invitationStatus === InvitationStatus.ACTIVE,
  )
  const invitationRefused = computed(
    () => state.value.invitationStatus === InvitationStatus.REFUSED,
  )
  const isEnriched = computed(
    () => state.value.demandStatus === DemandStatus.ENRICHED || state.value.hasRecentPhoto,
  )
  const hasFirmProposal = computed(
    () => state.value.proposalStatus === ProposalStatus.FIRM,
  )
  const softHoldActive = computed(
    () => state.value.softHoldStatus === SoftHoldStatus.ACTIVE,
  )
  const isCommitted = computed(
    () => state.value.engagementStatus === EngagementStatus.COMMITTED,
  )
  const isReady = computed(() => state.value.readinessStatus === ReadinessStatus.READY)
  const readinessPending = computed(
    () => state.value.readinessStatus === ReadinessStatus.PENDING,
  )
  const engagementSequenceRunning = computed(
    () => state.value.engagementSequencePhase === 'running',
  )
  const engagementSequenceDone = computed(
    () =>
      state.value.engagementSequencePhase === 'done' ||
      state.value.engagementStatus === EngagementStatus.COMMITTED,
  )

  const missingPhotoAlert = computed(
    () => isInjected.value && !state.value.hasRecentPhoto && !hasFirmProposal.value,
  )

  const canPrepareProposal = computed(
    () =>
      invitationActive.value &&
      isEnriched.value &&
      !hasFirmProposal.value,
  )

  const canSendClarification = computed(
    () =>
      invitationActive.value &&
      !state.value.clarificationSent &&
      !state.value.clarificationWaiting &&
      state.value.selectedQuestionIds.length >= 1,
  )

  /** True once Sarah a décidé de réaliser (ou checks persistés pour compat). */
  const feasibilityComplete = computed(() => {
    if (state.value.canRealize) return true
    const checks = state.value.feasibilityConfirmed
    const allChecked = FEASIBILITY_CHECKS.every((c) => checks[c.id])
    return allChecked && state.value.lightTension
  })

  /** Décision seule — plus besoin de cocher les preuves. */
  const canConfirmRealize = computed(
    () => canPrepareProposal.value && !state.value.canRealize,
  )

  const canSendProposal = computed(
    () =>
      state.value.canRealize &&
      state.value.mechesIncluded &&
      state.value.offerReviewed &&
      !hasFirmProposal.value,
  )

  const sarahChecklistComplete = computed(() =>
    SARAH_CHECKLIST.every((c) => state.value.sarahChecklist[c.id]),
  )

  const canConfirmSarahPrep = computed(
    () =>
      isCommitted.value &&
      readinessPending.value &&
      sarahChecklistComplete.value &&
      !state.value.sarahPrepConfirmed,
  )

  const canContinueDemo = computed(
    () => isReady.value && !state.value.dayJAdvanced,
  )

  const isInProgress = computed(
    () => state.value.executionStatus === ExecutionStatus.IN_PROGRESS,
  )
  const isCompleted = computed(
    () => state.value.executionStatus === ExecutionStatus.COMPLETED,
  )
  const isSettled = computed(
    () => state.value.settlementStatus === SettlementStatus.SETTLED,
  )
  const isV2 = computed(() => state.value.engagementVersion === EngagementVersion.V2)
  const settlementSequenceRunning = computed(
    () => state.value.settlementSequencePhase === 'running',
  )
  const settlementSequenceDone = computed(
    () =>
      state.value.settlementSequencePhase === 'done' ||
      state.value.settlementStatus === SettlementStatus.SETTLED,
  )
  const hasReviewReply = computed(() => !!state.value.reviewReplied)
  const platformFee = computed(() => rail.value.platformFee)
  const netRevenue = computed(() => rail.value.netRevenue)
  const modificationSequenceRunning = computed(
    () => state.value.modificationSequencePhase === 'running',
  )
  const modificationSequenceDone = computed(
    () =>
      state.value.modificationSequencePhase === 'done' ||
      state.value.engagementVersion === EngagementVersion.V2,
  )

  const activePrice = computed(() =>
    isV2.value ? rail.value.priceTotalV2 : rail.value.priceTotal,
  )
  const activeDuration = computed(() =>
    isV2.value ? rail.value.durationLabelV2 : rail.value.durationLabel,
  )
  const balancePreview = computed(() => activePrice.value - rail.value.deposit)

  const canComposeModification = computed(
    () =>
      isInProgress.value &&
      state.value.pearlsEventHandled &&
      !state.value.modificationRefused &&
      !isV2.value &&
      state.value.modificationSequencePhase === 'idle',
  )

  const canRequestModification = computed(() => {
    if (!canComposeModification.value) return false
    const supp = SUPPLEMENT_OPTIONS.find((o) => o.id === state.value.selectedSupplementId)
    const dur = EXTRA_DURATION_OPTIONS.find(
      (o) => o.id === state.value.selectedExtraDurationId,
    )
    return !!(supp?.rail && dur?.rail)
  })

  const canResumeAfterV2 = computed(
    () => isV2.value && !state.value.serviceResumedAfterV2 && !isCompleted.value,
  )

  const canQualifyCompletion = computed(
    () =>
      isInProgress.value &&
      isV2.value &&
      state.value.serviceResumedAfterV2 &&
      !isCompleted.value,
  )

  const cardSummary = computed(() => ({
    title: `${rail.value.clientName} — ${rail.value.prestationLabel}`,
    slot: `${rail.value.dateLabel} à ${rail.value.timeLabel} · ${rail.value.place}`,
    budget: `Budget maximum : ${rail.value.budgetMax} €`,
  }))

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  }

  function pushTimeline(entry) {
    state.value.timeline = [
      ...state.value.timeline,
      { id: `t-${state.value.timeline.length + 1}`, at: nowLabel(), ...entry },
    ]
  }

  /** Injection déterministe au déclencheur SCHEDULE_ACTIVE. */
  function ensureInesInjected() {
    if (state.value.proposalStatus === ProposalStatus.FIRM) return false
    if (state.value.engagementStatus === EngagementStatus.COMMITTED) return false
    if (state.value.injected && state.value.invitationStatus !== InvitationStatus.NONE) {
      return false
    }

    state.value = {
      ...createEmptyOpportunity(),
      injected: true,
      demandStatus: DemandStatus.QUALIFIED,
      invitationStatus: InvitationStatus.ACTIVE,
      timeline: [
        {
          id: 't-1',
          at: nowLabel(),
          label: 'Invitation reçue',
          detail: 'Demande qualifiée d’Inès adressée suite à l’activation du planning.',
        },
      ],
    }
    persist()
    notifySimulation('Inès a envoyé une demande')
    return true
  }

  /** Pose l’état absolu (évite le désync :checked natif ↔ toggle). */
  function setQuestionSelected(id, selected) {
    if (state.value.clarificationSent || state.value.clarificationWaiting) return
    if (!CLARIFICATION_QUESTIONS.some((q) => q.id === id)) return

    const next = new Set(state.value.selectedQuestionIds)
    if (selected) next.add(id)
    else next.delete(id)

    state.value.selectedQuestionIds = CLARIFICATION_QUESTIONS.map((q) => q.id).filter((qid) =>
      next.has(qid),
    )
    persist()
  }

  function toggleQuestion(id) {
    setQuestionSelected(id, !state.value.selectedQuestionIds.includes(id))
  }

  /**
   * Simulateur déterministe : mêmes questions → mêmes réponses.
   * Affiche une attente courte puis enrichit le dossier.
   */
  function sendClarification() {
    if (!canSendClarification.value) return false
    state.value.clarificationWaiting = true
    persist()

    const selected = CLARIFICATION_QUESTIONS.filter((q) =>
      state.value.selectedQuestionIds.includes(q.id),
    )
    const responseLines = selected.map((q) => q.response)

    // Micro-délai UI pour « Inès consulte… » (déterministe, non aléatoire).
    window.setTimeout(() => {
      state.value.clarificationWaiting = false
      state.value.clarificationSent = true
      state.value.hasRecentPhoto = true
      state.value.demandStatus = DemandStatus.ENRICHED
      pushTimeline({
        label: 'Précision demandée',
        detail: selected.map((q) => q.label).join(' · '),
      })
      pushTimeline({
        label: 'Réponse d’Inès',
        detail: responseLines.join(' '),
        photoAttached: true,
      })
      persist()
      notifySimulation('Inès vous a répondu')
      window.setTimeout(() => {
        notifySimulation('Inès a envoyé la photo')
      }, 400)
    }, 900)

    return true
  }

  function refuse(reasonId, { fromFeasibility = false } = {}) {
    if (!reasonId || hasFirmProposal.value) return false
    if (state.value.invitationStatus === InvitationStatus.REFUSED) return false

    state.value.snapshotBeforeRefuse = {
      demandStatus: state.value.demandStatus,
      invitationStatus: state.value.invitationStatus,
      hasRecentPhoto: state.value.hasRecentPhoto,
      clarificationSent: state.value.clarificationSent,
      selectedQuestionIds: [...state.value.selectedQuestionIds],
      timeline: state.value.timeline.map((t) => ({ ...t })),
      feasibilityConfirmed: { ...state.value.feasibilityConfirmed },
      lightTension: state.value.lightTension,
      canRealize: state.value.canRealize,
      mechesIncluded: state.value.mechesIncluded,
      offerReviewed: state.value.offerReviewed,
      proposalStatus: state.value.proposalStatus,
    }
    state.value.refusalReasonId = reasonId
    state.value.refusedAtFeasibility = fromFeasibility
    state.value.invitationStatus = InvitationStatus.REFUSED
    state.value.canRealize = false
    pushTimeline({
      label: fromFeasibility ? 'Refus technique' : 'Demande refusée',
      detail: 'Aucune proposition envoyée.',
    })
    persist()
    notifyError(
      fromFeasibility
        ? 'Refus technique enregistré — aucune proposition composée'
        : 'Demande refusée — aucune proposition envoyée',
    )
    return true
  }

  function recoverInes() {
    const snap = state.value.snapshotBeforeRefuse
    if (!snap) {
      // Reprise minimale si snapshot absent
      state.value.invitationStatus = InvitationStatus.ACTIVE
      state.value.refusalReasonId = null
      state.value.refusedAtFeasibility = false
      persist()
      return true
    }
    state.value = {
      ...state.value,
      ...snap,
      invitationStatus: InvitationStatus.ACTIVE,
      refusalReasonId: null,
      refusedAtFeasibility: false,
      snapshotBeforeRefuse: null,
    }
    pushTimeline({
      label: 'Dossier Inès repris',
      detail: 'Récupération démo — invitation restaurée.',
    })
    persist()
    return true
  }

  function setFeasibilityCheck(id, value) {
    if (!canPrepareProposal.value || state.value.canRealize) return
    state.value.feasibilityConfirmed = {
      ...state.value.feasibilityConfirmed,
      [id]: !!value,
    }
    persist()
  }

  function setLightTension(value) {
    if (!canPrepareProposal.value || state.value.canRealize) return
    state.value.lightTension = !!value
    persist()
  }

  function confirmRealize() {
    if (!canConfirmRealize.value) return false
    state.value.canRealize = true
    state.value.lightTension = true
    state.value.feasibilityConfirmed = Object.fromEntries(
      FEASIBILITY_CHECKS.map((c) => [c.id, true]),
    )
    state.value.proposalStatus = ProposalStatus.DRAFT
    state.value.mechesIncluded = true
    persist()
    notifySuccess('Faisabilité validée — vous réalisez (tension légère)')
    return true
  }

  function setMechesIncluded(value) {
    if (!state.value.canRealize || hasFirmProposal.value) return
    state.value.mechesIncluded = !!value
    persist()
  }

  function setOfferReviewed(value) {
    if (!state.value.canRealize || hasFirmProposal.value) return
    state.value.offerReviewed = !!value
    persist()
  }

  function sendFirmProposal() {
    if (!canSendProposal.value) return false
    state.value.proposalStatus = ProposalStatus.FIRM
    state.value.softHoldStatus = SoftHoldStatus.ACTIVE
    state.value.invitationStatus = InvitationStatus.CONVERTED
    state.value.firmProposalSentAt = new Date().toISOString()
    state.value.softHoldUntilLabel = `${rail.value.validityMinutes} min`
    pushTimeline({
      label: 'Proposition ferme envoyée',
      detail: `${rail.value.priceTotal} € · acompte ${rail.value.deposit} € · ${rail.value.dateLabel} ${rail.value.timeLabel}`,
    })
    pushTimeline({
      label: 'Créneau en réserve temporaire',
      detail: `SOFT_HOLD · validité ${rail.value.validityMinutes} minutes`,
    })
    persist()
    notifySuccess(
      `Proposition ferme envoyée — ${rail.value.priceTotal} € · acompte ${rail.value.deposit} €`,
    )
    return true
  }

  /**
   * Séquence visible Inès (C2) : accepte → consent → paie → COMMITTED.
   * Idempotent si déjà COMMITTED.
   */
  function startEngagementSequence() {
    if (!hasFirmProposal.value) return false
    if (state.value.engagementStatus === EngagementStatus.COMMITTED) {
      state.value.engagementSequencePhase = 'done'
      persist()
      return true
    }
    if (state.value.engagementSequencePhase === 'running') return false

    state.value.engagementSequencePhase = 'running'
    state.value.engagementSequenceStep = 0
    persist()

    const stepMs = 850
    const engagementToasts = [
      'Inès a accepté la proposition',
      'Inès a consenti aux règles',
      'Inès a payé l’acompte',
    ]
    ENGAGEMENT_SEQUENCE.forEach((_, index) => {
      window.setTimeout(() => {
        if (state.value.engagementSequencePhase !== 'running') return
        state.value.engagementSequenceStep = index
        persist()
        if (engagementToasts[index]) notifySimulation(engagementToasts[index])
      }, index * stepMs)
    })

    window.setTimeout(() => {
      if (state.value.engagementSequencePhase !== 'running') return
      finalizeCommitment()
    }, ENGAGEMENT_SEQUENCE.length * stepMs + 200)

    return true
  }

  function finalizeCommitment() {
    if (state.value.engagementStatus === EngagementStatus.COMMITTED) return

    const at = nowLabel()
    state.value.engagementStatus = EngagementStatus.COMMITTED
    state.value.readinessStatus = ReadinessStatus.PENDING
    state.value.softHoldStatus = SoftHoldStatus.NONE
    state.value.softHoldUntilLabel = null
    state.value.engagementSequencePhase = 'done'
    state.value.engagementSequenceStep = ENGAGEMENT_SEQUENCE.length - 1
    state.value.committedAtLabel = at
    state.value.consentAtLabel = at
    state.value.paymentAtLabel = at
    state.value.paymentRef = `PAY-INES-${Date.now().toString(36).toUpperCase().slice(-8)}`
    pushTimeline({
      label: 'Proposition acceptée',
      detail: 'Inès a accepté la proposition V1.',
    })
    pushTimeline({
      label: 'Consentement enregistré',
      detail: 'Règles de retard, annulation, préparation et pause.',
    })
    pushTimeline({
      label: 'Versement initial reçu',
      detail: `${rail.value.deposit} € · solde prévisionnel ${rail.value.priceTotal - rail.value.deposit} €`,
    })
    pushTimeline({
      label: 'Rendez-vous confirmé',
      detail: `COMMITTED · ${rail.value.dateLabel} ${rail.value.timeLabel}`,
    })
    pushTimeline({
      label: 'Checklists de préparation créées',
      detail: 'READINESS_PENDING',
    })
    persist()
  }

  function setSarahCheck(id, value) {
    if (!isCommitted.value || state.value.sarahPrepConfirmed) return
    if (!SARAH_CHECKLIST.some((c) => c.id === id)) return
    state.value.sarahChecklist = {
      ...state.value.sarahChecklist,
      [id]: !!value,
    }
    persist()
  }

  function checkAllSarah() {
    if (!isCommitted.value || state.value.sarahPrepConfirmed) return
    state.value.sarahChecklist = Object.fromEntries(SARAH_CHECKLIST.map((c) => [c.id, true]))
    persist()
  }

  /** Confirme la préparation Sarah puis remplit la checklist Inès (C4). */
  function confirmSarahPrep() {
    if (!canConfirmSarahPrep.value) return false
    state.value.sarahPrepConfirmed = true
    state.value.inesPrepFilling = true
    pushTimeline({
      label: 'Préparation confirmée',
      detail: 'Checklist coiffeuse complète.',
    })
    persist()

    const stepMs = 420
    INES_CHECKLIST.forEach((item, index) => {
      window.setTimeout(() => {
        if (!state.value.sarahPrepConfirmed) return
        state.value.inesChecklist = {
          ...state.value.inesChecklist,
          [item.id]: true,
        }
        persist()
      }, (index + 1) * stepMs)
    })

    window.setTimeout(() => {
      if (!state.value.sarahPrepConfirmed) return
      state.value.inesPrepFilling = false
      state.value.inesPrepConfirmed = true
      state.value.readinessStatus = ReadinessStatus.READY
      pushTimeline({
        label: 'Préparation Inès confirmée',
        detail: 'Checklist cliente complète (simulateur).',
      })
      pushTimeline({
        label: 'Rendez-vous prêt',
        detail: 'READY — toutes les conditions nécessaires sont satisfaites.',
      })
      persist()
      notifySimulation('Inès a confirmé sa checklist')
    }, INES_CHECKLIST.length * stepMs + 280)

    return true
  }

  /** Compression temps explicite (C5) → seuil Acte D. */
  function continueDemoToDayJ() {
    if (!canContinueDemo.value) return false
    state.value.dayJAdvanced = true
    pushTimeline({
      label: 'Compression démo',
      detail: 'Avance au jour J — dossier du jour disponible.',
    })
    persist()
    return true
  }

  /** Écran 12 → démarrage prestation (D). */
  function startService() {
    if (!state.value.dayJAdvanced || !isReady.value) return false
    if (state.value.executionStatus !== ExecutionStatus.NONE) return false

    state.value.executionStatus = ExecutionStatus.IN_PROGRESS
    state.value.startedAtLabel = rail.value.startTimeLabel
    state.value.pearlsEventOpen = false
    state.value.pearlsEventHandled = false
    pushTimeline({
      label: 'Prestation démarrée',
      detail: `IN_PROGRESS · début ${rail.value.startTimeLabel}`,
    })
    persist()

    // Événement perles immersif après le démarrage (D1).
    window.setTimeout(() => {
      if (state.value.executionStatus !== ExecutionStatus.IN_PROGRESS) return
      if (state.value.pearlsEventHandled || isV2.value) return
      state.value.pearlsEventOpen = true
      pushTimeline({
        label: 'Demande de modification',
        detail: `${rail.value.clientName} demande l’ajout de perles.`,
      })
      persist()
      notifySimulation('Inès demande l’ajout de perles')
    }, 700)

    return true
  }

  function openPearlsEvent() {
    if (!isInProgress.value || isV2.value || state.value.modificationRefused) return
    state.value.pearlsEventOpen = true
    persist()
  }

  function closePearlsEvent() {
    state.value.pearlsEventOpen = false
    persist()
  }

  /** D1 — évaluer la modification → composition. */
  function evaluateModification() {
    if (!isInProgress.value || isV2.value) return false
    state.value.pearlsEventOpen = false
    state.value.pearlsEventHandled = true
    state.value.modificationRefused = false
    state.value.modificationRefusalReasonId = null
    state.value.selectedSupplementId = null
    state.value.selectedExtraDurationId = null
    state.value.selectedMotifId = 'option'
    state.value.modificationSequencePhase = 'idle'
    state.value.modificationSequenceStep = -1
    persist()
    return true
  }

  /** D1 — refuser (récupérable). */
  function refuseModification(reasonId) {
    if (!reasonId || !isInProgress.value || isV2.value) return false
    state.value.pearlsEventOpen = false
    state.value.pearlsEventHandled = true
    state.value.modificationRefused = true
    state.value.modificationRefusalReasonId = reasonId
    pushTimeline({
      label: 'Modification refusée',
      detail: 'V1 inchangée — récupération démo disponible.',
    })
    persist()
    return true
  }

  function recoverModificationEvaluation() {
    if (!state.value.modificationRefused || isV2.value) return false
    state.value.modificationRefused = false
    state.value.modificationRefusalReasonId = null
    state.value.pearlsEventHandled = false
    state.value.pearlsEventOpen = true
    pushTimeline({
      label: 'Évaluation reprise',
      detail: 'Récupération démo — événement perles réouvert.',
    })
    persist()
    return true
  }

  function setSupplement(id) {
    if (!canComposeModification.value) return
    const opt = SUPPLEMENT_OPTIONS.find((o) => o.id === id)
    if (!opt || !opt.rail) return
    state.value.selectedSupplementId = id
    persist()
  }

  function setExtraDuration(id) {
    if (!canComposeModification.value) return
    const opt = EXTRA_DURATION_OPTIONS.find((o) => o.id === id)
    if (!opt || !opt.rail) return
    state.value.selectedExtraDurationId = id
    persist()
  }

  function setMotif(id) {
    if (!canComposeModification.value) return
    state.value.selectedMotifId = id
    persist()
  }

  /**
   * D2/D3 — demander l’accord Inès → séquence visible → V2.
   */
  function requestModificationAgreement() {
    if (!canRequestModification.value) return false
    if (state.value.modificationSequencePhase === 'running') return false

    state.value.modificationSequencePhase = 'running'
    state.value.modificationSequenceStep = 0
    pushTimeline({
      label: 'Proposition de modification envoyée',
      detail: `+${rail.value.modificationSupplement} € · +${rail.value.modificationMinutes} min · total ${rail.value.priceTotalV2} €`,
    })
    persist()

    const stepMs = 850
    const modificationToasts = [
      'Inès consulte la modification',
      'Inès a accepté la modification',
    ]
    MODIFICATION_SEQUENCE.forEach((_, index) => {
      window.setTimeout(() => {
        if (state.value.modificationSequencePhase !== 'running') return
        state.value.modificationSequenceStep = index
        persist()
        if (modificationToasts[index]) notifySimulation(modificationToasts[index])
      }, index * stepMs)
    })

    window.setTimeout(() => {
      if (state.value.modificationSequencePhase !== 'running') return
      finalizeModificationV2()
    }, MODIFICATION_SEQUENCE.length * stepMs + 200)

    return true
  }

  function finalizeModificationV2() {
    if (state.value.engagementVersion === EngagementVersion.V2) return

    state.value.engagementVersion = EngagementVersion.V2
    state.value.modificationSequencePhase = 'done'
    state.value.modificationSequenceStep = MODIFICATION_SEQUENCE.length - 1
    state.value.modificationAcceptedAtLabel = rail.value.modificationAcceptedAt
    pushTimeline({
      label: 'Modification acceptée',
      detail: `Engagement V2 actif · ${rail.value.modificationAcceptedAt}`,
    })
    pushTimeline({
      label: 'Preuves V1 / V2 conservées',
      detail: `Total ${rail.value.priceTotalV2} € · durée ${rail.value.durationLabelV2}`,
    })
    persist()
  }

  function resumeServiceAfterV2() {
    if (!canResumeAfterV2.value) return false
    state.value.serviceResumedAfterV2 = true
    pushTimeline({
      label: 'Prestation reprise',
      detail: `Totaux V2 · ${rail.value.priceTotalV2} € · ${rail.value.durationLabelV2}`,
    })
    persist()
    return true
  }

  /** D4 — qualification de fin. */
  function qualifyCompletion(choiceId) {
    if (!canQualifyCompletion.value) return false
    if (choiceId !== 'full') {
      state.value.completionChoiceId = choiceId
      persist()
      return false
    }
    state.value.completionChoiceId = 'full'
    state.value.executionStatus = ExecutionStatus.COMPLETED
    state.value.completedAtLabel = nowLabel()
    pushTimeline({
      label: 'Prestation terminée',
      detail: `COMPLETED · ${rail.value.priceTotalV2} € · ${rail.value.durationLabelV2}`,
    })
    persist()
    return true
  }

  function recoverFullCompletion() {
    if (isCompleted.value || !canQualifyCompletion.value) return false
    return qualifyCompletion('full')
  }

  /** Écran 16 — séquence règlement visible (E1). */
  function startSettlementSequence() {
    if (!isCompleted.value) return false
    if (state.value.settlementStatus === SettlementStatus.SETTLED) {
      state.value.settlementSequencePhase = 'done'
      persist()
      return true
    }
    if (state.value.settlementSequencePhase === 'running') return false

    state.value.settlementSequencePhase = 'running'
    state.value.settlementSequenceStep = 0
    persist()

    const stepMs = 850
    SETTLEMENT_SEQUENCE.forEach((step, index) => {
      window.setTimeout(() => {
        if (state.value.settlementSequencePhase !== 'running') return
        state.value.settlementSequenceStep = index
        persist()
        if (step.id === 'pay') {
          notifySimulation('Inès a réglé le solde')
        }
      }, index * stepMs)
    })

    window.setTimeout(() => {
      if (state.value.settlementSequencePhase !== 'running') return
      finalizeSettlement()
    }, SETTLEMENT_SEQUENCE.length * stepMs + 200)

    return true
  }

  function finalizeSettlement() {
    if (state.value.settlementStatus === SettlementStatus.SETTLED) return

    const at = nowLabel()
    state.value.settlementStatus = SettlementStatus.SETTLED
    state.value.settlementSequencePhase = 'done'
    state.value.settlementSequenceStep = SETTLEMENT_SEQUENCE.length - 1
    state.value.settledAtLabel = at
    state.value.finalPaymentAtLabel = at
    state.value.finalPaymentRef = `PAY-FINAL-${Date.now().toString(36).toUpperCase().slice(-8)}`
    pushTimeline({
      label: 'Versement initial imputé',
      detail: `${rail.value.deposit} € sur total ${rail.value.priceTotalV2} €`,
    })
    pushTimeline({
      label: 'Solde réglé',
      detail: `${rail.value.balanceFinal} € · payé par Inès`,
    })
    pushTimeline({
      label: 'Règlement terminé',
      detail: `SETTLED · net ${rail.value.netRevenue} € (frais ${rail.value.platformFee} €)`,
    })
    pushTimeline({
      label: 'Avis publié',
      detail: 'Avis vérifié d’Inès disponible.',
    })
    persist()
    notifySimulation('Inès a laissé un avis')
  }

  function selectReviewTone(toneId) {
    if (!isSettled.value || state.value.reviewReplied) return false
    const tone = REVIEW_TONES.find((t) => t.id === toneId)
    if (!tone) return false
    state.value.reviewReplyToneId = toneId
    state.value.reviewReplyText = tone.template
    persist()
    return true
  }

  function setReviewReplyText(value) {
    if (!isSettled.value || state.value.reviewReplied) return
    const trimmed = String(value || '').slice(0, REVIEW_REPLY_MAX)
    state.value.reviewReplyText = trimmed
    persist()
  }

  function sendReviewReply() {
    if (!isSettled.value || state.value.reviewReplied) return false
    if (!state.value.reviewReplyToneId) return false
    const text = String(state.value.reviewReplyText || '').trim()
    if (!text) return false

    state.value.reviewReplyText = text.slice(0, REVIEW_REPLY_MAX)
    state.value.reviewReplied = true
    state.value.reviewRepliedAtLabel = nowLabel()
    pushTimeline({
      label: 'Réponse à l’avis envoyée',
      detail: `Ton · ${REVIEW_TONES.find((t) => t.id === state.value.reviewReplyToneId)?.label || '—'}`,
    })
    persist()
    return true
  }

  function acknowledgeFavorite() {
    if (!isSettled.value) return false
    state.value.favoriteAcknowledged = true
    pushTimeline({
      label: 'Relation constatée',
      detail: 'Inès vous a ajoutée à ses favorites · préférences mémorisées.',
    })
    persist()
    return true
  }

  function reset() {
    state.value = createEmptyOpportunity()
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    state,
    rail,
    isInjected,
    invitationActive,
    invitationRefused,
    isEnriched,
    hasFirmProposal,
    softHoldActive,
    isCommitted,
    isReady,
    readinessPending,
    engagementSequenceRunning,
    engagementSequenceDone,
    isInProgress,
    isCompleted,
    isSettled,
    isV2,
    modificationSequenceRunning,
    modificationSequenceDone,
    settlementSequenceRunning,
    settlementSequenceDone,
    hasReviewReply,
    activePrice,
    activeDuration,
    platformFee,
    netRevenue,
    canComposeModification,
    canRequestModification,
    canResumeAfterV2,
    canQualifyCompletion,
    missingPhotoAlert,
    canPrepareProposal,
    canSendClarification,
    feasibilityComplete,
    canConfirmRealize,
    canSendProposal,
    sarahChecklistComplete,
    canConfirmSarahPrep,
    canContinueDemo,
    cardSummary,
    balancePreview,
    ensureInesInjected,
    setQuestionSelected,
    toggleQuestion,
    sendClarification,
    refuse,
    recoverInes,
    setFeasibilityCheck,
    setLightTension,
    confirmRealize,
    setMechesIncluded,
    setOfferReviewed,
    sendFirmProposal,
    startEngagementSequence,
    setSarahCheck,
    checkAllSarah,
    confirmSarahPrep,
    continueDemoToDayJ,
    startService,
    openPearlsEvent,
    closePearlsEvent,
    evaluateModification,
    refuseModification,
    recoverModificationEvaluation,
    setSupplement,
    setExtraDuration,
    setMotif,
    requestModificationAgreement,
    resumeServiceAfterV2,
    qualifyCompletion,
    recoverFullCompletion,
    startSettlementSequence,
    selectReviewTone,
    setReviewReplyText,
    sendReviewReply,
    acknowledgeFavorite,
    reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOpportunityStore, import.meta.hot))
}
