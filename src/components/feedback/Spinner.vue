<script setup>
import { computed } from 'vue'
import { t } from '../../utils/i18n'
const props = defineProps({
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  label: { type: String }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  label: props.label ?? t('spinner.label')
}))
</script>

<template>
  <span class="cui-spinner" :class="`cui-spinner--${size}`" role="status">
    <span class="cui-visually-hidden">{{ L.label }}</span>
  </span>
</template>

<style scoped>
.cui-spinner {
  display: inline-block;
  border-radius: 50%;
  border: 3px solid var(--cui-bg-muted);
  border-top-color: var(--cui-color-teal);
  animation: cui-spin 0.7s linear infinite;
}

.cui-spinner--sm {
  width: 1.6rem;
  height: 1.6rem;
  border-width: 2px;
}
.cui-spinner--md {
  width: 2.8rem;
  height: 2.8rem;
}
.cui-spinner--lg {
  width: 4.4rem;
  height: 4.4rem;
  border-width: 4px;
}

@keyframes cui-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cui-spinner {
    animation-duration: 1.4s;
  }
}
</style>
