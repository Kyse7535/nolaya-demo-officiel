<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useFrameworkStore } from '../../stores/framework'

const router = useRouter()
const store = useFrameworkStore()
const { framework } = storeToRefs(store)
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Cadre professionnel"
      badge="Brouillon"
      @back="router.push({ name: 'framework-contexts' })"
    />

    <div class="flex-1 px-5 py-5">
      <h2 class="screen-title">Accueil et accès</h2>
      <p class="screen-lead">Vos règles d’accueil pour les clientes.</p>

      <p class="field-label mt-6">Accompagnants</p>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="choice"
          :class="{ 'choice-active': !framework.companionsAllowed }"
          @click="store.patch({ companionsAllowed: false })"
        >
          Non autorisés
        </button>
        <button
          type="button"
          class="choice"
          :class="{ 'choice-active': framework.companionsAllowed }"
          @click="store.patch({ companionsAllowed: true })"
        >
          Autorisés
        </button>
      </div>

      <p class="field-label mt-6">Mineurs</p>
      <button
        type="button"
        class="choice w-full"
        :class="{ 'choice-active': framework.minorsWithGuardian }"
        @click="store.patch({ minorsWithGuardian: true })"
      >
        Acceptés avec accompagnateur
      </button>
      <button
        type="button"
        class="choice mt-2 w-full"
        :class="{ 'choice-active': !framework.minorsWithGuardian }"
        @click="store.patch({ minorsWithGuardian: false })"
      >
        Non acceptés
      </button>

      <label class="field-label mt-6">Comment trouver / entrer (digicode, étage…)</label>
      <input
        class="w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm"
        :value="framework.accessNote"
        @input="store.patch({ accessNote: $event.target.value })"
      />
    </div>

    <StickyFooter label="Continuer" @action="router.push({ name: 'framework-pause' })" />
  </div>
</template>
