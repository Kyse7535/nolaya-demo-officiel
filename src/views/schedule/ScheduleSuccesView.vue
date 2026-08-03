<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOfferStore } from '../../stores/offer'
import { useScheduleStore } from '../../stores/schedule'
import { useFrameworkStore } from '../../stores/framework'
import { useDemoStore } from '../../stores/demo'
import { useOpportunityStore } from '../../stores/opportunity'
import { contextsSummary } from '../../domain/model'

const router = useRouter()
const offerStore = useOfferStore()
const scheduleStore = useScheduleStore()
const frameworkStore = useFrameworkStore()
const demo = useDemoStore()
const opportunity = useOpportunityStore()
const { label, devisPreview } = storeToRefs(offerStore)
const { schedule, hoursSummary, isActive } = storeToRefs(scheduleStore)
const { framework } = storeToRefs(frameworkStore)
const { hasFirmProposal, invitationActive } = storeToRefs(opportunity)

const placeLine = computed(
  () => `${contextsSummary(framework.value.contexts)} · ${schedule.value.place}`,
)

onMounted(() => {
  opportunity.ensureInesInjected()
  if (isActive.value) {
    window.setTimeout(() => demo.promptActFeedback('P'), 320)
  }
})

function continueToDemand() {
  opportunity.ensureInesInjected()
  if (hasFirmProposal.value) {
    router.push({ name: 'opportunity-sent' })
    return
  }
  router.push({ name: 'opportunity-list' })
}
</script>

<template>
  <div class="flex flex-1 flex-col px-5 pb-6 pt-8">
    <p class="badge-mono">Planning actif</p>
    <h1 class="mt-3 text-2xl font-bold tracking-tight text-primary">
      Vous pouvez maintenant recevoir des demandes compatibles
    </h1>

    <div class="mt-6 rounded-card border border-outline-soft bg-surface p-4">
      <p class="text-sm font-semibold text-primary">{{ label }}</p>
      <p class="mt-1 text-sm text-muted">{{ hoursSummary }}</p>
      <p class="mt-1 text-sm text-muted">
        {{ placeLine }} · à partir de {{ devisPreview.from }} €
      </p>
      <p class="mt-2 text-sm text-muted">
        Créneaux possibles incluent {{ schedule.consequenceLabel }}
      </p>
      <p class="mt-3 text-xs font-mono uppercase tracking-wide text-secondary">
        État · SCHEDULE_ACTIVE
      </p>
    </div>

    <div
      v-if="invitationActive || hasFirmProposal"
      class="mt-4 rounded-card border border-secondary/40 bg-secondary-container/30 px-3 py-3"
    >
      <p class="text-sm font-semibold text-on-secondary-container">
        {{ hasFirmProposal ? 'Proposition déjà envoyée' : 'Demande Inès injectée' }}
      </p>
      <p class="mt-1 text-sm text-muted">
        {{
          hasFirmProposal
            ? 'Poursuivez vers le suivi de l’offre ferme.'
            : 'Une opportunité compatible attend votre examen (Scène 2/5).'
        }}
      </p>
    </div>

    <div class="mt-auto space-y-2 pt-8">
      <button type="button" class="btn-primary" @click="continueToDemand">
        Continuer vers une demande cliente
      </button>
      <button type="button" class="btn-secondary" @click="router.push({ name: 'schedule-liste' })">
        Voir mon planning
      </button>
      <p class="text-center text-[11px] text-muted">
        Enchaînement Acte B — sans reset du cadre, de l’offre ni du planning
      </p>
      <button type="button" class="btn-ghost mx-auto block" @click="demo.openResearch('P')">
        {{ demo.isFeedbackSubmitted('P') ? 'Revoir mon retour (acte précurseur)' : 'Donner mon retour sur cet acte' }}
      </button>
    </div>
  </div>
</template>
