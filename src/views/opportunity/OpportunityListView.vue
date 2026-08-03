<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useOpportunityStore } from '../../stores/opportunity'
import { useScheduleStore } from '../../stores/schedule'

const router = useRouter()
const opportunity = useOpportunityStore()
const schedule = useScheduleStore()
const {
  isInjected,
  invitationActive,
  invitationRefused,
  hasFirmProposal,
  isCommitted,
  isReady,
  cardSummary,
  matchCriteria,
  rail,
  state,
} = storeToRefs(opportunity)

const whyOpen = ref(false)

onMounted(() => {
  if (schedule.isActive) opportunity.ensureInesInjected()
})

function examine() {
  router.push({ name: 'opportunity-demande' })
}

function followUpStatusLabel() {
  if (opportunity.isSettled) return 'Payé — avis & suite'
  if (opportunity.isCompleted) return 'Terminé — règlement'
  if (opportunity.isInProgress) return 'En cours'
  if (state.value.dayJAdvanced) return 'Jour du rendez-vous'
  if (isReady.value) return 'Prêt'
  if (isCommitted.value) return 'Confirmé'
  return 'Proposition envoyée'
}

function followUpDetailLabel() {
  if (opportunity.isSettled) return 'Payé'
  if (opportunity.isCompleted) return 'Terminé'
  if (opportunity.isInProgress) return 'En cours'
  if (isReady.value) return 'Prêt'
  return 'Confirmé'
}

function openFollowUp() {
  if (state.value.dayJAdvanced) {
    if (opportunity.isSettled) router.push({ name: 'settlement-relation' })
    else if (opportunity.isCompleted) router.push({ name: 'settlement' })
    else if (opportunity.isInProgress) router.push({ name: 'execution-progress' })
    else router.push({ name: 'execution-jour' })
  } else if (isReady.value) {
    router.push({ name: 'engagement-prep' })
  } else if (isCommitted.value) {
    router.push({ name: 'engagement-committed' })
  } else {
    router.push({ name: 'opportunity-sent' })
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Demandes"
      badge="Demande"
      @back="router.push({ name: 'schedule-succes' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <h2 class="screen-title">Nouvelle demande</h2>
      <p class="screen-lead">
        Une cliente correspond à votre offre et à un créneau libre.
      </p>

      <div
        v-if="invitationRefused && !hasFirmProposal"
        class="mt-5 rounded-card border border-outline-soft bg-surface-low px-3 py-3"
      >
        <p class="text-sm font-semibold text-primary">Aucune invitation active</p>
        <p class="mt-1 text-sm text-muted">
          La demande d’Inès a été refusée. Vous pouvez reprendre la demande d’Inès pour continuer.
        </p>
        <button type="button" class="btn-primary mt-4" @click="opportunity.recoverInes()">
          Reprendre la demande d’Inès
        </button>
      </div>

      <div
        v-else-if="hasFirmProposal || isCommitted"
        class="mt-5 rounded-card border border-secondary/40 bg-secondary-container/30 px-3 py-3"
      >
        <p class="text-sm font-semibold text-on-secondary-container">
          {{ followUpStatusLabel() }}
        </p>
        <p class="mt-1 text-sm text-muted">
          <template v-if="isCommitted">
            {{ rail.clientName }} · {{ rail.dateLabel }} {{ rail.timeLabel }} ·
            {{ followUpDetailLabel() }}
          </template>
          <template v-else>
            Proposition pour {{ rail.clientName }} — créneau réservé temporairement.
          </template>
        </p>
        <button type="button" class="btn-primary mt-4" @click="openFollowUp">
          Voir le suivi
        </button>
      </div>

      <article
        v-else-if="isInjected && invitationActive"
        class="mt-5 rounded-card border border-outline-soft bg-surface p-4"
      >
        <p class="badge-mono">Nouvelle demande</p>
        <h3 class="mt-2 text-base font-bold text-primary">{{ cardSummary.title }}</h3>
        <p class="mt-1 text-sm text-muted">{{ cardSummary.slot }}</p>
        <p class="mt-1 text-sm text-muted">{{ cardSummary.budget }}</p>

        <button
          type="button"
          class="btn-ghost mt-4 text-left"
          @click="whyOpen = true"
        >
          Pourquoi cette demande ?
        </button>
      </article>

      <div
        v-else
        class="mt-5 rounded-card border border-outline-soft bg-surface-low px-3 py-3"
      >
        <p class="text-sm text-muted">
          Aucune demande pour le moment. Activez d’abord votre planning.
        </p>
      </div>
    </div>

    <StickyFooter
      v-if="invitationActive && !hasFirmProposal"
      label="Examiner la demande"
      @action="examine"
    />

    <!-- Sheet aide invitation -->
    <div
      v-if="whyOpen"
      class="fixed inset-0 z-50 flex items-end justify-center bg-primary/40"
      @click.self="whyOpen = false"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <h2 class="text-base font-bold text-primary">Pourquoi cette demande ?</h2>
        <ul class="mt-3 space-y-2 text-sm text-primary">
          <li v-for="criterion in matchCriteria" :key="criterion" class="flex gap-2">
            <span class="text-secondary">·</span>
            <span>{{ criterion }}</span>
          </li>
        </ul>
        <button type="button" class="btn-primary mt-5" @click="whyOpen = false">Fermer</button>
      </div>
    </div>
  </div>
</template>
