<script setup>
defineProps({
  disabled: { type: Boolean, default: false },
  label: { type: String, required: true },
})

defineEmits(['action'])
</script>

<template>
  <div class="sticky bottom-[46px] z-20 border-t border-outline-soft/70 bg-background/95 px-4 py-3 backdrop-blur">
    <button type="button" class="btn-primary" :disabled="disabled" @click="$emit('action')">
      {{ label }}
    </button>
    <slot />
  </div>
</template>
