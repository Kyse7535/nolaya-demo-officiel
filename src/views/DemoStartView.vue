<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDemoStore } from '../stores/demo'
import { createEmptyContacts, hasAnyContact } from '../utils/contacts'
import { STITCH } from '../assets/stitchAssets'

const router = useRouter()
const demo = useDemoStore()
const { stylistName, stylistContacts, stylistWorkplace } = storeToRefs(demo)

const nameDraft = ref(stylistName.value || '')
const workplaceDraft = ref(stylistWorkplace.value || '')
const contactsDraft = ref({
  ...createEmptyContacts(),
  ...(stylistContacts.value || {}),
})

const canStart = computed(() => {
  const nameOk = String(nameDraft.value || '').trim().length > 0
  const placeOk = String(workplaceDraft.value || '').trim().length > 0
  return nameOk && placeOk && hasAnyContact(contactsDraft.value)
})

const identityPreview = computed(() => {
  const name = String(nameDraft.value || '').trim() || 'Vous'
  const place = String(workplaceDraft.value || '').trim()
  return place ? `${name} — ${place}` : name
})

const steps = [
  { n: 1, title: 'Cadre professionnel', body: 'Comment vous travaillez' },
  { n: 2, title: 'Prestations', body: 'Ce que vous proposez' },
  { n: 3, title: 'Planning actif', body: 'Quand vous êtes disponible' },
]

function onStart() {
  if (!demo.startAs(nameDraft.value, contactsDraft.value, workplaceDraft.value)) return
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <!-- S01 hero -->
    <section class="relative h-52 shrink-0 overflow-hidden">
      <img
        :src="STITCH.s01Hero"
        alt=""
        class="hero-media absolute inset-0 h-full w-full"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/50" />
      <div class="absolute inset-x-0 top-0 px-4 pt-4">
        <div
          class="flex items-center justify-between rounded-card border border-white/20 bg-white/90 px-3 py-2 backdrop-blur"
        >
          <span class="font-mono text-[10px] font-medium uppercase tracking-wider text-primary">
            Mode démo
          </span>
          <span class="font-mono text-[10px] uppercase tracking-wider text-outline">
            Étape 1 sur 8
          </span>
        </div>
      </div>
      <div class="absolute inset-x-0 bottom-0 px-5 pb-4">
        <p class="text-2xl font-bold tracking-tight text-white drop-shadow">Atelier Synergy</p>
      </div>
    </section>

    <div class="flex flex-1 flex-col px-5 pb-6 pt-6">
      <h1 class="text-2xl font-bold tracking-tight text-primary">
        Créez votre offre professionnelle
      </h1>
      <p class="mt-2 text-sm leading-relaxed text-muted">
        Définissez comment vous travaillez, ce que vous proposez, puis quand vous êtes disponible.
      </p>

      <div class="editorial-card relative mt-5 overflow-hidden p-4">
        <p class="font-mono text-[10px] font-medium uppercase tracking-wider text-outline">
          Vous dans cette démo
        </p>
        <div class="mt-3 flex items-start gap-3">
          <img
            :src="STITCH.s01Avatar"
            alt=""
            class="h-12 w-12 shrink-0 rounded-full border border-outline-soft object-cover"
          />
          <div>
            <p class="text-sm font-semibold text-primary">
              {{ identityPreview }}
            </p>
            <p class="mt-2 text-xs font-semibold uppercase tracking-wide text-secondary">Parcours</p>
            <ol class="mt-1 space-y-0.5 text-sm text-muted">
              <li>1. Vos règles, votre offre, vos dispos</li>
              <li>2. Une demande cliente (Inès, simulée)</li>
            </ol>
            <p class="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-muted">
              <span class="material-symbols-outlined text-[16px]">timer</span>
              Durée estimée : 12 à 18 minutes
            </p>
          </div>
        </div>
      </div>

      <p class="mt-6 text-xs font-semibold uppercase tracking-wide text-secondary">
        Ce que vous allez faire
      </p>
      <ul class="mt-3 space-y-3">
        <li v-for="s in steps" :key="s.n" class="flex items-start gap-3">
          <span
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold"
            :class="
              s.n === 1
                ? 'bg-primary text-on-primary'
                : 'bg-surface-high text-muted'
            "
          >
            {{ s.n }}
          </span>
          <div>
            <p class="text-sm font-semibold text-primary">{{ s.title }}</p>
            <p class="text-xs text-muted">{{ s.body }}</p>
          </div>
        </li>
      </ul>

      <div class="mt-6 space-y-4">
        <div>
          <label class="field-label" for="stylist-name">Votre prénom</label>
          <input
            id="stylist-name"
            v-model="nameDraft"
            type="text"
            autocomplete="given-name"
            class="w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm text-primary"
            placeholder="Ex. Amina"
            @keydown.enter.prevent="onStart"
          />
        </div>

        <div>
          <label class="field-label" for="stylist-workplace">Lieu de travail</label>
          <input
            id="stylist-workplace"
            v-model="workplaceDraft"
            type="text"
            autocomplete="address-level2"
            class="w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm text-primary"
            placeholder="Ex. Paris 18e, À domicile — Aubervilliers…"
            @keydown.enter.prevent="onStart"
          />
          <p class="mt-1.5 text-xs text-muted">
            Ville, quartier ou formule (salon, domicile…) — comme vous l’indiquez à vos clientes.
          </p>
        </div>

        <div>
          <p class="field-label">Comment vous recontacter</p>
          <p class="mb-3 text-xs text-muted">
            Indiquez au moins un réseau ou moyen de contact — pour regrouper vos retours.
          </p>

          <div class="space-y-3">
            <div>
              <label class="field-label" for="contact-instagram">Instagram</label>
              <input
                id="contact-instagram"
                v-model="contactsDraft.instagram"
                type="text"
                autocomplete="off"
                class="w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm text-primary"
                placeholder="@votrecompte"
              />
            </div>
            <div>
              <label class="field-label" for="contact-tiktok">TikTok</label>
              <input
                id="contact-tiktok"
                v-model="contactsDraft.tiktok"
                type="text"
                autocomplete="off"
                class="w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm text-primary"
                placeholder="@votrecompte"
              />
            </div>
            <div>
              <label class="field-label" for="contact-whatsapp">WhatsApp (optionnel)</label>
              <input
                id="contact-whatsapp"
                v-model="contactsDraft.whatsapp"
                type="tel"
                autocomplete="tel"
                class="w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm text-primary"
                placeholder="06 …"
              />
            </div>
            <div>
              <label class="field-label" for="contact-phone">Téléphone (optionnel)</label>
              <input
                id="contact-phone"
                v-model="contactsDraft.phone"
                type="tel"
                autocomplete="tel"
                class="w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm text-primary"
                placeholder="06 …"
              />
            </div>
            <div>
              <label class="field-label" for="contact-email">E-mail (optionnel)</label>
              <input
                id="contact-email"
                v-model="contactsDraft.email"
                type="email"
                autocomplete="email"
                class="w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm text-primary"
                placeholder="vous@exemple.com"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-auto space-y-3 pt-8">
        <div
          class="flex items-center gap-2 rounded-card bg-surface-low px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted"
        >
          <span class="material-symbols-outlined text-[16px]">info</span>
          Cliente Inès simulée après activation du planning
        </div>
        <button type="button" class="btn-primary" :disabled="!canStart" @click="onStart">
          Commencer
        </button>
        <p class="text-center text-[11px] text-muted">
          Prénom, lieu de travail et au moins un contact requis pour démarrer.
        </p>
      </div>
    </div>
  </div>
</template>
