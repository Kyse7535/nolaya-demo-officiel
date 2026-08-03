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
    return 'execution-dossier'
  }
  if (isReady.value) return 'engagement-prep'
  if (isCommitted.value) return 'engagement-committed'
  return 'engagement-committed'
})

const nextLabel = computed(() => {
  if (state.value.dayJAdvanced) {
    if (opportunity.isSettled) return 'Voir l’avis et la suite'
    if (opportunity.isCompleted) return 'Voir le règlement'
    return 'Voir le dossier du jour'
  }
  if (isReady.value) return 'Voir la préparation'
  if (isCommitted.value) return 'Voir l’engagement'
  return 'Continuer vers l’engagement'
})

function goEngagement() {
  router.push({ name: nextRoute.value })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Proposition envoyée"
      badge="FIRM"
      back-label="Opportunités"
      @back="router.push({ name: 'opportunity-list' })"
    />

    <div class="flex flex-1 flex-col px-5 pb-28 pt-5">
      <p class="badge-mono">État · FIRM_PROPOSAL</p>
      <h1 class="mt-3 text-2xl font-bold tracking-tight text-primary">
        Offre ferme envoyée à {{ rail.clientName }}
      </h1>
      <p class="mt-2 text-sm leading-relaxed text-muted">
        <template v-if="isCommitted">
          Engagement formé — le créneau n’est plus en réserve temporaire.
        </template>
        <template v-else>
          Créneau réservé temporairement. Validité :
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
          class="mt-3 text-xs font-mono uppercase tracking-wide text-secondary"
        >
          SOFT_HOLD actif
        </p>
        <p
          v-else-if="isCommitted"
          class="mt-3 text-xs font-mono uppercase tracking-wide text-secondary"
        >
          {{ isReady ? 'READY' : 'COMMITTED' }}
        </p>
      </div>

      <div class="mt-5 rounded-card border border-secondary/30 bg-secondary-container/20 px-3 py-3">
        <p class="text-sm font-semibold text-on-secondary-container">Acte C — Engagement</p>
        <p class="mt-1 text-sm text-muted">
          Constater l’acceptation d’Inès, consulter les preuves, puis préparer le rendez-vous.
        </p>
      </div>

      <div class="mt-auto space-y-2 pt-8">
        <button
          type="button"
          class="btn-secondary"
          @click="router.push({ name: 'opportunity-dossier' })"
        >
          Revoir le dossier
        </button>
        <button type="button" class="btn-ghost mx-auto block" @click="demo.openResearch('B')">
          {{
            demo.isFeedbackSubmitted('B')
              ? 'Revoir mon retour (acte B)'
              : 'Donner mon retour sur cet acte'
          }}
        </button>
      </div>
    </div>

    <StickyFooter :label="nextLabel" @action="goEngagement" />
  </div>
</template>
