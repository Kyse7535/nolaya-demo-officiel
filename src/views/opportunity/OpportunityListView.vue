<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useOpportunityStore } from '../../stores/opportunity'
import { useScheduleStore } from '../../stores/schedule'

const router = useRouter()
const opportunity = useOpportunityStore()
const schedule = useScheduleStore()
const {
  isInjected,
  invitationActive,
  invitationRefused,
  hasFirmProposal,
  isCommitted,
  isReady,
  cardSummary,
  rail,
  state,
} = storeToRefs(opportunity)

const whyOpen = ref(false)

onMounted(() => {
  if (schedule.isActive) opportunity.ensureInesInjected()
})

function examine() {
  router.push({ name: 'opportunity-dossier' })
}

function openFollowUp() {
  if (state.value.dayJAdvanced) {
    if (opportunity.isSettled) router.push({ name: 'settlement-relation' })
    else if (opportunity.isCompleted) router.push({ name: 'settlement' })
    else if (opportunity.isInProgress) router.push({ name: 'execution-progress' })
    else router.push({ name: 'execution-dossier' })
  } else if (isReady.value) {
    router.push({ name: 'engagement-prep' })
  } else if (isCommitted.value) {
    router.push({ name: 'engagement-committed' })
  } else {
    router.push({ name: 'opportunity-sent' })
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Opportunités"
      badge="Scène 2"
      @back="router.push({ name: 'schedule-succes' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <h2 class="screen-title">Nouvelle opportunité</h2>
      <p class="screen-lead">
        Une demande compatible avec votre offre et votre planning vient d’arriver.
      </p>

      <div
        v-if="invitationRefused && !hasFirmProposal"
        class="mt-5 rounded-card border border-outline-soft bg-surface-low px-3 py-3"
      >
        <p class="text-sm font-semibold text-primary">Aucune invitation active</p>
        <p class="mt-1 text-sm text-muted">
          La demande d’Inès a été refusée. Vous pouvez la reprendre depuis le protocole démo.
        </p>
        <button type="button" class="btn-primary mt-4" @click="opportunity.recoverInes()">
          Reprendre le dossier Inès
        </button>
      </div>

      <div
        v-else-if="hasFirmProposal || isCommitted"
        class="mt-5 rounded-card border border-secondary/40 bg-secondary-container/30 px-3 py-3"
      >
        <p class="text-sm font-semibold text-on-secondary-container">
          <template v-if="opportunity.isSettled">SETTLED — relation</template>
          <template v-else-if="opportunity.isCompleted">COMPLETED — règlement</template>
          <template v-else-if="opportunity.isInProgress">Réalisation en cours</template>
          <template v-else-if="state.dayJAdvanced">Jour J — Acte D</template>
          <template v-else-if="isReady">Préparation complète</template>
          <template v-else-if="isCommitted">Engagement formé</template>
          <template v-else>Proposition envoyée</template>
        </p>
        <p class="mt-1 text-sm text-muted">
          <template v-if="isCommitted">
            {{ rail.clientName }} · {{ rail.dateLabel }} {{ rail.timeLabel }} ·
            {{
              opportunity.isSettled
                ? 'SETTLED'
                : opportunity.isCompleted
                  ? 'COMPLETED'
                  : opportunity.isInProgress
                    ? 'IN_PROGRESS'
                    : isReady
                      ? 'READY'
                      : 'COMMITTED'
            }}
          </template>
          <template v-else>
            Offre ferme pour {{ rail.clientName }} — créneau en réserve temporaire.
          </template>
        </p>
        <button type="button" class="btn-primary mt-4" @click="openFollowUp">
          Voir le suivi
        </button>
      </div>

      <article
        v-else-if="isInjected && invitationActive"
        class="mt-5 rounded-card border border-outline-soft bg-surface p-4"
      >
        <p class="badge-mono">Invitation</p>
        <h3 class="mt-2 text-base font-bold text-primary">{{ cardSummary.title }}</h3>
        <p class="mt-1 text-sm text-muted">{{ cardSummary.slot }}</p>
        <p class="mt-1 text-sm text-muted">{{ cardSummary.budget }}</p>

        <button
          type="button"
          class="btn-ghost mt-4 text-left"
          @click="whyOpen = true"
        >
          Pourquoi cette invitation ?
        </button>
      </article>

      <div
        v-else
        class="mt-5 rounded-card border border-outline-soft bg-surface-low px-3 py-3"
      >
        <p class="text-sm text-muted">
          Aucune opportunité pour le moment. Activez d’abord votre planning.
        </p>
      </div>
    </div>

    <StickyFooter
      v-if="invitationActive && !hasFirmProposal"
      label="Examiner la demande"
      @action="examine"
    />

    <!-- Sheet aide invitation -->
    <div
      v-if="whyOpen"
      class="fixed inset-0 z-50 flex items-end justify-center bg-primary/40"
      @click.self="whyOpen = false"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <h2 class="text-base font-bold text-primary">Pourquoi cette invitation ?</h2>
        <p class="mt-3 text-sm leading-relaxed text-muted">
          Cette démo vous montre comment les demandes de prestation des clientes se
          présenteront, et comment vous les traiterez sur la plateforme.
        </p>
        <button type="button" class="btn-primary mt-5" @click="whyOpen = false">Fermer</button>
      </div>
    </div>
  </div>
</template>
