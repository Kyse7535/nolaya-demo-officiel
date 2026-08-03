<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { INES_CHECKLIST, SARAH_CHECKLIST } from '../../domain/model'
import { useOpportunityStore } from '../../stores/opportunity'
import { useDemoStore } from '../../stores/demo'

const router = useRouter()
const opportunity = useOpportunityStore()
const demo = useDemoStore()
const {
  rail,
  state,
  isReady,
  readinessPending,
  canConfirmSarahPrep,
  canContinueDemo,
  sarahChecklistComplete,
} = storeToRefs(opportunity)

const consignesOpen = ref(false)

watch(
  () => state.value.dayJAdvanced,
  (advanced) => {
    if (advanced) {
      window.setTimeout(() => demo.promptActFeedback('C'), 320)
    }
  },
  { immediate: true },
)

const statusBadge = computed(() => {
  if (state.value.dayJAdvanced) return 'Jour J'
  if (isReady.value) return 'READY'
  return 'Préparation'
})

const statusMono = computed(() => {
  if (state.value.dayJAdvanced) return 'Seuil · Acte D'
  if (isReady.value) return 'État · READY'
  return 'État · READINESS_PENDING'
})

function toggleSarah(id, checked) {
  opportunity.setSarahCheck(id, checked)
}

function confirmPrep() {
  opportunity.confirmSarahPrep()
}

function continueDemo() {
  if (opportunity.continueDemoToDayJ()) {
    // Reste sur l’écran pont : formulaire acte C, puis « Ouvrir le dossier du jour ».
    window.setTimeout(() => demo.promptActFeedback('C'), 280)
  }
}

function goDayDossier() {
  router.push({ name: 'execution-dossier' })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Préparation"
      :badge="statusBadge"
      back-label="Engagement"
      @back="router.push({ name: 'engagement-committed' })"
    />

    <div
      class="flex-1 px-5 py-5"
      :class="isReady && !state.dayJAdvanced ? 'pb-36' : isReady || readinessPending ? 'pb-28' : 'pb-8'"
    >
      <p class="badge-mono">{{ statusMono }}</p>
      <h2 class="mt-2 screen-title">Préparer le rendez-vous</h2>
      <p class="screen-lead">
        Deux checklists distinctes. Vous cochez la vôtre ; Inès confirme la sienne après votre
        validation.
      </p>

      <!-- Checklist Sarah (C3) -->
      <section class="mt-6">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold text-primary">Votre checklist</h3>
          <button
            v-if="readinessPending && !state.sarahPrepConfirmed"
            type="button"
            class="btn-ghost text-xs"
            @click="opportunity.checkAllSarah()"
          >
            Tout cocher
          </button>
        </div>

        <ul class="mt-3 space-y-2">
          <li v-for="item in SARAH_CHECKLIST" :key="item.id">
            <label
              class="choice flex w-full cursor-pointer items-start gap-3"
              :class="{
                'choice-active': state.sarahChecklist[item.id],
                'opacity-60': state.sarahPrepConfirmed,
              }"
            >
              <input
                type="checkbox"
                class="mt-1"
                :checked="state.sarahChecklist[item.id]"
                :disabled="state.sarahPrepConfirmed"
                @change="toggleSarah(item.id, $event.target.checked)"
              />
              <span class="flex-1">
                <span class="block text-sm font-medium text-primary">{{ item.label }}</span>
                <span v-if="item.detail" class="mt-0.5 block text-xs text-muted">
                  {{ item.detail }}
                </span>
                <button
                  v-if="item.hasSheet"
                  type="button"
                  class="btn-ghost mt-1 block text-xs"
                  @click.prevent="consignesOpen = true"
                >
                  Voir les consignes
                </button>
              </span>
            </label>
          </li>
        </ul>
      </section>

      <!-- Checklist Inès (C4) -->
      <section class="mt-7">
        <h3 class="text-sm font-semibold text-primary">Checklist d’{{ rail.clientName }}</h3>
        <p class="mt-1 text-xs text-muted">
          Non modifiable — se remplit après votre confirmation.
        </p>

        <ul class="mt-3 space-y-2">
          <li
            v-for="item in INES_CHECKLIST"
            :key="item.id"
            class="rounded-card border px-4 py-3 transition"
            :class="
              state.inesChecklist[item.id]
                ? 'border-secondary bg-secondary-container/30'
                : 'border-outline-soft bg-surface'
            "
          >
            <div class="flex items-center gap-3">
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                :class="
                  state.inesChecklist[item.id]
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container text-muted'
                "
              >
                {{ state.inesChecklist[item.id] ? '✓' : '·' }}
              </span>
              <span class="text-sm font-medium text-primary">{{ item.label }}</span>
            </div>
          </li>
        </ul>

        <p
          v-if="state.inesPrepFilling"
          class="mt-3 text-center text-xs font-medium text-secondary"
        >
          Inès confirme sa préparation…
        </p>
        <p
          v-else-if="state.inesPrepConfirmed"
          class="mt-3 text-center text-xs font-medium text-secondary"
        >
          Inès a confirmé sa préparation.
        </p>
      </section>

      <!-- READY + compression (C5) -->
      <section
        v-if="isReady"
        class="mt-7 rounded-card border border-secondary/40 bg-secondary-container/25 px-4 py-4"
      >
        <p class="text-sm font-semibold text-on-secondary-container">
          Toutes les conditions nécessaires sont satisfaites.
        </p>
        <p class="mt-2 text-sm text-muted">
          Le rendez-vous est le {{ rail.dateLabel }} — la démo peut avancer au jour J.
        </p>
      </section>

      <!-- Pont Acte D -->
      <section
        v-if="state.dayJAdvanced"
        class="mt-5 rounded-card border border-secondary/40 bg-secondary-container/25 px-4 py-4"
      >
        <p class="badge-mono">Acte D · Scène 4/5</p>
        <h3 class="mt-2 text-sm font-semibold text-on-secondary-container">Dossier du jour</h3>
        <p class="mt-1 text-sm text-muted">
          {{ rail.clientName }} · {{ rail.timeLabel }} · {{ rail.prestationLabel }} ·
          {{ rail.priceTotal }} € · préparation complète (READY).
        </p>
        <button type="button" class="btn-primary mt-4" @click="goDayDossier">
          Ouvrir le dossier du jour
        </button>
        <button
          type="button"
          class="btn-ghost mx-auto mt-3 block"
          @click="demo.openResearch('C')"
        >
          {{
            demo.isFeedbackSubmitted('C')
              ? 'Revoir mon retour (acte C)'
              : 'Donner mon retour sur cet acte'
          }}
        </button>
      </section>
    </div>

    <StickyFooter
      v-if="readinessPending && !state.sarahPrepConfirmed"
      label="Confirmer ma préparation"
      :disabled="!canConfirmSarahPrep"
      @action="confirmPrep"
    >
      <p v-if="!sarahChecklistComplete" class="mt-2 text-center text-[11px] text-muted">
        Cochez les 4 points
      </p>
    </StickyFooter>

    <StickyFooter
      v-else-if="canContinueDemo"
      label="Continuer la démonstration"
      @action="continueDemo"
    >
      <p class="mt-2 text-center text-[11px] text-muted">Avance explicite au jour J</p>
    </StickyFooter>

    <!-- Sheet consignes -->
    <div
      v-if="consignesOpen"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="consignesOpen = false"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Consignes particulières</p>
        <h2 class="mt-2 text-base font-bold text-primary">Rappel pour ce rendez-vous</h2>
        <ul class="mt-4 space-y-2 text-sm text-primary">
          <li>{{ rail.scalp }} — adapter la tension</li>
          <li>Priorité cliente : {{ rail.priority }}</li>
          <li>Tension légère prévue dans l’offre acceptée</li>
        </ul>
        <button type="button" class="btn-primary mt-5" @click="consignesOpen = false">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>
