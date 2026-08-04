<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import { CLARIFICATION_QUESTIONS, REFUSAL_REASONS } from '../../domain/model'
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

const demandRows = computed(() => [
  {
    label: 'Résultat souhaité',
    value: `${rail.value.prestationLabel}, longueur ${rail.value.lengthLabel}`,
  },
  { label: 'Inspiration', value: rail.value.inspirationLabel },
  { label: 'Cheveux et confort', value: `${rail.value.hairType}, ${rail.value.scalp.toLowerCase()}` },
  {
    label: 'Date et lieu',
    value: `${rail.value.dateLabel}, ${rail.value.timeLabel}, ${rail.value.place}`,
  },
  {
    label: 'Budget',
    value: `Cible ${rail.value.budgetTarget} €, maximum ${rail.value.budgetMax} €`,
  },
  { label: 'Fournitures', value: rail.value.supplies },
  { label: 'Préparation demandée à la cliente', value: rail.value.clientTasks },
  { label: 'Ce qui compte pour elle', value: rail.value.priority },
])

const visibleTimeline = computed(() => state.value.timeline.slice(-5))

const hasNewAdditions = computed(
  () => isEnriched.value && (state.value.hasRecentPhoto || state.value.timeline.some((t) => t.isNew)),
)

const newTextAnswers = computed(() => {
  if (!isEnriched.value) return []
  return CLARIFICATION_QUESTIONS.filter(
    (q) => q.id !== 'photo' && state.value.selectedQuestionIds.includes(q.id),
  ).map((q) => ({ id: q.id, label: q.label, response: q.response }))
})

const newAdditionsCount = computed(() => {
  let n = 0
  if (state.value.hasRecentPhoto) n += 1
  n += newTextAnswers.value.length
  return n
})

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
      why: 'Une photo récente est requise pour décider si vous pouvez réaliser',
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

function scrollToNewAdditions() {
  nextTick(() => {
    document.getElementById('nouveaux-ajouts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

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
      title="Demande d’Inès"
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
          Vous pouvez reprendre la demande d’Inès pour continuer.
        </p>
        <button type="button" class="btn-primary mt-4" @click="opportunity.recoverInes()">
          Reprendre la demande d’Inès
        </button>
      </div>

      <template v-else>
        <h2 class="screen-title">{{ rail.clientName }} — {{ rail.prestationLabel }}</h2>
        <p class="screen-lead">Tout est regroupé ici pour décider.</p>

        <div
          v-if="missingPhotoAlert"
          class="mt-4 rounded-card border border-secondary bg-secondary-container/40 px-3 py-3"
        >
          <p class="text-sm font-semibold text-on-secondary-container">Information manquante</p>
          <p class="mt-1 text-sm text-primary">Aucune photo récente des cheveux</p>
        </div>

        <div
          v-if="hasNewAdditions"
          class="sticky top-12 z-20 mt-4 rounded-card border border-secondary bg-secondary-container px-3 py-3 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-on-secondary-container">
                {{ newAdditionsCount }} nouvel{{ newAdditionsCount > 1 ? 's' : '' }} ajout{{
                  newAdditionsCount > 1 ? 's' : ''
                }}
              </p>
              <p class="mt-1 text-sm text-muted">
                Réponse à votre demande de précision — photo et réponses d’Inès.
              </p>
            </div>
            <span
              class="shrink-0 rounded-card bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-secondary"
            >
              Nouveau
            </span>
          </div>
          <button type="button" class="btn-secondary mt-3" @click="scrollToNewAdditions">
            Voir les ajouts
          </button>
        </div>

        <dl class="mt-5 space-y-2">
          <div
            v-for="row in demandRows"
            :key="row.label"
            class="rounded-card border border-outline-soft bg-surface px-3 py-3"
          >
            <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">{{ row.label }}</dt>
            <dd class="mt-1 text-sm text-primary">{{ row.value }}</dd>
          </div>
        </dl>

        <!-- Zone ajouts après précision (photo + réponses texte) -->
        <div
          v-if="hasNewAdditions"
          id="nouveaux-ajouts"
          class="mt-4 space-y-3 scroll-mt-28"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-secondary">
            Ajouts après précision
          </p>

          <div
            v-if="state.hasRecentPhoto"
            class="overflow-hidden rounded-card border-2 border-secondary"
          >
            <div class="flex items-center justify-between gap-2 bg-secondary-container/40 px-3 py-1.5">
              <p class="text-[10px] font-bold uppercase tracking-wide text-on-secondary-container">
                Réponse à votre demande de photo
              </p>
              <span
                class="rounded-card bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-secondary"
              >
                Nouveau
              </span>
            </div>
            <div
              class="relative flex h-36 items-end bg-gradient-to-br from-[#2c2418] via-[#5c4420] to-[#a17f3c] px-3 py-2"
            >
              <div
                class="absolute inset-4 rounded-card border border-white/20 bg-white/10 backdrop-blur-[1px]"
                aria-hidden="true"
              />
              <p class="relative text-xs font-semibold text-white">
                Photo récente · fournie par Inès
              </p>
            </div>
          </div>

          <div
            v-for="answer in newTextAnswers"
            :key="answer.id"
            class="rounded-card border-2 border-secondary bg-secondary-container/15 px-3 py-3"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-[10px] font-bold uppercase tracking-wide text-on-secondary-container">
                {{ answer.label }}
              </p>
              <span
                class="shrink-0 rounded-card bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-secondary"
              >
                Nouveau
              </span>
            </div>
            <p class="mt-1.5 text-sm font-medium text-primary">{{ answer.response }}</p>
          </div>
        </div>

        <section class="mt-6">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Chronologie</h3>
          <ul class="mt-2 space-y-2">
            <li
              v-for="item in visibleTimeline"
              :key="item.id"
              class="rounded-card border px-3 py-2"
              :class="
                item.isNew
                  ? 'border-secondary bg-secondary-container/20'
                  : 'border-outline-soft bg-surface-low'
              "
            >
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium text-primary">{{ item.label }}</p>
                <span
                  v-if="item.isNew"
                  class="shrink-0 rounded-card bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-on-secondary"
                >
                  Nouveau
                </span>
              </div>
              <p class="mt-0.5 text-xs text-muted">{{ item.at }} · {{ item.detail }}</p>
            </li>
          </ul>
        </section>

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
