<script setup>
defineProps({
  title: { type: String, required: true },
  badge: { type: String, default: '' },
  backLabel: { type: String, default: 'Retour' },
})

defineEmits(['back'])
</script>

<template>
  <header class="sticky top-[37px] z-30 border-b border-outline-soft/70 bg-background/95 px-4 py-3 backdrop-blur">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="text-sm font-medium text-muted"
        @click="$emit('back')"
      >
        ← {{ backLabel }}
      </button>
      <div class="min-w-0 flex-1 text-center">
        <h1 class="truncate text-sm font-bold text-primary">{{ title }}</h1>
      </div>
      <span v-if="badge" class="badge-mono">{{ badge }}</span>
      <span v-else class="w-10" />
    </div>
  </header>
</template>
