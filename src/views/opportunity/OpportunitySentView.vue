<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useOpportunityStore } from '../../stores/opportunity'
import { useDemoStore } from '../../stores/demo'

const router = useRouter()
const opportunity = useOpportunityStore()
const demo = useDemoStore()
const { rail, softHoldActive, isCommitted, isReady, state, hasFirmProposal } =
  storeToRefs(opportunity)

onMounted(() => {
  if (hasFirmProposal.value) {
    window.setTimeout(() => demo.promptActFeedback('B'), 320)
  }
})

const nextRoute = computed(() => {
  if (state.value.dayJAdvanced) {
    if (opportunity.isSettled) return 'settlement-relation'
    if (opportunity.isCompleted) return 'settlement'
    if (opportunity.isInProgress) return 'execution-progress'
    return 'execution-jour'
  }
  if (isReady.value) return 'engagement-prep'
  if (isCommitted.value) return 'engagement-committed'
  return 'engagement-committed'
})

const nextLabel = computed(() => {
  if (state.value.dayJAdvanced) {
    if (opportunity.isSettled) return 'Voir l’avis et la suite'
    if (opportunity.isCompleted) return 'Voir le règlement'
    return 'Voir la demande du jour'
  }
  if (isReady.value) return 'Voir la préparation'
  if (isCommitted.value) return 'Voir la confirmation'
  return 'Continuer vers la confirmation'
})

function goEngagement() {
  router.push({ name: nextRoute.value })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Proposition envoyée"
      badge="Envoyée"
      back-label="Demandes"
      @back="router.push({ name: 'opportunity-list' })"
    />

    <div class="flex flex-1 flex-col px-5 pb-28 pt-5">
      <p class="badge-mono">Proposition envoyée</p>
      <h1 class="mt-3 text-2xl font-bold tracking-tight text-primary">
        Proposition envoyée à {{ rail.clientName }}
      </h1>
      <p class="mt-2 text-sm leading-relaxed text-muted">
        <template v-if="isCommitted">
          Rendez-vous confirmé — le créneau n’est plus en réserve temporaire.
        </template>
        <template v-else>
          Créneau réservé temporairement. Valable
          {{ state.softHoldUntilLabel || '30 min' }}.
        </template>
      </p>

      <div class="mt-6 rounded-card border border-outline-soft bg-surface p-4">
        <p class="text-sm font-semibold text-primary">
          {{ rail.prestationLabel }} · {{ rail.lengthLabel }}
        </p>
        <p class="mt-1 text-sm text-muted">
          {{ rail.priceTotal }} € · acompte {{ rail.deposit }} € · {{ rail.dateLabel }}
          {{ rail.timeLabel }}
        </p>
        <p
          v-if="softHoldActive && !isCommitted"
          class="mt-3 text-xs font-semibold uppercase tracking-wide text-secondary"
        >
          Créneau réservé {{ rail.validityMinutes }} min
        </p>
        <p
          v-else-if="isCommitted"
          class="mt-3 text-xs font-semibold uppercase tracking-wide text-secondary"
        >
          {{ isReady ? 'Prêt' : 'Confirmé' }}
        </p>
      </div>

      <div class="mt-5 rounded-card border border-secondary/30 bg-secondary-container/20 px-3 py-3">
        <p class="text-sm font-semibold text-on-secondary-container">Ensuite</p>
        <p class="mt-1 text-sm text-muted">
          Inès accepte, paie l’acompte, puis vous préparez le rendez-vous.
        </p>
      </div>

      <div class="mt-auto space-y-2 pt-8">
        <button
          type="button"
          class="btn-secondary"
          @click="router.push({ name: 'opportunity-demande' })"
        >
          Revoir la demande
        </button>
        <button type="button" class="btn-ghost mx-auto block" @click="demo.openResearch('B')">
          {{
            demo.isFeedbackSubmitted('B')
              ? 'Revoir mon avis sur cette étape'
              : 'Donner mon avis sur cette étape'
          }}
        </button>
      </div>
    </div>

    <StickyFooter :label="nextLabel" @action="goEngagement" />
  </div>
</template>
