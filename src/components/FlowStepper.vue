<script setup>
defineProps({
  steps: { type: Array, required: true },
  current: { type: Number, required: true },
})
</script>

<template>
  <nav aria-label="Étapes" class="flex gap-3 overflow-x-auto pb-1">
    <div
      v-for="(step, index) in steps"
      :key="step"
      class="flex min-w-max flex-col gap-1"
    >
      <span
        class="flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider"
        :class="index + 1 <= current ? 'text-primary' : 'text-outline'"
      >
        <span
          class="flex h-4 w-4 items-center justify-center rounded-full text-[8px]"
          :class="
            index + 1 < current
              ? 'bg-primary text-on-primary'
              : index + 1 === current
                ? 'bg-primary text-on-primary'
                : 'border border-outline text-outline'
          "
        >
          {{ index + 1 < current ? '✓' : index + 1 }}
        </span>
        {{ step }}
      </span>
      <div
        class="h-0.5 w-full"
        :class="index + 1 <= current ? 'bg-primary' : 'bg-surface-high'"
      />
    </div>
  </nav>
</template>
