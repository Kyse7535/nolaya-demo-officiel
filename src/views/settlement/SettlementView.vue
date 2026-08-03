<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useOpportunityStore } from '../../stores/opportunity'
import { useDemoStore } from '../../stores/demo'

const router = useRouter()
const opportunity = useOpportunityStore()
const demo = useDemoStore()
const {
  rail,
  state,
  isCompleted,
  isSettled,
  settlementSequence,
  settlementSequenceRunning,
  settlementSequenceDone,
  balancePreview,
  platformFee,
  netRevenue,
} = storeToRefs(opportunity)
const { displayName } = storeToRefs(demo)

const sheet = ref(null) // 'payment' | 'fees' | 'v2' | null

watch(
  () => ({ completed: isCompleted.value, settled: isSettled.value }),
  ({ completed }) => {
    if (!completed) {
      router.replace({ name: 'execution-complete' })
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (isCompleted.value && !isSettled.value) {
    opportunity.startSettlementSequence()
  }
})

const financeRows = computed(() => [
  {
    id: 'v1',
    label: 'Prestation de départ',
    value: `${rail.value.priceTotal} €`,
  },
  {
    id: 'v2',
    label: 'Perles ajoutées',
    value: `+${rail.value.modificationSupplement} €`,
    action: 'v2',
    actionLabel: 'Voir le détail',
  },
  {
    id: 'total',
    label: 'Total final',
    value: `${rail.value.priceTotalV2} €`,
    emphasize: true,
  },
  {
    id: 'deposit',
    label: 'Acompte déjà payé',
    value: `−${rail.value.deposit} €`,
  },
  {
    id: 'balance',
    label: 'Payé par Inès',
    value: `${rail.value.balanceFinal} €`,
    action: 'payment',
    actionLabel: 'Voir la preuve de paiement',
  },
  {
    id: 'fees',
    label: 'Frais de plateforme',
    value: `${platformFee.value} € (10 %)`,
    action: 'fees',
    actionLabel: 'Voir le détail des frais',
  },
  {
    id: 'net',
    label: `Revenu net ${displayName.value}`,
    value: `${netRevenue.value} €`,
    emphasize: true,
    highlight: true,
  },
])

function goReview() {
  if (!isSettled.value) return
  router.push({ name: 'settlement-relation' })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Paiement"
      :badge="isSettled ? 'Payé' : 'Paiement'"
      back-label="Clôture"
      @back="router.push({ name: 'execution-complete' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <!-- Séquence Inès (simulée) -->
      <section v-if="!settlementSequenceDone || settlementSequenceRunning">
        <p class="badge-mono">Inès (simulée)</p>
        <h2 class="mt-2 screen-title">Ce qu’Inès a payé</h2>
        <p class="screen-lead">
          Inès paie le reste. Vous regardez le détail.
        </p>

        <ol class="mt-6 space-y-3">
          <li
            v-for="(step, index) in settlementSequence"
            :key="step.id"
            class="rounded-card border px-4 py-3 transition"
            :class="
              state.settlementSequenceStep >= index
                ? 'border-secondary bg-secondary-container/30'
                : 'border-outline-soft bg-surface opacity-50'
            "
          >
            <div class="flex items-start gap-3">
              <span
                class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                :class="
                  state.settlementSequenceStep >= index
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container text-muted'
                "
              >
                {{ state.settlementSequenceStep > index ? '✓' : index + 1 }}
              </span>
              <div>
                <p class="text-sm font-semibold text-primary">{{ step.label }}</p>
                <p class="mt-0.5 text-xs text-muted">{{ step.detail }}</p>
              </div>
            </div>
          </li>
        </ol>
      </section>

      <!-- Récap payé + preuves -->
      <section v-else>
        <p class="badge-mono">Paiement terminé</p>
        <h2 class="mt-2 screen-title">Paiement terminé</h2>
        <p class="screen-lead">
          Voici ce qu’Inès a payé et ce que vous gardez.
        </p>

        <dl class="mt-5 space-y-2">
          <div
            v-for="row in financeRows"
            :key="row.id"
            class="rounded-card border px-4 py-3"
            :class="
              row.highlight
                ? 'border-secondary/50 bg-secondary-container/25'
                : 'border-outline-soft bg-surface'
            "
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <dt
                  class="text-xs font-semibold uppercase tracking-wide"
                  :class="row.highlight ? 'text-on-secondary-container' : 'text-muted'"
                >
                  {{ row.label }}
                </dt>
                <dd
                  class="mt-1 text-sm font-medium"
                  :class="row.emphasize ? 'text-base font-bold text-primary' : 'text-primary'"
                >
                  {{ row.value }}
                </dd>
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
          Reste {{ balancePreview }} € réglé · avis Inès prêt à consulter
        </p>
      </section>
    </div>

    <StickyFooter
      v-if="isSettled"
      label="Voir l’avis et la suite"
      @action="goReview"
    />

    <!-- Sheet preuve paiement final -->
    <div
      v-if="sheet === 'payment'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto max-h-[85vh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Détail · Paiement final</p>
        <h2 class="mt-2 text-base font-bold text-primary">{{ rail.balanceFinal }} € réglés</h2>
        <dl class="mt-4 space-y-2 text-sm text-primary">
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Montant</dt>
            <dd class="font-medium">{{ rail.balanceFinal }} €</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Après acompte</dt>
            <dd class="font-medium">{{ rail.deposit }} € déjà payés</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Total prestation</dt>
            <dd class="font-medium">{{ rail.priceTotalV2 }} €</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Payé par</dt>
            <dd class="font-medium">Inès</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Référence</dt>
            <dd class="font-mono text-xs">{{ state.finalPaymentRef || '—' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Horodatage</dt>
            <dd class="font-medium">{{ state.finalPaymentAtLabel || '—' }}</dd>
          </div>
        </dl>
        <button type="button" class="btn-primary mt-5" @click="sheet = null">Fermer</button>
      </div>
    </div>

    <!-- Sheet détail frais -->
    <div
      v-if="sheet === 'fees'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto max-h-[85vh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Détail · Frais plateforme</p>
        <h2 class="mt-2 text-base font-bold text-primary">Comment se calcule votre net</h2>
        <dl class="mt-4 space-y-2 text-sm text-primary">
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Base (total final)</dt>
            <dd class="font-medium">{{ rail.priceTotalV2 }} €</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted">Frais plateforme (10 %)</dt>
            <dd class="font-medium">{{ platformFee }} €</dd>
          </div>
          <div class="flex justify-between gap-3 border-t border-outline-soft pt-2">
            <dt class="font-semibold">Revenu net</dt>
            <dd class="font-bold">{{ netRevenue }} €</dd>
          </div>
        </dl>
        <p class="mt-4 text-xs text-muted">
          Exemple pour la démo — non modifiable ici.
        </p>
        <button type="button" class="btn-primary mt-5" @click="sheet = null">Fermer</button>
      </div>
    </div>

    <!-- Sheet rappel modification -->
    <div
      v-if="sheet === 'v2'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto max-h-[85vh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Rappel · Modification</p>
        <h2 class="mt-2 text-base font-bold text-primary">{{ rail.pearlsLabel }}</h2>
        <ul class="mt-4 space-y-2 text-sm text-primary">
          <li>+{{ rail.modificationSupplement }} € · +{{ rail.modificationMinutes }} min</li>
          <li>Total {{ rail.priceTotalV2 }} € · {{ rail.durationLabelV2 }}</li>
          <li>
            Accepté {{ state.modificationAcceptedAtLabel || rail.modificationAcceptedAt }}
          </li>
        </ul>
        <button type="button" class="btn-primary mt-5" @click="sheet = null">Fermer</button>
      </div>
    </div>
  </div>
</template>
