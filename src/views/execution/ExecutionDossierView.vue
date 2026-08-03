<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useOpportunityStore } from '../../stores/opportunity'

const router = useRouter()
const opportunity = useOpportunityStore()
const { rail, state, isReady, isInProgress, isCompleted, isSettled, isV2 } =
  storeToRefs(opportunity)

const sheet = ref(null)

const rows = computed(() => [
  { label: 'Cliente', value: rail.value.clientName },
  { label: 'Heure prévue', value: rail.value.timeLabel },
  { label: 'Heure d’arrivée', value: `${rail.value.arrivalLabel} · déjà signalée` },
  {
    label: 'Prestation',
    value: `${rail.value.prestationLabel} · ${rail.value.lengthLabel}`,
  },
  { label: 'Prix convenu', value: `${rail.value.priceTotal} €` },
  {
    label: 'Engagement',
    value: isV2.value ? 'V2 active' : 'V1 active',
    action: 'v1',
    actionLabel: 'Voir l’engagement V1',
  },
  {
    label: 'Consignes sensibles',
    value: `${rail.value.scalp} · tension légère`,
  },
  {
    label: 'Préparation',
    value: isReady.value ? 'Complète (READY)' : 'En cours',
  },
])

function start() {
  if (isSettled.value) {
    router.push({ name: 'settlement-relation' })
    return
  }
  if (isCompleted.value) {
    router.push({ name: 'settlement' })
    return
  }
  if (isInProgress.value) {
    router.push({ name: 'execution-progress' })
    return
  }
  if (opportunity.startService()) {
    router.push({ name: 'execution-progress' })
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Dossier du jour"
      badge="Acte D"
      back-label="Préparation"
      @back="router.push({ name: 'engagement-prep' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <p class="badge-mono">Jour J · {{ rail.dateLabel }}</p>
      <h2 class="mt-2 screen-title">Rendez-vous avec {{ rail.clientName }}</h2>
      <p class="screen-lead">
        Préparation complète. Démarrez pour ouvrir le dossier opérationnel — aucune modification
        n’est encore demandée.
      </p>

      <dl class="mt-6 space-y-2">
        <div
          v-for="row in rows"
          :key="row.label"
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
              class="btn-ghost shrink-0 text-xs"
              @click="sheet = row.action"
            >
              {{ row.actionLabel }}
            </button>
          </div>
        </div>
      </dl>

      <button type="button" class="btn-secondary mt-5" disabled>
        Signaler un problème — hors parcours
      </button>
      <p class="mt-1 text-center text-[11px] text-muted">Non disponible dans cette démo</p>
    </div>

    <StickyFooter
      :label="
        isSettled
          ? 'Voir l’avis et la suite'
          : isCompleted
            ? 'Voir le règlement'
            : isInProgress
              ? 'Reprendre la prestation'
              : 'Commencer la prestation'
      "
      @action="start"
    />

    <div
      v-if="sheet === 'v1'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto w-full max-w-phone rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Engagement · V1</p>
        <h2 class="mt-2 text-base font-bold text-primary">Proposition acceptée</h2>
        <ul class="mt-4 space-y-2 text-sm text-primary">
          <li>{{ rail.prestationLabel }} · {{ rail.lengthLabel }}</li>
          <li>Prix : {{ rail.priceTotal }} € (dont mèches {{ rail.mechesAmount }} €)</li>
          <li>Durée : {{ rail.durationLabel }}</li>
          <li>Créneau : {{ rail.dateLabel }}, {{ rail.timeLabel }}</li>
          <li>Acompte reçu : {{ rail.deposit }} €</li>
        </ul>
        <p class="mt-4 text-xs text-muted">Lecture seule · version active jusqu’à acceptation V2</p>
        <button type="button" class="btn-primary mt-5" @click="sheet = null">Fermer</button>
      </div>
    </div>
  </div>
</template>
