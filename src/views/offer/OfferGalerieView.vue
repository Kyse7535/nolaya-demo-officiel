<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import FlowStepper from '../../components/FlowStepper.vue'
import { useOfferStore } from '../../stores/offer'
import { GALLERY_MOCK } from '../../domain/model'

const router = useRouter()
const store = useOfferStore()
const { offer, label, lengthsSummary } = storeToRefs(store)

const steps = ['Prestation', 'Galerie', 'Préparation', 'Prix']
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Prestation"
      badge="Brouillon"
      @back="router.push({ name: 'offer-prestation' })"
    />

    <div class="flex-1 px-5 py-5">
      <FlowStepper :steps="steps" :current="2" />

      <h2 class="screen-title mt-5">Galerie de la prestation</h2>
      <p class="screen-lead">
        Photos rattachées à
        <span class="font-semibold text-primary">{{ label }}</span>
        <span v-if="lengthsSummary !== '—'"> ({{ lengthsSummary }})</span>
        — pas à tout votre portfolio.
      </p>

      <div class="mt-6 grid grid-cols-2 gap-3">
        <button
          v-for="item in GALLERY_MOCK"
          :key="item.id"
          type="button"
          class="overflow-hidden border text-left"
          :class="
            offer.galleryIds.includes(item.id)
              ? 'border-primary ring-1 ring-primary'
              : 'border-outline-soft'
          "
          @click="store.toggleGallery(item.id)"
        >
          <div class="relative h-28">
            <img
              v-if="item.src"
              :src="item.src"
              alt=""
              class="hero-media absolute inset-0 h-full w-full"
            />
            <div v-else class="h-full bg-gradient-to-br" :class="item.tone" />
            <span
              v-if="offer.galleryIds.includes(item.id)"
              class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary"
            >
              <span class="material-symbols-outlined text-[16px] icon-filled">check</span>
            </span>
          </div>
          <div class="bg-surface px-2 py-2">
            <p class="text-xs font-semibold text-primary">{{ item.label }}</p>
            <p class="font-mono text-[10px] uppercase tracking-wider text-muted">
              {{ item.proof }}
            </p>
          </div>
        </button>
      </div>

      <p class="mt-4 text-xs leading-relaxed text-muted">
        Ajoutez au moins 1 photo ; 3 donnent une belle vitrine.
        {{ offer.galleryIds.length }} sélectionnée(s). Ne mélangez pas vanilles, perruques ou
        d’autres prestations dans cette galerie.
      </p>
    </div>

    <StickyFooter
      label="Continuer"
      :disabled="offer.galleryIds.length < 1"
      @action="router.push({ name: 'offer-service' })"
    />
  </div>
</template>
