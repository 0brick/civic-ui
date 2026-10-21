<script setup>
// Like Tooltip but click-triggered and holds rich content (a heading + a
// body slot) instead of a single line of text.
//
// Not merged with Dropdown: both already share click-outside behavior via
// useClickOutside below, but Popover is a 4-way-placed rich-content
// primitive with no menu semantics, while Dropdown is a 2-way-aligned
// action-menu primitive with built-in trigger chrome: real divergence,
// not duplication.
import { ref } from 'vue'
import { useClickOutside } from '../../composables/useClickOutside'
import { useId } from '../../composables/useId'
import { t } from '../../utils/i18n'

defineProps({
  title: { type: String, default: '' },
  placement: { type: String, default: 'bottom', validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v) }
})

const open = ref(false)
const root = ref(null)
const panelId = useId('cui-popover')
const titleId = useId('cui-popover-title')

// a11y (WCAG 2.1.1/2.4.3): remember whatever had focus before the popover
// opened so Escape/outside-dismiss can hand focus back to it, exactly like
// Modal's focus trap does for its own open/close cycle.
let previouslyFocused = null

function openPopover() {
  if (open.value) return
  previouslyFocused = document.activeElement
  open.value = true
}

function closePopover(event) {
  if (!open.value) return
  open.value = false
  // Focus moved out on its own (Tab past the panel): the user chose where it
  // goes, so don't yank it back to the trigger.
  const focusLeft = event?.type === 'focusin'
  if (!focusLeft && previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus()
  previouslyFocused = null
}

function toggle() {
  open.value ? closePopover() : openPopover()
}

// a11y (WCAG 2.1.2): Escape must dismiss the popover without trapping focus.
function onKeydown(e) {
  if (e.key === 'Escape') closePopover()
}

useClickOutside(root, closePopover)
</script>

<template>
  <span ref="root" class="cui-popover-wrap" @keydown="onKeydown">
    <span @click="toggle">
      <!-- a11y (WAI-ARIA disclosure pattern): expose open state / target id
           so a slotted trigger button can bind aria-expanded/aria-controls. -->
      <slot name="trigger" :open="open" :toggle="toggle" :panel-id="panelId" />
    </span>
    <transition name="cui-popover-fade">
      <div
        v-if="open"
        :id="panelId"
        class="cui-popover"
        :class="`cui-popover--${placement}`"
        role="dialog"
        :aria-labelledby="title ? titleId : undefined"
        :aria-label="!title ? t('popover.trigger') : undefined"
      >
        <p v-if="title" :id="titleId" class="cui-popover__title">{{ title }}</p>
        <div class="cui-popover__body"><slot /></div>
      </div>
    </transition>
  </span>
</template>

<style scoped>
.cui-popover-wrap {
  position: relative;
  display: inline-flex;
}

.cui-popover {
  position: absolute;
  z-index: var(--cui-z-popover);
  width: 260px;
  padding: var(--cui-space-4);
  background: var(--cui-surface-raised);
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
  box-shadow: var(--cui-shadow-md);
}

.cui-popover--top {
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
}
.cui-popover--bottom {
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
}
.cui-popover--left {
  right: calc(100% + 10px);
  top: 0;
}
.cui-popover--right {
  left: calc(100% + 10px);
  top: 0;
}

.cui-popover__title {
  margin: 0 0 0.6rem;
  font-weight: 700;
  font-size: 1.4rem;
}

.cui-popover__body {
  font-size: 1.3rem;
  color: var(--cui-text-muted);
}

.cui-popover-fade-enter-active,
.cui-popover-fade-leave-active {
  transition: opacity var(--cui-duration-fast) var(--cui-ease), transform var(--cui-duration-fast) var(--cui-ease);
}
.cui-popover-fade-enter-from,
.cui-popover-fade-leave-to {
  opacity: 0;
}
.cui-popover--top.cui-popover-fade-enter-from,
.cui-popover--top.cui-popover-fade-leave-to,
.cui-popover--bottom.cui-popover-fade-enter-from,
.cui-popover--bottom.cui-popover-fade-leave-to {
  transform: translateX(-50%) translateY(-4px);
}
.cui-popover--left.cui-popover-fade-enter-from,
.cui-popover--left.cui-popover-fade-leave-to,
.cui-popover--right.cui-popover-fade-enter-from,
.cui-popover--right.cui-popover-fade-leave-to {
  transform: translateY(-4px);
}
</style>
