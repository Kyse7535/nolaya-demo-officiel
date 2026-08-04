<script setup>
defineProps({
  title: { type: String, required: true },
  badge: { type: String, default: '' },
  backLabel: { type: String, default: 'Retour' },
  icon: { type: String, default: 'arrow_back' },
})

defineEmits(['back'])
</script>

<template>
  <header
    class="sticky top-[37px] z-30 border-b border-outline-soft/70 bg-surface/95 px-4 py-3 backdrop-blur"
  >
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-card text-muted transition hover:bg-surface-low"
        :aria-label="backLabel"
        @click="$emit('back')"
      >
        <span class="material-symbols-outlined text-[22px]">{{ icon }}</span>
      </button>
      <div class="min-w-0 flex-1 text-center">
        <h1 class="truncate text-sm font-bold tracking-tight text-primary">{{ title }}</h1>
      </div>
      <span
        v-if="badge"
        class="shrink-0 rounded-card border border-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary"
      >
        {{ badge }}
      </span>
      <span v-else class="w-9" />
    </div>
  </header>
</template>
