<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDemoStore } from '../stores/demo'
import { createEmptyContacts, hasAnyContact } from '../utils/contacts'

const router = useRouter()
const demo = useDemoStore()
const { stylistName, stylistContacts } = storeToRefs(demo)

const nameDraft = ref(stylistName.value || '')
const contactsDraft = ref({
  ...createEmptyContacts(),
  ...(stylistContacts.value || {}),
})

const canStart = computed(() => {
  const nameOk = String(nameDraft.value || '').trim().length > 0
  return nameOk && hasAnyContact(contactsDraft.value)
})

function onStart() {
  if (!demo.startAs(nameDraft.value, contactsDraft.value)) return
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="flex flex-1 flex-col px-5 pb-6 pt-10">
    <p class="badge-mono">Démonstration autonome</p>
    <h1 class="mt-4 text-3xl font-bold tracking-tight text-primary">
      Créez votre offre, puis traitez une demande
    </h1>
    <p class="mt-3 text-base leading-relaxed text-muted">
      Définissez comment vous travaillez, ce que vous proposez, quand vous êtes disponible — puis
      recevez et traitez la demande simulée d’Inès.
    </p>

    <div class="mt-8 rounded-card bg-surface-low p-4">
      <p class="text-xs font-semibold uppercase tracking-wide text-secondary">
        Vous dans cette démo
      </p>
      <p class="mt-1 text-sm font-semibold text-primary">
        {{ canStart ? nameDraft.trim() : 'Vous' }} — coiffeuse en tresses, Saint-Denis
      </p>
      <p class="mt-3 text-xs font-semibold uppercase tracking-wide text-secondary">Parcours</p>
      <ol class="mt-1 space-y-1 text-sm text-muted">
        <li>1. Vos règles, votre offre, vos dispos</li>
        <li>2. Une demande cliente (Inès, simulée)</li>
      </ol>
      <p class="mt-3 text-xs text-muted">
        Durée estimée : 12 à 18 minutes · Cliente Inès simulée après activation du planning
      </p>
    </div>

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

    <div class="mt-auto pt-8">
      <button type="button" class="btn-primary" :disabled="!canStart" @click="onStart">
        Commencer
      </button>
      <p class="mt-2 text-center text-[11px] text-muted">
        Prénom + au moins un contact requis pour démarrer.
      </p>
    </div>
  </div>
</template>
