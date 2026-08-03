<script setup>
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useFrameworkStore } from '../../stores/framework'
import {
  CONTEXT_OPTIONS,
  PAYMENT_OPTIONS,
  cancellationLabel,
  channelsSummary,
  pauseLabel,
  FrameworkStatus,
} from '../../domain/model'

const router = useRouter()
const store = useFrameworkStore()
const { framework, canActivate, status, isActive } = storeToRefs(store)

function contextsText() {
  return framework.value.contexts
    .map((id) => CONTEXT_OPTIONS.find((c) => c.id === id)?.label)
    .filter(Boolean)
    .join(' · ')
}

function paymentsText() {
  return framework.value.payments
    .map((id) => PAYMENT_OPTIONS.find((p) => p.id === id)?.label)
    .filter(Boolean)
    .join(' · ')
}

function activate() {
  if (store.activate()) {
    router.push({ name: 'framework-bridge' })
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Cadre professionnel"
      :badge="isActive ? 'Actif' : status === FrameworkStatus.DRAFT ? 'Brouillon' : ''"
      @back="
        router.push({
          name: isActive ? 'framework-bridge' : 'framework-politiques',
        })
      "
    />

    <div class="flex-1 px-5 py-5">
      <h2 class="screen-title">Récapitulatif</h2>
      <p class="screen-lead">Relisez vos règles avant de les activer.</p>

      <dl class="mt-6 space-y-3">
        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Lieux de travail</dt>
              <dd class="mt-1 text-sm text-primary">
                {{ contextsText() }} ·
                {{ framework.addressPrivate ? 'adresse masquée' : 'adresse visible' }}
              </dd>
            </div>
            <button type="button" class="btn-ghost" @click="router.push({ name: 'framework-contexts' })">
              Modifier
            </button>
          </div>
        </div>

        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Accueil</dt>
              <dd class="mt-1 text-sm text-primary">
                {{ framework.companionsAllowed ? 'Accompagnants OK' : 'Pas d’accompagnants' }}
                ·
                {{ framework.minorsWithGuardian ? 'mineurs avec accompagnateur' : 'mineurs non acceptés' }}
              </dd>
            </div>
            <button type="button" class="btn-ghost" @click="router.push({ name: 'framework-accueil' })">
              Modifier
            </button>
          </div>
        </div>

        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">Pause</dt>
              <dd class="mt-1 text-sm text-primary">{{ pauseLabel(framework.pauseId) }}</dd>
            </div>
            <button type="button" class="btn-ghost" @click="router.push({ name: 'framework-pause' })">
              Modifier
            </button>
          </div>
        </div>

        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">
                Communication & paiement
              </dt>
              <dd class="mt-1 text-sm text-primary">
                {{ channelsSummary(framework.channels) }} · {{ framework.responseDelay }}
              </dd>
              <dd class="mt-1 text-sm text-muted">
                {{ paymentsText() }} · reste à payer en fin de prestation
              </dd>
            </div>
            <button type="button" class="btn-ghost" @click="router.push({ name: 'framework-comm' })">
              Modifier
            </button>
          </div>
        </div>

        <div class="rounded-card border border-outline-soft bg-surface px-3 py-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-secondary">
                Règles & photos
              </dt>
              <dd class="mt-1 text-sm text-primary">
                Retard {{ framework.lateTolerance }} min ·
                {{ cancellationLabel(framework.cancellationPolicy) }}
              </dd>
              <dd class="mt-1 text-sm text-muted">
                Photos : uniquement avec l’accord de la cliente
              </dd>
            </div>
            <button
              type="button"
              class="btn-ghost"
              @click="router.push({ name: 'framework-politiques' })"
            >
              Modifier
            </button>
          </div>
        </div>
      </dl>
    </div>

    <StickyFooter
      v-if="!isActive"
      label="Activer mon cadre professionnel"
      :disabled="!canActivate"
      @action="activate"
    />
    <div v-else class="sticky bottom-[46px] z-20 border-t border-outline-soft/70 bg-background/95 px-4 py-3">
      <button type="button" class="btn-primary" @click="router.push({ name: 'framework-bridge' })">
        Retour
      </button>
    </div>
  </div>
</template>
