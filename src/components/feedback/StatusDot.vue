<script setup>
// Small presence/state indicator with a label, "3 servers online", a row
// status in a data table, a badge-alternative for compact spaces where
// Badge's pill shape is too heavy.
defineProps({
  // Superset of Badge/Alert's neutral/success/warning/danger is deliberate:
  // online/offline/busy/away are presence states, not generic severities,
  // and they alias onto the same success/warning/danger color tokens below
  // not drift to "fix" into a shared enum.
  status: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'online', 'offline', 'busy', 'away', 'success', 'warning', 'danger'].includes(v)
  },
  label: { type: String, default: '' },
  pulse: { type: Boolean, default: false }
})
</script>

<template>
  <span class="cui-status-dot">
    <span class="cui-status-dot__dot" :class="[`cui-status-dot__dot--${status}`, { 'cui-status-dot__dot--pulse': pulse }]" aria-hidden="true" />
    <span v-if="label" class="cui-status-dot__label">{{ label }}</span>
  </span>
</template>

<style scoped>
.cui-status-dot {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1.4rem;
  color: var(--cui-text);
}

.cui-status-dot__dot {
  position: relative;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--cui-color-grey-500);
}

.cui-status-dot__dot--pulse::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: inherit;
  opacity: 0.4;
  animation: cui-status-pulse 1.8s ease-out infinite;
}

.cui-status-dot__dot--neutral {
  background: var(--cui-color-grey-500);
}
.cui-status-dot__dot--online,
.cui-status-dot__dot--success {
  background: var(--cui-color-success);
}
.cui-status-dot__dot--offline {
  background: var(--cui-color-grey-300);
}
.cui-status-dot__dot--busy,
.cui-status-dot__dot--danger {
  background: var(--cui-color-danger);
}
.cui-status-dot__dot--away,
.cui-status-dot__dot--warning {
  background: var(--cui-color-warning);
}

@keyframes cui-status-pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cui-status-dot__dot--pulse::after {
    animation: none;
  }
}
</style>
