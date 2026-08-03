export const FrameworkStatus = {
  NONE: 'NONE',
  DRAFT: 'PROFESSIONAL_FRAMEWORK_DRAFT',
  ACTIVE: 'PROFESSIONAL_FRAMEWORK_ACTIVE',
}

export const OfferStatus = {
  NONE: 'NONE',
  DRAFT: 'OFFER_DRAFT',
  ACTIVE: 'OFFER_ACTIVE',
}

export const ScheduleStatus = {
  NONE: 'NONE',
  DRAFT: 'SCHEDULE_DRAFT',
  ACTIVE: 'SCHEDULE_ACTIVE',
}

/** Acte B — demande / invitation / proposition (rail Inès). */
export const DemandStatus = {
  NONE: 'NONE',
  QUALIFIED: 'DEMAND_QUALIFIED',
  ENRICHED: 'DEMAND_ENRICHED',
}

export const InvitationStatus = {
  NONE: 'NONE',
  ACTIVE: 'INVITATION_ACTIVE',
  REFUSED: 'INVITATION_REFUSED',
  CONVERTED: 'INVITATION_CONVERTED',
}

export const ProposalStatus = {
  NONE: 'NONE',
  DRAFT: 'PROPOSAL_DRAFT',
  FIRM: 'FIRM_PROPOSAL',
}

export const SoftHoldStatus = {
  NONE: 'NONE',
  ACTIVE: 'SOFT_HOLD',
}

/** Acte C — engagement formé + préparation RDV. */
export const EngagementStatus = {
  NONE: 'NONE',
  COMMITTED: 'COMMITTED',
}

export const ReadinessStatus = {
  NONE: 'NONE',
  PENDING: 'READINESS_PENDING',
  READY: 'READY',
}

/** Acte D — réalisation + modification V2. */
export const ExecutionStatus = {
  NONE: 'NONE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
}

/** Acte E — règlement final. */
export const SettlementStatus = {
  NONE: 'NONE',
  SETTLED: 'SETTLED',
}

export const EngagementVersion = {
  V1: 'V1',
  V2: 'V2',
}

/** Séquence simulateur Inès (écran 10) — déterministe, non pilotée par Sarah. */
export const ENGAGEMENT_SEQUENCE = [
  {
    id: 'accept',
    label: 'Inès accepte la proposition V1',
    detail: 'Offre ferme reçue et acceptée telle quelle.',
  },
  {
    id: 'consent',
    label: 'Inès consent aux règles',
    detail: 'Retard, annulation, préparation et pause du cadre.',
  },
  {
    id: 'payment',
    label: 'Versement initial de 50 € reçu',
    detail: 'Acompte imputé sur le total convenu.',
  },
]

export const SARAH_CHECKLIST = [
  { id: 'meches', label: 'Mèches disponibles' },
  { id: 'materiel', label: 'Matériel préparé' },
  { id: 'poste', label: 'Poste de travail disponible' },
  {
    id: 'consignes',
    label: 'Consignes particulières consultées',
    detail: 'Cuir chevelu sensible · tension légère',
    hasSheet: true,
  },
]

export const INES_CHECKLIST = [
  { id: 'laves', label: 'Cheveux lavés' },
  { id: 'demesles', label: 'Cheveux démêlés' },
  { id: 'adresse', label: 'Adresse et accès consultés' },
  { id: 'reconfirme', label: 'Rendez-vous reconfirmé' },
]

/** Séquence simulateur modification (écran 14) — déterministe. */
export const MODIFICATION_SEQUENCE = [
  {
    id: 'consult',
    label: 'Inès consulte la proposition de modification',
    detail: 'Ajout de perles · conséquences prix et durée.',
  },
  {
    id: 'accept',
    label: 'Inès accepte la modification (+10 € · +20 min)',
    detail: 'Consentement explicite — engagement V2.',
  },
]

/** Rail démo Inès — valeurs figées (storyboard cible Acte B). */
export const INES_RAIL = {
  clientName: 'Inès',
  clientAge: 27,
  prestationLabel: 'Knotless braids medium',
  lengthId: 'mi-dos',
  lengthLabel: 'Mi-dos',
  hairType: 'Cheveux naturels crépus',
  scalp: 'Cuir chevelu sensible',
  dateLabel: 'Samedi 15 août',
  timeLabel: '9 h',
  arrivalLabel: '8 h 57',
  place: 'Saint-Denis',
  budgetTarget: 170,
  budgetMax: 180,
  priceBase: 150,
  mechesAmount: 20,
  priceTotal: 170,
  deposit: 50,
  durationLabel: '5 h 30',
  validityMinutes: 30,
  clientTasks: 'Cheveux lavés et démêlés',
  proTasks: 'Fournir les mèches et le matériel',
  priority: 'Confort et faible tension',
  supplies: 'Mèches souhaitées auprès de la coiffeuse',
  inspirationLabel: 'Inspiration knotless mi-dos',
  /** Rail Acte D — modification perles (V2). */
  pearlsLabel: 'Ajout de perles',
  modificationSupplement: 10,
  modificationMinutes: 20,
  priceTotalV2: 180,
  durationLabelV2: '5 h 50',
  modificationAcceptedAt: '11 h 18',
  startTimeLabel: '9 h 02',
  /** Rail Acte E — règlement & revenu. */
  balanceFinal: 130,
  platformFeeRate: 0.1,
  platformFee: 18,
  netRevenue: 162,
}

/** Micro-choix composition V2 — hors-rail désactivé. */
export const SUPPLEMENT_OPTIONS = [
  { id: '5', amount: 5, label: '+5 €', rail: false },
  { id: '10', amount: 10, label: '+10 €', rail: true },
  { id: '15', amount: 15, label: '+15 €', rail: false },
]

export const EXTRA_DURATION_OPTIONS = [
  { id: '10', minutes: 10, label: '+10 min', rail: false },
  { id: '20', minutes: 20, label: '+20 min', rail: true },
  { id: '30', minutes: 30, label: '+30 min', rail: false },
]

export const MODIFICATION_MOTIFS = [
  { id: 'option', label: 'Option demandée pendant la prestation' },
  { id: 'confort', label: 'Confort / finition demandée' },
  { id: 'autre', label: 'Autre motif', disabled: true },
]

export const MODIFICATION_REFUSAL_REASONS = [
  { id: 'temps', label: 'Temps insuffisant' },
  { id: 'materiel', label: 'Matériel non disponible' },
  { id: 'tarif', label: 'Tarif non négociable aujourd’hui' },
  { id: 'autre', label: 'Autre motif' },
]

export const COMPLETION_OPTIONS = [
  {
    id: 'full',
    label: 'Prestation réalisée intégralement',
    rail: true,
    detail: 'Clôture normale — engagement V2 honoré.',
  },
  {
    id: 'partial',
    label: 'Prestation réalisée partiellement',
    rail: false,
    detail: 'Clôture partielle — récupération démo disponible.',
  },
  {
    id: 'resolution',
    label: 'Déclencher une résolution',
    rail: false,
    detail: 'Protocole incident — hors cadre de la démo.',
  },
]

/** Séquence simulateur règlement (écran 16) — déterministe. */
export const SETTLEMENT_SEQUENCE = [
  {
    id: 'impute',
    label: 'Imputation du versement initial de 50 €',
    detail: 'Acompte déjà reçu, imputé sur le total V2.',
  },
  {
    id: 'balance',
    label: 'Solde dû : 130 €',
    detail: 'Total 180 € − versement initial 50 €.',
  },
  {
    id: 'pay',
    label: 'Inès règle les 130 €',
    detail: 'Paiement final via la plateforme.',
  },
]

/** Avis Inès déterministe (écran 17). */
export const INES_REVIEW = {
  dimensions: [
    { id: 'technique', label: 'Résultat technique', score: 5 },
    { id: 'communication', label: 'Communication', score: 5 },
    { id: 'ponctualite', label: 'Ponctualité', score: 5 },
    { id: 'prix', label: 'Conformité du prix', score: 5 },
    { id: 'confort', label: 'Confort', score: 4 },
    { id: 'modifications', label: 'Résolution des modifications', score: 5 },
  ],
  comment:
    'Sarah a bien pris en compte mon cuir chevelu sensible et m’a expliqué le supplément avant d’ajouter les perles.',
}

export const REVIEW_TONES = [
  {
    id: 'warm',
    label: 'Remerciement chaleureux',
    suggested: true,
    template:
      'Merci Inès — ravie que le confort et la transparence sur les perles aient compté. À bientôt !',
  },
  {
    id: 'pro',
    label: 'Professionnel',
    suggested: false,
    template: 'Merci pour votre avis. Au plaisir de vous accueillir de nouveau.',
  },
  {
    id: 'short',
    label: 'Court',
    suggested: false,
    template: 'Merci pour votre retour, Inès.',
  },
]

export const REVIEW_REPLY_MAX = 280

/** Préférences mémorisées Inès — lecture seule (E3). */
export const INES_MEMORIZED_PREFS = [
  'Cuir chevelu sensible',
  'Tension légère',
  'Mi-dos + mèches fournies',
  'Knotless braids medium',
]

export const CLARIFICATION_QUESTIONS = [
  {
    id: 'photo',
    label: 'Photo récente des cheveux',
    required: true,
    response: 'Voici une photo récente.',
  },
  {
    id: 'chimique',
    label: 'Date du dernier traitement chimique',
    required: true,
    response: 'Je n’ai pas fait de défrisage depuis huit mois.',
  },
  {
    id: 'allergies',
    label: 'Allergies produits (complémentaire)',
    required: false,
    response: 'Aucune allergie connue.',
  },
]

export const REFUSAL_REASONS = [
  { id: 'creneau', label: 'Créneau incompatible' },
  { id: 'budget', label: 'Budget incompatible' },
  { id: 'technique', label: 'Technique / faisabilité' },
  { id: 'autre', label: 'Autre motif' },
]

export const MATCH_CRITERIA = [
  'Offre correspondante (knotless medium · mi-dos)',
  'Créneau dérivé du planning (15 août · 9 h)',
  'Zone compatible (Saint-Denis)',
  'Budget compatible (max. 180 €)',
  'Cuir chevelu sensible accepté (tension légère)',
]

export const FEASIBILITY_CHECKS = [
  { id: 'photo', label: 'Photo récente reçue' },
  { id: 'chimique', label: 'Pas de défrisage depuis 8 mois' },
  { id: 'texture', label: 'Texture crépue confirmée' },
]

export const CONTEXT_OPTIONS = [
  { id: 'salon', label: 'En salon' },
  { id: 'chez-moi', label: 'Chez moi' },
  { id: 'deplacement', label: 'En déplacement' },
]

export const PAUSE_OPTIONS = [
  { id: 'aucune', label: 'Aucune', detail: 'Pas de pause prévue par défaut' },
  { id: '5min', label: '5 min / h', detail: '5 minutes toutes les heures' },
  { id: '10min', label: '10 min / h', detail: '10 minutes toutes les heures' },
  { id: 'perso', label: 'Personnaliser', detail: 'À préciser plus tard' },
]

export const CHANNEL_OPTIONS = [
  { id: 'plateforme', label: 'Via la plateforme' },
  { id: 'instagram', label: 'Instagram (Insta)' },
  { id: 'tiktok', label: 'TikTok' },
]

export const PAYMENT_OPTIONS = [
  { id: 'carte', label: 'Carte' },
  { id: 'plateforme', label: 'Paiement via la plateforme' },
  { id: 'especes', label: 'Espèces' },
  { id: 'virement', label: 'Virement' },
]

export const CANCELLATION_OPTIONS = [
  { id: 'selon-delai', label: 'Définir ses règles d’annulation' },
  { id: '24h', label: 'Annulation gratuite jusqu’à 24 h avant' },
  { id: '48h', label: 'Annulation gratuite jusqu’à 48 h avant' },
]

export const SIZE_OPTIONS = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
]

export const SERVICE_LEVEL_OPTIONS = [
  {
    id: 'complet-prep',
    label: 'Service complet avec préparation cliente',
    detail: 'Vous réalisez la prestation ; la cliente prépare ses cheveux.',
  },
  {
    id: 'assiste',
    label: 'Service assisté',
    detail: 'Davantage de tâches côté cliente.',
  },
]

export function tasksForServiceLevel(serviceLevel) {
  if (serviceLevel === 'assiste') {
    return TASK_DEFAULTS.map((t) => ({
      ...t,
      owner: ['meches', 'lavage', 'demelage'].includes(t.id) ? 'cliente' : 'coiffeuse',
    }))
  }
  return TASK_DEFAULTS.map((t) => ({ ...t }))
}

export function serviceLevelLabel(id) {
  return SERVICE_LEVEL_OPTIONS.find((o) => o.id === id)?.label ?? '—'
}

export function cancellationLabel(id) {
  return CANCELLATION_OPTIONS.find((o) => o.id === id)?.label ?? '—'
}

export const PRESTATION_CATALOG = [
  { id: 'knotless', label: 'Knotless braids' },
  { id: 'vanilles', label: 'Vanilles / twists' },
  { id: 'retwist', label: 'Retwist locs' },
]

export const LENGTH_OPTIONS = [
  { id: 'epaules', label: 'Épaules' },
  { id: 'mi-dos', label: 'Mi-dos' },
  { id: 'taille', label: 'Taille' },
]

export const WEEKDAY_OPTIONS = [
  { id: 'lun', label: 'Lun' },
  { id: 'mar', label: 'Mar' },
  { id: 'mer', label: 'Mer' },
  { id: 'jeu', label: 'Jeu' },
  { id: 'ven', label: 'Ven' },
  { id: 'sam', label: 'Sam' },
  { id: 'dim', label: 'Dim' },
]

/** Ordre métier : la plus courte = longueur de référence lorsqu’elle est activée. */
export const DEFAULT_LENGTH_OFFERS = [
  { id: 'epaules', enabled: true, price: 120, durationHours: 4, durationMinutes: 0 },
  { id: 'mi-dos', enabled: true, price: 150, durationHours: 5, durationMinutes: 30 },
  { id: 'taille', enabled: false, price: 180, durationHours: 6, durationMinutes: 30 },
]

/** Première longueur activée dans l’ordre catalogue = référence tarifaire. */
export function referenceLengthId(lengthOffers = []) {
  const enabled = new Set(
    lengthOffers.filter((o) => o.enabled).map((o) => o.id),
  )
  return LENGTH_OPTIONS.find((l) => enabled.has(l.id))?.id ?? null
}

export const GALLERY_MOCK = [
  { id: 'g1', label: 'Réalisation 1', tone: 'from-[#2c2418] to-[#775a19]', proof: 'Réalisation déclarée' },
  { id: 'g2', label: 'Réalisation 2', tone: 'from-[#1b1c1c] to-[#464747]', proof: 'Réalisation déclarée' },
  { id: 'g3', label: 'Réalisation 3', tone: 'from-[#271900] to-[#a17f3c]', proof: 'Inspiration' },
  { id: 'g4', label: 'Réalisation 4', tone: 'from-[#3d2e14] to-[#e8c176]', proof: 'Réalisation déclarée' },
]

export const TASK_DEFAULTS = [
  { id: 'meches', label: 'Fournir les mèches', owner: 'coiffeuse' },
  { id: 'lavage', label: 'Lavage', owner: 'cliente' },
  { id: 'demelage', label: 'Démêlage', owner: 'cliente' },
]

export const REMOVED_TASK_IDS = new Set(['pose', 'finition'])

/** Identifiants d’acte pour le protocole de test (retour après chaque acte). */
export const DEMO_ACT_IDS = ['P', 'B', 'C', 'D', 'E']

const OUI_PARTIEL_NON = [
  { id: 'oui', label: 'Oui' },
  { id: 'partiellement', label: 'Partiellement' },
  { id: 'non', label: 'Non' },
]

const OUI_MITIGE_NON = [
  { id: 'oui', label: 'Oui' },
  { id: 'mitige', label: 'Mitigé' },
  { id: 'non', label: 'Non' },
]

/**
 * Formulaire de retour par acte — même UX (4 choix + artificiel + libre).
 * P = précurseur (cadre · offre · planning) ; B–E = actes transactionnels.
 */
export const ACT_FEEDBACK = {
  P: {
    id: 'P',
    badge: 'Acte précurseur',
    title: 'Retour · Création de l’offre',
    summary:
      'Vous avez défini comment vous travaillez, créé une prestation, fixé vos conditions et défini un planning réellement disponible.',
    questions: [
      {
        id: 'q1',
        label: 'Avez-vous compris la différence entre cadre, prestation et planning ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q2',
        label: 'Créer votre offre vous a-t-il semblé utile ou administratif ?',
        options: [
          { id: 'utile', label: 'Utile' },
          { id: 'mitige', label: 'Mitigé' },
          { id: 'administratif', label: 'Administratif' },
        ],
      },
      {
        id: 'q3',
        label: 'Le planning vous paraît-il un vrai outil de disponibilité ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q4',
        label:
          'Après activation du planning, comprenez-vous que vous pouvez recevoir une demande ?',
        options: OUI_PARTIEL_NON,
      },
    ],
  },
  B: {
    id: 'B',
    badge: 'Acte B',
    title: 'Retour · Opportunité & proposition',
    summary:
      'Vous avez examiné une demande structurée, demandé une précision si besoin, puis envoyé une offre ferme avec réserve temporaire de créneau.',
    questions: [
      {
        id: 'q1',
        label: 'La demande contenait-elle assez d’informations pour décider ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q2',
        label: 'La clarification vous a-t-elle aidée avant de proposer ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q3',
        label: 'L’offre ferme et la réserve de créneau étaient-elles claires ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q4',
        label: 'Utiliseriez-vous ce fonctionnement pour décider avec une vraie cliente ?',
        options: OUI_MITIGE_NON,
      },
    ],
  },
  C: {
    id: 'C',
    badge: 'Acte C',
    title: 'Retour · Engagement & préparation',
    summary:
      'Vous avez constaté l’acceptation d’Inès, consulté les preuves, préparé le rendez-vous et avancé explicitement au jour J.',
    questions: [
      {
        id: 'q1',
        label: 'Les preuves (consentement, paiement) vous ont-elles rassurée ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q2',
        label: 'La checklist de préparation vous a-t-elle semblé utile ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q3',
        label: 'Le passage explicite au jour J était-il clair ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q4',
        label: 'Utiliseriez-vous cette préparation avant un vrai rendez-vous ?',
        options: OUI_MITIGE_NON,
      },
    ],
  },
  D: {
    id: 'D',
    badge: 'Acte D',
    title: 'Retour · Réalisation',
    summary:
      'Vous avez démarré la prestation, traité une modification (perles), consulté les preuves V1/V2 et clôturé la réalisation.',
    questions: [
      {
        id: 'q1',
        label: 'L’événement de modification (perles) était-il compréhensible ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q2',
        label: 'Les conséquences prix et durée de la modification étaient-elles claires ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q3',
        label: 'Les preuves V1 / V2 vous auraient-elles protégée en vrai ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q4',
        label: 'La qualification de fin de prestation était-elle claire ?',
        options: OUI_PARTIEL_NON,
      },
    ],
  },
  E: {
    id: 'E',
    badge: 'Acte E',
    title: 'Fin de la démonstration',
    summary:
      'Vous avez reçu une demande structurée, obtenu une précision, sécurisé une proposition, préparé le rendez-vous, fait accepter une modification, reçu le règlement final et répondu à l’avis.',
    questions: [
      {
        id: 'q1',
        label: 'La demande contenait-elle assez d’informations pour décider ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q2',
        label: 'Le prix, le versement initial, le solde et votre revenu net étaient-ils clairs ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q3',
        label:
          'La checklist et la preuve de modification (perles) vous auraient-elles protégée en vrai ?',
        options: OUI_PARTIEL_NON,
      },
      {
        id: 'q4',
        label: 'Utiliseriez-vous ce fonctionnement avec une vraie cliente ?',
        options: OUI_MITIGE_NON,
      },
    ],
  },
}

/** @deprecated Préférer ACT_FEEDBACK[actId].questions — conservé pour compat. */
export const FEEDBACK_QUESTIONS = ACT_FEEDBACK.E.questions

export function getActFeedbackConfig(actId) {
  return ACT_FEEDBACK[actId] || ACT_FEEDBACK.E
}

export function createEmptyActFeedback(actId = 'E') {
  const questions = getActFeedbackConfig(actId).questions
  return {
    actId,
    answers: Object.fromEntries(questions.map((q) => [q.id, ''])),
    artificialMoment: '',
    comment: '',
    submittedAt: null,
  }
}

export function createEmptyFeedbackByAct() {
  return Object.fromEntries(DEMO_ACT_IDS.map((id) => [id, createEmptyActFeedback(id)]))
}

export const DEFAULT_DAY_HOURS = { open: '9 h', close: '18 h' }

export function createEmptyFramework() {
  return {
    status: FrameworkStatus.NONE,
    contexts: ['salon'],
    addressPrivate: true,
    companionsAllowed: false,
    minorsWithGuardian: true,
    accessNote: 'Sonner à l’entrée du salon',
    pauseId: '5min',
    channels: ['plateforme'],
    responseDelay: 'Sous 2 heures pendant les créneaux ouverts',
    payments: ['carte', 'plateforme'],
    balanceWhen: 'fin',
    lateTolerance: 15,
    cancellationPolicy: 'selon-delai',
    safetyInterrupt: true,
    photoConsent: 'explicit',
  }
}

export function createEmptyOffer() {
  return {
    status: OfferStatus.NONE,
    prestationId: null,
    sizes: ['medium'],
    lengthOffers: DEFAULT_LENGTH_OFFERS.map((o) => ({ ...o })),
    galleryIds: [],
    serviceLevel: 'complet-prep',
    tasks: TASK_DEFAULTS.map((t) => ({ ...t })),
    clientPrepNote: 'Cheveux lavés et démêlés avant le rendez-vous',
    supplementLabel: 'Mèches fournies',
    supplementAmount: 20,
  }
}

export function createEmptySchedule() {
  const weekdays = ['mar', 'mer', 'jeu', 'ven', 'sam']
  return {
    status: ScheduleStatus.NONE,
    place: 'Saint-Denis',
    weekdays,
    dayHours: Object.fromEntries(weekdays.map((id) => [id, { ...DEFAULT_DAY_HOURS }])),
    maxPerDay: 1,
    consequenceLabel: 'Samedi 15 août dès 9 h',
  }
}

/** @deprecated Préférer createEmptyActFeedback(actId). */
export function createEmptyFeedback() {
  return createEmptyActFeedback('E')
}

export function createEmptyOpportunity() {
  return {
    injected: false,
    demandStatus: DemandStatus.NONE,
    invitationStatus: InvitationStatus.NONE,
    proposalStatus: ProposalStatus.NONE,
    softHoldStatus: SoftHoldStatus.NONE,
    engagementStatus: EngagementStatus.NONE,
    readinessStatus: ReadinessStatus.NONE,
    hasRecentPhoto: false,
    clarificationSent: false,
    clarificationWaiting: false,
    selectedQuestionIds: [],
    timeline: [],
    refusalReasonId: null,
    refusedAtFeasibility: false,
    snapshotBeforeRefuse: null,
    feasibilityConfirmed: Object.fromEntries(FEASIBILITY_CHECKS.map((c) => [c.id, false])),
    lightTension: false,
    canRealize: false,
    mechesIncluded: true,
    offerReviewed: false,
    inesPreviewOpen: false,
    firmProposalSentAt: null,
    softHoldUntilLabel: null,
    /** idle | running | done — séquence visible Acte C. */
    engagementSequencePhase: 'idle',
    engagementSequenceStep: -1,
    committedAtLabel: null,
    consentAtLabel: null,
    paymentRef: null,
    paymentAtLabel: null,
    sarahChecklist: Object.fromEntries(SARAH_CHECKLIST.map((c) => [c.id, false])),
    sarahPrepConfirmed: false,
    inesChecklist: Object.fromEntries(INES_CHECKLIST.map((c) => [c.id, false])),
    inesPrepFilling: false,
    inesPrepConfirmed: false,
    /** Compression temps → jour J (seuil Acte D). */
    dayJAdvanced: false,
    /** Acte D — réalisation. */
    executionStatus: ExecutionStatus.NONE,
    startedAtLabel: null,
    pearlsEventOpen: false,
    pearlsEventHandled: false,
    modificationRefused: false,
    modificationRefusalReasonId: null,
    selectedSupplementId: null,
    selectedExtraDurationId: null,
    selectedMotifId: 'option',
    modificationSequencePhase: 'idle',
    modificationSequenceStep: -1,
    modificationAcceptedAtLabel: null,
    engagementVersion: EngagementVersion.V1,
    serviceResumedAfterV2: false,
    completionChoiceId: null,
    completedAtLabel: null,
    /** Acte E — règlement & relation. */
    settlementStatus: SettlementStatus.NONE,
    settlementSequencePhase: 'idle',
    settlementSequenceStep: -1,
    finalPaymentRef: null,
    finalPaymentAtLabel: null,
    settledAtLabel: null,
    reviewReplyToneId: null,
    reviewReplyText: '',
    reviewReplied: false,
    reviewRepliedAtLabel: null,
    favoriteAcknowledged: false,
  }
}

export function pauseLabel(pauseId) {
  return PAUSE_OPTIONS.find((o) => o.id === pauseId)?.detail ?? '—'
}

export function prestationLabel(id) {
  return PRESTATION_CATALOG.find((p) => p.id === id)?.label ?? '—'
}

export function lengthLabel(id) {
  return LENGTH_OPTIONS.find((l) => l.id === id)?.label ?? id
}

export function sizeLabel(id) {
  return SIZE_OPTIONS.find((s) => s.id === id)?.label ?? id
}

export function sizesSummary(sizes = []) {
  const labels = SIZE_OPTIONS.filter((s) => sizes.includes(s.id)).map((s) => s.label)
  return labels.length ? labels.join(' · ') : '—'
}

export function channelLabel(id) {
  return CHANNEL_OPTIONS.find((c) => c.id === id)?.label ?? id
}

export function channelsSummary(channels = []) {
  const labels = CHANNEL_OPTIONS.filter((c) => channels.includes(c.id)).map((c) => c.label)
  return labels.length ? labels.join(' · ') : '—'
}

export function contextsSummary(contexts = []) {
  const labels = CONTEXT_OPTIONS.filter((c) => contexts.includes(c.id)).map((c) => c.label)
  return labels.length ? labels.join(' · ') : '—'
}

export function weekdaysSummary(weekdays = []) {
  const set = new Set(weekdays)
  const labels = WEEKDAY_OPTIONS.filter((d) => set.has(d.id)).map((d) => d.label)
  return labels.length ? labels.join(' · ') : '—'
}

export function dayHoursSummary(weekdays = [], dayHours = {}) {
  const parts = WEEKDAY_OPTIONS.filter((d) => weekdays.includes(d.id)).map((d) => {
    const hours = dayHours[d.id]
    if (!hours?.open || !hours?.close) return d.label
    return `${d.label} ${hours.open}–${hours.close}`
  })
  return parts.length ? parts.join(' · ') : '—'
}

export function formatDuration(hours, minutes) {
  const h = Number(hours) || 0
  const m = Number(minutes) || 0
  if (h && m) return `${h} h ${m}`
  if (h) return `${h} h`
  if (m) return `${m} min`
  return '—'
}

export function migrateFramework(raw) {
  const base = createEmptyFramework()
  if (!raw || typeof raw !== 'object') return base

  const merged = { ...base, ...raw }

  if (!Array.isArray(merged.channels) || merged.channels.length === 0) {
    merged.channels = raw.channel ? [raw.channel] : [...base.channels]
  }
  delete merged.channel

  merged.safetyInterrupt = true

  return merged
}

export function migrateOffer(raw) {
  const base = createEmptyOffer()
  if (!raw || typeof raw !== 'object') return base

  const merged = { ...base, ...raw }

  if (merged.status === 'OFFER_OPEN') merged.status = OfferStatus.ACTIVE

  if (!Array.isArray(merged.sizes) || merged.sizes.length === 0) {
    merged.sizes = raw.size ? [raw.size] : [...base.sizes]
  }
  delete merged.size

  if (!Array.isArray(merged.lengthOffers) || merged.lengthOffers.length === 0) {
    const legacyLength = raw.length || 'mi-dos'
    const legacyPrice = Number(raw.priceBase) || 150
    const legacyH = Number(raw.durationHours) || 5
    const legacyM = Number(raw.durationMinutes) || 30
    merged.lengthOffers = DEFAULT_LENGTH_OFFERS.map((o) => ({
      ...o,
      enabled: o.id === legacyLength,
      price: o.id === legacyLength ? legacyPrice : o.price,
      durationHours: o.id === legacyLength ? legacyH : o.durationHours,
      durationMinutes: o.id === legacyLength ? legacyM : o.durationMinutes,
    }))
  } else {
    merged.lengthOffers = DEFAULT_LENGTH_OFFERS.map((def) => {
      const found = merged.lengthOffers.find((o) => o.id === def.id)
      return found ? { ...def, ...found } : { ...def }
    })
  }

  delete merged.length
  delete merged.priceBase
  delete merged.durationHours
  delete merged.durationMinutes
  delete merged.place
  delete merged.dateLabel
  delete merged.timeLabel
  delete merged.maxPerDay
  delete merged.desiredVolume

  if (!Array.isArray(merged.tasks)) {
    merged.tasks = TASK_DEFAULTS.map((t) => ({ ...t }))
  } else {
    merged.tasks = merged.tasks
      .filter((t) => t && !REMOVED_TASK_IDS.has(t.id))
      .map((t) => ({ ...t }))
    const known = new Set(merged.tasks.map((t) => t.id))
    for (const def of TASK_DEFAULTS) {
      if (!known.has(def.id)) merged.tasks.push({ ...def })
    }
  }

  return merged
}

export function migrateSchedule(raw) {
  const base = createEmptySchedule()
  if (!raw || typeof raw !== 'object') return base

  const merged = { ...base, ...raw }
  const weekdays = Array.isArray(merged.weekdays) ? merged.weekdays : [...base.weekdays]
  merged.weekdays = WEEKDAY_OPTIONS.map((d) => d.id).filter((id) => weekdays.includes(id))

  const legacyOpen = raw.openHour || DEFAULT_DAY_HOURS.open
  const legacyClose = raw.closeHour || DEFAULT_DAY_HOURS.close
  const incoming = raw.dayHours && typeof raw.dayHours === 'object' ? raw.dayHours : {}

  merged.dayHours = Object.fromEntries(
    merged.weekdays.map((id) => {
      const existing = incoming[id]
      return [
        id,
        {
          open: existing?.open || legacyOpen,
          close: existing?.close || legacyClose,
        },
      ]
    }),
  )

  delete merged.openHour
  delete merged.closeHour

  const samOpen = merged.dayHours.sam?.open || DEFAULT_DAY_HOURS.open
  merged.consequenceLabel = `Samedi 15 août dès ${samOpen}`

  return merged
}
