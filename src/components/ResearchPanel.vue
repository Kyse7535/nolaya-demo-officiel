<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDemoStore } from '../stores/demo'
import { useOpportunityStore } from '../stores/opportunity'

const router = useRouter()
const demo = useDemoStore()
const opportunity = useOpportunityStore()
const {
  feedback,
  feedbackSubmitted,
  canSubmitFeedback,
  researchConfig,
  researchActId,
} = storeToRefs(demo)
const { rail, isSettled, hasReviewReply, netRevenue } = storeToRefs(opportunity)

const isFinalAct = computed(() => researchActId.value === 'E')

const summaryText = computed(() => {
  if (researchActId.value === 'E' && isSettled.value) {
    return `Vous avez reçu une demande structurée, obtenu une précision, sécurisé une proposition, préparé le rendez-vous, fait accepter une modification, reçu le règlement final (${rail.value.priceTotalV2} € · net ${netRevenue.value} €)${hasReviewReply.value ? ' et répondu à l’avis d’Inès' : ''}.`
  }
  return researchConfig.value.summary
})

function onSubmit() {
  demo.submitFeedback()
}

function onContinue() {
  demo.closeResearch()
}

function onExportArchive() {
  const payload = demo.exportFeedbackArchive()
  try {
    void navigator.clipboard?.writeText(JSON.stringify(payload, null, 2))
  } catch {
    /* console déjà rempli par exportFeedbackArchive */
  }
}
</script>

<template>
  <div
    v-if="demo.researchOpen"
    class="fixed inset-0 z-50 flex items-end justify-center bg-primary/40 p-0 sm:items-center sm:p-4"
    @click.self="demo.closeResearch()"
  >
    <div class="max-h-[90vh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface p-5 sm:rounded-xl">
      <p class="badge-mono mb-3">Protocole de test · {{ researchConfig.badge }}</p>
      <h2 class="text-lg font-bold text-primary">{{ researchConfig.title }}</h2>
      <p class="mt-2 text-sm leading-relaxed text-muted">
        {{ summaryText }}
      </p>

      <div
        v-if="feedbackSubmitted"
        class="mt-4 rounded-card border border-secondary/40 bg-secondary-container/30 px-3 py-3"
      >
        <p class="text-sm font-semibold text-on-secondary-container">Retour enregistré</p>
        <p class="mt-1 text-xs text-muted">
          Merci{{ demo.displayName ? `, ${demo.displayName}` : '' }}. Vos réponses pour cet acte
          sont conservées sous votre prénom pour l’analyse du test
          <span v-if="feedback.submittedAt">
            ({{ new Date(feedback.submittedAt).toLocaleString('fr-FR') }})
          </span>.
        </p>
        <button type="button" class="btn-ghost mt-2 text-xs" @click="onExportArchive">
          Exporter l’archive (console / presse-papiers)
        </button>
      </div>

      <form class="mt-4 space-y-5" @submit.prevent="onSubmit">
        <fieldset
          v-for="q in researchConfig.questions"
          :key="q.id"
          class="rounded-card bg-surface-low px-3 py-3"
          :disabled="feedbackSubmitted"
        >
          <legend class="text-sm font-medium text-primary">{{ q.label }}</legend>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="opt in q.options"
              :key="opt.id"
              type="button"
              class="choice px-3 py-2 text-xs"
              :class="{ 'choice-active': feedback.answers[q.id] === opt.id }"
              @click="demo.setAnswer(q.id, opt.id)"
            >
              {{ opt.label }}
            </button>
          </div>
        </fieldset>

        <div class="rounded-card bg-surface-low px-3 py-3">
          <label class="text-sm font-medium text-primary" for="artificial">
            À quel moment le parcours vous a-t-il paru artificiel ?
          </label>
          <textarea
            id="artificial"
            class="mt-2 min-h-[72px] w-full rounded-card border border-outline-soft bg-surface px-3 py-2 text-sm disabled:opacity-60"
            :value="feedback.artificialMoment"
            :disabled="feedbackSubmitted"
            placeholder="Ex. trop de clics, données déjà remplies…"
            @input="demo.setArtificialMoment($event.target.value)"
          />
        </div>

        <div class="rounded-card bg-surface-low px-3 py-3">
          <label class="text-sm font-medium text-primary" for="comment">
            Commentaire libre (optionnel)
          </label>
          <textarea
            id="comment"
            class="mt-2 min-h-[64px] w-full rounded-card border border-outline-soft bg-surface px-3 py-2 text-sm disabled:opacity-60"
            :value="feedback.comment"
            :disabled="feedbackSubmitted"
            placeholder="Ce que vous aimeriez ajouter…"
            @input="demo.setComment($event.target.value)"
          />
        </div>

        <button
          v-if="!feedbackSubmitted"
          type="submit"
          class="btn-primary"
          :disabled="!canSubmitFeedback"
        >
          Enregistrer mon retour
        </button>
      </form>

      <div class="mt-5 space-y-2">
        <button
          v-if="feedbackSubmitted && !isFinalAct"
          type="button"
          class="btn-primary"
          @click="onContinue"
        >
          Continuer le parcours
        </button>
        <button
          type="button"
          class="btn-primary"
          :class="{ 'opacity-50': !feedbackSubmitted, 'btn-secondary': feedbackSubmitted && !isFinalAct }"
          :disabled="!feedbackSubmitted"
          @click="demo.resetAll(router)"
        >
          Recommencer le scénario
        </button>
        <button
          v-if="researchActId !== 'P'"
          type="button"
          class="btn-secondary"
          disabled
        >
          Tester un incident
        </button>
        <p class="text-center text-[11px] text-muted">
          <template v-if="isFinalAct">
            Branche protocole — hors parcours nominal. Enregistrez d’abord votre retour pour
            recommencer.
          </template>
          <template v-else>
            Vous pouvez fermer et poursuivre le rail nominal sans enregistrer — le retour ne sera
            pas considéré comme collecté.
          </template>
        </p>
        <button type="button" class="btn-ghost mx-auto block" @click="demo.closeResearch()">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>
