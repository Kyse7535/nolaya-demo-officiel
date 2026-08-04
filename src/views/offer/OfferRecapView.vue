<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useOfferStore } from '../../stores/offer'
import { useFrameworkStore } from '../../stores/framework'
import { GALLERY_MOCK, OfferStatus } from '../../domain/model'
import { STITCH } from '../../assets/stitchAssets'

const router = useRouter()
const store = useOfferStore()
const frameworkStore = useFrameworkStore()
const { offer, label, lengthsSummary, sizesText, canActivate, devisPreview, isActive, status } =
  storeToRefs(store)
const { pauseText, framework } = storeToRefs(frameworkStore)

const galleryItems = computed(() =>
  GALLERY_MOCK.filter((g) => offer.value.galleryIds.includes(g.id)),
)

function activate() {
  if (store.activate()) {
    router.push({ name: 'offer-bridge' })
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Prestation"
      :badge="isActive ? 'Active' : status === OfferStatus.DRAFT ? 'Brouillon' : ''"
      @back="router.push({ name: isActive ? 'offer-bridge' : 'offer-prix' })"
    />

    <div class="flex-1 px-5 py-5">
      <h2 class="screen-title">Récapitulatif et activation de l’offre</h2>
      <p class="screen-lead">
        {{
          isActive
            ? 'Offre active — le planning vient ensuite.'
            : 'Relisez avant d’activer. Le planning viendra ensuite.'
        }}
      </p>

      <div class="mt-5 overflow-hidden border border-outline-soft">
        <img :src="STITCH.s15Hero" alt="" class="hero-media h-32 w-full" />
      </div>

      <p class="field-label mt-6">Aperçu côté cliente</p>
      <article class="editorial-card overflow-hidden">
        <div class="grid grid-cols-3 gap-0.5 bg-surface-low">
          <div v-for="item in galleryItems.slice(0, 3)" :key="item.id" class="relative h-20">
            <img
              v-if="item.src"
              :src="item.src"
              alt=""
              class="hero-media absolute inset-0 h-full w-full"
            />
            <div v-else class="h-full bg-gradient-to-br" :class="item.tone" />
          </div>
          <div
            v-if="galleryItems.length === 0"
            class="col-span-3 flex h-20 items-center justify-center text-xs text-muted"
          >
            Aucune photo
          </div>
        </div>
        <div class="px-3 py-3">
          <p class="text-base font-bold text-primary">{{ label }}</p>
          <p class="mt-1 text-sm text-muted">
            {{ lengthsSummary }}
            <span v-if="sizesText !== '—'"> · {{ sizesText }}</span>
          </p>
          <p class="mt-2 text-lg font-semibold text-primary">
            À partir de {{ devisPreview.from }} €
          </p>
          <ul class="mt-2 space-y-0.5 text-xs text-muted">
            <li v-for="line in devisPreview.lines" :key="line.id">
              {{ line.label }} — {{ line.price }} € · {{ line.duration }}
            </li>
          </ul>
          <p v-if="offer.clientPrepNote" class="mt-3 text-xs leading-relaxed text-muted">
            À préparer : {{ offer.clientPrepNote }}
          </p>
        </div>
      </article>

      <dl class="mt-6 space-y-3">
        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Cadre actif</dt>
          <dd class="mt-1 text-sm text-primary">
            {{ pauseText }} · retard {{ framework.lateTolerance }} min
          </dd>
        </div>

        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <div class="flex justify-between gap-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Prestation</dt>
              <dd class="mt-1 text-sm text-primary">{{ label }}</dd>
              <dd class="mt-1 text-sm text-muted">
                Longueurs : {{ lengthsSummary }} · Épaisseur : {{ sizesText }}
              </dd>
            </div>
            <button
              v-if="!isActive"
              type="button"
              class="btn-ghost"
              @click="router.push({ name: 'offer-prestation' })"
            >
              Modifier
            </button>
          </div>
        </div>

        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <div class="flex justify-between gap-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Galerie</dt>
              <dd class="mt-1 text-sm text-primary">
                {{ offer.galleryIds.length }} réalisation(s)
              </dd>
            </div>
            <button
              v-if="!isActive"
              type="button"
              class="btn-ghost"
              @click="router.push({ name: 'offer-galerie' })"
            >
              Modifier
            </button>
          </div>
        </div>

        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <div class="flex justify-between gap-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">
                Préparation
              </dt>
              <dd class="mt-1 text-sm text-primary">{{ offer.clientPrepNote || '—' }}</dd>
            </div>
            <button
              v-if="!isActive"
              type="button"
              class="btn-ghost"
              @click="router.push({ name: 'offer-service' })"
            >
              Modifier
            </button>
          </div>
        </div>

        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <div class="flex justify-between gap-2">
            <div class="min-w-0">
              <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">
                Prix par longueur
              </dt>
              <dd class="mt-1 space-y-1 text-sm text-primary">
                <p v-for="line in devisPreview.lines" :key="line.id">
                  {{ line.label }} — {{ line.price }} € · {{ line.duration }}
                </p>
              </dd>
              <dd
                v-if="offer.supplementAmount"
                class="mt-2 text-sm text-muted"
              >
                Option :
                + {{ offer.supplementAmount }} €
                {{ offer.supplementLabel.toLowerCase() }}
              </dd>
            </div>
            <button
              v-if="!isActive"
              type="button"
              class="btn-ghost"
              @click="router.push({ name: 'offer-prix' })"
            >
              Modifier
            </button>
          </div>
        </div>
      </dl>
    </div>

    <StickyFooter
      v-if="!isActive"
      label="Activer cette prestation"
      :disabled="!canActivate"
      @action="activate"
    />
    <div
      v-else
      class="sticky bottom-[46px] z-20 border-t border-outline-soft/70 bg-background/95 px-4 py-3"
    >
      <button type="button" class="btn-primary" @click="router.push({ name: 'offer-bridge' })">
        Retour
      </button>
    </div>
  </div>
</template>
