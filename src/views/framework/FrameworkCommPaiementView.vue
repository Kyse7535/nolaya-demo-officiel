<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useFrameworkStore } from '../../stores/framework'
import { CHANNEL_OPTIONS, PAYMENT_OPTIONS } from '../../domain/model'

const router = useRouter()
const store = useFrameworkStore()
const { framework } = storeToRefs(store)
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Cadre professionnel"
      badge="Brouillon"
      @back="router.push({ name: 'framework-pause' })"
    />

    <div class="flex-1 px-5 py-5">
      <h2 class="screen-title">Communication et paiement</h2>
      <p class="screen-lead">Comment on vous joint, et comment vous êtes payée.</p>

      <p class="field-label mt-6">Canal</p>
      <div class="space-y-2">
        <button
          v-for="opt in CHANNEL_OPTIONS"
          :key="opt.id"
          type="button"
          class="choice w-full"
          :class="{ 'choice-active': framework.channels.includes(opt.id) }"
          @click="store.toggleChannel(opt.id)"
        >
          {{ opt.label }}
        </button>
      </div>

      <p class="field-label mt-6">Délai de réponse à un message (indicatif)</p>
      <p class="mb-2 text-xs text-muted">
        Temps dans lequel vous essayez de répondre quand une cliente vous écrit.
      </p>
      <input
        class="w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm"
        :value="framework.responseDelay"
        @input="store.patch({ responseDelay: $event.target.value })"
      />

      <p class="field-label mt-6">Moyens de paiement acceptés</p>
      <div class="space-y-2">
        <button
          v-for="opt in PAYMENT_OPTIONS"
          :key="opt.id"
          type="button"
          class="choice w-full"
          :class="{ 'choice-active': framework.payments.includes(opt.id) }"
          @click="store.togglePayment(opt.id)"
        >
          {{ opt.label }}
        </button>
      </div>

      <p class="mt-5 text-sm leading-relaxed text-muted">
        Le reste à payer se règle à la fin de la prestation.
      </p>
    </div>

    <StickyFooter
      label="Continuer"
      :disabled="framework.channels.length === 0 || framework.payments.length === 0"
      @action="router.push({ name: 'framework-politiques' })"
    />
  </div>
</template>
