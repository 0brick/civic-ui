// Shared "close me when you click elsewhere" behavior for Dropdown, Popover
// and Select: one listener implementation instead of three slightly
// different ones.
//
// a11y (WCAG 2.4.11/2.4.3): focus leaving the element (Tab past the last
// item) counts as "elsewhere" too: otherwise an open menu keeps covering
// whatever the keyboard user tabbed on to. The callback gets the event, so
// callers can tell a `focusin` apart and leave focus where the user put it.
import { onMounted, onBeforeUnmount } from 'vue'

export function useClickOutside(elRef, callback) {
  function handler(event) {
    const el = elRef.value
    if (el && !el.contains(event.target)) callback(event)
  }

  onMounted(() => {
    document.addEventListener('click', handler, true)
    document.addEventListener('focusin', handler, true)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', handler, true)
    document.removeEventListener('focusin', handler, true)
  })
}
