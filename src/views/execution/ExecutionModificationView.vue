<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import {
  EXTRA_DURATION_OPTIONS,
  MODIFICATION_MOTIFS,
  MODIFICATION_SEQUENCE,
  SUPPLEMENT_OPTIONS,
} from '../../domain/model'
import { useOpportunityStore } from '../../stores/opportunity'
import { useDemoStore } from '../../stores/demo'

const router = useRouter()
const opportunity = useOpportunityStore()
const demo = useDemoStore()
const {
  rail,
  state,
  isV2,
  canComposeModification,
  canRequestModification,
  canResumeAfterV2,
  modificationSequenceRunning,
  modificationSequenceDone,
  balancePreview,
} = storeToRefs(opportunity)
const { displayName } = storeToRefs(demo)

const sheet = ref(null)

watch(
  () => ({
    handled: state.value.pearlsEventHandled,
    refused: state.value.modificationRefused,
    inProgress: state.value.executionStatus,
  }),
  ({ handled, refused, inProgress }) => {
    if (inProgress !== 'IN_PROGRESS') {
      router.replace({ name: 'execution-dossier' })
      return
    }
    if (!handled || refused) {
      router.replace({ name: 'execution-progress' })
    }
  },
  { immediate: true },
)

const previewTotal = computed(() =>
  state.value.selectedSupplementId === '10' ? rail.value.priceTotalV2 : rail.value.priceTotal,
)
const previewDuration = computed(() =>
  state.value.selectedExtraDurationId === '20'
    ? rail.value.durationLabelV2
    : rail.value.durationLabel,
)

const proofRows = computed(() => [
  {
    id: 'demand',
    label: 'Demande cliente',
    value: rail.value.pearlsLabel,
    action: 'demand',
    actionLabel: 'Voir la demande',
  },
  {
    id: 'proposal',
    label: `Proposition ${displayName.value}`,
    value: `+${rail.value.modificationSupplement} € · +${rail.value.modificationMinutes} min · total ${rail.value.priceTotalV2} €`,
    action: 'proposal',
    actionLabel: 'Voir la proposition',
  },
  {
    id: 'consent',
    label: 'Consentement Inès',
    value: `Accepté à ${state.value.modificationAcceptedAtLabel || rail.value.modificationAcceptedAt}`,
    action: 'consent',
    actionLabel: 'Voir le consentement',
  },
  {
    id: 'v2',
    label: 'Engagement actif',
    value: 'V2',
  },
  {
    id: 'v1',
    label: 'Engagement archivé',
    value: `V1 · ${rail.value.priceTotal} € · ${rail.value.durationLabel}`,
    action: 'v1',
    actionLabel: 'Voir V1',
  },
])

function send() {
  opportunity.requestModificationAgreement()
}

function resume() {
  if (opportunity.resumeServiceAfterV2()) {
    router.push({ name: 'execution-progress' })
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Modification"
      badge="Acte D"
      back-label="En cours"
      @back="router.push({ name: 'execution-progress' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <!-- Composition (D2) -->
      <section v-if="canComposeModification">
        <p class="badge-mono">Composition · Rail démo</p>
        <h2 class="mt-2 screen-title">Proposer une modification</h2>
        <p class="screen-lead">
          Rendez les conséquences explicites. V2 ne devient active qu’après l’accord d’Inès.
        </p>

        <div class="mt-5 rounded-card border border-outline-soft bg-surface px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">Modification</p>
          <p class="mt-1 text-sm font-medium text-primary">{{ rail.pearlsLabel }}</p>
        </div>

        <fieldset class="mt-5">
          <legend class="field-label">Supplément</legend>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="opt in SUPPLEMENT_OPTIONS"
              :key="opt.id"
              type="button"
              class="choice text-center text-sm"
              :class="{
                'choice-active': state.selectedSupplementId === opt.id,
                'opacity-40': !opt.rail,
              }"
              :disabled="!opt.rail"
              @click="opportunity.setSupplement(opt.id)"
            >
              <span class="block">{{ opt.label }}</span>
              <span v-if="!opt.rail" class="mt-0.5 block text-[10px] font-normal text-muted">
                Hors cadre de la démo
              </span>
            </button>
          </div>
          <p class="mt-1.5 text-[11px] text-muted">+10 € requis pour le rail démo</p>
        </fieldset>

        <fieldset class="mt-5">
          <legend class="field-label">Durée supplémentaire</legend>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="opt in EXTRA_DURATION_OPTIONS"
              :key="opt.id"
              type="button"
              class="choice text-center text-sm"
              :class="{
                'choice-active': state.selectedExtraDurationId === opt.id,
                'opacity-40': !opt.rail,
              }"
              :disabled="!opt.rail"
              @click="opportunity.setExtraDuration(opt.id)"
            >
              <span class="block">{{ opt.label }}</span>
              <span v-if="!opt.rail" class="mt-0.5 block text-[10px] font-normal text-muted">
                Hors cadre de la démo
              </span>
            </button>
          </div>
          <p class="mt-1.5 text-[11px] text-muted">+20 min requis pour le rail démo</p>
        </fieldset>

        <fieldset class="mt-5">
          <legend class="field-label">Motif</legend>
          <ul class="space-y-2">
            <li v-for="motif in MODIFICATION_MOTIFS" :key="motif.id">
              <button
                type="button"
                class="choice w-full"
                :class="{
                  'choice-active': state.selectedMotifId === motif.id,
                  'opacity-40': motif.disabled,
                }"
                :disabled="motif.disabled"
                @click="opportunity.setMotif(motif.id)"
              >
                <span class="block">{{ motif.label }}</span>
                <span
                  v-if="motif.disabled"
                  class="mt-0.5 block text-[10px] font-normal text-muted"
                >
                  Hors cadre de la démo
                </span>
              </button>
            </li>
          </ul>
        </fieldset>

        <dl class="mt-5 grid grid-cols-2 gap-2">
          <div class="rounded-card border border-outline-soft bg-surface-low px-3 py-3">
            <dt class="text-[10px] font-semibold uppercase text-muted">Nouveau total</dt>
            <dd class="mt-1 text-sm font-semibold text-primary">{{ previewTotal }} €</dd>
          </div>
          <div class="rounded-card border border-outline-soft bg-surface-low px-3 py-3">
            <dt class="text-[10px] font-semibold uppercase text-muted">Nouvelle durée</dt>
            <dd class="mt-1 text-sm font-semibold text-primary">{{ previewDuration }}</dd>
          </div>
        </dl>

        <p
          v-if="canRequestModification"
          class="mt-4 rounded-card border border-secondary/30 bg-secondary-container/20 px-3 py-2.5 text-sm text-on-secondary-container"
        >
          Inès verra : +{{ rail.modificationSupplement }} € · +{{ rail.modificationMinutes }} min ·
          nouveau total {{ rail.priceTotalV2 }} €.
        </p>

        <button type="button" class="btn-ghost mt-4 text-xs" @click="sheet = 'v1'">
          Voir V1 ({{ rail.priceTotal }} € · {{ rail.durationLabel }})
        </button>
      </section>

      <!-- Séquence Inès (D3) -->
      <section v-else-if="modificationSequenceRunning || (modificationSequenceDone && !isV2)">
        <p class="badge-mono">Simulateur · Inès</p>
        <h2 class="mt-2 screen-title">Inès répond à la modification</h2>
        <p class="screen-lead">
          Séquence déterministe — vous constatez, vous n’acceptez pas à sa place.
        </p>
        <ol class="mt-6 space-y-3">
          <li
            v-for="(step, index) in MODIFICATION_SEQUENCE"
            :key="step.id"
            class="rounded-card border px-4 py-3 transition"
            :class="
              state.modificationSequenceStep >= index
                ? 'border-secondary bg-secondary-container/30'
                : 'border-outline-soft bg-surface opacity-50'
            "
          >
            <div class="flex items-start gap-3">
              <span
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                :class="
                  state.modificationSequenceStep >= index
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container text-muted'
                "
              >
                {{ state.modificationSequenceStep > index ? '✓' : index + 1 }}
              </span>
              <div>
                <p class="text-sm font-semibold text-primary">{{ step.label }}</p>
                <p class="mt-0.5 text-xs text-muted">{{ step.detail }}</p>
              </div>
            </div>
          </li>
        </ol>
      </section>

      <!-- Preuves V2 (D3) -->
      <section v-else-if="isV2">
        <p class="badge-mono">État · V2</p>
        <h2 class="mt-2 screen-title">Modification acceptée — engagement V2 actif</h2>
        <p class="screen-lead">
          Les preuves protègent temps et revenu. Ouvrez-les pour constater avant de reprendre.
        </p>

        <dl class="mt-5 space-y-2">
          <div
            v-for="row in proofRows"
            :key="row.id"
            class="rounded-card border border-outline-soft bg-surface px-4 py-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <dt class="text-xs font-semibold uppercase tracking-wide text-muted">
                  {{ row.label }}
                </dt>
                <dd class="mt-1 text-sm font-medium text-primary">{{ row.value }}</dd>
              </div>
              <button
                v-if="row.action"
                type="button"
                class="btn-ghost shrink-0 text-xs"
                @click="sheet = row.action"
              >
                {{ row.actionLabel }}
              </button>
            </div>
          </div>
        </dl>

        <p class="mt-4 text-center text-[11px] text-muted">
          Solde prévisionnel après acompte : {{ balancePreview }} €
        </p>
      </section>
    </div>

    <StickyFooter
      v-if="canComposeModification"
      label="Demander l’accord d’Inès"
      :disabled="!canRequestModification"
      @action="send"
    >
      <p v-if="!canRequestModification" class="mt-2 text-center text-[11px] text-muted">
        Sélectionnez +10 € et +20 min
      </p>
    </StickyFooter>

    <StickyFooter
      v-else-if="canResumeAfterV2"
      label="Reprendre la prestation"
      @action="resume"
    >
      <p class="mt-2 text-center text-[11px] text-muted">
        Consultation des preuves recommandée
      </p>
    </StickyFooter>

    <!-- Sheets preuves -->
    <div
      v-if="sheet"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto max-h-[85vh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface p-5">
        <template v-if="sheet === 'demand'">
          <p class="badge-mono">Preuve · Demande</p>
          <h2 class="mt-2 text-base font-bold text-primary">Demande d’{{ rail.clientName }}</h2>
          <p class="mt-3 text-sm text-primary">
            « J’aimerais ajouter des perles au résultat prévu. »
          </p>
          <p class="mt-3 text-xs text-muted">
            Signalée pendant la prestation · engagement V1 encore actif à ce moment.
          </p>
        </template>
        <template v-else-if="sheet === 'proposal'">
          <p class="badge-mono">Preuve · Proposition</p>
          <h2 class="mt-2 text-base font-bold text-primary">Proposition de {{ displayName }}</h2>
          <ul class="mt-3 space-y-2 text-sm text-primary">
            <li>Modification : {{ rail.pearlsLabel }}</li>
            <li>Supplément : +{{ rail.modificationSupplement }} €</li>
            <li>Durée : +{{ rail.modificationMinutes }} min</li>
            <li>Nouveau total : {{ rail.priceTotalV2 }} €</li>
            <li>Nouvelle durée : {{ rail.durationLabelV2 }}</li>
          </ul>
        </template>
        <template v-else-if="sheet === 'consent'">
          <p class="badge-mono">Preuve · Consentement</p>
          <h2 class="mt-2 text-base font-bold text-primary">Acceptation Inès</h2>
          <p class="mt-3 text-sm text-primary">
            Modification acceptée explicitement (+{{ rail.modificationSupplement }} € · +{{
              rail.modificationMinutes
            }}
            min).
          </p>
          <p class="mt-3 text-xs text-muted">
            Horodatage démo : {{ state.modificationAcceptedAtLabel || rail.modificationAcceptedAt }}
          </p>
        </template>
        <template v-else-if="sheet === 'v1'">
          <p class="badge-mono">Engagement · V1</p>
          <h2 class="mt-2 text-base font-bold text-primary">Version archivée</h2>
          <ul class="mt-3 space-y-2 text-sm text-primary">
            <li>{{ rail.prestationLabel }} · {{ rail.lengthLabel }}</li>
            <li>Prix : {{ rail.priceTotal }} €</li>
            <li>Durée : {{ rail.durationLabel }}</li>
            <li>Acompte : {{ rail.deposit }} €</li>
          </ul>
        </template>
        <button type="button" class="btn-primary mt-5" @click="sheet = null">Fermer</button>
      </div>
    </div>
  </div>
</template>
