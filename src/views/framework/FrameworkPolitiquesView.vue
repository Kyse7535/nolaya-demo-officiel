<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useFrameworkStore } from '../../stores/framework'
import { CANCELLATION_OPTIONS } from '../../domain/model'

const router = useRouter()
const store = useFrameworkStore()
const { framework } = storeToRefs(store)
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Cadre professionnel"
      badge="Brouillon"
      @back="router.push({ name: 'framework-comm' })"
    />

    <div class="flex-1 px-5 py-5">
      <h2 class="screen-title">Politiques, sécurité et photos</h2>
      <p class="screen-lead">Choisissez des règles simples, sans rédiger un texte juridique.</p>

      <p class="field-label mt-6">Retard toléré</p>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="m in [10, 15, 20]"
          :key="m"
          type="button"
          class="choice text-center"
          :class="{ 'choice-active': framework.lateTolerance === m }"
          @click="store.patch({ lateTolerance: m })"
        >
          {{ m }} min
        </button>
      </div>

      <p class="field-label mt-6">Annulation / report</p>
      <button
        v-for="opt in CANCELLATION_OPTIONS"
        :key="opt.id"
        type="button"
        class="choice mt-2 w-full first:mt-0"
        :class="{ 'choice-active': framework.cancellationPolicy === opt.id }"
        @click="store.patch({ cancellationPolicy: opt.id })"
      >
        {{ opt.label }}
      </button>

      <p class="field-label mt-6">Interruption pour sécurité</p>
      <div class="choice choice-active choice-locked w-full">
        Possible si tension excessive ou malaise
      </div>
      <p class="mt-1.5 text-xs text-muted">Règle par défaut de la plateforme — non modifiable ici.</p>

      <p class="field-label mt-6">Consentement photos</p>
      <button
        type="button"
        class="choice w-full"
        :class="{ 'choice-active': framework.photoConsent === 'explicit' }"
        @click="store.patch({ photoConsent: 'explicit' })"
      >
        Publication uniquement avec l’accord de la cliente
      </button>
    </div>

    <StickyFooter label="Continuer" @action="router.push({ name: 'framework-recap' })" />
  </div>
</template>
