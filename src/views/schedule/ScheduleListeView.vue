<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import { useOfferStore } from '../../stores/offer'
import { useScheduleStore } from '../../stores/schedule'
import { useFrameworkStore } from '../../stores/framework'
import { useDemoStore } from '../../stores/demo'
import { contextsSummary } from '../../domain/model'

const router = useRouter()
const offerStore = useOfferStore()
const scheduleStore = useScheduleStore()
const frameworkStore = useFrameworkStore()
const demo = useDemoStore()
const { label, devisPreview, lengthsSummary } = storeToRefs(offerStore)
const { schedule, hoursSummary, isActive } = storeToRefs(scheduleStore)
const { framework } = storeToRefs(frameworkStore)

const placeLine = computed(
  () => `${contextsSummary(framework.value.contexts)} · ${schedule.value.place}`,
)
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Mon planning"
      @back="router.push({ name: 'schedule-succes' })"
    />

    <div class="flex-1 px-5 py-5">
      <div
        v-if="isActive"
        class="rounded-card border border-secondary/40 bg-surface p-4"
      >
        <p class="badge-mono mb-2">Actif</p>
        <p class="text-sm font-semibold text-primary">{{ label }}</p>
        <p class="mt-1 text-sm text-muted">{{ lengthsSummary }}</p>
        <p class="mt-1 text-sm text-muted">{{ hoursSummary }}</p>
        <p class="mt-1 text-sm text-muted">{{ placeLine }}</p>
        <p class="mt-1 text-sm text-muted">À partir de {{ devisPreview.from }} €</p>
        <p class="mt-2 text-xs text-muted">
          Conséquence visible : {{ schedule.consequenceLabel }}
        </p>
      </div>
      <p v-else class="text-sm text-muted">Aucun planning actif.</p>
    </div>

    <div class="px-5 pb-6">
      <button type="button" class="btn-secondary" @click="demo.openResearch('P')">
        {{ demo.isFeedbackSubmitted('P') ? 'Revoir mon retour (acte précurseur)' : 'Donner mon retour sur cet acte' }}
      </button>
    </div>
  </div>
</template>
