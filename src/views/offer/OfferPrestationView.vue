<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import FlowStepper from '../../components/FlowStepper.vue'
import { useOfferStore } from '../../stores/offer'
import { LENGTH_OPTIONS, PRESTATION_CATALOG, SIZE_OPTIONS } from '../../domain/model'
import { STITCH } from '../../assets/stitchAssets'

const router = useRouter()
const store = useOfferStore()
const { offer, hasEnabledLength, hasEnabledSize } = storeToRefs(store)

const steps = ['Prestation', 'Galerie de la prestation', 'Préparation', 'Prix']

function isLengthEnabled(id) {
  return offer.value.lengthOffers.some((o) => o.id === id && o.enabled)
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Prestation"
      badge="Brouillon"
      icon="close"
      @back="router.push({ name: 'framework-bridge' })"
    />

    <div class="flex-1 px-5 py-5">
      <p class="font-mono text-[10px] uppercase tracking-wider text-muted">Étape 2 sur 8</p>
      <FlowStepper class="mt-3" :steps="steps" :current="1" />

      <h2 class="screen-title mt-5">Prestation et longueurs</h2>
      <p class="screen-lead">
        Choisissez ce que vous proposez. Activez les longueurs : chacune aura ensuite son propre
        prix.
      </p>

      <p class="field-label mt-6">Type de prestation</p>
      <div class="grid grid-cols-1 gap-2">
        <button
          v-for="p in PRESTATION_CATALOG"
          :key="p.id"
          type="button"
          class="choice w-full"
          :class="{ 'choice-active': offer.prestationId === p.id }"
          @click="store.patch({ prestationId: p.id })"
        >
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">
              {{ offer.prestationId === p.id ? 'check_circle' : 'radio_button_unchecked' }}
            </span>
            {{ p.label }}
          </span>
        </button>
      </div>

      <p class="field-label mt-6">Épaisseur</p>
      <p class="mb-2 text-xs text-muted">Vous pouvez en choisir plusieurs.</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in SIZE_OPTIONS"
          :key="s.id"
          type="button"
          class="rounded-card border px-4 py-2 text-sm transition"
          :class="
            offer.sizes.includes(s.id)
              ? 'border-primary bg-primary text-on-primary'
              : 'border-outline-soft bg-surface text-primary'
          "
          @click="store.toggleSize(s.id)"
        >
          {{ s.label }}
        </button>
      </div>

      <p class="field-label mt-6">Longueurs proposées</p>
      <p class="mb-2 text-xs text-muted">
        La plus courte activée servira de longueur de départ pour le prix.
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
            <span class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px]">
                {{ isLengthEnabled(l.id) ? 'check_box' : 'check_box_outline_blank' }}
              </span>
              <span>
                {{ l.label }}
                <span v-if="index === 0" class="ml-1 text-xs text-muted">(longueur de départ)</span>
              </span>
            </span>
            <span
              v-if="isLengthEnabled(l.id) && index === 0"
              class="rounded-card border border-primary px-2 py-0.5 font-mono text-[9px] font-bold uppercase"
            >
              Réf.
            </span>
          </span>
        </button>
      </div>

      <div class="mt-6 overflow-hidden border border-outline-soft">
        <img :src="STITCH.s11Hero" alt="" class="hero-media h-40 w-full" />
        <div class="flex items-center justify-between bg-surface px-3 py-2">
          <span class="font-mono text-[10px] uppercase tracking-wider text-muted">
            Aperçu visuel
          </span>
          <span class="material-symbols-outlined text-[16px] text-outline">info</span>
        </div>
      </div>
    </div>

    <StickyFooter
      label="Continuer"
      :disabled="!offer.prestationId || !hasEnabledSize || !hasEnabledLength"
      @action="router.push({ name: 'offer-galerie' })"
    />
  </div>
</template>
