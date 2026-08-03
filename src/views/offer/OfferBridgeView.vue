<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import StickyFooter from '../../components/StickyFooter.vue'
import { useOfferStore } from '../../stores/offer'
import { useScheduleStore } from '../../stores/schedule'
import { useFrameworkStore } from '../../stores/framework'
import { GALLERY_MOCK, contextsSummary } from '../../domain/model'

const router = useRouter()
const offerStore = useOfferStore()
const scheduleStore = useScheduleStore()
const frameworkStore = useFrameworkStore()
const { offer, label, devisPreview, lengthsSummary, sizesText } = storeToRefs(offerStore)
const { framework } = storeToRefs(frameworkStore)

const galleryItems = computed(() =>
  GALLERY_MOCK.filter((g) => offer.value.galleryIds.includes(g.id)),
)

const pillars = [
  { title: 'Lieu', body: 'Où vous accueillez, d’après votre cadre.' },
  { title: 'Jours & horaires', body: 'Vos jours ouverts, avec les horaires de chaque jour.' },
  { title: 'Limite de charge', body: 'Combien de rendez-vous maximum par jour.' },
]

function openSchedule() {
  scheduleStore.startDraft()
  router.push({ name: 'schedule-config' })
}
</script>

<template>
  <div class="flex flex-1 flex-col px-5 pb-0 pt-6">
    <p class="badge-mono">Offre active</p>
    <h1 class="mt-3 screen-title">Votre prestation est active</h1>
    <p class="screen-lead">
      Voici comment elle apparaît côté cliente. Ensuite, définissez quand vous êtes disponible.
    </p>

    <p class="field-label mt-5">Vue cliente</p>
    <article class="overflow-hidden rounded-card border border-outline-soft bg-surface shadow-sm">
      <div class="grid grid-cols-3 gap-0.5 bg-surface-low">
        <div
          v-for="item in galleryItems.slice(0, 3)"
          :key="item.id"
          class="h-24 bg-gradient-to-br"
          :class="item.tone"
        />
        <div
          v-if="galleryItems.length === 0"
          class="col-span-3 flex h-24 items-center justify-center text-xs text-muted"
        >
          Aucune photo
        </div>
      </div>
      <div class="px-4 py-4">
        <p class="text-lg font-bold tracking-tight text-primary">{{ label }}</p>
        <p class="mt-1 text-sm text-muted">
          {{ lengthsSummary }}
          <span v-if="sizesText !== '—'"> · {{ sizesText }}</span>
        </p>
        <p class="mt-3 text-xl font-semibold text-primary">
          À partir de {{ devisPreview.from }} €
          <span v-if="offer.supplementAmount" class="text-sm font-medium text-muted">
            · {{ devisPreview.withSupplement }} € avec {{ offer.supplementLabel.toLowerCase() }}
          </span>
        </p>
        <ul class="mt-2 space-y-1 text-sm text-muted">
          <li v-for="line in devisPreview.lines" :key="line.id">
            {{ line.label }} — {{ line.price }} € · {{ line.duration }}
          </li>
        </ul>
        <p
          v-if="offer.clientPrepNote"
          class="mt-3 rounded-card bg-surface-low px-3 py-2 text-xs leading-relaxed text-muted"
        >
          À préparer : {{ offer.clientPrepNote }}
        </p>
        <p class="mt-2 text-[11px] text-muted">
          {{ contextsSummary(framework.contexts) }}
        </p>
      </div>
    </article>

    <div class="mt-5 rounded-card border border-secondary/30 bg-secondary-container/30 px-3 py-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-on-secondary-container">
        Cadre actif · Offre active
      </p>
    </div>

    <h2 class="mt-6 text-lg font-bold text-primary">Quand vous êtes disponible</h2>
    <p class="mt-2 text-sm leading-relaxed text-muted">
      Indiquez vos jours, vos horaires et votre charge. Les créneaux possibles en découlent.
    </p>

    <ul class="mt-4 space-y-2">
      <li
        v-for="p in pillars"
        :key="p.title"
        class="rounded-card border border-outline-soft bg-surface px-3 py-2.5"
      >
        <p class="text-sm font-semibold text-primary">{{ p.title }}</p>
        <p class="text-xs text-muted">{{ p.body }}</p>
      </li>
    </ul>

    <button
      type="button"
      class="btn-ghost mt-4 text-center"
      @click="router.push({ name: 'offer-recap' })"
    >
      Revoir ma prestation
    </button>

    <div class="mt-auto">
      <StickyFooter label="Configurer mon planning" @action="openSchedule" />
    </div>
  </div>
</template>