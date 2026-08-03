<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { REFUSAL_REASONS } from '../../domain/model'
import { useOpportunityStore } from '../../stores/opportunity'
import { useFrameworkStore } from '../../stores/framework'
import { useDemoStore } from '../../stores/demo'

const router = useRouter()
const opportunity = useOpportunityStore()
const framework = useFrameworkStore()
const demo = useDemoStore()
const {
  rail,
  state,
  canConfirmRealize,
  canSendProposal,
  hasFirmProposal,
  invitationRefused,
} = storeToRefs(opportunity)
const { displayName } = storeToRefs(demo)

const previewOpen = ref(false)
const refuseOpen = ref(false)
const refuseReason = ref('')

const pauseNote = computed(
  () => `Pause prévue : ${framework.pauseText} (incluse, pas facturée en plus)`,
)

const demandProofs = computed(() => {
  const proofs = []
  if (state.value.hasRecentPhoto || state.value.selectedQuestionIds.includes('photo')) {
    proofs.push('Photo récente')
  }
  proofs.push('Texture crépue', 'Cuir sensible')
  if (state.value.selectedQuestionIds.includes('allergies')) {
    proofs.push('Aucune allergie connue')
  }
  return proofs
})

const offerLocked = computed(() => !state.value.canRealize || hasFirmProposal.value)

const refuseDisabled = computed(
  () => state.value.canRealize || hasFirmProposal.value || invitationRefused.value,
)

const reviewLabel = computed(
  () =>
    `${rail.value.priceTotal} € · ${rail.value.deposit} € · ${rail.value.dateLabel} ${rail.value.timeLabel}`,
)

function confirmRealize() {
  opportunity.confirmRealize()
  nextTick(() => {
    document.getElementById('proposition-compose')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

function sendProposal() {
  if (opportunity.sendFirmProposal()) {
    router.push({ name: 'opportunity-sent' })
  }
}

function goFollowUp() {
  router.push({ name: 'opportunity-sent' })
}

function confirmRefuse() {
  if (!refuseReason.value || refuseDisabled.value) return
  opportunity.refuse(refuseReason.value, { fromFeasibility: true })
  refuseOpen.value = false
  router.push({ name: 'opportunity-demande' })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Proposition"
      badge="Décision"
      @back="router.push({ name: 'opportunity-demande' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <!-- Décision — résumé demande + avis pro -->
      <section>
        <p class="badge-mono">Étape 1 · Votre avis</p>
        <h2 class="mt-2 screen-title">Pouvez-vous réaliser ?</h2>
        <p class="screen-lead">
          Les infos sont dans la demande. Décidez si vous pouvez réaliser.
        </p>

        <div class="mt-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-secondary">
            Synthèse de la demande
          </p>
          <ul class="mt-2 flex flex-wrap gap-2">
            <li
              v-for="proof in demandProofs"
              :key="proof"
              class="rounded-card border border-outline-soft bg-surface-low px-2.5 py-1 text-xs font-medium text-primary"
            >
              {{ proof }}
            </li>
          </ul>
        </div>

        <div v-if="!state.canRealize && !hasFirmProposal" class="mt-6 space-y-2">
          <button
            type="button"
            class="btn-primary"
            :disabled="!canConfirmRealize"
            @click="confirmRealize"
          >
            Je peux réaliser
          </button>
          <p class="text-center text-[11px] text-muted">
            Adaptée au cuir chevelu sensible d’Inès
          </p>
          <button
            type="button"
            class="btn-secondary"
            @click="refuseOpen = true"
          >
            Je ne peux pas réaliser
          </button>
        </div>

        <div v-else class="mt-6 space-y-2">
          <div
            class="rounded-card border border-secondary/40 bg-secondary-container/30 px-3 py-3"
          >
            <p class="text-sm font-semibold text-on-secondary-container">
              Vous réalisez
            </p>
            <p class="mt-1 text-sm text-muted">
              <template v-if="hasFirmProposal">
                Décision enregistrée. Proposition déjà envoyée.
              </template>
              <template v-else>
                Décision enregistrée. Vérifiez puis envoyez votre proposition ci-dessous.
              </template>
            </p>
          </div>
          <button type="button" class="btn-secondary" disabled>
            Je ne peux pas réaliser — décision déjà prise
          </button>
        </div>
      </section>

      <!-- Proposition (verrouillée jusqu’à « Je peux réaliser ») -->
      <section
        id="proposition-compose"
        class="mt-10 scroll-mt-4"
        :class="{ 'opacity-40': !state.canRealize && !hasFirmProposal }"
      >
        <p class="badge-mono">Étape 2 · Votre proposition</p>
        <h2 class="mt-2 text-lg font-bold text-primary">Confirmer la proposition</h2>
        <p class="mt-2 text-sm text-muted">
          Vérifiez puis envoyez — les montants et le créneau sont ceux convenus.
        </p>

        <dl class="mt-5 space-y-2" :class="{ 'pointer-events-none': !state.canRealize }">
          <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Prestation</dt>
            <dd class="mt-1 text-sm text-primary">
              {{ rail.prestationLabel }} · {{ rail.lengthLabel }}
            </dd>
          </div>
          <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Prix</dt>
            <dd class="mt-1 text-sm text-primary">Base {{ rail.priceBase }} €</dd>
            <label
              class="mt-2 flex items-center gap-2 text-sm text-primary opacity-60"
            >
              <input
                type="checkbox"
                :checked="true"
                disabled
              />
              Mèches incluses (+{{ rail.mechesAmount }} €)
            </label>
            <dd class="mt-2 text-base font-bold text-primary">Total {{ rail.priceTotal }} €</dd>
          </div>
          <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Créneau & durée</dt>
            <dd class="mt-1 text-sm text-primary">
              {{ rail.dateLabel }}, {{ rail.timeLabel }} · {{ rail.durationLabel }}
            </dd>
            <dd class="mt-1 text-sm text-muted">Salon {{ rail.place }}</dd>
          </div>
          <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Préparation</dt>
            <dd class="mt-1 text-sm text-primary">Cliente : {{ rail.clientTasks }}</dd>
            <dd class="mt-1 text-sm text-primary">Vous : {{ rail.proTasks }}</dd>
            <dd class="mt-2 text-xs text-muted">{{ pauseNote }}</dd>
          </div>
          <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Acompte · valable 30 min</dt>
            <dd class="mt-1 text-sm text-primary">Acompte {{ rail.deposit }} €</dd>
            <dd class="mt-1 text-sm text-muted">Proposition valable {{ rail.validityMinutes }} minutes</dd>
          </div>
        </dl>

        <button
          type="button"
          class="btn-ghost mt-4"
          :disabled="!state.canRealize && !hasFirmProposal"
          @click="previewOpen = true"
        >
          Aperçu — ce qu’Inès verra
        </button>

        <label
          class="choice mt-4 flex w-full items-start gap-3"
          :class="{
            'choice-active': state.offerReviewed,
            'cursor-pointer': !offerLocked,
            'cursor-not-allowed opacity-60': offerLocked && state.canRealize,
          }"
        >
          <input
            type="checkbox"
            class="mt-1"
            :checked="state.offerReviewed"
            :disabled="offerLocked"
            @change="opportunity.setOfferReviewed($event.target.checked)"
          />
          <span class="text-sm font-medium text-primary">
            <template v-if="hasFirmProposal">Proposition relue — déjà envoyée</template>
            <template v-else>J’ai relu la proposition ({{ reviewLabel }})</template>
          </span>
        </label>
      </section>
    </div>

    <StickyFooter
      v-if="state.canRealize && !hasFirmProposal"
      label="Envoyer la proposition"
      :disabled="!canSendProposal"
      @action="sendProposal"
    >
      <p v-if="!canSendProposal" class="mt-2 text-center text-[11px] text-muted">
        Relisez la proposition pour activer l’envoi
      </p>
    </StickyFooter>

    <div
      v-else-if="hasFirmProposal"
      class="sticky bottom-[46px] z-20 space-y-2 border-t border-outline-soft/70 bg-background/95 px-4 py-3 backdrop-blur"
    >
      <button type="button" class="btn-secondary" disabled>
        Proposition envoyée
      </button>
      <button type="button" class="btn-primary" @click="goFollowUp">
        Voir le suivi
      </button>
    </div>

    <!-- Aperçu cliente -->
    <div
      v-if="previewOpen"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="previewOpen = false"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Vue cliente</p>
        <h2 class="mt-2 text-base font-bold text-primary">Proposition de {{ displayName }}</h2>
        <ul class="mt-4 space-y-2 text-sm text-primary">
          <li>{{ rail.prestationLabel }} · {{ rail.lengthLabel }}</li>
          <li>Total {{ rail.priceTotal }} € (dont mèches {{ rail.mechesAmount }} €)</li>
          <li>Acompte {{ rail.deposit }} €</li>
          <li>{{ rail.dateLabel }} à {{ rail.timeLabel }} · salon {{ rail.place }}</li>
          <li>Durée {{ rail.durationLabel }}</li>
          <li>À préparer : {{ rail.clientTasks }}</li>
        </ul>
        <button type="button" class="btn-primary mt-5" @click="previewOpen = false">Fermer</button>
      </div>
    </div>

    <!-- Refus -->
    <div
      v-if="refuseOpen"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="refuseOpen = false"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <h2 class="text-base font-bold text-primary">Je ne peux pas réaliser</h2>
        <p class="mt-2 text-sm text-muted">Aucune proposition ne sera composée.</p>
        <div class="mt-4 space-y-2">
          <button
            v-for="reason in REFUSAL_REASONS"
            :key="reason.id"
            type="button"
            class="choice w-full"
            :class="{ 'choice-active': refuseReason === reason.id }"
            @click="refuseReason = reason.id"
          >
            {{ reason.label }}
          </button>
        </div>
        <button
          type="button"
          class="btn-primary mt-5"
          :disabled="!refuseReason"
          @click="confirmRefuse"
        >
          Confirmer le refus
        </button>
        <button type="button" class="btn-ghost mx-auto mt-3 block" @click="refuseOpen = false">
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>
