import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  DEFAULT_DAY_HOURS,
  ScheduleStatus,
  WEEKDAY_OPTIONS,
  createEmptySchedule,
  dayHoursSummary,
  migrateSchedule,
  weekdaysSummary,
} from '../domain/model'

const STORAGE_KEY = 'demo-precurseur.schedule'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptySchedule()
    return migrateSchedule(JSON.parse(raw))
  } catch {
    return createEmptySchedule()
  }
}

export const useScheduleStore = defineStore('schedule', () => {
  const schedule = ref(load())

  const status = computed(() => schedule.value.status)
  const isActive = computed(() => schedule.value.status === ScheduleStatus.ACTIVE)

  const daysSummary = computed(() => weekdaysSummary(schedule.value.weekdays))

  const hoursSummary = computed(() =>
    dayHoursSummary(schedule.value.weekdays, schedule.value.dayHours || {}),
  )

  const planningSummary = computed(
    () =>
      `${daysSummary.value} · ${schedule.value.maxPerDay} RDV / jour`,
  )

  const canActivate = computed(() => {
    const s = schedule.value
    const hours = s.dayHours || {}
    return (
      !!s.place &&
      Array.isArray(s.weekdays) &&
      s.weekdays.length > 0 &&
      s.weekdays.every((id) => hours[id]?.open && hours[id]?.close) &&
      Number(s.maxPerDay) >= 1
    )
  })

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule.value))
  }

  function syncConsequence(dayHours, weekdays) {
    if (!weekdays.includes('sam')) return schedule.value.consequenceLabel
    const open = dayHours.sam?.open || DEFAULT_DAY_HOURS.open
    return `Samedi 15 août dès ${open}`
  }

  function startDraft() {
    if (schedule.value.status === ScheduleStatus.NONE) {
      schedule.value.status = ScheduleStatus.DRAFT
      persist()
    }
  }

  function patch(partial) {
    schedule.value = { ...schedule.value, ...partial }
    if (schedule.value.status === ScheduleStatus.NONE) {
      schedule.value.status = ScheduleStatus.DRAFT
    }
    persist()
  }

  function toggleWeekday(id) {
    const set = new Set(schedule.value.weekdays)
    const dayHours = { ...(schedule.value.dayHours || {}) }
    if (set.has(id)) {
      set.delete(id)
      delete dayHours[id]
    } else {
      set.add(id)
      dayHours[id] = { ...(dayHours[id] || DEFAULT_DAY_HOURS) }
    }
    const ordered = WEEKDAY_OPTIONS.map((d) => d.id).filter((d) => set.has(d))
    patch({
      weekdays: ordered,
      dayHours,
      consequenceLabel: syncConsequence(dayHours, ordered),
    })
  }

  function updateDayHours(id, partial) {
    if (!schedule.value.weekdays.includes(id)) return
    const dayHours = {
      ...(schedule.value.dayHours || {}),
      [id]: {
        ...(schedule.value.dayHours?.[id] || DEFAULT_DAY_HOURS),
        ...partial,
      },
    }
    patch({
      dayHours,
      consequenceLabel: syncConsequence(dayHours, schedule.value.weekdays),
    })
  }

  function activate() {
    if (!canActivate.value) return false
    schedule.value.status = ScheduleStatus.ACTIVE
    persist()
    return true
  }

  function reset() {
    schedule.value = createEmptySchedule()
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Préremplit le lieu planning depuis l’identité (sans passer en DRAFT).
   * Remplace uniquement un lieu vide ou l’ancien défaut figé « Saint-Denis ».
   */
  function seedPlace(place) {
    const next = String(place || '').trim()
    if (!next) return
    const current = String(schedule.value.place || '').trim()
    if (current && current !== 'Saint-Denis') return
    schedule.value = { ...schedule.value, place: next }
    persist()
  }

  return {
    schedule,
    status,
    isActive,
    daysSummary,
    hoursSummary,
    planningSummary,
    canActivate,
    startDraft,
    patch,
    seedPlace,
    toggleWeekday,
    updateDayHours,
    activate,
    reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useScheduleStore, import.meta.hot))
}
