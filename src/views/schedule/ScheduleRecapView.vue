<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useScheduleStore } from '../../stores/schedule'
import { useOfferStore } from '../../stores/offer'
import { useFrameworkStore } from '../../stores/framework'
import { useOpportunityStore } from '../../stores/opportunity'
import { contextsSummary } from '../../domain/model'

const router = useRouter()
const store = useScheduleStore()
const offerStore = useOfferStore()
const frameworkStore = useFrameworkStore()
const opportunity = useOpportunityStore()
const { schedule, hoursSummary, canActivate } = storeToRefs(store)
const { label, lengthsSummary } = storeToRefs(offerStore)
const { pauseText, framework } = storeToRefs(frameworkStore)

const placeLine = computed(
  () => `${contextsSummary(framework.value.contexts)} · ${schedule.value.place}`,
)

function activate() {
  if (store.activate()) {
    opportunity.ensureInesInjected()
    router.push({ name: 'schedule-succes' })
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Planning"
      badge="Brouillon"
      @back="router.push({ name: 'schedule-config' })"
    />

    <div class="flex-1 px-5 py-5">
      <h2 class="screen-title">Récapitulatif du planning</h2>
      <p class="screen-lead">Confirmez avant d’activer votre disponibilité.</p>

      <dl class="mt-6 space-y-3">
        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Cadre actif</dt>
          <dd class="mt-1 text-sm text-primary">
            {{ pauseText }} · retard {{ framework.lateTolerance }} min
          </dd>
        </div>

        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Offre active</dt>
          <dd class="mt-1 text-sm text-primary">{{ label }}</dd>
          <dd class="mt-1 text-sm text-muted">Longueurs : {{ lengthsSummary }}</dd>
        </div>

        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <div class="flex justify-between gap-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Lieu</dt>
              <dd class="mt-1 text-sm text-primary">{{ placeLine }}</dd>
            </div>
            <button type="button" class="btn-ghost" @click="router.push({ name: 'schedule-config' })">
              Modifier
            </button>
          </div>
        </div>

        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <div class="flex justify-between gap-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Planning</dt>
              <dd class="mt-1 text-sm text-primary">{{ hoursSummary }}</dd>
              <dd class="mt-1 text-sm text-muted">
                {{ schedule.maxPerDay }} RDV / jour
              </dd>
              <dd class="mt-2 text-sm text-muted">
                Créneaux possibles incluent {{ schedule.consequenceLabel }}
              </dd>
            </div>
            <button type="button" class="btn-ghost" @click="router.push({ name: 'schedule-config' })">
              Modifier
            </button>
          </div>
        </div>
      </dl>
    </div>

    <StickyFooter
      label="Activer mon planning"
      :disabled="!canActivate"
      @action="activate"
    />
  </div>
</template>
