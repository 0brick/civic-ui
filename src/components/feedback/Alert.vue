<script setup>
// A11y of `dismissible` (WCAG 2.4.3): the close button goes away with the
// alert. If it had focus, focus moves to `focusTarget` (an element or a CSS
// selector); without one, listen to `dismiss` and place focus yourself.
import { ref, computed, nextTick } from 'vue'
import CloseButton from '../button/CloseButton.vue'
import { t } from '../../utils/i18n'
import { focusElement } from '../../utils/focus'

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (v) => ['info', 'success', 'warning', 'danger', 'neutral'].includes(v)
  },
  title: { type: String, default: '' },
  dismissible: { type: Boolean, default: false },
  // Whether the alert is its own live region (role="alert"/"status"). An
  // alert that is inserted with v-if together with its role is often not
  // announced, for messages that appear after an action, keep an always-
  // rendered live region in the page, render the Alert inside it and turn
  // this off (pattern: AppointmentSection).
  live: { type: Boolean, default: true },
  focusTarget: { type: [String, Object], default: null }
})
const emit = defineEmits(['dismiss'])

const visible = ref(true)
const root = ref(null)
function dismiss() {
  const hadFocus = !!root.value?.contains(document.activeElement)
  visible.value = false
  emit('dismiss')
  if (hadFocus && props.focusTarget) nextTick(() => focusElement(props.focusTarget))
}

// a11y (WCAG 4.1.3): only warning/danger interrupt with an assertive
// role="alert": info/success/neutral use the polite role="status" so they
// don't cut off whatever a screen reader is already reading.
const isUrgent = computed(() => props.variant === 'warning' || props.variant === 'danger')
// The variant only shows as color and icon (both hidden from screen
// readers), so it is also said in words: "Warning: …". Neutral has none.
const prefix = computed(() => (props.variant === 'neutral' ? '' : t(`alert.prefix.${props.variant}`)))
</script>

<template>
  <transition name="cui-alert-collapse">
    <div v-if="visible" ref="root" class="cui-alert" :class="`cui-alert--${variant}`" :role="live ? (isUrgent ? 'alert' : 'status') : undefined">
      <span class="cui-alert__icon" aria-hidden="true">
        <svg v-if="variant === 'success'" viewBox="0 0 20 20" width="20" height="20"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <svg v-else-if="variant === 'danger'" viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8" /><path d="M10 6v5M10 14.5h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
        <svg v-else-if="variant === 'warning'" viewBox="0 0 20 20" width="20" height="20"><path d="M10 2l9 16H1L10 2zM10 8v4M10 15h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <svg v-else viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6" /><path d="M10 9v5M10 6h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </span>
      <div class="cui-alert__body">
        <p v-if="title" class="cui-alert__title"><span v-if="prefix" class="cui-visually-hidden">{{ `${prefix} ` }}</span>{{ title }}</p>
        <div class="cui-alert__text"><span v-if="prefix && !title" class="cui-visually-hidden">{{ `${prefix} ` }}</span><slot /></div>
      </div>
      <CloseButton v-if="dismissible" class="cui-alert__close" :label="t('alert.dismiss')" @click="dismiss" />
    </div>
  </transition>
</template>

<style scoped>
.cui-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--cui-space-3);
  padding: var(--cui-space-4);
  border-radius: var(--cui-radius-md);
  border: 1.5px solid transparent;
  border-left-width: 4px;
  font-size: 1.4rem;
  line-height: 1.55;
}

.cui-alert__icon {
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.cui-alert__title {
  margin: 0 0 0.2rem;
  font-weight: 700;
}

.cui-alert__text {
  flex: 1;
}
.cui-alert__text > :last-child {
  margin-bottom: 0;
}

.cui-alert__close {
  margin: -0.4rem -0.4rem -0.4rem auto;
  flex-shrink: 0;
}

.cui-alert--info {
  background: var(--cui-info-bg);
  border-color: var(--cui-color-teal);
  color: var(--cui-info-text);
}
.cui-alert--success {
  background: var(--cui-success-bg);
  border-color: var(--cui-color-success);
  color: var(--cui-success-text);
}
.cui-alert--warning {
  background: var(--cui-warning-bg);
  border-color: var(--cui-color-warning);
  color: var(--cui-warning-text);
}
.cui-alert--danger {
  background: var(--cui-danger-bg);
  border-color: var(--cui-color-danger);
  color: var(--cui-danger-text);
}
.cui-alert--neutral {
  background: var(--cui-bg-subtle);
  border-color: var(--cui-border);
  color: var(--cui-text);
}

.cui-alert-collapse-enter-active,
.cui-alert-collapse-leave-active {
  transition:
    opacity var(--cui-duration) var(--cui-ease),
    transform var(--cui-duration) var(--cui-ease),
    max-height var(--cui-duration) var(--cui-ease),
    margin var(--cui-duration) var(--cui-ease),
    padding var(--cui-duration) var(--cui-ease);
  overflow: hidden;
}
.cui-alert-collapse-enter-from,
.cui-alert-collapse-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
  max-height: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.cui-alert-collapse-enter-to,
.cui-alert-collapse-leave-from {
  max-height: 20rem;
}
</style>
