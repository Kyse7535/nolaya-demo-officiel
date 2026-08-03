<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { CLARIFICATION_QUESTIONS } from '../../domain/model'
import { useOpportunityStore } from '../../stores/opportunity'

const router = useRouter()
const opportunity = useOpportunityStore()
const { state, canSendClarification, isEnriched } = storeToRefs(opportunity)

watch(
  () => state.value.clarificationWaiting,
  (waiting, wasWaiting) => {
    if (wasWaiting && !waiting && isEnriched.value) {
      router.replace({ name: 'opportunity-demande' })
    }
  },
)

function onQuestionChange(id, event) {
  opportunity.setQuestionSelected(id, event.target.checked)
}

function send() {
  opportunity.sendClarification()
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Clarification"
      badge="Précision"
      @back="router.push({ name: 'opportunity-demande' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <h2 class="screen-title">Demander une précision</h2>
      <p class="screen-lead">
        Choisissez une ou plusieurs questions. Inès répondra tout de suite.
      </p>

      <div v-if="state.clarificationWaiting" class="mt-8 rounded-card border border-outline-soft bg-surface p-5 text-center">
        <p class="text-sm font-semibold text-primary">Inès consulte votre demande…</p>
        <p class="mt-2 text-sm text-muted">Réponse simulée d’Inès en cours d’affichage.</p>
      </div>

      <template v-else-if="state.clarificationSent">
        <div class="mt-6 rounded-card border border-secondary/40 bg-secondary-container/30 p-4">
          <p class="text-sm font-semibold text-on-secondary-container">Réponse reçue</p>
          <p class="mt-2 text-sm text-primary">Voici une photo récente.</p>
          <p
            v-if="state.selectedQuestionIds.includes('allergies')"
            class="mt-2 text-sm text-primary"
          >
            Aucune allergie connue.
          </p>
        </div>
        <button
          type="button"
          class="btn-primary mt-6"
          @click="router.push({ name: 'opportunity-demande' })"
        >
          Retour à la demande
        </button>
      </template>

      <template v-else>
        <ul class="mt-5 space-y-2">
          <li v-for="q in CLARIFICATION_QUESTIONS" :key="q.id">
            <label
              class="choice flex w-full cursor-pointer items-start gap-3"
              :class="{ 'choice-active': state.selectedQuestionIds.includes(q.id) }"
            >
              <input
                type="checkbox"
                class="mt-1"
                :checked="state.selectedQuestionIds.includes(q.id)"
                @change="onQuestionChange(q.id, $event)"
              />
              <span class="block text-sm font-semibold text-primary">{{ q.label }}</span>
            </label>
          </li>
        </ul>
      </template>
    </div>

    <StickyFooter
      v-if="!state.clarificationSent && !state.clarificationWaiting"
      label="Envoyer la demande"
      :disabled="!canSendClarification"
      @action="send"
    >
      <p v-if="!canSendClarification" class="mt-2 text-center text-[11px] text-muted">
        Cochez au moins une précision pour activer l’envoi.
      </p>
    </StickyFooter>
  </div>
</template>
