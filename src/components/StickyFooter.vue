<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
  label: { type: String, required: true },
  showArrow: { type: Boolean, default: true },
})

defineEmits(['action'])
</script>

<template>
  <div
    class="sticky bottom-[46px] z-20 border-t border-outline-soft/70 bg-background/95 px-4 py-3 backdrop-blur"
  >
    <button
      type="button"
      class="btn-primary flex items-center justify-center gap-2"
      :disabled="disabled"
      @click="$emit('action')"
    >
      {{ label }}
      <span v-if="showArrow" class="material-symbols-outlined text-[18px]">arrow_forward</span>
    </button>
    <slot />
  </div>
</template>
