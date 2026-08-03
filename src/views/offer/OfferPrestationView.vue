<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useOfferStore } from '../../stores/offer'
import { LENGTH_OPTIONS, PRESTATION_CATALOG, SIZE_OPTIONS } from '../../domain/model'

const router = useRouter()
const store = useOfferStore()
const { offer, hasEnabledLength, hasEnabledSize } = storeToRefs(store)

function isLengthEnabled(id) {
  return offer.value.lengthOffers.some((o) => o.id === id && o.enabled)
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Prestation"
      badge="Brouillon"
      @back="router.push({ name: 'framework-bridge' })"
    />

    <div class="flex-1 px-5 py-5">
      <p class="text-xs text-secondary">Étape 1 / 4 · Prestation</p>
      <h2 class="screen-title mt-1">Prestation et longueurs</h2>
      <p class="screen-lead">
        Choisissez ce que vous proposez. Activez les longueurs : chacune aura ensuite son propre
        prix.
      </p>

      <p class="field-label mt-6">Catalogue</p>
      <div class="space-y-2">
        <button
          v-for="p in PRESTATION_CATALOG"
          :key="p.id"
          type="button"
          class="choice w-full"
          :class="{ 'choice-active': offer.prestationId === p.id }"
          @click="store.patch({ prestationId: p.id })"
        >
          {{ p.label }}
        </button>
      </div>

      <p class="field-label mt-6">Épaisseur</p>
      <p class="mb-2 text-xs text-muted">Vous pouvez en choisir plusieurs.</p>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="s in SIZE_OPTIONS"
          :key="s.id"
          type="button"
          class="choice text-center"
          :class="{ 'choice-active': offer.sizes.includes(s.id) }"
          @click="store.toggleSize(s.id)"
        >
          {{ s.label }}
        </button>
      </div>

      <p class="field-label mt-6">Longueurs proposées</p>
      <p class="mb-2 text-xs text-muted">
        La plus courte activée servira de longueur de référence pour le tarif.
      </p>
      <div class="space-y-2">
        <button
          v-for="(l, index) in LENGTH_OPTIONS"
          :key="l.id"
          type="button"
          class="choice w-full"
          :class="{ 'choice-active': isLengthEnabled(l.id) }"
          @click="store.toggleLength(l.id)"
        >
          <span class="flex items-center justify-between gap-2">
            <span>
              {{ l.label }}
              <span v-if="index === 0" class="ml-1 text-xs text-muted">(réf. suggérée)</span>
            </span>
            <span class="text-xs font-semibold text-secondary">
              {{ isLengthEnabled(l.id) ? 'Activée' : 'Off' }}
            </span>
          </span>
        </button>
      </div>
    </div>

    <StickyFooter
      label="Continuer"
      :disabled="!offer.prestationId || !hasEnabledSize || !hasEnabledLength"
      @action="router.push({ name: 'offer-galerie' })"
    />
  </div>
</template>
