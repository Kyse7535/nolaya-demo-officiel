<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useOpportunityStore } from '../../stores/opportunity'
import { useFrameworkStore } from '../../stores/framework'

const router = useRouter()
const opportunity = useOpportunityStore()
const frameworkStore = useFrameworkStore()
const {
  rail,
  state,
  isCommitted,
  engagementSequence,
  engagementSequenceRunning,
  engagementSequenceDone,
  balancePreview,
} = storeToRefs(opportunity)
const { framework, pauseText } = storeToRefs(frameworkStore)

const sheet = ref(null) // 'consent' | 'payment' | 'offer' | null

const securedRows = computed(() => [
  {
    id: 'version',
    label: 'Proposition acceptée',
    value: `${rail.value.prestationLabel} · ${rail.value.priceTotal} €`,
    action: 'offer',
    actionLabel: 'Voir l’offre',
  },
  {
    id: 'price',
    label: 'Prix convenu',
    value: `${rail.value.priceTotal} €`,
  },
  {
    id: 'deposit',
    label: 'Acompte reçu',
    value: `${rail.value.deposit} €`,
    action: 'payment',
    actionLabel: 'Voir le détail du paiement',
  },
  {
    id: 'balance',
    label: 'Reste à payer',
    value: `${balancePreview.value} €`,
  },
  {
    id: 'slot',
    label: 'Créneau',
    value: `${rail.value.dateLabel}, ${rail.value.timeLabel} — confirmé`,
  },
  {
    id: 'consent',
    label: 'Règles acceptées',
    value: 'Enregistré',
    action: 'consent',
    actionLabel: 'Voir l’accord',
  },
])

onMounted(() => {
  if (!opportunity.hasFirmProposal) {
    router.replace({ name: 'opportunity-sent' })
    return
  }
  opportunity.startEngagementSequence()
})

function goPrep() {
  if (!isCommitted.value) return
  router.push({ name: 'engagement-prep' })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Rendez-vous confirmé"
      badge="Confirmé"
      back-label="Proposition"
      @back="router.push({ name: 'opportunity-sent' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <!-- Séquence Inès (simulée) -->
      <section v-if="!engagementSequenceDone || engagementSequenceRunning">
        <p class="badge-mono">Inès (simulée)</p>
        <h2 class="mt-2 screen-title">Inès répond à votre proposition</h2>
        <p class="screen-lead">
          Inès (cliente simulée) répond. Vous regardez seulement — vous n’acceptez pas à sa place.
        </p>

        <ol class="mt-6 space-y-3">
          <li
            v-for="(step, index) in engagementSequence"
            :key="step.id"
            class="rounded-card border px-4 py-3 transition"
            :class="
              state.engagementSequenceStep >= index
                ? 'border-secondary bg-secondary-container/30'
                : 'border-outline-soft bg-surface opacity-50'
            "
          >
            <div class="flex items-start gap-3">
              <span
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                :class="
                  state.engagementSequenceStep >= index
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container text-muted'
                "
              >
                {{ state.engagementSequenceStep > index ? '✓' : index + 1 }}
              </span>
              <div>
                <p class="text-sm font-semibold text-primary">{{ step.label }}</p>
                <p class="mt-0.5 text-xs text-muted">{{ step.detail }}</p>
              </div>
            </div>
          </li>
        </ol>
      </section>

      <!-- Récap confirmé + preuves (C1) -->
      <section v-else>
        <p class="badge-mono">Rendez-vous confirmé</p>
        <h2 class="mt-2 screen-title">Rendez-vous confirmé avec {{ rail.clientName }}</h2>
        <p class="screen-lead">
          Le rendez-vous est confirmé. Vous pouvez revoir ce qu’Inès a accepté.
        </p>

        <dl class="mt-5 space-y-2">
          <div
            v-for="row in securedRows"
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
                class="btn-ghost shrink-0 text-left text-xs"
                @click="sheet = row.action"
              >
                {{ row.actionLabel }}
              </button>
            </div>
          </div>
        </dl>

        <p class="mt-4 text-center text-[11px] text-muted">
          Prochaine étape : préparer le rendez-vous
        </p>
      </section>
    </div>

    <StickyFooter
      v-if="isCommitted"
      label="Préparer le rendez-vous"
      @action="goPrep"
    />

    <!-- Sheet consentement -->
    <div
      v-if="sheet === 'consent'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Détail · Accord</p>
        <h2 class="mt-2 text-base font-bold text-primary">Règles acceptées par Inès</h2>
        <ul class="mt-4 space-y-2 text-sm text-primary">
          <li>Tolérance de retard : {{ framework.lateTolerance }} min</li>
          <li>Annulation : selon le délai restant (cadre actif)</li>
          <li>Préparation cliente : {{ rail.clientTasks }}</li>
          <li>{{ pauseText }}</li>
        </ul>
        <p class="mt-4 text-xs text-muted">
          Accepté par Inès · {{ state.consentAtLabel || '—' }}
        </p>
        <button type="button" class="btn-primary mt-5" @click="sheet = null">Fermer</button>
      </div>
    </div>

    <!-- Sheet paiement -->
    <div
      v-if="sheet === 'payment'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Détail · Paiement</p>
        <h2 class="mt-2 text-base font-bold text-primary">Acompte reçu</h2>
        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Montant</dt>
            <dd class="font-semibold text-primary">{{ rail.deposit }} €</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Déduit du total</dt>
            <dd class="font-medium text-primary">{{ rail.priceTotal }} €</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Reste à payer</dt>
            <dd class="font-medium text-primary">{{ balancePreview }} €</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Référence</dt>
            <dd class="font-mono text-xs text-primary">{{ state.paymentRef || '—' }}</dd>
          </div>
        </dl>
        <p class="mt-4 text-xs text-muted">Reçu · {{ state.paymentAtLabel || '—' }}</p>
        <button type="button" class="btn-primary mt-5" @click="sheet = null">Fermer</button>
      </div>
    </div>

    <!-- Sheet offre acceptée -->
    <div
      v-if="sheet === 'offer'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Proposition acceptée · Lecture seule</p>
        <h2 class="mt-2 text-base font-bold text-primary">Proposition acceptée</h2>
        <ul class="mt-4 space-y-2 text-sm text-primary">
          <li>{{ rail.prestationLabel }} · {{ rail.lengthLabel }}</li>
          <li>Total {{ rail.priceTotal }} € (dont mèches {{ rail.mechesAmount }} €)</li>
          <li>Acompte {{ rail.deposit }} €</li>
          <li>{{ rail.dateLabel }} à {{ rail.timeLabel }} · salon {{ rail.place }}</li>
          <li>Durée {{ rail.durationLabel }}</li>
        </ul>
        <button type="button" class="btn-primary mt-5" @click="sheet = null">Fermer</button>
      </div>
    </div>
  </div>
</template>
