<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import FlowStepper from '../../components/FlowStepper.vue'
import { useOfferStore } from '../../stores/offer'
import { STITCH } from '../../assets/stitchAssets'

const router = useRouter()
const store = useOfferStore()
const { offer } = storeToRefs(store)

const steps = ['Prestation', 'Galerie de la prestation', 'Préparation', 'Prix']
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Prestation"
      badge="Brouillon"
      @back="router.push({ name: 'offer-galerie' })"
    />

    <div class="flex-1 px-5 py-5">
      <FlowStepper :steps="steps" :current="3" />

      <div class="mt-5 overflow-hidden border border-outline-soft">
        <img :src="STITCH.s13Hero" alt="" class="hero-media h-36 w-full" />
      </div>

      <h2 class="screen-title mt-5">Préparation avant le rendez-vous</h2>
      <p class="screen-lead">
        Indiquez clairement ce que la cliente doit préparer avant de venir (ex. cheveux lavés et
        démêlés).
      </p>

      <label class="field-label mt-6">Consigne pour la cliente</label>
      <textarea
        class="min-h-[120px] w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm"
        :value="offer.clientPrepNote"
        @input="store.patch({ clientPrepNote: $event.target.value })"
      />

      <p class="mt-4 rounded-card bg-surface-low px-3 py-3 text-xs leading-relaxed text-muted">
        Cette consigne sera visible côté cliente avec votre prestation.
      </p>
    </div>

    <StickyFooter label="Continuer" @action="router.push({ name: 'offer-prix' })" />
  </div>
</template>
