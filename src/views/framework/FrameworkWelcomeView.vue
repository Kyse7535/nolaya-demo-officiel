<script setup>
import { useRouter } from 'vue-router'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useFrameworkStore } from '../../stores/framework'
import { STITCH } from '../../assets/stitchAssets'

const router = useRouter()
const frameworkStore = useFrameworkStore()

const pillars = [
  { title: 'Lieux de travail', body: 'Où vous travaillez et si l’adresse reste privée.' },
  { title: 'Accueil', body: 'Accompagnants, mineurs, comment trouver / entrer.' },
  { title: 'Pauses', body: 'Vos pauses pendant une longue prestation.' },
  { title: 'Communication & paiement', body: 'Comment on vous joint et comment vous êtes payée.' },
  { title: 'Règles & sécurité', body: 'Retard, annulation, interruption et photos.' },
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

      <div class="mt-5 overflow-hidden border border-outline-soft">
        <img :src="STITCH.s03Hero" alt="" class="hero-media h-44 w-full" />
      </div>

      <p class="mt-6 text-xs font-semibold uppercase tracking-wide text-secondary">
        Ce que vous allez définir
      </p>
      <ul class="mt-3 space-y-3">
        <li
          v-for="(p, i) in pillars"
          :key="p.title"
          class="editorial-card flex items-start gap-3 px-3 py-3"
        >
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-high font-mono text-[10px] font-bold text-primary"
          >
            {{ i + 1 }}
          </span>
          <div>
            <p class="text-sm font-semibold text-primary">{{ p.title }}</p>
            <p class="mt-0.5 text-sm text-muted">{{ p.body }}</p>
          </div>
        </li>
      </ul>

      <p class="mt-4 text-xs text-muted">
        Certaines règles de sécurité sont déjà prévues par la plateforme.
      </p>
    </div>

    <StickyFooter label="Commencer" @action="start" />
  </div>
</template>
