import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  FrameworkStatus,
  createEmptyFramework,
  migrateFramework,
  pauseLabel,
} from '../domain/model'

const STORAGE_KEY = 'demo-precurseur.framework'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyFramework()
    return migrateFramework(JSON.parse(raw))
  } catch {
    return createEmptyFramework()
  }
}

export const useFrameworkStore = defineStore('framework', () => {
  const framework = ref(load())

  const status = computed(() => framework.value.status)
  const isActive = computed(() => framework.value.status === FrameworkStatus.ACTIVE)
  const pauseText = computed(() => pauseLabel(framework.value.pauseId))

  const canActivate = computed(() => {
    const f = framework.value
    return (
      f.contexts.length > 0 &&
      f.pauseId &&
      Array.isArray(f.channels) &&
      f.channels.length > 0 &&
      f.payments.length > 0 &&
      f.lateTolerance != null &&
      f.photoConsent
    )
  })

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(framework.value))
  }

  function startDraft() {
    if (framework.value.status === FrameworkStatus.NONE) {
      framework.value.status = FrameworkStatus.DRAFT
      persist()
    }
  }

  function patch(partial) {
    framework.value = { ...framework.value, ...partial, safetyInterrupt: true }
    if (framework.value.status === FrameworkStatus.NONE) {
      framework.value.status = FrameworkStatus.DRAFT
    }
    persist()
  }

  function toggleContext(id) {
    const set = new Set(framework.value.contexts)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    patch({ contexts: [...set] })
  }

  function toggleChannel(id) {
    const set = new Set(framework.value.channels)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    patch({ channels: [...set] })
  }

  function togglePayment(id) {
    const set = new Set(framework.value.payments)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    patch({ payments: [...set] })
  }

  function activate() {
    if (!canActivate.value) return false
    framework.value.status = FrameworkStatus.ACTIVE
    framework.value.safetyInterrupt = true
    persist()
    return true
  }

  function reset() {
    framework.value = createEmptyFramework()
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    framework,
    status,
    isActive,
    pauseText,
    canActivate,
    startDraft,
    patch,
    toggleContext,
    toggleChannel,
    togglePayment,
    activate,
    reset,
  }
})
