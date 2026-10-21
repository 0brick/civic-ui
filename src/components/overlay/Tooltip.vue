<script setup>
// CSS-only positioning (no floating-ui dependency): good enough for short
// text hints anchored to a single trigger element. Wrap whatever you want
// the tooltip attached to in the default slot.
//
// a11y:
// - WCAG 1.3.1 / 4.1.2: the tooltip is always in the DOM (hidden with
//   v-show while closed) and the first focusable element in the slot gets
//   aria-describedby pointing at it, so screen readers read the hint as the
//   trigger's description. The id is also handed to the slot
//   (`v-slot="{ describedby }"`) for triggers that want to wire it
//   themselves: the automatic wiring then leaves them alone.
// - WCAG 1.4.13: the tooltip stays open while the pointer moves from the
//   trigger onto it (it's a child of the wrapper, and a ::before bridge
//   fills the gap), and Escape closes it without moving focus.
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'
import { useId } from '../../composables/useId'

defineProps({
  text: { type: String, required: true },
  placement: { type: String, default: 'top', validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v) }
})

const id = useId('cui-tooltip')
const wrapEl = ref(null)

const hovered = ref(false)
const focused = ref(false)
// Set by Escape; cleared the next time the pointer or focus arrives anew.
const dismissed = ref(false)
const visible = computed(() => (hovered.value || focused.value) && !dismissed.value)

function onMouseenter() {
  hovered.value = true
  dismissed.value = false
}
function onMouseleave() {
  hovered.value = false
}
function onFocusin() {
  focused.value = true
  dismissed.value = false
}
function onFocusout(event) {
  // Focus moving between elements inside the wrapper keeps it open.
  if (wrapEl.value && event.relatedTarget && wrapEl.value.contains(event.relatedTarget)) return
  focused.value = false
}

// Capture phase on document, so the hint closes wherever focus is (hover
// alone doesn't focus anything) and a surrounding Modal's own Escape
// handler doesn't also close the dialog: the first Escape only dismisses
// the hint, the way nested layers usually peel off one at a time.
function onKeydown(event) {
  if (event.key !== 'Escape' || !visible.value) return
  dismissed.value = true
  event.stopPropagation()
}
watch(visible, (open) => {
  if (typeof document === 'undefined') return
  if (open) document.addEventListener('keydown', onKeydown, true)
  else document.removeEventListener('keydown', onKeydown, true)
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('keydown', onKeydown, true)
})

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'

// Wires aria-describedby onto the trigger (the first focusable element in
// the slot, or the slot's first element): appended to any ids it already
// carries, never duplicated.
function describeTrigger() {
  const wrap = wrapEl.value
  if (!wrap) return
  const trigger =
    Array.from(wrap.querySelectorAll(FOCUSABLE_SELECTOR)).find((el) => !el.classList.contains('cui-tooltip')) ??
    Array.from(wrap.children).find((el) => !el.classList.contains('cui-tooltip'))
  if (!trigger) return
  const ids = (trigger.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean)
  if (ids.includes(id)) return
  trigger.setAttribute('aria-describedby', [...ids, id].join(' '))
}
onMounted(describeTrigger)
onUpdated(describeTrigger)
</script>

<template>
  <span
    ref="wrapEl"
    class="cui-tooltip-wrap"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
    @focusin="onFocusin"
    @focusout="onFocusout"
  >
    <slot :describedby="id" />
    <span v-show="visible" :id="id" class="cui-tooltip" :class="`cui-tooltip--${placement}`" role="tooltip">
      {{ text }}
    </span>
  </span>
</template>

<style scoped>
.cui-tooltip-wrap {
  position: relative;
  display: inline-flex;
}

.cui-tooltip {
  position: absolute;
  z-index: var(--cui-z-tooltip);
  padding: 0.6rem 1rem;
  background: var(--cui-primary);
  color: var(--cui-primary-contrast);
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: var(--cui-radius-sm);
  /* a11y (WCAG 1.4.10): wrap instead of running off a 320px viewport.
     max-content keeps short tips on one line, without it the absolutely
     positioned box would shrink to the trigger's width. */
  white-space: normal;
  width: max-content;
  max-width: min(28rem, calc(100vw - 2rem));
  overflow-wrap: break-word;
  animation: cui-tooltip-in var(--cui-duration-fast) var(--cui-ease);
}

/* Invisible bridge over the 8px gap between trigger and tooltip, so the
   pointer never leaves the wrapper on its way onto the tooltip (WCAG 1.4.13
   "hoverable"). */
.cui-tooltip::before {
  content: '';
  position: absolute;
}

.cui-tooltip--top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}
.cui-tooltip--top::before {
  top: 100%;
  left: 0;
  right: 0;
  height: 8px;
}
.cui-tooltip--bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}
.cui-tooltip--bottom::before {
  bottom: 100%;
  left: 0;
  right: 0;
  height: 8px;
}
.cui-tooltip--left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}
.cui-tooltip--left::before {
  left: 100%;
  top: 0;
  bottom: 0;
  width: 8px;
}
.cui-tooltip--right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}
.cui-tooltip--right::before {
  right: 100%;
  top: 0;
  bottom: 0;
  width: 8px;
}

@keyframes cui-tooltip-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cui-tooltip {
    animation: none;
  }
}
</style>
