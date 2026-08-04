<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import FlowStepper from '../../components/FlowStepper.vue'
import { useFrameworkStore } from '../../stores/framework'
import { CANCELLATION_OPTIONS } from '../../domain/model'
import { STITCH } from '../../assets/stitchAssets'

const router = useRouter()
const store = useFrameworkStore()
const { framework } = storeToRefs(store)

const steps = ['Contextes', 'Accueil', 'Pause', 'Communication', 'Politiques']
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Cadre professionnel"
      badge="Brouillon"
      @back="router.push({ name: 'framework-comm' })"
    />

    <div class="flex-1 px-5 py-5">
      <FlowStepper :steps="steps" :current="5" />

      <div class="mt-5 overflow-hidden border border-outline-soft">
        <img :src="STITCH.s08Hero" alt="" class="hero-media h-36 w-full" />
      </div>

      <h2 class="screen-title mt-5">Retard, annulation et photos</h2>
      <p class="screen-lead">Choisissez des règles simples.</p>

      <p class="field-label mt-6">Retard toléré</p>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="m in [10, 15, 20]"
          :key="m"
          type="button"
          class="choice text-center font-mono"
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
      <div class="platform-rule w-full">
        Possible si douleur forte ou malaise
        <span class="platform-rule__tag">Fixé par la plateforme</span>
      </div>

      <p class="field-label mt-6">Photos de la cliente</p>
      <div class="platform-rule w-full">
        Publication uniquement avec l’accord de la cliente
        <span class="platform-rule__tag">Fixé par la plateforme</span>
      </div>
    </div>

    <StickyFooter label="Continuer" @action="router.push({ name: 'framework-recap' })" />
  </div>
</template>
