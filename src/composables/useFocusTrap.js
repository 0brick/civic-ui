// Shared focus-trap for Modal (all placements): moves keyboard
// focus into the dialog when it opens, keeps Tab/Shift+Tab cycling inside
// it while open (so the visually-hidden backdrop content isn't still
// keyboard-reachable despite `aria-modal="true"`), and restores focus to
// whatever element triggered the dialog once it closes.
import { watch, onBeforeUnmount, nextTick } from 'vue'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetWidth || el.offsetHeight || el === document.activeElement
  )
}

// `openRef` is a ref tracking whether the dialog is open. `containerRef` is
// a template ref to the dialog element itself (only present in the DOM
// while open, since these components render through a <teleport>).
export function useFocusTrap(openRef, containerRef) {
  let previouslyFocused = null

  function onKeydown(event) {
    if (event.key !== 'Tab') return
    const container = containerRef.value
    if (!container) return
    const focusable = focusableElements(container)
    if (!focusable.length) {
      event.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(
    openRef,
    (open) => {
      // SSR safety: this watcher's
      // `immediate: true` runs it synchronously during setup(), on both the
      // client and the server. `document` doesn't exist during SSR, so
      // without this guard *every* page that server-renders a Modal/
      // CookieConsent, open or closed, throws here and the whole render
      // crashes, regardless of the dialog's initial open state.
      if (typeof document === 'undefined') return
      if (open) {
        previouslyFocused = document.activeElement
        document.addEventListener('keydown', onKeydown, true)
        nextTick(() => {
          const container = containerRef.value
          if (!container) return
          const target = focusableElements(container)[0] ?? container
          target.focus()
        })
      } else {
        document.removeEventListener('keydown', onKeydown, true)
        if (previouslyFocused && document.contains(previouslyFocused)) {
          previouslyFocused.focus()
        }
        previouslyFocused = null
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (typeof document === 'undefined') return
    document.removeEventListener('keydown', onKeydown, true)
  })
}
