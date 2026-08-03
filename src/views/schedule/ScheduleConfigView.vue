<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ScreenHeader from '../../components/ScreenHeader.vue'
import StickyFooter from '../../components/StickyFooter.vue'
import { useScheduleStore } from '../../stores/schedule'
import { useFrameworkStore } from '../../stores/framework'
import { WEEKDAY_OPTIONS, contextsSummary } from '../../domain/model'

const router = useRouter()
const store = useScheduleStore()
const frameworkStore = useFrameworkStore()
const { schedule, canActivate } = storeToRefs(store)
const { framework } = storeToRefs(frameworkStore)

const contextLabel = computed(() => contextsSummary(framework.value.contexts))

const WEEK_PREVIEW = [
  { id: 'mer', day: 'Mer 12' },
  { id: 'jeu', day: 'Jeu 13' },
  { id: 'ven', day: 'Ven 14' },
  { id: 'sam', day: 'Sam 15', highlight: true },
  { id: 'dim', day: 'Dim 16' },
  { id: 'lun', day: 'Lun 17' },
  { id: 'mar', day: 'Mar 18' },
]

const previewDays = computed(() =>
  WEEK_PREVIEW.map((row) => {
    const enabled = schedule.value.weekdays.includes(row.id)
    const hours = schedule.value.dayHours?.[row.id]
    return {
      ...row,
      enabled,
      slot: enabled && hours ? `${hours.open} – ${hours.close}` : '—',
      note: enabled ? '' : 'Fermé',
    }
  }),
)

const consequenceVisible = computed(() => schedule.value.weekdays.includes('sam'))

const enabledWeekdays = computed(() =>
  WEEKDAY_OPTIONS.filter((d) => schedule.value.weekdays.includes(d.id)),
)

function num(event, key) {
  store.patch({ [key]: Number(event.target.value) || 0 })
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ScreenHeader
      title="Planning"
      badge="Brouillon"
      @back="router.push({ name: 'offer-bridge' })"
    />

    <div class="flex-1 px-5 py-5">
      <h2 class="screen-title">Configurer le planning</h2>
      <p class="screen-lead">
        Indiquez vos jours, horaires et charge. Les créneaux possibles en découlent.
      </p>

      <p class="field-label mt-6">Contexte d’accueil</p>
      <div class="choice choice-active choice-locked w-full">
        {{ contextLabel }}
      </div>
      <p class="mt-1.5 text-xs text-muted">Issu de votre cadre professionnel.</p>

      <label class="field-label mt-6">Lieu</label>
      <input
        class="w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm"
        :value="schedule.place"
        @input="store.patch({ place: $event.target.value })"
      />
      <p class="mt-1.5 text-xs text-muted">
        Affiché avec votre contexte : {{ contextLabel }} · {{ schedule.place || '—' }}
      </p>

      <p class="field-label mt-6">Jours ouvrés et horaires</p>
      <p class="mb-2 text-xs text-muted">
        Cochez un jour, puis fixez ses horaires d’ouverture et de fermeture.
      </p>
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="d in WEEKDAY_OPTIONS"
          :key="d.id"
          type="button"
          class="choice py-2 text-center text-xs"
          :class="{ 'choice-active': schedule.weekdays.includes(d.id) }"
          @click="store.toggleWeekday(d.id)"
        >
          {{ d.label }}
        </button>
      </div>

      <div v-if="enabledWeekdays.length" class="mt-4 space-y-3">
        <div
          v-for="d in enabledWeekdays"
          :key="d.id"
          class="rounded-card border border-outline-soft bg-surface p-3"
        >
          <p class="text-sm font-semibold text-primary">{{ d.label }}</p>
          <div class="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">Ouverture</label>
              <input
                class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 text-sm"
                :value="schedule.dayHours?.[d.id]?.open || ''"
                @input="store.updateDayHours(d.id, { open: $event.target.value })"
              />
            </div>
            <div>
              <label class="field-label">Fermeture</label>
              <input
                class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 text-sm"
                :value="schedule.dayHours?.[d.id]?.close || ''"
                @input="store.updateDayHours(d.id, { close: $event.target.value })"
              />
            </div>
          </div>
        </div>
      </div>

      <label class="field-label mt-6">Limite de charge</label>
      <input
        type="number"
        class="w-full rounded-card border border-outline-soft bg-surface px-3 py-3 text-sm"
        :value="schedule.maxPerDay"
        @input="num($event, 'maxPerDay')"
      />
      <p class="mt-1 text-xs text-muted">Rendez-vous maximum par jour</p>

      <p class="field-label mt-6">Aperçu — semaine du 12–18 août</p>
      <div class="space-y-2">
        <div
          v-for="row in previewDays"
          :key="row.day"
          class="flex items-center justify-between rounded-card border px-3 py-2.5"
          :class="
            row.highlight && row.enabled
              ? 'border-secondary bg-secondary-container/30'
              : 'border-outline-soft bg-surface'
          "
        >
          <div>
            <p class="text-sm font-medium text-primary">{{ row.day }}</p>
            <p v-if="row.note" class="text-[11px] text-muted">{{ row.note }}</p>
          </div>
          <p
            class="text-sm"
            :class="
              row.highlight && row.enabled
                ? 'font-semibold text-on-secondary-container'
                : 'text-muted'
            "
          >
            {{ row.slot }}
          </p>
        </div>
      </div>
      <p v-if="consequenceVisible" class="mt-3 text-xs leading-relaxed text-muted">
        {{ schedule.consequenceLabel }} apparaît comme créneau possible — conséquence de vos
        règles.
      </p>
      <p v-else class="mt-3 text-xs leading-relaxed text-muted">
        Ajoutez le samedi pour voir le créneau du 15 août.
      </p>
    </div>

    <StickyFooter
      label="Continuer"
      :disabled="!canActivate"
      @action="router.push({ name: 'schedule-recap' })"
    />
  </div>
</template>
