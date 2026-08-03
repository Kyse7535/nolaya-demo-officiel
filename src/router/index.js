import { createRouter, createWebHistory } from 'vue-router'
import { useFrameworkStore } from '../stores/framework'
import { useOfferStore } from '../stores/offer'
import { useScheduleStore } from '../stores/schedule'
import { useOpportunityStore } from '../stores/opportunity'
import { useDemoStore } from '../stores/demo'
import { FrameworkStatus, OfferStatus, ScheduleStatus } from '../domain/model'

import DemoStartView from '../views/DemoStartView.vue'
import DashboardView from '../views/DashboardView.vue'
import FrameworkWelcomeView from '../views/framework/FrameworkWelcomeView.vue'
import FrameworkContextsView from '../views/framework/FrameworkContextsView.vue'
import FrameworkAccueilView from '../views/framework/FrameworkAccueilView.vue'
import FrameworkPauseView from '../views/framework/FrameworkPauseView.vue'
import FrameworkCommPaiementView from '../views/framework/FrameworkCommPaiementView.vue'
import FrameworkPolitiquesView from '../views/framework/FrameworkPolitiquesView.vue'
import FrameworkRecapView from '../views/framework/FrameworkRecapView.vue'
import FrameworkBridgeView from '../views/framework/FrameworkBridgeView.vue'
import OfferPrestationView from '../views/offer/OfferPrestationView.vue'
import OfferGalerieView from '../views/offer/OfferGalerieView.vue'
import OfferServiceView from '../views/offer/OfferServiceView.vue'
import OfferPrixView from '../views/offer/OfferPrixView.vue'
import OfferRecapView from '../views/offer/OfferRecapView.vue'
import OfferBridgeView from '../views/offer/OfferBridgeView.vue'
import ScheduleConfigView from '../views/schedule/ScheduleConfigView.vue'
import ScheduleRecapView from '../views/schedule/ScheduleRecapView.vue'
import ScheduleSuccesView from '../views/schedule/ScheduleSuccesView.vue'
import ScheduleListeView from '../views/schedule/ScheduleListeView.vue'
import OpportunityListView from '../views/opportunity/OpportunityListView.vue'
import OpportunityDossierView from '../views/opportunity/OpportunityDossierView.vue'
import OpportunityClarificationView from '../views/opportunity/OpportunityClarificationView.vue'
import OpportunityProposalView from '../views/opportunity/OpportunityProposalView.vue'
import OpportunitySentView from '../views/opportunity/OpportunitySentView.vue'
import EngagementCommittedView from '../views/engagement/EngagementCommittedView.vue'
import EngagementPrepView from '../views/engagement/EngagementPrepView.vue'
import ExecutionDossierView from '../views/execution/ExecutionDossierView.vue'
import ExecutionProgressView from '../views/execution/ExecutionProgressView.vue'
import ExecutionModificationView from '../views/execution/ExecutionModificationView.vue'
import ExecutionCompleteView from '../views/execution/ExecutionCompleteView.vue'
import SettlementView from '../views/settlement/SettlementView.vue'
import RelationView from '../views/settlement/RelationView.vue'

const needsFramework = new Set([
  'framework-bridge',
  'offer-prestation',
  'offer-galerie',
  'offer-service',
  'offer-prix',
  'offer-recap',
  'offer-bridge',
  'schedule-config',
  'schedule-recap',
  'schedule-succes',
  'schedule-liste',
  'opportunity-list',
  'opportunity-demande',
  'opportunity-clarification',
  'opportunity-proposal',
  'opportunity-sent',
  'engagement-committed',
  'engagement-prep',
  'execution-jour',
  'execution-progress',
  'execution-modification',
  'execution-complete',
  'settlement',
  'settlement-relation',
])

const needsOffer = new Set([
  'offer-bridge',
  'schedule-config',
  'schedule-recap',
  'opportunity-list',
  'opportunity-demande',
  'opportunity-clarification',
  'opportunity-proposal',
  'opportunity-sent',
  'engagement-committed',
  'engagement-prep',
  'execution-jour',
  'execution-progress',
  'execution-modification',
  'execution-complete',
  'settlement',
  'settlement-relation',
])

const needsSchedule = new Set([
  'schedule-succes',
  'schedule-liste',
  'opportunity-list',
  'opportunity-demande',
  'opportunity-clarification',
  'opportunity-proposal',
  'opportunity-sent',
  'engagement-committed',
  'engagement-prep',
  'execution-jour',
  'execution-progress',
  'execution-modification',
  'execution-complete',
  'settlement',
  'settlement-relation',
])

const needsOpportunity = new Set([
  'opportunity-demande',
  'opportunity-clarification',
  'opportunity-proposal',
  'opportunity-sent',
  'engagement-committed',
  'engagement-prep',
  'execution-jour',
  'execution-progress',
  'execution-modification',
  'execution-complete',
  'settlement',
  'settlement-relation',
])

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'demo-start', component: DemoStartView, meta: { demoOnly: true } },
    { path: '/accueil', name: 'dashboard', component: DashboardView },
    { path: '/cadre', name: 'framework-welcome', component: FrameworkWelcomeView },
    { path: '/cadre/contextes', name: 'framework-contexts', component: FrameworkContextsView },
    { path: '/cadre/accueil', name: 'framework-accueil', component: FrameworkAccueilView },
    { path: '/cadre/pause', name: 'framework-pause', component: FrameworkPauseView },
    { path: '/cadre/communication', name: 'framework-comm', component: FrameworkCommPaiementView },
    { path: '/cadre/politiques', name: 'framework-politiques', component: FrameworkPolitiquesView },
    { path: '/cadre/recap', name: 'framework-recap', component: FrameworkRecapView },
    { path: '/cadre/actif', name: 'framework-bridge', component: FrameworkBridgeView },
    { path: '/prestation', name: 'offer-prestation', component: OfferPrestationView },
    { path: '/prestation/galerie', name: 'offer-galerie', component: OfferGalerieView },
    { path: '/prestation/service', name: 'offer-service', component: OfferServiceView },
    { path: '/prestation/prix', name: 'offer-prix', component: OfferPrixView },
    { path: '/prestation/recap', name: 'offer-recap', component: OfferRecapView },
    { path: '/prestation/active', name: 'offer-bridge', component: OfferBridgeView },
    { path: '/planning', name: 'schedule-config', component: ScheduleConfigView },
    { path: '/planning/recap', name: 'schedule-recap', component: ScheduleRecapView },
    { path: '/planning/actif', name: 'schedule-succes', component: ScheduleSuccesView },
    { path: '/planning/liste', name: 'schedule-liste', component: ScheduleListeView },
    { path: '/opportunites', name: 'opportunity-list', component: OpportunityListView },
    { path: '/opportunites/demande', name: 'opportunity-demande', component: OpportunityDossierView },
    { path: '/opportunites/dossier', redirect: { name: 'opportunity-demande' } },
    {
      path: '/opportunites/clarification',
      name: 'opportunity-clarification',
      component: OpportunityClarificationView,
    },
    {
      path: '/opportunites/proposition',
      name: 'opportunity-proposal',
      component: OpportunityProposalView,
    },
    {
      path: '/opportunites/proposition-envoyee',
      name: 'opportunity-sent',
      component: OpportunitySentView,
    },
    {
      path: '/engagement',
      name: 'engagement-committed',
      component: EngagementCommittedView,
    },
    {
      path: '/engagement/preparation',
      name: 'engagement-prep',
      component: EngagementPrepView,
    },
    {
      path: '/realisation',
      name: 'execution-jour',
      component: ExecutionDossierView,
    },
    {
      path: '/realisation/en-cours',
      name: 'execution-progress',
      component: ExecutionProgressView,
    },
    {
      path: '/realisation/modification',
      name: 'execution-modification',
      component: ExecutionModificationView,
    },
    {
      path: '/realisation/cloture',
      name: 'execution-complete',
      component: ExecutionCompleteView,
    },
    {
      path: '/reglement',
      name: 'settlement',
      component: SettlementView,
    },
    {
      path: '/reglement/suite',
      name: 'settlement-relation',
      component: RelationView,
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

function executionHome(opportunity) {
  if (opportunity.isSettled) return { name: 'settlement-relation' }
  if (opportunity.isCompleted) return { name: 'settlement' }
  if (opportunity.isInProgress) {
    if (
      opportunity.state.pearlsEventHandled &&
      !opportunity.state.modificationRefused &&
      !opportunity.isV2
    ) {
      return { name: 'execution-modification' }
    }
    return { name: 'execution-progress' }
  }
  return { name: 'execution-jour' }
}

router.beforeEach((to) => {
  const framework = useFrameworkStore()
  const offer = useOfferStore()
  const schedule = useScheduleStore()
  const opportunity = useOpportunityStore()
  const demo = useDemoStore()

  if (to.name !== 'demo-start' && !demo.hasStylistName) {
    return { name: 'demo-start' }
  }

  if (needsFramework.has(to.name) && framework.status !== FrameworkStatus.ACTIVE) {
    return { name: 'dashboard' }
  }

  if (needsOffer.has(to.name) && offer.status !== OfferStatus.ACTIVE) {
    return framework.status === FrameworkStatus.ACTIVE
      ? { name: 'framework-bridge' }
      : { name: 'dashboard' }
  }

  if (needsSchedule.has(to.name) && schedule.status !== ScheduleStatus.ACTIVE) {
    if (offer.status === OfferStatus.ACTIVE) return { name: 'offer-bridge' }
    if (framework.status === FrameworkStatus.ACTIVE) return { name: 'framework-bridge' }
    return { name: 'dashboard' }
  }

  if (needsOpportunity.has(to.name)) {
    if (!opportunity.isInjected) {
      opportunity.ensureInesInjected()
    }

    if (to.name === 'opportunity-sent' && !opportunity.hasFirmProposal) {
      return opportunity.state.canRealize || opportunity.canPrepareProposal
        ? { name: 'opportunity-proposal' }
        : { name: 'opportunity-demande' }
    }

    if (to.name === 'opportunity-proposal') {
      if (opportunity.hasFirmProposal) return { name: 'opportunity-sent' }
      if (!opportunity.canPrepareProposal && !opportunity.state.canRealize) {
        return { name: 'opportunity-demande' }
      }
    }

    if (to.name === 'opportunity-clarification') {
      if (opportunity.state.clarificationSent || !opportunity.invitationActive) {
        return { name: 'opportunity-demande' }
      }
    }

    if (to.name === 'engagement-committed' || to.name === 'engagement-prep') {
      if (!opportunity.hasFirmProposal) {
        return { name: 'opportunity-list' }
      }
    }

    if (to.name === 'engagement-prep' && !opportunity.isCommitted) {
      return { name: 'engagement-committed' }
    }

    const executionRoutes = new Set([
      'execution-jour',
      'execution-progress',
      'execution-modification',
      'execution-complete',
    ])

    const settlementRoutes = new Set(['settlement', 'settlement-relation'])

    if (executionRoutes.has(to.name) || settlementRoutes.has(to.name)) {
      if (!opportunity.state.dayJAdvanced || !opportunity.isReady) {
        return opportunity.isCommitted
          ? { name: 'engagement-prep' }
          : { name: 'engagement-committed' }
      }

      if (settlementRoutes.has(to.name)) {
        if (!opportunity.isCompleted) return executionHome(opportunity)
        if (to.name === 'settlement-relation' && !opportunity.isSettled) {
          return { name: 'settlement' }
        }
        return true
      }

      if (to.name === 'execution-progress' && !opportunity.isInProgress && !opportunity.isCompleted) {
        return { name: 'execution-jour' }
      }

      if (to.name === 'execution-modification') {
        if (opportunity.isSettled) return { name: 'settlement-relation' }
        if (opportunity.isCompleted) return { name: 'settlement' }
        if (!opportunity.isInProgress) return { name: 'execution-jour' }
        if (opportunity.state.modificationRefused || !opportunity.state.pearlsEventHandled) {
          return { name: 'execution-progress' }
        }
      }

      if (to.name === 'execution-complete') {
        if (opportunity.isCompleted) return true
        if (
          !opportunity.isV2 ||
          !opportunity.state.serviceResumedAfterV2 ||
          !opportunity.isInProgress
        ) {
          return executionHome(opportunity)
        }
      }
    }
  }

  return true
})

export default router
