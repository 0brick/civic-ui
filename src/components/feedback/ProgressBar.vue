<script setup>
defineProps({
  value: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  variant: { type: String, default: 'primary', validator: (v) => ['primary', 'accent', 'success', 'warning', 'danger'].includes(v) },
  label: { type: String, default: '' },
  showValue: { type: Boolean, default: false },
  striped: { type: Boolean, default: false }
})
</script>

<template>
  <div class="cui-progress-wrap">
    <div v-if="label || showValue" class="cui-progress-meta">
      <span>{{ label }}</span>
      <span v-if="showValue">{{ Math.round((value / max) * 100) }}%</span>
    </div>
    <div
      class="cui-progress"
      role="progressbar"
      :aria-valuenow="value"
      :aria-valuemin="0"
      :aria-valuemax="max"
      :aria-label="label || undefined"
    >
      <div
        class="cui-progress__bar"
        :class="[`cui-progress__bar--${variant}`, { 'cui-progress__bar--striped': striped }]"
        :style="{ width: `${Math.min(100, (value / max) * 100)}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.cui-progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
}

/* a11y (WCAG 1.4.11): the track's outline shows where 100 % is (the muted
   fill alone is ~1.2:1 against the page), and every fill reads at 3:1+
   against the track: status fills use the --cui-text-* tones, which a dark
   color mode lightens, instead of the swatches that carry white labels. */
.cui-progress {
  width: 100%;
  height: 1.2rem;
  background: var(--cui-bg-muted);
  border: 1px solid var(--cui-border-control);
  border-radius: var(--cui-radius-pill);
  overflow: hidden;
}

.cui-progress__bar {
  height: 100%;
  border-radius: var(--cui-radius-pill);
  transition: width var(--cui-duration-slow) var(--cui-ease);
}

.cui-progress__bar--primary {
  background: var(--cui-primary);
}
.cui-progress__bar--accent {
  background: var(--cui-accent);
  /* Yellow on the light track is ~1:1: the ink edge marks where it ends. */
  box-shadow: inset 0 0 0 1px var(--cui-accent-contrast);
}
.cui-progress__bar--success {
  background: var(--cui-text-success);
}
.cui-progress__bar--warning {
  background: var(--cui-text-warning);
}
.cui-progress__bar--danger {
  background: var(--cui-text-danger);
}

.cui-progress__bar--striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.25) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.25) 50%,
    rgba(255, 255, 255, 0.25) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1.6rem 1.6rem;
}
</style>
