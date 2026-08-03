<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useOfferStore } from '../../stores/offer'
import { GALLERY_MOCK } from '../../domain/model'

const router = useRouter()
const store = useOfferStore()
const { offer, label, lengthsSummary } = storeToRefs(store)
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Prestation"
      badge="Brouillon"
      @back="router.push({ name: 'offer-prestation' })"
    />

    <div class="flex-1 px-5 py-5">
      <p class="text-xs text-secondary">Étape 2 / 4 · Galerie</p>
      <h2 class="screen-title mt-1">Galerie de la prestation</h2>
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
          class="overflow-hidden rounded-card border text-left"
          :class="
            offer.galleryIds.includes(item.id)
              ? 'border-secondary ring-2 ring-secondary/30'
              : 'border-outline-soft'
          "
          @click="store.toggleGallery(item.id)"
        >
          <div class="h-24 bg-gradient-to-br" :class="item.tone" />
          <div class="bg-surface px-2 py-2">
            <p class="text-xs font-semibold text-primary">{{ item.label }}</p>
            <p class="text-[10px] text-muted">{{ item.proof }}</p>
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
