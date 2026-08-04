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
import { STITCH } from '../assets/stitchAssets'

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
const { invitationActive, hasFirmProposal, cardSummary } = storeToRefs(opportunity)

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
    <div class="flex items-center gap-3">
      <img
        :src="STITCH.s02Avatar"
        alt=""
        class="h-14 w-14 rounded-full border border-outline-soft object-cover"
      />
      <div>
        <p class="text-sm text-muted">Bonjour</p>
        <h1 class="text-2xl font-bold tracking-tight text-primary">{{ displayName }}</h1>
      </div>
    </div>

    <div class="editorial-card relative mt-6 overflow-hidden p-5 text-center">
      <div
        class="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-surface-high/60"
      />
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-outline-soft bg-surface-low"
      >
        <span class="material-symbols-outlined text-3xl text-outline">
          {{
            !frameworkActive
              ? 'storefront'
              : !offerActive
                ? 'content_cut'
                : !scheduleActive
                  ? 'calendar_month'
                  : 'mark_email_unread'
          }}
        </span>
      </div>

      <template v-if="!frameworkActive">
        <h2 class="text-lg font-bold text-primary">Définir comment vous exercez</h2>
        <div
          class="mx-auto mt-3 inline-flex items-center gap-2 rounded-card bg-surface-low px-3 py-1.5"
        >
          <span class="h-2 w-2 rounded-full bg-[#ba1a1a]" />
          <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
            Votre cadre professionnel n’est pas encore actif
          </span>
        </div>
        <p class="mt-3 text-sm leading-relaxed text-muted">
          Sans cadre actif, aucune prestation ni planning ne peut recevoir de demande.
        </p>
      </template>
      <template v-else-if="!offerActive">
        <h2 class="text-lg font-bold text-primary">Créer ma première prestation</h2>
        <div
          class="mx-auto mt-3 inline-flex items-center gap-2 rounded-card bg-secondary-container/50 px-3 py-1.5"
        >
          <span class="h-2 w-2 rounded-full bg-secondary" />
          <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
            Cadre professionnel actif
          </span>
        </div>
        <p class="mt-3 text-sm leading-relaxed text-muted">
          Vous pouvez maintenant créer ce que vous proposez. Le planning viendra ensuite.
        </p>
      </template>
      <template v-else-if="!scheduleActive">
        <h2 class="text-lg font-bold text-primary">Définir mon planning</h2>
        <p class="mt-2 text-sm text-muted">{{ label }}</p>
        <p class="mt-3 text-sm leading-relaxed text-muted">
          Sans planning actif, aucune demande ne peut encore vous être adressée.
        </p>
      </template>
      <template v-else-if="hasFirmProposal">
        <h2 class="text-lg font-bold text-primary">Proposition envoyée</h2>
        <p class="mt-2 text-sm text-muted">{{ cardSummary.title }}</p>
        <p class="mt-3 text-sm leading-relaxed text-muted">
          Créneau en réserve temporaire. Ensuite : Inès peut accepter et payer l’acompte.
        </p>
      </template>
      <template v-else-if="invitationActive">
        <h2 class="text-lg font-bold text-primary">Examiner la demande d’Inès</h2>
        <p class="mt-2 text-sm text-muted">{{ cardSummary.title }}</p>
        <p class="mt-1 text-sm text-muted">{{ cardSummary.slot }}</p>
      </template>
      <template v-else>
        <h2 class="text-lg font-bold text-primary">Planning actif</h2>
        <p class="mt-2 text-sm text-muted">{{ label }}</p>
        <p class="mt-3 text-sm leading-relaxed text-muted">
          Vous pouvez recevoir des demandes qui correspondent à votre offre.
        </p>
      </template>

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
        class="mt-4 font-mono text-[10px] font-medium uppercase tracking-wider text-muted underline decoration-secondary/40 underline-offset-4"
        @click="helpOpen = true"
      >
        Qu’est-ce qu’un cadre professionnel ?
      </button>
    </div>

    <div
      v-if="helpOpen"
      class="fixed inset-0 z-50 flex justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cadre-help-title"
    >
      <div
        class="flex h-full w-full max-w-phone flex-col justify-end bg-primary/40"
        @click.self="helpOpen = false"
      >
        <div class="w-full rounded-t-xl bg-surface p-5">
          <div class="mx-auto mb-4 h-1 w-12 rounded-full bg-surface-high" />
          <h2 id="cadre-help-title" class="text-base font-bold text-primary">Cadre professionnel</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            Le cadre décrit comment vous travaillez : contextes, accueil, pause, communication,
            paiement, politiques. Ce n’est pas encore votre prestation. Vous le définissez une fois,
            puis vous l’utilisez pour ce que vous proposez.
          </p>
          <button type="button" class="btn-primary mt-5" @click="helpOpen = false">Compris</button>
        </div>
      </div>
    </div>
  </div>
</template>
