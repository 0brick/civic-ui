<script setup>
// Fixed circular button that fades in after the page has scrolled past
// `threshold` and smooth-scrolls back to the top on click (jumps instead
// under prefers-reduced-motion).
//
// a11y (WCAG 2.4.3): the button fades out once the page is back at the top,
// so it hands keyboard focus to `focusTarget` (the main content by default)
// otherwise focus is left on a removed element and the next Tab starts
// over from the top of the document.
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { t } from '../../utils/i18n'
import { focusElement } from '../../utils/focus'

const props = defineProps({
  threshold: { type: Number, default: 480 },
  label: { type: String },
  // element or CSS selector; the first match wins
  focusTarget: { type: [String, Object], default: '#main-content, main' }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  label: props.label ?? t('backToTop.label')
}))


const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > props.threshold
}

function scrollToTop() {
  // A JS smooth scroll ignores base.css's scroll-behavior rule: ask the
  // media query ourselves and jump for reduced-motion visitors.
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  // preventScroll: the target may sit lower than the top; let the smooth
  // scroll finish where it was going.
  focusElement(props.focusTarget, { preventScroll: true })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <transition name="cui-back-to-top">
    <button v-if="visible" type="button" class="cui-back-to-top" :aria-label="L.label" @click="scrollToTop">
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M10 15V5M10 5l-5 5m5-5l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
  </transition>
</template>

<style scoped>
.cui-back-to-top {
  position: fixed;
  right: var(--cui-space-5);
  bottom: var(--cui-space-5);
  z-index: var(--cui-z-sticky);
  width: 4.6rem;
  height: 4.6rem;
  border: none;
  border-radius: 50%;
  background: var(--cui-primary);
  color: var(--cui-primary-contrast);
  box-shadow: var(--cui-shadow-md);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--cui-duration) var(--cui-ease), transform var(--cui-duration-fast) var(--cui-ease);
}
.cui-back-to-top:hover {
  background: var(--cui-primary-hover);
  transform: translateY(-2px);
}

.cui-back-to-top-enter-active,
.cui-back-to-top-leave-active {
  transition: opacity var(--cui-duration) var(--cui-ease), transform var(--cui-duration) var(--cui-ease);
}
.cui-back-to-top-enter-from,
.cui-back-to-top-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
