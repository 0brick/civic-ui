<script setup>
// Bottom-fixed cookie/consent banner, controlled via v-model like the
// other overlays. Ships with three actions (accept all / reject
// non-essential / customize) since that three-way choice is what EU
// consent rules generally require: hide `onCustomize`'s button by not
// listening for it if a project only needs accept/reject.
//
// This component is presentation-only: it does not persist a decision or
// block any script by itself. Pair it with the `useCookieConsent` composable
// (src/composables/useCookieConsent.js) to actually gate analytics/marketing
// scripts on the visitor's choice: see that file's header comment for the
// wiring.
import { computed, nextTick, onBeforeUnmount, ref, toRef, watch } from 'vue'
import AppButton from '../button/AppButton.vue'
import { useScrollLock } from '../../composables/useScrollLock'
import { useFocusTrap } from '../../composables/useFocusTrap'
import { t } from '../../utils/i18n'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String },
  text: { type: String },
  acceptLabel: { type: String },
  rejectLabel: { type: String },
  customizeLabel: { type: String },
  lockScroll: { type: Boolean, default: false },
  // a11y (WCAG 2.4.3 / 2.4.11 / 4.1.2): a modal banner (aria-modal="true")
  // keeps Tab inside itself until a choice is made, and hands focus back
  // after, so nothing focused can end up hidden behind it, and nothing
  // behind it is used before the visitor decided.
  // `modal: false` leaves the page usable: the banner then publishes its
  // height for scroll-padding-bottom (base.css) and Escape collapses it.
  // Implied by `lockScroll`: a page that can't scroll mustn't be tabbable
  // behind the banner either.
  modal: { type: Boolean, default: true },
  // GDPR (Art. 4 Nr. 11 / Art. 7, EDPB cookie banner taskforce): rejecting
  // must be offered as prominently as accepting, so both buttons share one
  // variant by default. `false` highlights the accept button: only for a
  // banner whose reject option is presented equally elsewhere.
  equalWeight: { type: Boolean, default: true }
})
const emit = defineEmits(['update:modelValue', 'accept', 'reject', 'customize'])
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  title: props.title ?? t('cookieConsent.title'),
  text: props.text ?? t('cookieConsent.text'),
  acceptLabel: props.acceptLabel ?? t('cookieConsent.accept'),
  rejectLabel: props.rejectLabel ?? t('cookieConsent.reject'),
  customizeLabel: props.customizeLabel ?? t('cookieConsent.customize'),
  expandLabel: t('cookieConsent.expand')
}))


function accept() {
  emit('accept')
  emit('update:modelValue', false)
}
function reject() {
  emit('reject')
  emit('update:modelValue', false)
}

if (props.lockScroll) useScrollLock(toRef(props, 'modelValue'))

const panelEl = ref(null)
const isModal = computed(() => props.modal || props.lockScroll)
useFocusTrap(computed(() => props.modelValue && isModal.value), panelEl)
// Non-modal only: see collapse() below.
const collapsed = ref(false)
const expandEl = ref(null)

// Non-modal: still move focus to the banner when it appears, so keyboard and
// screen-reader users meet the consent choice first instead of tabbing
// through the whole page to find it. The banner itself (tabindex="-1")
// takes focus, so its title is announced before the buttons.
watch(
  () => props.modelValue,
  (open) => {
    collapsed.value = false
    if (!open || isModal.value || typeof document === 'undefined') return
    nextTick(() => panelEl.value?.focus())
  },
  { immediate: true }
)

// a11y (WCAG 2.4.11, non-modal only): Escape collapses the banner to a
// one-line bar so it covers less of the page; its button opens it again.
// Focus inside the banner moves to that button instead of getting lost.
function collapse() {
  const hadFocus = panelEl.value?.contains(document.activeElement)
  collapsed.value = true
  if (hadFocus) nextTick(() => expandEl.value?.$el?.focus())
}
function expand() {
  collapsed.value = false
  nextTick(() => panelEl.value?.focus())
}
function onDocumentKeydown(event) {
  if (event.key !== 'Escape' || collapsed.value) return
  // Escape inside another dialog (a Modal opened from the page) is that
  // dialog's: don't collapse the banner along with it.
  const target = event.target
  if (typeof target?.closest === 'function' && !panelEl.value?.contains(target) && target.closest('[aria-modal="true"]')) return
  collapse()
}

// a11y (WCAG 2.4.11, non-modal only): publish the banner's height as
// --cui-cookie-consent-height on <html>: base.css turns it into
// scroll-padding-bottom, so the browser scrolls a focused element above the
// banner instead of leaving it hidden underneath (same idea as Navbar's
// --cui-navbar-height).
let resizeObserver = null
function publishHeight() {
  if (!panelEl.value) return
  document.documentElement.style.setProperty('--cui-cookie-consent-height', `${panelEl.value.offsetHeight}px`)
}
function stopNonModal() {
  resizeObserver?.disconnect()
  resizeObserver = null
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', onDocumentKeydown)
  document.documentElement.style.removeProperty('--cui-cookie-consent-height')
}
watch(
  () => props.modelValue && !isModal.value,
  (active) => {
    if (typeof document === 'undefined') return
    stopNonModal()
    if (!active) return
    document.addEventListener('keydown', onDocumentKeydown)
    nextTick(() => {
      if (!panelEl.value) return
      publishHeight()
      if (typeof ResizeObserver === 'undefined') return
      resizeObserver = new ResizeObserver(publishHeight)
      resizeObserver.observe(panelEl.value)
    })
  },
  { immediate: true }
)
onBeforeUnmount(stopNonModal)
</script>

<template>
  <teleport to="body">
    <transition name="cui-cookie-consent">
      <div
        v-if="modelValue"
        ref="panelEl"
        class="cui-cookie-consent"
        :class="{ 'cui-cookie-consent--non-modal': !isModal }"
        role="dialog"
        :aria-modal="isModal ? 'true' : 'false'"
        :aria-label="L.title"
        tabindex="-1"
      >
        <div v-if="collapsed" class="cui-cookie-consent__inner cui-cookie-consent__inner--collapsed">
          <p class="cui-cookie-consent__title">{{ L.title }}</p>
          <AppButton ref="expandEl" variant="outline" size="sm" :aria-expanded="false" @click="expand">{{ L.expandLabel }}</AppButton>
        </div>
        <div v-else class="cui-cookie-consent__inner">
          <div class="cui-cookie-consent__body">
            <p class="cui-cookie-consent__title">{{ L.title }}</p>
            <p class="cui-cookie-consent__text">{{ L.text }}</p>
          </div>
          <div class="cui-cookie-consent__actions">
            <AppButton variant="ghost" size="sm" @click="emit('customize')">{{ L.customizeLabel }}</AppButton>
            <AppButton :variant="equalWeight ? 'primary' : 'outline'" size="sm" @click="reject">{{ L.rejectLabel }}</AppButton>
            <AppButton :variant="equalWeight ? 'primary' : 'accent'" size="sm" @click="accept">{{ L.acceptLabel }}</AppButton>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.cui-cookie-consent {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--cui-z-modal);
  /* a11y (WCAG 1.4.10 / 1.4.4): at 400 % zoom or on a short landscape phone
     the banner can be taller than the viewport: it scrolls instead of
     pushing its buttons off-screen. */
  max-height: 100dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--cui-surface-raised);
  border-top: 1px solid var(--cui-border);
  box-shadow: var(--cui-shadow-lg);
}
/* a11y (WCAG 2.4.11): the non-modal banner leaves the page usable, so it
   must leave the page room, at most half the viewport (on a 320×256
   viewport the full banner plus a sticky header covered all of it, and no
   focused element could be scrolled into view). Its text scrolls inside;
   the panel takes focus when it opens, so the arrow keys scroll it. */
.cui-cookie-consent--non-modal {
  max-height: 50dvh;
}

.cui-cookie-consent__inner {
  max-width: var(--cui-container-max);
  margin-inline: auto;
  padding: var(--cui-space-5) var(--cui-gutter);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--cui-space-4);
}

.cui-cookie-consent__inner--collapsed {
  padding-block: var(--cui-space-3);
}
.cui-cookie-consent__inner--collapsed .cui-cookie-consent__title {
  margin: 0;
}

.cui-cookie-consent__body {
  flex: 1;
  min-width: 240px;
}

.cui-cookie-consent__title {
  margin: 0 0 0.4rem;
  font-weight: 700;
  font-size: 1.5rem;
}

.cui-cookie-consent__text {
  margin: 0;
  font-size: 1.3rem;
  color: var(--cui-text-muted);
  max-width: 70ch;
}

.cui-cookie-consent__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cui-space-2);
  flex-shrink: 0;
}

.cui-cookie-consent-enter-active,
.cui-cookie-consent-leave-active {
  transition: transform var(--cui-duration-slow) var(--cui-ease), opacity var(--cui-duration) var(--cui-ease);
}
.cui-cookie-consent-enter-from,
.cui-cookie-consent-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .cui-cookie-consent-enter-active,
  .cui-cookie-consent-leave-active {
    transition: opacity var(--cui-duration) var(--cui-ease);
  }
  .cui-cookie-consent-enter-from,
  .cui-cookie-consent-leave-to {
    transform: none;
  }
}
</style>
