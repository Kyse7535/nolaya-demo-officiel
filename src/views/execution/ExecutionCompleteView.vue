<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { COMPLETION_OPTIONS } from '../../domain/model'
import { useOpportunityStore } from '../../stores/opportunity'
import { useDemoStore } from '../../stores/demo'

const router = useRouter()
const opportunity = useOpportunityStore()
const demo = useDemoStore()
const {
  rail,
  state,
  isCompleted,
  isV2,
  canQualifyCompletion,
  balancePreview,
} = storeToRefs(opportunity)

watch(
  () => isCompleted.value,
  (completed) => {
    if (completed) {
      window.setTimeout(() => demo.promptActFeedback('D'), 320)
    }
  },
  { immediate: true },
)

const sheet = ref(null)

watch(
  () => ({
    v2: isV2.value,
    resumed: state.value.serviceResumedAfterV2,
    completed: isCompleted.value,
    status: state.value.executionStatus,
  }),
  ({ v2, resumed, completed, status }) => {
    if (status === 'NONE') {
      router.replace({ name: 'execution-jour' })
      return
    }
    if (!completed && (!v2 || !resumed)) {
      router.replace({ name: 'execution-progress' })
    }
  },
  { immediate: true },
)

const summaryRows = computed(() => [
  { label: 'Prestation initiale', value: `${rail.value.prestationLabel} · réalisée` },
  { label: 'Modification', value: `${rail.value.pearlsLabel}` },
  { label: 'Incidents', value: 'Aucun' },
  { label: 'Durée réelle', value: rail.value.durationLabelV2 },
  { label: 'Prix final', value: `${rail.value.priceTotalV2} €` },
  { label: 'Acompte', value: `${rail.value.deposit} €` },
  { label: 'Reste à payer', value: `${balancePreview.value} €` },
])

function chooseFull() {
  if (!canQualifyCompletion.value && !isCompleted.value) return
  opportunity.qualifyCompletion('full')
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Fin de prestation"
      :badge="isCompleted ? 'Terminé' : 'Fin'"
      back-label="En cours"
      @back="router.push({ name: 'execution-progress' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <template v-if="!isCompleted">
        <h2 class="screen-title">Terminer la prestation</h2>
        <p class="screen-lead">
          Confirmez que la prestation est réalisée comme convenu.
        </p>

        <dl class="mt-5 space-y-2">
          <div
            v-for="row in summaryRows"
            :key="row.label"
            class="flex items-baseline justify-between gap-3 border-b border-outline-soft/60 py-2"
          >
            <dt class="text-xs text-muted">{{ row.label }}</dt>
            <dd class="text-sm font-medium text-primary">{{ row.value }}</dd>
          </div>
        </dl>

        <button type="button" class="btn-ghost mt-3 text-xs" @click="sheet = 'proofs'">
          Revoir la modification acceptée
        </button>

        <button type="button" class="btn-primary mt-6" @click="chooseFull()">
          {{ COMPLETION_OPTIONS[0]?.label || 'Terminer — prestation réalisée' }}
        </button>
      </template>

      <template v-else>
        <p class="badge-mono">Terminé</p>
        <h2 class="mt-2 screen-title">Prestation terminée</h2>
        <p class="screen-lead">
          {{ rail.clientName }} · {{ rail.priceTotalV2 }} € · {{ rail.durationLabelV2 }}. La
          modification acceptée reste consultable.
        </p>

        <dl class="mt-5 space-y-2">
          <div
            v-for="row in summaryRows"
            :key="row.label"
            class="rounded-card border border-outline-soft bg-surface px-4 py-3"
          >
            <dt class="text-xs font-semibold uppercase tracking-wide text-muted">
              {{ row.label }}
            </dt>
            <dd class="mt-1 text-sm font-medium text-primary">{{ row.value }}</dd>
          </div>
        </dl>

        <button type="button" class="btn-ghost mt-4 text-xs" @click="sheet = 'proofs'">
          Voir la modification acceptée
        </button>

        <section class="mt-7 rounded-card border border-secondary/40 bg-secondary-container/25 px-4 py-4">
          <p class="badge-mono">Ensuite</p>
          <h3 class="mt-2 text-sm font-semibold text-primary">Règlement & relation</h3>
          <p class="mt-1 text-sm text-muted">
            Ensuite : Inès paie le reste, vous voyez votre revenu, puis son avis.
          </p>
          <button
            type="button"
            class="btn-primary mt-4"
            @click="router.push({ name: 'settlement' })"
          >
            Continuer vers le règlement
          </button>
          <button
            type="button"
            class="btn-ghost mx-auto mt-3 block"
            @click="demo.openResearch('D')"
          >
            {{
              demo.isFeedbackSubmitted('D')
                ? 'Revoir mon avis sur cette étape'
                : 'Donner mon avis sur cette étape'
            }}
          </button>
        </section>
      </template>
    </div>

    <StickyFooter
      v-if="isCompleted"
      label="Continuer vers le règlement"
      @action="router.push({ name: 'settlement' })"
    />

    <div
      v-if="sheet === 'proofs'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto max-h-[85vh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Modification acceptée</p>
        <h2 class="mt-2 text-base font-bold text-primary">Rappel de la modification acceptée</h2>
        <ul class="mt-4 space-y-3 text-sm text-primary">
          <li>
            <span class="font-semibold">Demande</span> — {{ rail.pearlsLabel }}
          </li>
          <li>
            <span class="font-semibold">Proposition</span> — +{{ rail.modificationSupplement }} € ·
            +{{ rail.modificationMinutes }} min
          </li>
          <li>
            <span class="font-semibold">Acceptée</span> —
            {{ state.modificationAcceptedAtLabel || rail.modificationAcceptedAt }}
          </li>
          <li>
            <span class="font-semibold">Avant</span> — {{ rail.priceTotal }} € ·
            {{ rail.durationLabel }}
          </li>
          <li>
            <span class="font-semibold">Après</span> — {{ rail.priceTotalV2 }} € ·
            {{ rail.durationLabelV2 }}
          </li>
        </ul>
        <button type="button" class="btn-primary mt-5" @click="sheet = null">Fermer</button>
      </div>
    </div>
  </div>
</template>
