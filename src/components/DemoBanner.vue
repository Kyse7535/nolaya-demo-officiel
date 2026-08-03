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
  <div class="sticky top-0 z-40 border-b border-secondary/20 bg-[#fff8e8] px-3 py-2">
    <div class="flex items-center justify-between gap-2">
      <p class="text-[11px] font-medium leading-snug text-on-secondary-container">
        Mode démo — {{ demo.sceneLabel }}
      </p>
      <div class="flex shrink-0 items-center gap-2">
        <button type="button" class="text-[11px] font-semibold text-secondary" @click="onReset">
          Réinitialiser
        </button>
        <button
          type="button"
          class="text-[11px] font-semibold text-muted"
          @click="router.push({ name: 'demo-start' })"
        >
          Quitter
        </button>
      </div>
    </div>
  </div>
</template>
