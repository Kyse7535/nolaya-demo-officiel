<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { MODIFICATION_REFUSAL_REASONS } from '../../domain/model'
import { useOpportunityStore } from '../../stores/opportunity'

const router = useRouter()
const opportunity = useOpportunityStore()
const {
  rail,
  state,
  isInProgress,
  isV2,
  activePrice,
  activeDuration,
  canQualifyCompletion,
  canResumeAfterV2,
} = storeToRefs(opportunity)

const sheet = ref(null)
const refuseOpen = ref(false)
const refuseReasonId = ref(null)

const events = computed(() =>
  state.value.timeline.filter((t) =>
    /démarr|modification|Prestation|perles|V2|reprise|refus/i.test(
      `${t.label} ${t.detail || ''}`,
    ),
  ),
)

watch(
  () => state.value.executionStatus,
  (status) => {
    if (status === 'NONE' || !status) {
      router.replace({ name: 'execution-dossier' })
    }
  },
  { immediate: true },
)

function evaluate() {
  if (opportunity.evaluateModification()) {
    router.push({ name: 'execution-modification' })
  }
}

function confirmRefuse() {
  if (!refuseReasonId.value) return
  opportunity.refuseModification(refuseReasonId.value)
  refuseOpen.value = false
  refuseReasonId.value = null
}

function recover() {
  opportunity.recoverModificationEvaluation()
}

function goModification() {
  router.push({ name: 'execution-modification' })
}

function finish() {
  router.push({ name: 'execution-complete' })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Prestation en cours"
      badge="IN_PROGRESS"
      back-label="Dossier"
      @back="router.push({ name: 'execution-dossier' })"
    />

    <div
      class="flex-1 px-5 py-5"
      :class="canQualifyCompletion || state.modificationRefused ? 'pb-36' : 'pb-28'"
    >
      <p class="badge-mono">{{ isV2 ? 'Engagement · V2' : 'Engagement · V1' }}</p>
      <h2 class="mt-2 screen-title">{{ rail.clientName }} · en réalisation</h2>
      <p class="screen-lead">
        Début réel {{ state.startedAtLabel || rail.startTimeLabel }}. Les totaux suivent
        l’engagement actif.
      </p>

      <dl class="mt-5 grid grid-cols-2 gap-2">
        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <dt class="text-[10px] font-semibold uppercase tracking-wide text-muted">Prix actuel</dt>
          <dd class="mt-1 text-sm font-semibold text-primary">{{ activePrice }} €</dd>
        </div>
        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <dt class="text-[10px] font-semibold uppercase tracking-wide text-muted">Durée estimée</dt>
          <dd class="mt-1 text-sm font-semibold text-primary">{{ activeDuration }}</dd>
        </div>
      </dl>

      <button
        type="button"
        class="btn-ghost mt-3 text-xs"
        @click="sheet = isV2 ? 'v2' : 'v1'"
      >
        Voir la prestation convenue ({{ isV2 ? 'V2' : 'V1' }})
      </button>

      <section class="mt-6">
        <h3 class="text-sm font-semibold text-primary">Chronologie</h3>
        <ul class="mt-3 space-y-2">
          <li
            v-for="ev in events.slice(-6)"
            :key="ev.id"
            class="rounded-card border border-outline-soft bg-surface-low px-3 py-2.5"
          >
            <p class="text-xs font-medium text-primary">{{ ev.label }}</p>
            <p class="mt-0.5 text-[11px] text-muted">{{ ev.detail }}</p>
          </li>
          <li v-if="!events.length" class="text-xs text-muted">Aucun événement encore.</li>
        </ul>
      </section>

      <section
        v-if="state.modificationRefused"
        class="mt-6 rounded-card border border-outline-soft bg-surface-low px-4 py-4"
      >
        <p class="text-sm font-semibold text-primary">Modification refusée — V1 inchangée</p>
        <p class="mt-1 text-sm text-muted">
          L’engagement à {{ rail.priceTotal }} € / {{ rail.durationLabel }} reste actif.
        </p>
        <button type="button" class="btn-primary mt-4" @click="recover">
          Reprendre l’évaluation
        </button>
      </section>

      <section
        v-else-if="isV2 && state.serviceResumedAfterV2"
        class="mt-6 rounded-card border border-secondary/40 bg-secondary-container/25 px-4 py-4"
      >
        <p class="text-sm font-semibold text-on-secondary-container">
          Modification V2 intégrée
        </p>
        <p class="mt-1 text-sm text-muted">
          Perles acceptées · {{ rail.priceTotalV2 }} € · {{ rail.durationLabelV2 }}. Vous pouvez
          clôturer la prestation.
        </p>
      </section>

      <section
        v-else-if="canResumeAfterV2"
        class="mt-6 rounded-card border border-secondary/40 bg-secondary-container/25 px-4 py-4"
      >
        <p class="text-sm font-semibold text-on-secondary-container">
          Modification acceptée — V2 active
        </p>
        <p class="mt-1 text-sm text-muted">
          Consultez les preuves puis reprenez la réalisation aux totaux V2.
        </p>
        <button type="button" class="btn-primary mt-4" @click="goModification">
          Voir les preuves V2
        </button>
      </section>

      <button
        v-if="!state.pearlsEventHandled && !state.pearlsEventOpen && !isV2"
        type="button"
        class="btn-secondary mt-6"
        @click="opportunity.openPearlsEvent()"
      >
        Signaler un événement
      </button>
      <button
        v-else-if="state.pearlsEventHandled && !isV2 && !state.modificationRefused"
        type="button"
        class="btn-primary mt-6"
        @click="goModification"
      >
        Continuer la composition
      </button>
      <button
        v-else-if="isV2 && state.serviceResumedAfterV2"
        type="button"
        class="btn-secondary mt-6"
        disabled
      >
        Modification déjà traitée
      </button>
    </div>

    <StickyFooter
      v-if="canQualifyCompletion"
      label="Terminer la prestation"
      @action="finish"
    />
    <StickyFooter
      v-else-if="canResumeAfterV2"
      label="Voir les preuves V2"
      @action="goModification"
    />
    <StickyFooter
      v-else-if="isInProgress && !state.modificationRefused"
      label="Dossier du jour"
      @action="router.push({ name: 'execution-dossier' })"
    />

    <!-- Modal événement perles (D1) -->
    <div
      v-if="state.pearlsEventOpen"
      class="fixed inset-0 z-50 flex items-end bg-primary/50"
      @click.self="opportunity.closePearlsEvent()"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5 shadow-lg">
        <p class="badge-mono">Événement · Modification</p>
        <h2 class="mt-2 text-lg font-bold text-primary">
          {{ rail.clientName }} demande une modification
        </h2>
        <p class="mt-2 text-sm text-muted">
          Ajouter des perles à la coiffure. L’engagement V1 reste actif jusqu’à ce qu’une
          modification soit acceptée.
        </p>
        <button type="button" class="btn-primary mt-5" @click="evaluate">
          Évaluer la modification
        </button>
        <button
          type="button"
          class="btn-secondary mt-2"
          @click="refuseOpen = true"
        >
          Refuser la modification
        </button>
      </div>
    </div>

    <!-- Refus motif -->
    <div
      v-if="refuseOpen"
      class="fixed inset-0 z-[60] flex items-end bg-primary/40"
      @click.self="refuseOpen = false"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Refus structuré</p>
        <h2 class="mt-2 text-base font-bold text-primary">Motif du refus</h2>
        <ul class="mt-4 space-y-2">
          <li v-for="reason in MODIFICATION_REFUSAL_REASONS" :key="reason.id">
            <button
              type="button"
              class="choice w-full"
              :class="{ 'choice-active': refuseReasonId === reason.id }"
              @click="refuseReasonId = reason.id"
            >
              {{ reason.label }}
            </button>
          </li>
        </ul>
        <button
          type="button"
          class="btn-primary mt-5"
          :disabled="!refuseReasonId"
          @click="confirmRefuse"
        >
          Confirmer le refus
        </button>
        <button type="button" class="btn-ghost mx-auto mt-3 block" @click="refuseOpen = false">
          Annuler
        </button>
      </div>
    </div>

    <!-- Sheets V1 / V2 -->
    <div
      v-if="sheet"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Engagement · {{ sheet.toUpperCase() }}</p>
        <h2 class="mt-2 text-base font-bold text-primary">Prestation convenue</h2>
        <ul class="mt-4 space-y-2 text-sm text-primary">
          <li>{{ rail.prestationLabel }} · {{ rail.lengthLabel }}</li>
          <li v-if="sheet === 'v2'">{{ rail.pearlsLabel }} inclus</li>
          <li>
            Prix :
            {{ sheet === 'v2' ? rail.priceTotalV2 : rail.priceTotal }} €
          </li>
          <li>
            Durée :
            {{ sheet === 'v2' ? rail.durationLabelV2 : rail.durationLabel }}
          </li>
        </ul>
        <button type="button" class="btn-primary mt-5" @click="sheet = null">Fermer</button>
      </div>
    </div>
  </div>
</template>
