import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  OfferStatus,
  SIZE_OPTIONS,
  createEmptyOffer,
  formatDuration,
  lengthLabel,
  migrateOffer,
  prestationLabel,
  referenceLengthId,
  sizesSummary,
} from '../domain/model'

const STORAGE_KEY = 'demo-precurseur.offer'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyOffer()
    return migrateOffer(JSON.parse(raw))
  } catch {
    return createEmptyOffer()
  }
}

export const useOfferStore = defineStore('offer', () => {
  const offer = ref(load())

  const status = computed(() => offer.value.status)
  const isActive = computed(() => offer.value.status === OfferStatus.ACTIVE)

  const enabledLengths = computed(() =>
    offer.value.lengthOffers.filter((o) => o.enabled),
  )

  const baseLengthId = computed(() => referenceLengthId(offer.value.lengthOffers))

  const baseLengthOffer = computed(() =>
    enabledLengths.value.find((o) => o.id === baseLengthId.value) ?? null,
  )

  const adaptedLengthOffers = computed(() =>
    enabledLengths.value.filter((o) => o.id !== baseLengthId.value),
  )

  const lengthsSummary = computed(() =>
    enabledLengths.value.map((o) => lengthLabel(o.id)).join(' · ') || '—',
  )

  const sizesText = computed(() => sizesSummary(offer.value.sizes || []))

  const label = computed(() => {
    const base = prestationLabel(offer.value.prestationId)
    if (base === '—') return '—'
    const sizes = sizesText.value
    return sizes !== '—' ? `${base} ${sizes}` : base
  })

  const devisPreview = computed(() => {
    const prices = enabledLengths.value.map((o) => Number(o.price) || 0).filter((p) => p > 0)
    const from = prices.length ? Math.min(...prices) : 0
    const extra = Number(offer.value.supplementAmount) || 0
    return {
      from,
      withSupplement: from + extra,
      lines: enabledLengths.value.map((o) => ({
        id: o.id,
        label: lengthLabel(o.id),
        price: Number(o.price) || 0,
        duration: formatDuration(o.durationHours, o.durationMinutes),
      })),
    }
  })

  const hasEnabledLength = computed(() => enabledLengths.value.length >= 1)
  const hasEnabledSize = computed(() => (offer.value.sizes || []).length >= 1)

  const barèmeReady = computed(() =>
    enabledLengths.value.every(
      (o) =>
        Number(o.price) > 0 && (Number(o.durationHours) > 0 || Number(o.durationMinutes) > 0),
    ),
  )

  const canActivate = computed(() => {
    const o = offer.value
    return (
      !!o.prestationId &&
      hasEnabledSize.value &&
      hasEnabledLength.value &&
      barèmeReady.value &&
      o.galleryIds.length >= 1
    )
  })

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offer.value))
  }

  function startDraft() {
    if (offer.value.status === OfferStatus.NONE) {
      offer.value.status = OfferStatus.DRAFT
      persist()
    }
  }

  function patch(partial) {
    offer.value = { ...offer.value, ...partial }
    if (offer.value.status === OfferStatus.NONE) {
      offer.value.status = OfferStatus.DRAFT
    }
    persist()
  }

  function toggleSize(id) {
    const set = new Set(offer.value.sizes || [])
    if (set.has(id)) set.delete(id)
    else set.add(id)
    const ordered = SIZE_OPTIONS.map((s) => s.id).filter((s) => set.has(s))
    patch({ sizes: ordered })
  }

  function toggleLength(id) {
    const lengthOffers = offer.value.lengthOffers.map((o) =>
      o.id === id ? { ...o, enabled: !o.enabled } : o,
    )
    patch({ lengthOffers })
  }

  function updateLengthOffer(id, partial) {
    const lengthOffers = offer.value.lengthOffers.map((o) =>
      o.id === id ? { ...o, ...partial } : o,
    )
    patch({ lengthOffers })
  }

  function toggleGallery(id) {
    const set = new Set(offer.value.galleryIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    patch({ galleryIds: [...set] })
  }

  function setTaskOwner(taskId, owner) {
    const tasks = offer.value.tasks.map((t) =>
      t.id === taskId ? { ...t, owner } : t,
    )
    patch({ tasks })
  }

  function activate() {
    if (!canActivate.value) return false
    offer.value.status = OfferStatus.ACTIVE
    persist()
    return true
  }

  function reset() {
    offer.value = createEmptyOffer()
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    offer,
    status,
    isActive,
    label,
    sizesText,
    lengthsSummary,
    enabledLengths,
    baseLengthId,
    baseLengthOffer,
    adaptedLengthOffers,
    devisPreview,
    hasEnabledLength,
    hasEnabledSize,
    barèmeReady,
    canActivate,
    startDraft,
    patch,
    toggleSize,
    toggleLength,
    updateLengthOffer,
    toggleGallery,
    setTaskOwner,
    activate,
    reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOfferStore, import.meta.hot))
}
