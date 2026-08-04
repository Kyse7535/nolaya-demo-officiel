<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOfferStore } from '../stores/offer'
import { useScheduleStore } from '../stores/schedule'
import { useOpportunityStore } from '../stores/opportunity'

const route = useRoute()
const router = useRouter()
const offerStore = useOfferStore()
const scheduleStore = useScheduleStore()
const opportunity = useOpportunityStore()
const { isActive: offerActive } = storeToRefs(offerStore)
const { isActive: scheduleActive } = storeToRefs(scheduleStore)
const { isInjected, hasFirmProposal, isCommitted, isReady, isSettled, isCompleted } =
  storeToRefs(opportunity)

const onSettlement = computed(() => String(route.name || '').startsWith('settlement'))
const onExecution = computed(() => String(route.name || '').startsWith('execution'))
const onOpportunityOrEngagement = computed(
  () =>
    String(route.name || '').startsWith('opportunity') ||
    String(route.name || '').startsWith('engagement'),
)

function goTransactionFollowUp() {
  opportunity.ensureInesInjected()
  if (opportunity.state.dayJAdvanced) {
    if (isSettled.value) router.push({ name: 'settlement-relation' })
    else if (isCompleted.value) router.push({ name: 'settlement' })
    else if (opportunity.isInProgress) router.push({ name: 'execution-progress' })
    else router.push({ name: 'execution-jour' })
  } else if (isReady.value) {
    router.push({ name: 'engagement-prep' })
  } else if (isCommitted.value) {
    router.push({ name: 'engagement-committed' })
  } else if (hasFirmProposal.value) {
    router.push({ name: 'opportunity-sent' })
  } else {
    router.push({ name: 'opportunity-list' })
  }
}

const items = computed(() => [
  {
    id: 'accueil',
    label: 'Accueil',
    icon: 'home',
    active: route.name === 'dashboard',
    action: () => router.push({ name: 'dashboard' }),
  },
  {
    id: 'demandes',
    label: 'Demandes',
    icon: 'chat_bubble',
    active: onOpportunityOrEngagement.value && !onSettlement.value && !onExecution.value,
    action: scheduleActive.value && !onSettlement.value ? goTransactionFollowUp : null,
  },
  {
    id: 'rdv',
    label: onSettlement.value ? 'Paiement' : 'Rendez-vous',
    icon: onSettlement.value ? 'payments' : 'calendar_today',
    active: onExecution.value || onSettlement.value,
    action: opportunity.state.dayJAdvanced
      ? () => {
          if (isSettled.value) router.push({ name: 'settlement-relation' })
          else if (isCompleted.value) router.push({ name: 'settlement' })
          else if (opportunity.isInProgress) router.push({ name: 'execution-progress' })
          else router.push({ name: 'execution-jour' })
        }
      : null,
  },
  {
    id: 'prestations',
    label: 'Prestations',
    icon: 'content_cut',
    active:
      String(route.name || '').startsWith('offer') ||
      String(route.name || '').startsWith('schedule'),
    action: () => {
      if (scheduleActive.value) router.push({ name: 'schedule-liste' })
      else if (offerActive.value) router.push({ name: 'offer-bridge' })
      else router.push({ name: 'dashboard' })
    },
  },
  { id: 'profil', label: 'Profil', icon: 'person', active: false, action: null },
])
</script>

<template>
  <nav
    class="sticky bottom-0 z-30 border-t border-outline-soft/70 bg-surface/95 px-1 py-1.5 backdrop-blur"
  >
    <ul class="grid grid-cols-5 gap-0.5">
      <li v-for="item in items" :key="item.id">
        <button
          type="button"
          class="flex w-full flex-col items-center rounded-card px-0.5 py-1.5 font-mono text-[9px] font-medium uppercase tracking-wider leading-tight"
          :class="item.active ? 'text-primary' : 'text-outline'"
          :disabled="!item.action"
          @click="item.action?.()"
        >
          <span class="relative mb-0.5">
            <span
              class="material-symbols-outlined text-[20px]"
              :class="item.active ? 'icon-filled' : ''"
            >
              {{ item.icon }}
            </span>
            <span
              v-if="item.id === 'demandes' && isInjected && !hasFirmProposal && scheduleActive"
              class="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-secondary"
            />
          </span>
          <span class="truncate">{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>
