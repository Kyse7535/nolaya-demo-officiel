<script setup>
import { useRouter } from 'vue-router'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useFrameworkStore } from '../../stores/framework'

const router = useRouter()
const frameworkStore = useFrameworkStore()

const pillars = [
  { title: 'Contextes', body: 'Où vous travaillez et si l’adresse reste privée.' },
  { title: 'Accueil', body: 'Accompagnants, mineurs, consignes d’accès.' },
  { title: 'Pause', body: 'Votre droit à la pause pendant les prestations longues.' },
  { title: 'Communication & paiement', body: 'Comment on vous joint et comment vous êtes payée.' },
  { title: 'Politiques & sécurité', body: 'Retard, annulation, interruption et photos.' },
]

function start() {
  frameworkStore.startDraft()
  router.push({ name: 'framework-contexts' })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Cadre professionnel"
      badge="Brouillon"
      @back="router.push({ name: 'dashboard' })"
    />

    <div class="flex-1 px-5 py-5">
      <h2 class="screen-title">Définissez comment vous travaillez.</h2>
      <p class="screen-lead">
        Ce n’est pas encore votre prestation. C’est le cadre dans lequel vous acceptez de travailler.
      </p>

      <div
        class="mt-5 overflow-hidden rounded-card bg-gradient-to-br from-[#1b1c1c] to-[#775a19] px-4 py-8 text-on-primary"
      >
        <p class="text-sm font-medium opacity-90">Rendre votre façon de travailler claire et prévisible.</p>
      </div>

      <p class="mt-6 text-xs font-semibold uppercase tracking-wide text-secondary">
        Ce que vous allez définir
      </p>
      <ul class="mt-3 space-y-3">
        <li
          v-for="p in pillars"
          :key="p.title"
          class="rounded-card border border-outline-soft bg-surface px-3 py-3"
        >
          <p class="text-sm font-semibold text-primary">{{ p.title }}</p>
          <p class="mt-1 text-sm text-muted">{{ p.body }}</p>
        </li>
      </ul>

      <p class="mt-4 text-xs text-muted">
        Certaines règles de sécurité sont déjà prévues par la plateforme.
      </p>
    </div>

    <StickyFooter label="Commencer" @action="start" />
  </div>
</template>
