<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import FlowStepper from '../../components/FlowStepper.vue'
import { useOfferStore } from '../../stores/offer'
import { useFrameworkStore } from '../../stores/framework'
import { lengthLabel } from '../../domain/model'
import { STITCH } from '../../assets/stitchAssets'

const router = useRouter()
const store = useOfferStore()
const frameworkStore = useFrameworkStore()
const {
  offer,
  devisPreview,
  enabledLengths,
  baseLengthOffer,
  adaptedLengthOffers,
  barèmeReady,
} = storeToRefs(store)
const { pauseText } = storeToRefs(frameworkStore)

const steps = ['Prestation', 'Galerie de la prestation', 'Préparation', 'Prix']

function setOfferNum(id, key, event) {
  store.updateLengthOffer(id, { [key]: Number(event.target.value) || 0 })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Prestation"
      badge="Brouillon"
      @back="router.push({ name: 'offer-service' })"
    />

    <div class="flex-1 px-5 py-5">
      <FlowStepper :steps="steps" :current="4" />

      <div class="mt-5 overflow-hidden border border-outline-soft">
        <img :src="STITCH.s14Hero" alt="" class="hero-media h-32 w-full" />
      </div>

      <h2 class="screen-title mt-5">Prix par longueur</h2>
      <p class="screen-lead">
        Fixez le prix de la longueur de référence, puis adaptez le tarif des autres longueurs.
      </p>

      <div
        v-if="enabledLengths.length === 0"
        class="mt-6 rounded-card bg-surface-low px-3 py-3 text-sm text-muted"
      >
        Aucune longueur activée. Revenez à l’étape Prestation.
      </div>

      <template v-else>
        <div
          v-if="baseLengthOffer"
          class="mt-6 rounded-card border border-outline-soft bg-surface p-3"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-semibold text-primary">
              {{ lengthLabel(baseLengthOffer.id) }}
            </p>
            <span class="text-[11px] font-semibold uppercase tracking-wide text-secondary">
              Référence
            </span>
          </div>
          <p class="mt-1 text-xs text-muted">
            Prix de base pour cette prestation à cette longueur.
          </p>
          <label class="field-label mt-3">Prix (€)</label>
          <input
            type="number"
            class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 text-sm"
            :value="baseLengthOffer.price"
            @input="setOfferNum(baseLengthOffer.id, 'price', $event)"
          />
          <div class="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">Heures</label>
              <input
                type="number"
                class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 text-sm"
                :value="baseLengthOffer.durationHours"
                @input="setOfferNum(baseLengthOffer.id, 'durationHours', $event)"
              />
            </div>
            <div>
              <label class="field-label">Minutes</label>
              <input
                type="number"
                class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 text-sm"
                :value="baseLengthOffer.durationMinutes"
                @input="setOfferNum(baseLengthOffer.id, 'durationMinutes', $event)"
              />
            </div>
          </div>
        </div>

        <template v-if="adaptedLengthOffers.length">
          <p class="field-label mt-6">Autres longueurs — adapter le prix</p>
          <p class="mb-2 text-xs text-muted">
            Plus la longueur augmente, plus vous ajustez le tarif (toujours un prix complet).
          </p>
          <div class="space-y-4">
            <div
              v-for="line in adaptedLengthOffers"
              :key="line.id"
              class="rounded-card border border-outline-soft bg-surface p-3"
            >
              <p class="text-sm font-semibold text-primary">{{ lengthLabel(line.id) }}</p>
              <label class="field-label mt-3">Prix (€)</label>
              <input
                type="number"
                class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 text-sm"
                :value="line.price"
                @input="setOfferNum(line.id, 'price', $event)"
              />
              <div class="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label class="field-label">Heures</label>
                  <input
                    type="number"
                    class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 text-sm"
                    :value="line.durationHours"
                    @input="setOfferNum(line.id, 'durationHours', $event)"
                  />
                </div>
                <div>
                  <label class="field-label">Minutes</label>
                  <input
                    type="number"
                    class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 text-sm"
                    :value="line.durationMinutes"
                    @input="setOfferNum(line.id, 'durationMinutes', $event)"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <div class="mt-6 rounded-card border border-dashed border-outline-soft bg-surface-low p-3">
          <p class="text-sm font-semibold text-primary">En plus (ex. mèches)</p>
          <p class="mt-1 text-xs text-muted">
            Fourniture ou service en plus du prix de la longueur choisie (ex. mèches). Ce n’est pas
            un écart de longueur.
          </p>
          <label class="field-label mt-3">Libellé</label>
          <input
            class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 text-sm"
            :value="offer.supplementLabel"
            @input="store.patch({ supplementLabel: $event.target.value })"
          />
          <label class="field-label mt-3">Montant (€)</label>
          <input
            type="number"
            class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 text-sm"
            :value="offer.supplementAmount"
            @input="store.patch({ supplementAmount: Number($event.target.value) || 0 })"
          />
        </div>

        <div class="mt-5 rounded-card bg-surface-low px-3 py-3">
          <p class="text-sm font-semibold text-primary">
            Aperçu · À partir de {{ devisPreview.from }} €
            <span v-if="offer.supplementAmount">
              · {{ devisPreview.withSupplement }} € avec
              {{ offer.supplementLabel.toLowerCase() }}
            </span>
          </p>
          <ul class="mt-2 space-y-1 text-xs text-muted">
            <li v-for="line in devisPreview.lines" :key="line.id">
              {{ line.label }} — {{ line.price }} € · {{ line.duration }}
            </li>
          </ul>
          <p class="mt-2 text-xs leading-relaxed text-muted">
            Pause prévue dans votre cadre : {{ pauseText }} — rappelée à la cliente, non ajoutée
            automatiquement à ces durées.
          </p>
        </div>
      </template>
    </div>

    <StickyFooter
      label="Continuer"
      :disabled="!barèmeReady"
      @action="router.push({ name: 'offer-recap' })"
    />
  </div>
</template>
