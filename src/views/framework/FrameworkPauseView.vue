<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import FlowStepper from '../../components/FlowStepper.vue'
import { useFrameworkStore } from '../../stores/framework'
import { PAUSE_OPTIONS } from '../../domain/model'
import { STITCH } from '../../assets/stitchAssets'

const router = useRouter()
const store = useFrameworkStore()
const { framework } = storeToRefs(store)

const steps = ['Contextes', 'Accueil', 'Pause', 'Communication', 'Politiques']
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Cadre professionnel"
      badge="Brouillon"
      @back="router.push({ name: 'framework-accueil' })"
    />

    <div class="flex-1 px-5 py-5">
      <FlowStepper :steps="steps" :current="3" />

      <div class="mt-5 overflow-hidden border border-outline-soft">
        <img :src="STITCH.s06Hero" alt="" class="hero-media h-36 w-full" />
      </div>

      <h2 class="screen-title mt-5">Vos pauses pendant une longue prestation</h2>
      <p class="screen-lead">
        Pendant une prestation longue, vous pouvez prévoir des pauses. Elles font partie de votre
        cadre.
      </p>

      <div class="mt-6 space-y-2">
        <button
          v-for="opt in PAUSE_OPTIONS"
          :key="opt.id"
          type="button"
          class="choice w-full"
          :class="{ 'choice-active': framework.pauseId === opt.id }"
          @click="store.patch({ pauseId: opt.id })"
        >
          <span class="block text-sm font-semibold">{{ opt.label }}</span>
          <span class="mt-0.5 block text-xs text-muted">{{ opt.detail }}</span>
        </button>
      </div>

      <p class="mt-5 rounded-card bg-surface-low px-3 py-3 text-xs leading-relaxed text-muted">
        La pause est rappelée à la cliente ; elle n’allonge pas toute seule le créneau affiché.
      </p>
    </div>

    <StickyFooter
      label="Continuer"
      :disabled="!framework.pauseId"
      @action="router.push({ name: 'framework-comm' })"
    />
  </div>
</template>
