<script setup>
// The one overlay-panel primitive. `placement` picks the shape: 'center'
// (dialog), 'start'/'end'/'top'/'bottom' (drawer for nav or filter panels),
// or 'bottom' + `handle` (mobile drag-to-dismiss sheet). All share one
// v-model/teleport/backdrop/scroll-lock/focus-trap implementation.
import { computed, ref, toRef, watch } from 'vue'
import CloseButton from '../button/CloseButton.vue'
import { useScrollLock } from '../../composables/useScrollLock'
import { useFocusTrap } from '../../composables/useFocusTrap'
import { useId } from '../../composables/useId'
import { t } from '../../utils/i18n'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  placement: {
    type: String,
    default: 'center',
    validator: (v) => ['center', 'start', 'end', 'top', 'bottom'].includes(v)
  },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg', 'full'].includes(v) }, // placement="center" only
  handle: { type: Boolean, default: false }, // placement="bottom" only: drag handle, no header close button
  title: { type: String, default: '' },
  // a11y (WCAG 4.1.2): fallback accessible name for dialogs rendered without
  // a visible `title` (e.g. a handle-only bottom sheet): see `titleId` below.
  ariaLabel: { type: String, default: '' },
  // Screen-reader name of the header close button / sheet drag handle.
  closeLabel: { type: String },
  closeOnBackdrop: { type: Boolean, default: true },
  // Footer button alignment; 'stretch' gives every footer child an equal
  // share of the row (full-width buttons, common on mobile sheets).
  footerAlign: { type: String, default: 'end', validator: (v) => ['start', 'center', 'end', 'stretch'].includes(v) },
  // id of the dialog element, for a trigger's aria-controls (the root is a
  // teleport, so a plain `id` attribute would have nowhere to land).
  id: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  closeLabel: props.closeLabel ?? t('modal.close')
}))


function close() {
  emit('update:modelValue', false)
}

const isSheet = computed(() => props.placement === 'bottom' && props.handle)
// One <transition> on the backdrop, named per placement: the panel mounts
// together with it, so a nested <transition> around the panel would never
// run (and shared names would stamp the same classes on both). The panel's
// own fade/zoom/slide hangs off the backdrop's classes in the styles below.
const transitionName = computed(() => `cui-modal-${props.placement}`)

// a11y (WCAG 4.1.2): every dialog needs an accessible name. Point at the
// visible title via aria-labelledby when there is one; fall back to
// aria-label (either the explicit `ariaLabel` prop or, worst case, the
// close button's own label) so a title-less sheet still names itself.
const titleId = useId('cui-modal-title')

// Sheet drag-to-dismiss: drag the handle down at least DISMISS_PX and let go
// to close; shorter drags spring back. A tap (or Enter/Space) on the handle
// still closes on its own: the single-pointer/keyboard alternative to the
// drag gesture (WCAG 2.5.1, 2.5.7). The offset goes into the `translate`
// property, so the open/close slide (on `transform`) keeps working.
const DISMISS_PX = 80
const dragY = ref(0)
const dragging = ref(false)
let dragStartY = null
let suppressClick = false

function onHandlePointerDown(e) {
  if (e.button !== 0) return
  dragStartY = e.clientY
  dragY.value = 0
  dragging.value = true
  suppressClick = false
  e.currentTarget.setPointerCapture?.(e.pointerId)
}
function onHandlePointerMove(e) {
  if (dragStartY === null) return
  dragY.value = Math.max(0, e.clientY - dragStartY)
  // A real drag, not a tap: the click that follows must not close.
  if (dragY.value > 4) suppressClick = true
}
function onHandlePointerUp(e) {
  if (dragStartY === null) return
  const dismiss = e.type === 'pointerup' && dragY.value >= DISMISS_PX
  dragStartY = null
  dragging.value = false
  // Dismissed: keep the offset so the sheet slides out from where it was let go.
  if (dismiss) close()
  else dragY.value = 0
}
function onHandleClick() {
  if (suppressClick) {
    suppressClick = false
    return
  }
  close()
}
watch(
  () => props.modelValue,
  (open) => {
    if (open) dragY.value = 0
  }
)

const panelEl = ref(null)
useScrollLock(toRef(props, 'modelValue'))
useFocusTrap(toRef(props, 'modelValue'), panelEl)
</script>

<template>
  <teleport to="body">
    <transition :name="transitionName">
      <div
        v-if="modelValue"
        class="cui-modal-backdrop"
        :class="`cui-modal-backdrop--${placement}`"
        @click="closeOnBackdrop && close()"
      >
        <div
          :id="id || undefined"
          ref="panelEl"
          class="cui-modal"
          :class="[
            `cui-modal--${placement}`,
            { [`cui-modal--${size}`]: placement === 'center', 'cui-modal--sheet': isSheet, 'cui-modal--dragging': dragging }
          ]"
          :style="isSheet && dragY ? { '--cui-sheet-drag': `${dragY}px` } : undefined"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          :aria-label="!title ? ariaLabel || t('modal.fallbackName') : undefined"
          tabindex="-1"
          @click.stop
          @keydown.escape="close"
        >
          <!-- a11y (WCAG 2.1.1/4.1.2): a native <button> instead of a plain
                 div so the drag handle is keyboard-focusable and operable
                 (Enter/Space) as a close control, not mouse-only. Styles
                 below reset default button chrome to keep the exact same
                 pill-shaped visual. -->
          <button
            v-if="isSheet"
            type="button"
            class="cui-modal__handle"
            :aria-label="L.closeLabel"
            @click="onHandleClick"
            @pointerdown="onHandlePointerDown"
            @pointermove="onHandlePointerMove"
            @pointerup="onHandlePointerUp"
            @pointercancel="onHandlePointerUp"
          />
          <div v-if="!isSheet || title" class="cui-modal__header" :class="{ 'cui-modal__header--untitled': !title }">
            <!-- a11y (WCAG 1.3.1/2.4.6): no empty <h2> when there is no title;
                 the dialog is then named by aria-label instead. -->
            <h2 v-if="title" :id="titleId" class="cui-modal__title">{{ title }}</h2>
            <CloseButton v-if="!isSheet" :label="L.closeLabel" @click="close" />
          </div>
          <div class="cui-modal__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="cui-modal__footer" :class="`cui-modal__footer--${footerAlign}`">
            <slot name="footer" :close="close" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.cui-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 29, 53, 0.55);
}
.cui-modal-backdrop--center {
  z-index: var(--cui-z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--cui-space-4);
}
.cui-modal-backdrop--start,
.cui-modal-backdrop--end,
.cui-modal-backdrop--top,
.cui-modal-backdrop--bottom {
  z-index: var(--cui-z-offcanvas);
  background: rgba(0, 29, 53, 0.5);
}

.cui-modal {
  display: flex;
  flex-direction: column;
  background: var(--cui-surface-raised);
  box-shadow: var(--cui-shadow-lg);
}

/* ---- center ---- */
.cui-modal--center {
  width: 100%;
  max-height: 90vh;
  border-radius: var(--cui-radius-lg);
}
.cui-modal--sm {
  max-width: 420px;
}
.cui-modal--md {
  max-width: 620px;
}
.cui-modal--lg {
  max-width: 900px;
}
.cui-modal--full {
  max-width: none;
  width: 96vw;
  height: 92vh;
}

/* ---- start/end/top/bottom ---- */
.cui-modal--start,
.cui-modal--end,
.cui-modal--top,
.cui-modal--bottom {
  position: fixed;
  z-index: calc(var(--cui-z-offcanvas) + 1);
}
.cui-modal--start,
.cui-modal--end {
  top: 0;
  bottom: 0;
  width: min(340px, 88vw);
}
.cui-modal--start {
  left: 0;
}
.cui-modal--end {
  right: 0;
}
.cui-modal--top,
.cui-modal--bottom {
  left: 0;
  right: 0;
  max-height: 80vh;
}
.cui-modal--top {
  top: 0;
}
.cui-modal--bottom {
  bottom: 0;
  border-radius: var(--cui-radius-lg) var(--cui-radius-lg) 0 0;
}

/* ---- bottom + handle ---- */
.cui-modal--sheet {
  max-height: 85vh;
  overflow-y: auto;
  padding-bottom: var(--cui-space-5);
  translate: 0 var(--cui-sheet-drag, 0);
  transition: translate var(--cui-duration) var(--cui-ease);
}
/* follow the pointer 1:1 while dragging; spring back otherwise */
.cui-modal--dragging {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .cui-modal--sheet {
    transition: none;
  }
}
/* a11y (WCAG 2.5.8 / 1.4.11): the button is a 48×24 hit area and the
   visible pill is drawn by ::before in the control-border color (3:1+
   against the sheet): it is the sheet's only visible close control. */
.cui-modal__handle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 4.8rem;
  height: 2.4rem;
  padding: 0;
  border: none;
  border-radius: var(--cui-radius-pill);
  background: transparent;
  margin: var(--cui-space-1) auto;
  cursor: grab;
  /* the drag gesture is ours, not the page's scroll */
  touch-action: none;
}
.cui-modal__handle::before {
  content: '';
  width: 4rem;
  height: 4px;
  border-radius: var(--cui-radius-pill);
  background: var(--cui-border-control);
}

.cui-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--cui-space-4) var(--cui-space-5);
  border-bottom: 1px solid var(--cui-border);
}
.cui-modal__header--untitled {
  justify-content: flex-end;
}
.cui-modal--sheet .cui-modal__header {
  border-bottom: none;
  padding: 0 var(--cui-space-5) var(--cui-space-3);
}

.cui-modal__title {
  margin: 0;
  font-size: 2rem;
}
.cui-modal--sheet .cui-modal__title {
  font-size: 1.9rem;
}
.cui-modal--start .cui-modal__title,
.cui-modal--end .cui-modal__title,
.cui-modal--top .cui-modal__title,
.cui-modal--bottom .cui-modal__title {
  font-size: 1.8rem;
}

.cui-modal__body {
  padding: var(--cui-space-5);
  overflow-y: auto;
}
.cui-modal--start .cui-modal__body,
.cui-modal--end .cui-modal__body,
.cui-modal--top .cui-modal__body,
.cui-modal--bottom .cui-modal__body {
  padding: var(--cui-space-4);
}
.cui-modal--sheet .cui-modal__body {
  padding: 0 var(--cui-space-5);
}

.cui-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--cui-space-3);
  padding: var(--cui-space-4) var(--cui-space-5);
  border-top: 1px solid var(--cui-border);
}
.cui-modal__footer--start {
  justify-content: flex-start;
}
.cui-modal__footer--center {
  justify-content: center;
}
.cui-modal__footer--stretch > :deep(*) {
  flex: 1 1 0;
}
/* A sheet has no header rule and an inset body (see .cui-modal--sheet
   .cui-modal__body): line the footer up with that body instead of
   drawing a full-bleed bar across it. */
.cui-modal--sheet .cui-modal__footer {
  border-top: none;
  padding: var(--cui-space-4) var(--cui-space-5) 0;
}

/* ---- transitions ---- */
/* transitions: see transitionName: the backdrop fades, the panel zooms in
   (center) or slides in from its edge, both keyed off the backdrop's classes. */
.cui-modal-center-enter-active,
.cui-modal-center-leave-active {
  transition: opacity var(--cui-duration) var(--cui-ease);
}
.cui-modal-start-enter-active,
.cui-modal-start-leave-active,
.cui-modal-end-enter-active,
.cui-modal-end-leave-active,
.cui-modal-top-enter-active,
.cui-modal-top-leave-active,
.cui-modal-bottom-enter-active,
.cui-modal-bottom-leave-active {
  /* as long as the panel's slide, so Vue keeps both mounted until it ends */
  transition: opacity var(--cui-duration-slow) var(--cui-ease);
}
.cui-modal-center-enter-from,
.cui-modal-center-leave-to,
.cui-modal-start-enter-from,
.cui-modal-start-leave-to,
.cui-modal-end-enter-from,
.cui-modal-end-leave-to,
.cui-modal-top-enter-from,
.cui-modal-top-leave-to,
.cui-modal-bottom-enter-from,
.cui-modal-bottom-leave-to {
  opacity: 0;
}

.cui-modal-center-enter-active .cui-modal,
.cui-modal-center-leave-active .cui-modal {
  transition: transform var(--cui-duration) var(--cui-ease);
}
.cui-modal-center-enter-from .cui-modal,
.cui-modal-center-leave-to .cui-modal {
  transform: translateY(16px) scale(0.98);
}

.cui-modal-start-enter-active .cui-modal,
.cui-modal-start-leave-active .cui-modal,
.cui-modal-end-enter-active .cui-modal,
.cui-modal-end-leave-active .cui-modal,
.cui-modal-top-enter-active .cui-modal,
.cui-modal-top-leave-active .cui-modal,
.cui-modal-bottom-enter-active .cui-modal,
.cui-modal-bottom-leave-active .cui-modal {
  transition: transform var(--cui-duration-slow) var(--cui-ease);
}
.cui-modal-start-enter-from .cui-modal,
.cui-modal-start-leave-to .cui-modal {
  transform: translateX(-100%);
}
.cui-modal-end-enter-from .cui-modal,
.cui-modal-end-leave-to .cui-modal {
  transform: translateX(100%);
}
.cui-modal-top-enter-from .cui-modal,
.cui-modal-top-leave-to .cui-modal {
  transform: translateY(-100%);
}
.cui-modal-bottom-enter-from .cui-modal,
.cui-modal-bottom-leave-to .cui-modal {
  transform: translateY(100%);
}
</style>
