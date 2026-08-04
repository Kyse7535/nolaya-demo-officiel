<script setup>
import { useRouter } from 'vue-router'
import StickyFooter from '../../components/StickyFooter.vue'
import { useOfferStore } from '../../stores/offer'
import { STITCH } from '../../assets/stitchAssets'

const router = useRouter()
const offerStore = useOfferStore()

const pillars = [
  { title: 'Prestation', body: 'Le service et les longueurs que vous proposez.' },
  { title: 'Galerie', body: 'Des photos de cette prestation (pas de tout votre portfolio).' },
  {
    title: 'Préparation',
    body: 'Ce que vous faites, et ce que la cliente prépare avant le rendez-vous (ex. cheveux lavés).',
  },
  { title: 'Prix & durée', body: 'Un prix et une durée pour chaque longueur.' },
]

function openOffer() {
  offerStore.startDraft()
  router.push({ name: 'offer-prestation' })
}
</script>

<template>
  <div class="flex flex-1 flex-col px-5 pb-0 pt-6">
    <p class="badge-mono">Cadre actif</p>
    <h1 class="mt-3 screen-title">Votre cadre professionnel est actif</h1>
    <p class="screen-lead">
      Vous pouvez maintenant créer ce que vous proposez aux clientes
    </p>

    <div class="mt-5 overflow-hidden border border-outline-soft">
      <img :src="STITCH.s10Hero" alt="" class="hero-media h-40 w-full" />
    </div>

    <div class="mt-4 rounded-card border border-secondary/30 bg-secondary-container/30 px-3 py-3">
      <p class="font-mono text-[10px] font-semibold uppercase tracking-wider text-on-secondary-container">
        Cadre professionnel actif
      </p>
    </div>

    <h2 class="mt-6 text-lg font-bold text-primary">Créer ce que vous proposez</h2>
    <p class="mt-2 text-sm leading-relaxed text-muted">
      Choisissez une prestation, montrez comment elle se présente, puis
      fixez prix et durée. Le planning viendra ensuite.
    </p>

    <ul class="mt-4 space-y-2">
      <li
        v-for="(p, i) in pillars"
        :key="p.title"
        class="editorial-card flex items-start gap-3 px-3 py-2.5"
      >
        <span
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-high font-mono text-[10px] font-bold"
        >
          {{ i + 1 }}
        </span>
        <div>
          <p class="text-sm font-semibold text-primary">{{ p.title }}</p>
          <p class="text-xs text-muted">{{ p.body }}</p>
        </div>
      </li>
    </ul>

    <button
      type="button"
      class="btn-ghost mt-4 text-center"
      @click="router.push({ name: 'framework-recap' })"
    >
      Revoir mon cadre
    </button>

    <div class="mt-auto">
      <StickyFooter label="Créer une prestation" @action="openOffer" />
    </div>
  </div>
</template>
