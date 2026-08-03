<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import {
  MODIFICATION_MOTIFS,
  MODIFICATION_SEQUENCE,
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
      router.replace({ name: 'execution-jour' })
      return
    }
    if (!handled || refused) {
      router.replace({ name: 'execution-progress' })
    }
  },
  { immediate: true },
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
    label: 'Accord d’Inès',
    value: `Accepté à ${state.value.modificationAcceptedAtLabel || rail.value.modificationAcceptedAt}`,
    action: 'consent',
    actionLabel: 'Voir l’accord',
  },
  {
    id: 'active',
    label: 'Accord actuel',
    value: `Modifiée (perles) · ${rail.value.priceTotalV2} €`,
  },
  {
    id: 'archived',
    label: 'Proposition initiale',
    value: `${rail.value.priceTotal} € · ${rail.value.durationLabel}`,
    action: 'v1',
    actionLabel: 'Voir le détail',
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
      badge="Accord"
      back-label="En cours"
      @back="router.push({ name: 'execution-progress' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <!-- Composition — valeurs figées en lecture seule -->
      <section v-if="canComposeModification">
        <h2 class="screen-title">Proposer une modification</h2>
        <p class="screen-lead">
          Comme un reçu : demande → votre prix → son oui. Inès doit accepter avant que ce soit
          valable.
        </p>
        <p
          class="mt-3 rounded-card border border-secondary/30 bg-secondary-container/20 px-3 py-2.5 text-sm font-semibold leading-relaxed text-on-secondary-container"
        >
          On note ici le changement pour éviter le « tu m’avais dit… » sur le prix ou la durée à
          la fin.
        </p>

        <div class="mt-5 rounded-card border border-outline-soft bg-surface px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">Modification</p>
          <p class="mt-1 text-sm font-medium text-primary">{{ rail.pearlsLabel }}</p>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-2">
          <div class="rounded-card border border-outline-soft bg-surface-low px-3 py-3 opacity-80">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-muted">Supplément</p>
            <p class="mt-1 text-sm font-semibold text-primary">
              +{{ rail.modificationSupplement }} €
            </p>
            <p class="mt-0.5 text-[11px] text-muted">Dans cette démo</p>
          </div>
          <div class="rounded-card border border-outline-soft bg-surface-low px-3 py-3 opacity-80">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-muted">Durée en plus</p>
            <p class="mt-1 text-sm font-semibold text-primary">
              +{{ rail.modificationMinutes }} min
            </p>
            <p class="mt-0.5 text-[11px] text-muted">Dans cette démo</p>
          </div>
        </div>

        <fieldset class="mt-5">
          <legend class="field-label">Motif</legend>
          <ul class="space-y-2">
            <li v-for="motif in MODIFICATION_MOTIFS" :key="motif.id">
              <button
                type="button"
                class="choice w-full"
                :class="{ 'choice-active': state.selectedMotifId === motif.id }"
                @click="opportunity.setMotif(motif.id)"
              >
                <span class="block">{{ motif.label }}</span>
              </button>
            </li>
          </ul>
        </fieldset>

        <dl class="mt-5 grid grid-cols-2 gap-2">
          <div class="rounded-card border border-outline-soft bg-surface-low px-3 py-3">
            <dt class="text-[10px] font-semibold uppercase text-muted">Nouveau total</dt>
            <dd class="mt-1 text-sm font-semibold text-primary">{{ rail.priceTotalV2 }} €</dd>
          </div>
          <div class="rounded-card border border-outline-soft bg-surface-low px-3 py-3">
            <dt class="text-[10px] font-semibold uppercase text-muted">Nouvelle durée</dt>
            <dd class="mt-1 text-sm font-semibold text-primary">{{ rail.durationLabelV2 }}</dd>
          </div>
        </dl>

        <p
          class="mt-4 rounded-card border border-secondary/30 bg-secondary-container/20 px-3 py-2.5 text-sm text-on-secondary-container"
        >
          Inès verra : +{{ rail.modificationSupplement }} € · +{{ rail.modificationMinutes }} min ·
          nouveau total {{ rail.priceTotalV2 }} €.
        </p>

        <button type="button" class="btn-ghost mt-4 text-xs" @click="sheet = 'v1'">
          Voir la proposition initiale ({{ rail.priceTotal }} € · {{ rail.durationLabel }})
        </button>
      </section>

      <!-- Séquence Inès (D3) -->
      <section v-else-if="modificationSequenceRunning || (modificationSequenceDone && !isV2)">
        <p class="badge-mono">Inès (simulée)</p>
        <h2 class="mt-2 screen-title">Inès répond à la modification</h2>
        <p class="screen-lead">
          Inès (cliente simulée) répond. Vous regardez seulement — vous n’acceptez pas à sa place.
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

      <!-- Preuves après acceptation -->
      <section v-else-if="isV2">
        <h2 class="screen-title">Modification acceptée</h2>
        <p class="screen-lead">
          Voici la trace du changement — ce qui a été accepté, consultable si besoin.
        </p>
        <p
          class="mt-3 rounded-card border border-secondary/30 bg-secondary-container/20 px-3 py-2.5 text-sm font-semibold leading-relaxed text-on-secondary-container"
        >
          Demande → votre prix → son oui. Comme un reçu partagé, en cas de désaccord sur le
          supplément.
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
          Reste à payer après acompte : {{ balancePreview }} €
        </p>
      </section>
    </div>

    <StickyFooter
      v-if="canComposeModification"
      label="Demander l’accord d’Inès"
      :disabled="!canRequestModification"
      @action="send"
    />

    <StickyFooter
      v-else-if="canResumeAfterV2"
      label="Reprendre la prestation"
      @action="resume"
    />

    <!-- Sheets preuves -->
    <div
      v-if="sheet"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto max-h-[85vh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface p-5">
        <template v-if="sheet === 'demand'">
          <p class="badge-mono">Détail · Demande</p>
          <h2 class="mt-2 text-base font-bold text-primary">Demande d’{{ rail.clientName }}</h2>
          <p class="mt-3 text-sm text-primary">
            « J’aimerais ajouter des perles au résultat prévu. »
          </p>
          <p class="mt-3 text-xs text-muted">
            Signalée pendant la prestation · l’accord initial était encore actif.
          </p>
        </template>
        <template v-else-if="sheet === 'proposal'">
          <p class="badge-mono">Détail · Proposition</p>
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
          <p class="badge-mono">Détail · Accord</p>
          <h2 class="mt-2 text-base font-bold text-primary">Accord d’Inès</h2>
          <p class="mt-3 text-sm text-primary">
            Modification acceptée (+{{ rail.modificationSupplement }} € · +{{
              rail.modificationMinutes
            }}
            min).
          </p>
          <p class="mt-3 text-xs text-muted">
            Horodatage : {{ state.modificationAcceptedAtLabel || rail.modificationAcceptedAt }}
          </p>
        </template>
        <template v-else-if="sheet === 'v1'">
          <p class="badge-mono">Proposition initiale</p>
          <h2 class="mt-2 text-base font-bold text-primary">Avant modification</h2>
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
