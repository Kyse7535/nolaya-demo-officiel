<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useFrameworkStore } from '../../stores/framework'
import { CONTEXT_OPTIONS } from '../../domain/model'

const router = useRouter()
const store = useFrameworkStore()
const { framework } = storeToRefs(store)
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Cadre professionnel"
      badge="Brouillon"
      @back="router.push({ name: 'framework-welcome' })"
    />

    <div class="flex-1 px-5 py-5">
      <h2 class="screen-title">Où vous travaillez</h2>
      <p class="screen-lead">
        Ces lieux s’appliquent par défaut à vos prochaines prestations.
      </p>

      <p class="field-label mt-6">Où travaillez-vous ?</p>
      <div class="space-y-2">
        <button
          v-for="opt in CONTEXT_OPTIONS"
          :key="opt.id"
          type="button"
          class="choice w-full"
          :class="{ 'choice-active': framework.contexts.includes(opt.id) }"
          @click="store.toggleContext(opt.id)"
        >
          {{ opt.label }}
        </button>
      </div>

      <p class="field-label mt-6">Confidentialité de l’adresse</p>
      <button
        type="button"
        class="choice w-full"
        :class="{ 'choice-active': framework.addressPrivate }"
        @click="store.patch({ addressPrivate: true })"
      >
        Adresse masquée jusqu’à l’engagement
      </button>
      <button
        type="button"
        class="choice mt-2 w-full"
        :class="{ 'choice-active': !framework.addressPrivate }"
        @click="store.patch({ addressPrivate: false })"
      >
        Adresse visible plus tôt
      </button>
    </div>

    <StickyFooter
      label="Continuer"
      :disabled="framework.contexts.length === 0"
      @action="router.push({ name: 'framework-accueil' })"
    />
  </div>
</template>
