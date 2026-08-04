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

const previewDays = computed(() =>
  [
    { id: 'lun', day: 'L 12' },
    { id: 'mar', day: 'M 13' },
    { id: 'mer', day: 'M 14' },
    { id: 'jeu', day: 'J 15' },
    { id: 'ven', day: 'V 16' },
    { id: 'sam', day: 'S 15', highlight: true },
    { id: 'dim', day: 'D 18' },
  ].map((row) => ({
    ...row,
    enabled: schedule.value.weekdays.includes(row.id),
  })),
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
      title="Configurer le planning"
      badge="Brouillon"
      @back="router.push({ name: 'offer-bridge' })"
    />

    <div class="flex-1 px-5 py-5">
      <div class="flex items-end justify-between gap-2">
        <span class="font-mono text-[10px] uppercase tracking-wider text-muted">Progression</span>
        <span class="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
          Étape 3 sur 8
        </span>
      </div>
      <div class="mt-2 h-1 overflow-hidden rounded-full bg-surface-container">
        <div class="h-full w-[37.5%] bg-primary" />
      </div>

      <h2 class="screen-title mt-6">Informations de base</h2>

      <p class="field-label mt-5">Contexte d’accueil</p>
      <div class="platform-rule flex w-full items-center gap-3">
        <span class="material-symbols-outlined text-[20px] text-outline icon-filled">storefront</span>
        <span class="flex-1">{{ contextLabel }}</span>
        <span class="material-symbols-outlined text-[16px] text-outline">lock</span>
      </div>
      <span class="platform-rule__tag mt-1 block">Comme dans votre cadre (non modifiable ici)</span>

      <label class="field-label mt-6">Lieu</label>
      <div class="relative">
        <span
          class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline"
        >
          location_on
        </span>
        <input
          class="w-full rounded-card border border-outline-soft bg-surface py-3 pl-10 pr-3 text-sm"
          :value="schedule.place"
          @input="store.patch({ place: $event.target.value })"
        />
      </div>
      <p class="mt-1.5 text-xs text-muted">
        Affiché avec votre contexte : {{ contextLabel }} · {{ schedule.place || '—' }}
      </p>

      <h2 class="mt-8 text-lg font-bold text-primary">Jours d’ouverture</h2>
      <p class="mb-3 mt-2 text-xs text-muted">
        Cochez un jour, puis fixez ses horaires d’ouverture et de fermeture.
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="d in WEEKDAY_OPTIONS"
          :key="d.id"
          type="button"
          class="rounded-card border px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-wider transition"
          :class="
            schedule.weekdays.includes(d.id)
              ? 'border-primary bg-primary text-on-primary'
              : 'border-outline-soft bg-surface text-muted'
          "
          @click="store.toggleWeekday(d.id)"
        >
          {{ d.label }}
        </button>
      </div>

      <div v-if="enabledWeekdays.length" class="mt-4 space-y-3">
        <div v-for="d in enabledWeekdays" :key="d.id" class="editorial-card p-3">
          <p class="text-sm font-semibold text-primary">{{ d.label }}</p>
          <div class="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">Ouverture</label>
              <input
                class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 font-mono text-sm"
                :value="schedule.dayHours?.[d.id]?.open || ''"
                @input="store.updateDayHours(d.id, { open: $event.target.value })"
              />
            </div>
            <div>
              <label class="field-label">Fermeture</label>
              <input
                class="w-full rounded-card border border-outline-soft bg-background px-3 py-2.5 font-mono text-sm"
                :value="schedule.dayHours?.[d.id]?.close || ''"
                @input="store.updateDayHours(d.id, { close: $event.target.value })"
              />
            </div>
          </div>
        </div>
      </div>

      <label class="field-label mt-6">Rendez-vous max. / jour</label>
      <input
        type="number"
        class="w-32 rounded-card border border-outline-soft bg-surface px-3 py-3 text-center font-mono text-sm"
        :value="schedule.maxPerDay"
        @input="num($event, 'maxPerDay')"
      />
      <p class="mt-1 text-xs text-muted">Nombre maximum de rendez-vous que vous acceptez par jour</p>

      <section class="mt-6 rounded-card border-l-2 border-primary bg-surface-container px-4 py-4">
        <div class="flex items-center gap-2 text-primary">
          <span class="material-symbols-outlined text-[20px] icon-filled">calendar_month</span>
          <span class="font-mono text-[10px] font-bold uppercase tracking-wider">
            Aperçu — semaine du 12–18 août
          </span>
        </div>
        <p v-if="consequenceVisible" class="mt-2 text-sm leading-relaxed text-muted">
          Grâce à vos jours, le samedi 15 août à {{ schedule.dayHours?.sam?.open || '9 h' }} peut
          recevoir une demande.
        </p>
        <p v-else class="mt-2 text-sm leading-relaxed text-muted">
          Ajoutez le samedi pour voir le créneau du 15 août.
        </p>
        <div class="mt-3 flex justify-between gap-1">
          <div
            v-for="row in previewDays"
            :key="row.day"
            class="flex flex-col items-center"
            :class="row.enabled ? '' : 'opacity-40'"
          >
            <span
              class="font-mono text-[10px]"
              :class="row.highlight && row.enabled ? 'font-bold text-primary' : ''"
            >
              {{ row.day }}
            </span>
            <div
              class="mt-1 rounded-full"
              :class="
                row.highlight && row.enabled
                  ? 'h-3 w-3 bg-primary ring-2 ring-surface-container ring-offset-1'
                  : row.enabled
                    ? 'h-2 w-2 bg-secondary-container'
                    : 'h-2 w-2 border border-outline'
              "
            />
          </div>
        </div>
      </section>
    </div>

    <StickyFooter
      label="Continuer"
      :disabled="!canActivate"
      @action="router.push({ name: 'schedule-recap' })"
    />
  </div>
</template>
