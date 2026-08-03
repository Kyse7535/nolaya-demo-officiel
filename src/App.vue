<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DemoBanner from './components/DemoBanner.vue'
import ProductNav from './components/ProductNav.vue'
import ResearchPanel from './components/ResearchPanel.vue'

const route = useRoute()
const showBanner = computed(() => route.name !== 'demo-start')
const showNav = computed(() => route.name !== 'demo-start')
</script>

<template>
  <div class="min-h-screen bg-surface-high">
    <div
      class="mx-auto flex min-h-screen w-full max-w-phone flex-col bg-background shadow-xl shadow-primary/10"
    >
      <DemoBanner v-if="showBanner" />
      <main class="flex min-h-0 flex-1 flex-col">
        <RouterView />
      </main>
      <ProductNav v-if="showNav" />
    </div>
    <ResearchPanel />
  </div>
</template>
