<script setup>
// Standalone dismiss button used inside Alert, Modal and Toast.
// Kept as its own component because every one of those needs an identical,
// accessible "X" and it's silly to redraw it four times.
import { computed } from 'vue'
import { t } from '../../utils/i18n'
const props = defineProps({
  label: { type: String },
  dark: { type: Boolean, default: false }
})
defineEmits(['click'])
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  label: props.label ?? t('closeButton.label')
}))
</script>

<template>
  <button type="button" class="cui-close" :class="{ 'cui-close--dark': dark }" :aria-label="L.label" @click="$emit('click')">
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </button>
</template>

<style scoped>
.cui-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  padding: 0;
  border: none;
  border-radius: var(--cui-radius-md);
  background: transparent;
  color: var(--cui-text);
  cursor: pointer;
  opacity: 0.65;
  transition:
    opacity var(--cui-duration) var(--cui-ease),
    background-color var(--cui-duration) var(--cui-ease);
}

.cui-close:hover {
  opacity: 1;
  background: var(--cui-bg-muted);
}

.cui-close--dark {
  color: var(--cui-color-white);
}
.cui-close--dark:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
