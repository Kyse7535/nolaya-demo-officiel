<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import { REFUSAL_REASONS } from '../../domain/model'
import { useOpportunityStore } from '../../stores/opportunity'

const router = useRouter()
const opportunity = useOpportunityStore()
const {
  rail,
  missingPhotoAlert,
  canPrepareProposal,
  invitationActive,
  invitationRefused,
  isEnriched,
  hasFirmProposal,
  state,
} = storeToRefs(opportunity)

const refuseOpen = ref(false)
const refuseReason = ref('')

const dossierRows = computed(() => [
  { label: 'Résultat souhaité', value: `Knotless medium, longueur ${rail.value.lengthLabel}` },
  { label: 'Inspiration', value: rail.value.inspirationLabel },
  { label: 'Cheveux et confort', value: `${rail.value.hairType}, ${rail.value.scalp.toLowerCase()}` },
  { label: 'Date et lieu', value: `${rail.value.dateLabel}, ${rail.value.timeLabel}, ${rail.value.place}` },
  { label: 'Budget', value: `Cible ${rail.value.budgetTarget} €, maximum ${rail.value.budgetMax} €` },
  { label: 'Fournitures', value: rail.value.supplies },
  { label: 'Tâches cliente', value: rail.value.clientTasks },
  { label: 'Priorité', value: rail.value.priority },
])

/** Clarifier encore possible — primary tant que la précision n’est pas demandée. */
const canClarify = computed(
  () => invitationActive.value && !state.value.clarificationSent && !hasFirmProposal.value,
)

/**
 * CTA proposition : un seul primary = prochaine action utile ;
 * sinon grisé + libellé d’état ou motif (photo manquante).
 */
const proposalCta = computed(() => {
  if (hasFirmProposal.value) {
    return {
      label: 'Proposition envoyée',
      primary: false,
      disabled: true,
      why: null,
    }
  }
  if (!canPrepareProposal.value) {
    return {
      label: 'Préparer une proposition',
      primary: false,
      disabled: true,
      why: 'Une photo récente est requise pour évaluer la faisabilité',
    }
  }
  if (state.value.canRealize) {
    return {
      label: 'Continuer la proposition',
      primary: true,
      disabled: false,
      why: null,
    }
  }
  return {
    label: 'Préparer une proposition',
    // Primary seulement si clarifier n’est plus l’action utile
    primary: !!state.value.clarificationSent || isEnriched.value,
    disabled: false,
    why: null,
  }
})

const refuseCta = computed(() => {
  if (hasFirmProposal.value) {
    return {
      label: 'Refus non disponible',
      disabled: true,
      why: 'Une proposition a déjà été envoyée',
    }
  }
  if (!invitationActive.value) {
    return {
      label: 'Demande déjà refusée',
      disabled: true,
      why: null,
    }
  }
  return {
    label: 'Refuser',
    disabled: false,
    why: null,
  }
})

function goClarify() {
  if (!canClarify.value) return
  router.push({ name: 'opportunity-clarification' })
}

function goProposal() {
  if (hasFirmProposal.value || !canPrepareProposal.value) return
  router.push({ name: 'opportunity-proposal' })
}

function goFollowUp() {
  router.push({ name: 'opportunity-sent' })
}

function confirmRefuse() {
  if (!refuseReason.value) return
  opportunity.refuse(refuseReason.value)
  refuseOpen.value = false
  refuseReason.value = ''
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Dossier demande"
      badge="Inès"
      @back="router.push({ name: 'opportunity-list' })"
    />

    <div class="flex-1 px-5 py-5 pb-8">
      <!-- État refusé + récupération -->
      <div
        v-if="invitationRefused"
        class="mb-5 rounded-card border border-outline-soft bg-surface-low p-4"
      >
        <p class="text-sm font-semibold text-primary">Demande refusée — aucune proposition envoyée.</p>
        <p class="mt-2 text-sm text-muted">
          Récupération démo : vous pouvez reprendre le dossier Inès pour continuer le parcours.
        </p>
        <button type="button" class="btn-primary mt-4" @click="opportunity.recoverInes()">
          Reprendre le dossier Inès
        </button>
      </div>

      <template v-else>
        <h2 class="screen-title">{{ rail.clientName }} — {{ rail.prestationLabel }}</h2>
        <p class="screen-lead">Décidez à partir d’un dossier structuré, sans messagerie libre.</p>

        <div
          v-if="missingPhotoAlert"
          class="mt-4 rounded-card border border-secondary bg-secondary-container/40 px-3 py-3"
        >
          <p class="text-sm font-semibold text-on-secondary-container">Information manquante</p>
          <p class="mt-1 text-sm text-primary">Aucune photo récente des cheveux</p>
        </div>

        <div
          v-else-if="isEnriched"
          class="mt-4 rounded-card border border-secondary/30 bg-secondary-container/20 px-3 py-3"
        >
          <p class="text-sm font-semibold text-on-secondary-container">Dossier enrichi</p>
          <p class="mt-1 text-sm text-muted">Photo récente jointe · précisions reçues</p>
        </div>

        <dl class="mt-5 space-y-2">
          <div
            v-for="row in dossierRows"
            :key="row.label"
            class="rounded-card border border-outline-soft bg-surface px-3 py-3"
          >
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">{{ row.label }}</dt>
            <dd class="mt-1 text-sm text-primary">{{ row.value }}</dd>
          </div>
        </dl>

        <!-- Photo mock après enrichissement -->
        <div
          v-if="state.hasRecentPhoto"
          class="mt-3 overflow-hidden rounded-card border border-outline-soft"
        >
          <div
            class="flex h-28 items-end bg-gradient-to-br from-[#2c2418] to-[#a17f3c] px-3 py-2"
          >
            <p class="text-xs font-medium text-white/90">Photo récente · fournie par Inès</p>
          </div>
        </div>

        <section class="mt-6">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Chronologie</h3>
          <ul class="mt-2 space-y-2">
            <li
              v-for="item in state.timeline"
              :key="item.id"
              class="rounded-card border border-outline-soft bg-surface-low px-3 py-2"
            >
              <p class="text-sm font-medium text-primary">{{ item.label }}</p>
              <p class="mt-0.5 text-xs text-muted">{{ item.at }} · {{ item.detail }}</p>
            </li>
          </ul>
        </section>

        <!-- Carrefour B2 / B3 — un primary, états explicites -->
        <div class="mt-8 space-y-2">
          <button
            v-if="canClarify"
            type="button"
            class="btn-primary"
            @click="goClarify"
          >
            Demander une précision
          </button>
          <button
            v-else-if="state.clarificationSent"
            type="button"
            class="btn-secondary"
            disabled
          >
            Précision déjà demandée
          </button>

          <button
            type="button"
            :class="proposalCta.primary ? 'btn-primary' : 'btn-secondary'"
            :disabled="proposalCta.disabled"
            @click="goProposal"
          >
            {{ proposalCta.label }}
          </button>
          <p v-if="proposalCta.why" class="text-center text-[11px] text-muted">
            {{ proposalCta.why }}
          </p>

          <button
            type="button"
            class="btn-secondary"
            :disabled="refuseCta.disabled"
            @click="refuseOpen = true"
          >
            {{ refuseCta.label }}
          </button>
          <p v-if="refuseCta.why" class="text-center text-[11px] text-muted">
            {{ refuseCta.why }}
          </p>

          <!-- Consultation reste disponible après envoi -->
          <template v-if="hasFirmProposal">
            <button type="button" class="btn-primary" @click="goFollowUp">
              Voir le suivi
            </button>
            <button
              type="button"
              class="btn-secondary"
              @click="router.push({ name: 'opportunity-proposal' })"
            >
              Revoir la proposition
            </button>
          </template>
        </div>
      </template>
    </div>

    <!-- Refus motif structuré -->
    <div
      v-if="refuseOpen"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="refuseOpen = false"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <h2 class="text-base font-bold text-primary">Refuser la demande</h2>
        <p class="mt-2 text-sm text-muted">Choisissez un motif — aucune proposition ne sera envoyée.</p>
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
