<script setup>
import { computed } from 'vue'
import CloseButton from '../button/CloseButton.vue'
import { t } from '../../utils/i18n'

const props = defineProps({
  variant: { type: String, default: 'info' },
  title: { type: String, default: '' },
  // Whether the toast is its own live region. ToastContainer turns this off
  // and renders toasts into live regions that already exist (see there); a
  // standalone Toast keeps role="alert"/"status" so it is still announced.
  live: { type: Boolean, default: true }
})
defineEmits(['dismiss'])

// a11y (WCAG 4.1.3): danger/warning toasts interrupt (assertive role="alert");
// others announce politely once the screen reader is free (role="status").
const isUrgent = computed(() => props.variant === 'warning' || props.variant === 'danger')
// The variant is otherwise only a color: say it in words ("Error: …"),
// with the same texts as Alert.
const prefix = computed(() => (['info', 'success', 'warning', 'danger'].includes(props.variant) ? t(`alert.prefix.${props.variant}`) : ''))
</script>

<template>
  <div
    class="cui-toast"
    :class="`cui-toast--${variant}`"
    :role="live ? (isUrgent ? 'alert' : 'status') : undefined"
    :aria-live="live ? (isUrgent ? 'assertive' : 'polite') : undefined"
  >
    <div class="cui-toast__body">
      <p v-if="title" class="cui-toast__title"><span v-if="prefix" class="cui-visually-hidden">{{ `${prefix} ` }}</span>{{ title }}</p>
      <div class="cui-toast__text"><span v-if="prefix && !title" class="cui-visually-hidden">{{ `${prefix} ` }}</span><slot /></div>
    </div>
    <CloseButton :label="t('toast.dismiss')" @click="$emit('dismiss')" />
  </div>
</template>

<style scoped>
.cui-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--cui-space-3);
  min-width: 280px;
  max-width: 380px;
  padding: var(--cui-space-3) var(--cui-space-3) var(--cui-space-3) var(--cui-space-4);
  background: var(--cui-surface-raised);
  border-left: 4px solid var(--cui-color-teal);
  border-radius: var(--cui-radius-md);
  box-shadow: var(--cui-shadow-lg);
  font-size: 1.35rem;
  animation: cui-toast-in var(--cui-duration-slow) var(--cui-ease);
}

.cui-toast__title {
  margin: 0 0 0.2rem;
  font-weight: 700;
}

.cui-toast__body {
  flex: 1;
}

.cui-toast--success {
  border-left-color: var(--cui-color-success);
}
.cui-toast--warning {
  border-left-color: var(--cui-color-warning);
}
.cui-toast--danger {
  border-left-color: var(--cui-color-danger);
}

@media (prefers-reduced-motion: reduce) {
  .cui-toast {
    animation: none;
  }
}

@keyframes cui-toast-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
