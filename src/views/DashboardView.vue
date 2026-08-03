<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFrameworkStore } from '../stores/framework'
import { useOfferStore } from '../stores/offer'
import { useScheduleStore } from '../stores/schedule'
import { useOpportunityStore } from '../stores/opportunity'
import { useDemoStore } from '../stores/demo'
import { FrameworkStatus, OfferStatus } from '../domain/model'

const router = useRouter()
const demo = useDemoStore()
const frameworkStore = useFrameworkStore()
const offerStore = useOfferStore()
const scheduleStore = useScheduleStore()
const opportunity = useOpportunityStore()
const { displayName } = storeToRefs(demo)
const { status: frameworkStatus, isActive: frameworkActive } = storeToRefs(frameworkStore)
const { status: offerStatus, isActive: offerActive, label } = storeToRefs(offerStore)
const { isActive: scheduleActive } = storeToRefs(scheduleStore)
const {
  invitationActive,
  hasFirmProposal,
  cardSummary,
} = storeToRefs(opportunity)

const helpOpen = ref(false)

onMounted(() => {
  if (scheduleActive.value) opportunity.ensureInesInjected()
})

function goPrimary() {
  if (scheduleActive.value) {
    if (hasFirmProposal.value) {
      router.push({ name: 'opportunity-sent' })
      return
    }
    if (invitationActive.value) {
      router.push({ name: 'opportunity-list' })
      return
    }
    router.push({ name: 'schedule-succes' })
    return
  }
  if (offerActive.value) {
    router.push({ name: 'offer-bridge' })
    return
  }
  if (frameworkActive.value) {
    router.push({ name: 'framework-bridge' })
    return
  }
  if (frameworkStatus.value === FrameworkStatus.DRAFT) {
    router.push({ name: 'framework-welcome' })
    return
  }
  router.push({ name: 'framework-welcome' })
}
</script>

<template>
  <div class="flex flex-1 flex-col px-5 pb-8 pt-6">
    <p class="text-sm text-muted">Bonjour</p>
    <h1 class="screen-title">{{ displayName }}</h1>

    <div class="mt-6 rounded-card border border-outline-soft bg-surface p-4">
      <template v-if="!frameworkActive">
        <p class="text-sm font-semibold text-primary">
          Votre cadre professionnel n’est pas encore actif
        </p>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Sans cadre actif, aucune prestation ni planning ne peut recevoir de demande.
        </p>
        <p class="mt-4 text-xs font-semibold uppercase tracking-wide text-secondary">
          À traiter
        </p>
        <p class="mt-1 text-sm font-medium text-primary">Définir comment vous exercez</p>
      </template>
      <template v-else-if="!offerActive">
        <p class="text-sm font-semibold text-primary">Cadre professionnel actif</p>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Vous pouvez maintenant créer ce que vous proposez. Le planning viendra ensuite.
        </p>
        <p class="mt-4 text-xs font-semibold uppercase tracking-wide text-secondary">
          Prochaine étape
        </p>
        <p class="mt-1 text-sm font-medium text-primary">Créer ma première prestation</p>
      </template>
      <template v-else-if="!scheduleActive">
        <p class="text-sm font-semibold text-primary">Offre active</p>
        <p class="mt-2 text-sm text-muted">{{ label }}</p>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Sans planning actif, aucune demande ne peut encore vous être adressée.
        </p>
        <p class="mt-4 text-xs font-semibold uppercase tracking-wide text-secondary">
          Prochaine étape
        </p>
        <p class="mt-1 text-sm font-medium text-primary">Définir mon planning</p>
      </template>
      <template v-else-if="hasFirmProposal">
        <p class="text-sm font-semibold text-primary">Proposition ferme envoyée</p>
        <p class="mt-2 text-sm text-muted">{{ cardSummary.title }}</p>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Créneau en réserve temporaire. L’engagement (Acte C) arrive dans la suite du prototype.
        </p>
      </template>
      <template v-else-if="invitationActive">
        <p class="text-sm font-semibold text-primary">Nouvelle opportunité</p>
        <p class="mt-2 text-sm text-muted">{{ cardSummary.title }}</p>
        <p class="mt-1 text-sm text-muted">{{ cardSummary.slot }}</p>
        <p class="mt-4 text-xs font-semibold uppercase tracking-wide text-secondary">
          À traiter
        </p>
        <p class="mt-1 text-sm font-medium text-primary">Examiner la demande d’Inès</p>
      </template>
      <template v-else>
        <p class="text-sm font-semibold text-primary">Planning actif</p>
        <p class="mt-2 text-sm text-muted">{{ label }}</p>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Vous pouvez recevoir des demandes compatibles.
        </p>
      </template>
    </div>

    <button type="button" class="btn-primary mt-6" @click="goPrimary">
      <template v-if="!frameworkActive">Définir mon cadre</template>
      <template v-else-if="offerStatus === OfferStatus.NONE || offerStatus === OfferStatus.DRAFT">
        Créer ma prestation
      </template>
      <template v-else-if="!scheduleActive">Configurer mon planning</template>
      <template v-else-if="hasFirmProposal">Voir le suivi proposition</template>
      <template v-else-if="invitationActive">Examiner la demande</template>
      <template v-else>Voir mon planning</template>
    </button>

    <button
      v-if="!frameworkActive"
      type="button"
      class="btn-ghost mt-4 text-center"
      @click="helpOpen = true"
    >
      Qu’est-ce qu’un cadre professionnel ?
    </button>

    <div
      v-if="helpOpen"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="helpOpen = false"
    >
      <div class="w-full rounded-t-xl bg-surface p-5">
        <h2 class="text-base font-bold text-primary">Cadre professionnel</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Ce n’est pas encore votre prestation. C’est comment vous travaillez : accueil, pause,
          communication, paiement, politiques. Vous le définissez une fois, puis il s’applique
          à vos prestations et à votre planning.
        </p>
        <button type="button" class="btn-primary mt-5" @click="helpOpen = false">
          Compris
        </button>
      </div>
    </div>
  </div>
</template>
