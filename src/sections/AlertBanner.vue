<script setup>
// A full-width, page-top strip: sits above SiteHeader. Distinct from the
// inline Alert component, which is a content-area element, not a page-level
// banner. `variant="neutral"` plus `fixed` and a custom `#icon` (e.g. a flag
// glyph) gives a quiet official identity strip instead of a notice.
import { computed, ref } from 'vue'
import AppButton from '../components/button/AppButton.vue'
import CloseButton from '../components/button/CloseButton.vue'
import { t } from '../utils/i18n'

const props = defineProps({
  variant: { type: String, default: 'warning', validator: (v) => ['info', 'success', 'warning', 'danger', 'neutral'].includes(v) },
  text: { type: String, required: true },
  action: { type: Object, default: null }, // { label, href, newTab? }
  dismissible: { type: Boolean, default: true },
  dismissLabel: { type: String },
  fixed: { type: Boolean, default: false }, // sticky above a sticky header
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) }
})
const emit = defineEmits(['dismiss'])
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  dismissLabel: props.dismissLabel ?? t('alertBanner.dismiss')
}))


// info/success/danger sit on a saturated background with white text; warning
// (yellow) and neutral (light gray) keep the default dark navy text: the
// close icon needs to follow the same split or it renders as a dark "x" on
// top of a colored banner right next to white text.
const closeIsDark = computed(() => ['info', 'success', 'danger'].includes(props.variant))

// a11y (WCAG 4.1.3): warning/danger interrupt with an assertive role="alert";
// info/success/neutral use the polite role="status" instead.
const isUrgent = computed(() => props.variant === 'warning' || props.variant === 'danger')

const visible = ref(true)
function dismiss() {
  visible.value = false
  emit('dismiss')
}
</script>

<template>
  <transition name="cui-alert-banner-collapse">
    <div v-if="visible" class="cui-alert-banner" :class="[`cui-alert-banner--${variant}`, { 'cui-alert-banner--fixed': fixed }]" :role="isUrgent ? 'alert' : 'status'">
      <div class="cui-container cui-alert-banner__inner">
        <slot name="icon">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M10 2l9 16H1L10 2zM10 8v4M10 15h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </slot>
        <p class="cui-alert-banner__text" :class="`cui-align-${align}`">{{ text }}</p>
        <slot />
        <AppButton v-if="action" variant="link" size="sm" :href="action.href" :new-tab="action.newTab" class="cui-alert-banner__action">
          {{ action.label }}
        </AppButton>
        <CloseButton v-if="dismissible" class="cui-alert-banner__close" :dark="closeIsDark" :label="L.dismissLabel" @click="dismiss" />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.cui-alert-banner {
  font-size: 1.4rem;
  font-weight: 600;
}

.cui-alert-banner--fixed {
  position: sticky;
  top: 0;
  z-index: calc(var(--cui-z-sticky) + 1);
}

.cui-alert-banner__inner {
  display: flex;
  align-items: center;
  gap: var(--cui-space-3);
  padding-block: var(--cui-space-3);
}

.cui-alert-banner__text {
  flex: 1;
  margin: 0;
}

/* `class="cui-alert-banner__action"` lands on AppButton's own root element
   (fallthrough), not a wrapper around it, ":deep(.cui-btn)" is a descendant
   selector that can never match its own element, so it silently never
   applied and AppButton's own `.cui-btn--link { color: var(--cui-link) }`
   always won instead, painting this link the exact teal of the `info`
   variant's background. Target the element directly, and outrank that rule
   with an extra class instead of relying on source order. */
.cui-alert-banner__action.cui-btn--link {
  color: inherit;
  text-decoration: underline;
}

.cui-alert-banner--info {
  background: var(--cui-color-teal);
  color: var(--cui-color-white);
}
.cui-alert-banner--success {
  background: var(--cui-color-success);
  color: var(--cui-color-white);
}
.cui-alert-banner--warning {
  background: var(--cui-accent);
  color: var(--cui-accent-contrast);
}
.cui-alert-banner--danger {
  background: var(--cui-color-danger);
  color: var(--cui-color-white);
}
.cui-alert-banner--neutral {
  background: var(--cui-color-grey-50);
  color: var(--cui-text);
  font-size: 1.2rem;
}
.cui-alert-banner--neutral .cui-alert-banner__inner {
  padding-block: var(--cui-space-2);
  min-height: 3.6rem;
}

.cui-alert-banner-collapse-enter-active,
.cui-alert-banner-collapse-leave-active {
  transition:
    opacity var(--cui-duration) var(--cui-ease),
    max-height var(--cui-duration) var(--cui-ease);
  overflow: hidden;
}
.cui-alert-banner-collapse-enter-from,
.cui-alert-banner-collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.cui-alert-banner-collapse-enter-to,
.cui-alert-banner-collapse-leave-from {
  max-height: 6rem;
}
</style>
