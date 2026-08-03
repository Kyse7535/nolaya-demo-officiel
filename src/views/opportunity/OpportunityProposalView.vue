<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { REFUSAL_REASONS } from '../../domain/model'
import { useOpportunityStore } from '../../stores/opportunity'
import { useFrameworkStore } from '../../stores/framework'
import { useDemoStore } from '../../stores/demo'

/** Preuves dossier enrichi — lecture seule (pas des cases à cocher). */
const DOSSIER_PROOFS = [
  'Photo récente',
  'Pas de défrisage (8 mois)',
  'Texture crépue',
  'Cuir sensible',
]

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
/** Choix local avant confirmation — happy path démo. */
const selectedDecision = ref('realize')

const pauseNote = computed(
  () =>
    `Pause du cadre : ${framework.pauseText} — informatif, non facturée à part`,
)

const offerLocked = computed(() => !state.value.canRealize || hasFirmProposal.value)

const refuseDisabled = computed(
  () => state.value.canRealize || hasFirmProposal.value || invitationRefused.value,
)

function confirmRealize() {
  if (selectedDecision.value !== 'realize') return
  opportunity.confirmRealize()
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
  router.push({ name: 'opportunity-dossier' })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Proposition"
      badge="Faisabilité"
      @back="router.push({ name: 'opportunity-dossier' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <!-- 9a Faisabilité — résumé dossier + décision pro -->
      <section>
        <p class="badge-mono">Étape 1 · Faisabilité</p>
        <h2 class="mt-2 screen-title">Votre décision sur ce dossier</h2>
        <p class="screen-lead">
          Les preuves sont déjà dans le dossier. Décidez si vous réalisez — vous ne revalidez pas
          chaque élément.
        </p>

        <div class="mt-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-secondary">
            Synthèse du dossier
          </p>
          <ul class="mt-2 flex flex-wrap gap-2">
            <li
              v-for="proof in DOSSIER_PROOFS"
              :key="proof"
              class="rounded-card border border-outline-soft bg-surface-low px-2.5 py-1 text-xs font-medium text-primary"
            >
              {{ proof }}
            </li>
          </ul>
        </div>

        <div v-if="!state.canRealize && !hasFirmProposal" class="mt-6 space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-secondary">Décision</p>
          <button
            type="button"
            class="choice w-full"
            :class="{ 'choice-active': selectedDecision === 'realize' }"
            @click="selectedDecision = 'realize'"
          >
            <span class="block text-sm font-semibold text-primary">
              Je réalise — tension légère
            </span>
            <span class="mt-0.5 block text-xs text-muted">
              Adaptée au cuir chevelu sensible d’Inès — dans le cadre de la démo
            </span>
          </button>

          <button
            type="button"
            class="btn-primary mt-3"
            :disabled="!canConfirmRealize || selectedDecision !== 'realize'"
            @click="confirmRealize"
          >
            Confirmer — je réalise
          </button>
          <button
            type="button"
            class="btn-secondary"
            @click="refuseOpen = true"
          >
            Refus technique
          </button>
        </div>

        <div v-else class="mt-6 space-y-2">
          <div
            class="rounded-card border border-secondary/40 bg-secondary-container/30 px-3 py-3"
          >
            <p class="text-sm font-semibold text-on-secondary-container">
              Vous réalisez — tension légère
            </p>
            <p class="mt-1 text-sm text-muted">
              <template v-if="hasFirmProposal">
                Décision enregistrée. Proposition ferme déjà envoyée.
              </template>
              <template v-else>
                Décision enregistrée. Composez et envoyez l’offre ferme ci-dessous.
              </template>
            </p>
          </div>
          <button type="button" class="btn-secondary" disabled>
            Refus technique — décision déjà prise
          </button>
        </div>
      </section>

      <!-- 9b Proposition (verrouillée jusqu’à « Je réalise ») -->
      <section
        class="mt-10"
        :class="{ 'opacity-40': !state.canRealize && !hasFirmProposal }"
      >
        <p class="badge-mono">Étape 2 · Offre ferme</p>
        <h2 class="mt-2 text-lg font-bold text-primary">Confirmer la proposition</h2>
        <p class="mt-2 text-sm text-muted">
          Montants et créneau figés dans le cadre de la démo (Inès) — confirmation, pas d’édition libre.
        </p>

        <dl class="mt-5 space-y-2" :class="{ 'pointer-events-none': !state.canRealize }">
          <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Prestation</dt>
            <dd class="mt-1 text-sm text-primary">
              {{ rail.prestationLabel }}, tension légère · {{ rail.lengthLabel }}
            </dd>
          </div>
          <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Prix</dt>
            <dd class="mt-1 text-sm text-primary">Base {{ rail.priceBase }} €</dd>
            <label class="mt-2 flex items-center gap-2 text-sm text-primary">
              <input
                type="checkbox"
                :checked="state.mechesIncluded"
                :disabled="offerLocked"
                @change="opportunity.setMechesIncluded($event.target.checked)"
              />
              Mèches incluses (+{{ rail.mechesAmount }} €) — requis
            </label>
            <dd class="mt-2 text-base font-bold text-primary">Total {{ rail.priceTotal }} €</dd>
            <p v-if="!state.mechesIncluded" class="mt-1 text-[11px] text-muted">
              Hors cadre de la démo si les mèches sont retirées (budget Inès).
            </p>
          </div>
          <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Créneau & durée</dt>
            <dd class="mt-1 text-sm text-primary">
              {{ rail.dateLabel }}, {{ rail.timeLabel }} · {{ rail.durationLabel }}
            </dd>
            <dd class="mt-1 text-sm text-muted">Salon {{ rail.place }}</dd>
          </div>
          <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Tâches</dt>
            <dd class="mt-1 text-sm text-primary">Cliente · {{ rail.clientTasks }}</dd>
            <dd class="mt-1 text-sm text-primary">Coiffeuse · {{ rail.proTasks }}</dd>
            <dd class="mt-2 text-xs text-muted">{{ pauseNote }}</dd>
          </div>
          <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Versement & validité</dt>
            <dd class="mt-1 text-sm text-primary">Acompte {{ rail.deposit }} €</dd>
            <dd class="mt-1 text-sm text-muted">Validité de l’offre · {{ rail.validityMinutes }} minutes</dd>
          </div>
        </dl>

        <!-- Aperçu = consultation, reste actif dès que réalisable (y compris après envoi) -->
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
            <template v-else>J’ai relu la proposition (170 € · 50 € · 15 août 9 h)</template>
          </span>
        </label>
      </section>
    </div>

    <!-- Envoi possible : seul primary utile -->
    <StickyFooter
      v-if="state.canRealize && !hasFirmProposal"
      label="Envoyer la proposition"
      :disabled="!canSendProposal"
      @action="sendProposal"
    >
      <p v-if="!canSendProposal" class="mt-2 text-center text-[11px] text-muted">
        Relisez la proposition et gardez les mèches incluses
      </p>
    </StickyFooter>

    <!-- Retour après envoi : pas de CTA irréversible actif -->
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
          <li>{{ rail.prestationLabel }} · {{ rail.lengthLabel }} · tension légère</li>
          <li>Total {{ rail.priceTotal }} € (dont mèches {{ rail.mechesAmount }} €)</li>
          <li>Versement initial {{ rail.deposit }} €</li>
          <li>{{ rail.dateLabel }} à {{ rail.timeLabel }} · salon {{ rail.place }}</li>
          <li>Durée {{ rail.durationLabel }}</li>
          <li>À préparer : {{ rail.clientTasks }}</li>
        </ul>
        <button type="button" class="btn-primary mt-5" @click="previewOpen = false">Fermer</button>
      </div>
    </div>

    <!-- Refus technique -->
    <div
      v-if="refuseOpen"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="refuseOpen = false"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <h2 class="text-base font-bold text-primary">Refus technique</h2>
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
