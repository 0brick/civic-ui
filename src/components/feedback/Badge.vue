<script setup>
defineProps({
  variant: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'primary', 'accent', 'info', 'success', 'warning', 'danger', 'outline'].includes(v)
  },
  pill: { type: Boolean, default: false }
})
</script>

<template>
  <span class="cui-badge" :class="[`cui-badge--${variant}`, { 'cui-badge--pill': pill }]">
    <slot />
  </span>
</template>

<style scoped>
.cui-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: var(--cui-radius-sm);
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.01em;
  border: 1px solid transparent;
}

.cui-badge--pill {
  border-radius: var(--cui-radius-pill);
}

.cui-badge--neutral {
  background: var(--cui-bg-muted);
  color: var(--cui-text);
}
.cui-badge--primary {
  background: var(--cui-primary);
  color: var(--cui-primary-contrast);
}
.cui-badge--accent {
  background: var(--cui-accent);
  color: var(--cui-accent-contrast);
}
.cui-badge--info {
  background: var(--cui-info-bg);
  color: var(--cui-info-text);
}
.cui-badge--success {
  background: var(--cui-success-bg);
  color: var(--cui-success-text);
}
.cui-badge--warning {
  background: var(--cui-warning-bg);
  color: var(--cui-warning-text);
}
.cui-badge--danger {
  background: var(--cui-danger-bg);
  color: var(--cui-danger-text);
}
.cui-badge--outline {
  background: transparent;
  border-color: currentColor;
  color: var(--cui-text);
}
</style>
