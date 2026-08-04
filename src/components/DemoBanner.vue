<script setup>
import { useRouter } from 'vue-router'
import { useDemoStore } from '../stores/demo'

const router = useRouter()
const demo = useDemoStore()

function onReset() {
  if (confirm('Réinitialiser toute la démonstration ?')) {
    demo.resetAll(router)
  }
}
</script>

<template>
  <div class="sticky top-0 z-40 border-b border-secondary/20 bg-secondary-container/80 px-3 py-2">
    <div class="flex items-center justify-between gap-2">
      <div class="min-w-0">
        <p
          class="truncate font-mono text-[10px] font-medium uppercase tracking-wider text-on-secondary-container"
        >
          Mode démo — {{ demo.sceneLabel }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <button
          type="button"
          class="font-mono text-[10px] font-semibold uppercase tracking-wider text-secondary"
          @click="onReset"
        >
          Réinit.
        </button>
        <button
          type="button"
          class="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted"
          @click="router.push({ name: 'demo-start' })"
        >
          Quitter
        </button>
      </div>
    </div>
  </div>
</template>
