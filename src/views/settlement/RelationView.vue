<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import {
  INES_REVIEW,
  REVIEW_REPLY_MAX,
  REVIEW_TONES,
} from '../../domain/model'
import { useOpportunityStore } from '../../stores/opportunity'
import { useDemoStore } from '../../stores/demo'
import { notifySimulation } from '../../utils/simulationToast'

const router = useRouter()
const opportunity = useOpportunityStore()
const demo = useDemoStore()
const {
  rail,
  state,
  isSettled,
  hasReviewReply,
  memorizedPrefs,
  netRevenue,
} = storeToRefs(opportunity)
const { displayName, netlifySynced, netlifySubmitting, lastNetlifyError } = storeToRefs(demo)

const reviewComment = computed(() =>
  INES_REVIEW.comment.replace(/\bSarah\b/g, displayName.value),
)

const sheet = ref(null) // 'reply' | 'favorite' | 'client' | 'thanks' | null

watch(
  () => isSettled.value,
  (settled) => {
    if (!settled) router.replace({ name: 'settlement' })
  },
  { immediate: true },
)

const canSendReply = computed(() => {
  if (hasReviewReply.value) return false
  if (!state.value.reviewReplyToneId) return false
  return String(state.value.reviewReplyText || '').trim().length > 0
})

const replyCharCount = computed(() => String(state.value.reviewReplyText || '').length)

function openReply() {
  if (hasReviewReply.value) return
  if (!state.value.reviewReplyToneId) {
    opportunity.selectReviewTone('warm')
  }
  sheet.value = 'reply'
}

function chooseTone(id) {
  opportunity.selectReviewTone(id)
}

function sendReply() {
  if (!opportunity.sendReviewReply()) return
  sheet.value = null
  window.setTimeout(() => {
    sheet.value = 'favorite'
    notifySimulation('Inès vous a ajoutée à ses coups de cœur')
  }, 280)
}

function closeFavorite() {
  opportunity.acknowledgeFavorite()
  sheet.value = null
}

function openClient() {
  if (!state.value.favoriteAcknowledged && hasReviewReply.value) {
    opportunity.acknowledgeFavorite()
  }
  sheet.value = 'client'
}

function finishDemo() {
  demo.openResearch('E')
}

function onThanksClose() {
  sheet.value = null
}

async function onSendResponses() {
  await demo.submitSessionToNetlify()
}

watch(
  () => demo.isFeedbackSubmitted('E'),
  (submitted) => {
    if (submitted && demo.researchOpen && demo.researchActId === 'E') {
      // Laisser le temps à l’envoi Netlify auto avant la feuille « merci »
      window.setTimeout(() => {
        if (demo.researchOpen && demo.researchActId === 'E') {
          demo.closeResearch()
          sheet.value = 'thanks'
        }
      }, 900)
    }
  },
)
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Avis & relation"
      badge="Avis"
      back-label="Paiement"
      @back="router.push({ name: 'settlement' })"
    />

    <div class="flex-1 px-5 py-5 pb-28">
      <p class="badge-mono">Avis vérifié · {{ rail.clientName }}</p>
      <h2 class="mt-2 screen-title">Ce que Inès pense de vous</h2>
      <p class="screen-lead">
        Lisez l’avis, répondez, puis voyez la suite avec Inès.
      </p>

      <!-- Dimensions -->
      <ul class="mt-5 space-y-2">
        <li
          v-for="dim in INES_REVIEW.dimensions"
          :key="dim.id"
          class="flex items-center justify-between gap-3 border-b border-outline-soft/60 py-2"
        >
          <span class="text-sm text-primary">{{ dim.label }}</span>
          <span class="font-mono text-sm font-semibold text-secondary">{{ dim.score }}/5</span>
        </li>
      </ul>

      <blockquote
        class="mt-5 rounded-card border border-outline-soft bg-surface-low px-4 py-3 text-sm leading-relaxed text-primary"
      >
        « {{ reviewComment }} »
      </blockquote>

      <!-- Confirmation réponse -->
      <section
        v-if="hasReviewReply"
        class="mt-5 rounded-card border border-secondary/40 bg-secondary-container/30 px-4 py-3"
      >
        <p class="text-sm font-semibold text-on-secondary-container">Réponse envoyée</p>
        <p class="mt-1 text-sm text-primary">{{ state.reviewReplyText }}</p>
        <p class="mt-2 text-[11px] text-muted">
          {{ state.reviewRepliedAtLabel || '—' }}
        </p>
      </section>

      <!-- Relation -->
      <section
        v-if="hasReviewReply || state.favoriteAcknowledged"
        class="mt-5 rounded-card border border-outline-soft bg-surface px-4 py-4"
      >
        <p class="badge-mono">Relation</p>
        <h3 class="mt-2 text-sm font-semibold text-primary">
          {{ rail.clientName }} vous a ajoutée à ses coups de cœur
        </h3>
        <p class="mt-1 text-sm text-muted">
          Préférences mémorisées — elle pourra reprendre cette prestation depuis son historique.
        </p>
        <div class="mt-3 flex flex-wrap gap-3">
          <button type="button" class="btn-ghost text-xs" @click="sheet = 'favorite'">
            Voir le détail
          </button>
          <button type="button" class="btn-ghost text-xs" @click="openClient">
            Infos retenues sur Inès
          </button>
        </div>
      </section>

      <div class="mt-6 space-y-2">
        <button
          v-if="!hasReviewReply"
          type="button"
          class="btn-primary"
          @click="openReply"
        >
          Répondre à l’avis
        </button>
        <button
          v-else
          type="button"
          class="btn-secondary"
          disabled
        >
          Réponse déjà envoyée
        </button>
        <button
          type="button"
          :class="hasReviewReply ? 'btn-primary' : 'btn-secondary'"
          @click="finishDemo"
        >
          {{
            demo.isFeedbackSubmitted('E')
              ? 'Revoir mon avis · Terminer'
              : 'Donner mon avis · Terminer'
          }}
        </button>
      </div>
    </div>

    <StickyFooter
      v-if="!hasReviewReply"
      label="Répondre à l’avis"
      @action="openReply"
    />
    <StickyFooter
      v-else
      :label="
        demo.isFeedbackSubmitted('E')
          ? 'Revoir mon avis · Terminer'
          : 'Donner mon avis · Terminer'
      "
      @action="finishDemo"
    />

    <!-- Sheet réponse (E2) -->
    <div
      v-if="sheet === 'reply'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto max-h-[90vh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Répondre à l’avis</p>
        <h2 class="mt-2 text-base font-bold text-primary">Choisissez un ton</h2>
        <p class="mt-1 text-sm text-muted">
          Modèle proposé, ajustable brièvement — puis envoi confirmé.
        </p>

        <ul class="mt-4 space-y-2">
          <li v-for="tone in REVIEW_TONES" :key="tone.id">
            <button
              type="button"
              class="choice w-full"
              :class="{ 'choice-active': state.reviewReplyToneId === tone.id }"
              @click="chooseTone(tone.id)"
            >
              <span class="block text-sm font-medium text-primary">
                {{ tone.label }}
                <span v-if="tone.suggested" class="text-xs text-muted"> · suggéré</span>
              </span>
            </button>
          </li>
        </ul>

        <label class="field-label mt-4" for="reply-text">Votre réponse</label>
        <textarea
          id="reply-text"
          class="min-h-[96px] w-full rounded-card border border-outline-soft bg-surface-low px-3 py-2 text-sm text-primary"
          :value="state.reviewReplyText"
          :maxlength="REVIEW_REPLY_MAX"
          @input="opportunity.setReviewReplyText($event.target.value)"
        />
        <p class="mt-1 text-right text-[11px] text-muted">
          {{ replyCharCount }} / {{ REVIEW_REPLY_MAX }}
        </p>

        <button
          type="button"
          class="btn-primary mt-4"
          :disabled="!canSendReply"
          @click="sendReply"
        >
          Envoyer la réponse
        </button>
        <button type="button" class="btn-ghost mx-auto mt-3 block" @click="sheet = null">
          Annuler
        </button>
      </div>
    </div>

    <!-- Sheet favori (E3) -->
    <div
      v-if="sheet === 'favorite'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="closeFavorite"
    >
      <div class="mx-auto max-h-[85vh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Relation · Coup de cœur</p>
        <h2 class="mt-2 text-base font-bold text-primary">
          {{ rail.clientName }} vous a ajoutée à ses coups de cœur
        </h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Elle consent à mémoriser ses préférences et pourra reprendre cette prestation depuis
          son historique.
        </p>
        <button type="button" class="btn-secondary mt-5" @click="openClient">
          Infos retenues sur Inès
        </button>
        <button type="button" class="btn-primary mt-2" @click="closeFavorite">
          Continuer
        </button>
      </div>
    </div>

    <!-- Infos retenues sur Inès -->
    <div
      v-if="sheet === 'client'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="sheet = null"
    >
      <div class="mx-auto max-h-[85vh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Infos retenues sur Inès</p>
        <h2 class="mt-2 text-base font-bold text-primary">{{ rail.clientName }}</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-muted">Statut</dt>
            <dd class="mt-1 text-primary">Favorite · préférences mémorisées</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-muted">Dernier RDV</dt>
            <dd class="mt-1 text-primary">
              {{ rail.dateLabel }} · {{ rail.timeLabel }} · {{ rail.place }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-muted">Prestation</dt>
            <dd class="mt-1 text-primary">
              {{ rail.prestationLabel }} · {{ rail.lengthLabel }} · {{ rail.priceTotalV2 }} €
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-muted">
              Préférences mémorisées
            </dt>
            <dd class="mt-1">
              <ul class="list-inside list-disc text-primary">
                <li v-for="pref in memorizedPrefs" :key="pref">{{ pref }}</li>
              </ul>
            </dd>
          </div>
        </dl>
        <p class="mt-4 text-xs text-muted">
          Lecture seule — le revenu net reste dans l’écran Paiement.
        </p>
        <button type="button" class="btn-primary mt-5" @click="sheet = null">Fermer</button>
      </div>
    </div>

    <!-- Merci clôture (E4) -->
    <div
      v-if="sheet === 'thanks'"
      class="fixed inset-0 z-50 flex items-end bg-primary/40"
      @click.self="onThanksClose"
    >
      <div class="mx-auto max-h-[85vh] w-full max-w-phone overflow-y-auto rounded-t-xl bg-surface p-5">
        <p class="badge-mono">Fin de démonstration</p>
        <h2 class="mt-2 text-base font-bold text-primary">
          Merci d’avoir testé le parcours {{ displayName }} / Inès
        </h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Vous avez parcouru : offre &amp; planning → demande → confirmation → réalisation →
          paiement &amp; relation.
        </p>
        <p class="mt-3 text-sm text-primary">
          Paiement final <strong>{{ rail.priceTotalV2 }} €</strong> · net
          <strong>{{ netRevenue }} €</strong>
          <span v-if="hasReviewReply"> · réponse à l’avis envoyée</span>.
        </p>

        <div
          v-if="demo.isFeedbackSubmitted('E')"
          class="mt-4 rounded-card border border-outline-soft bg-surface-low px-3 py-3"
        >
          <p v-if="netlifySynced" class="text-sm font-semibold text-primary">
            Vos réponses ont bien été envoyées. Merci.
          </p>
          <template v-else>
            <p class="text-sm font-semibold text-primary">Envoyer l’ensemble de vos réponses</p>
            <p class="mt-1 text-xs text-muted">
              Cela regroupe votre prénom, vos contacts et tous vos retours du parcours.
              <span v-if="lastNetlifyError"> L’envoi précédent a échoué — réessayez.</span>
            </p>
            <button
              type="button"
              class="btn-primary mt-3"
              :disabled="netlifySubmitting"
              @click="onSendResponses"
            >
              {{ netlifySubmitting ? 'Envoi…' : 'Envoyer mes réponses' }}
            </button>
          </template>
        </div>

        <button
          type="button"
          class="btn-primary mt-5"
          @click="demo.resetAll(router)"
        >
          Recommencer le scénario
        </button>
        <button type="button" class="btn-ghost mx-auto mt-3 block" @click="onThanksClose">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>
