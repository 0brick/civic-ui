// Shared body-scroll lock for Modal (all placements).
//
// Setting `overflow: hidden` on <body> removes the scrollbar, which shrinks
// the page width and shifts all fixed/centered content sideways: the
// visible "jump" when an overlay opens. We compensate by padding the body
// by exactly the scrollbar width so the content width never changes.
//
// Locks are reference-counted so that with two overlays open, closing one
// doesn't unlock scrolling out from under the other.
import { watch, onBeforeUnmount } from 'vue'

let lockCount = 0
let savedOverflow = ''
let savedPaddingRight = ''

function lock() {
  // SSR safety: a Modal/
  // CookieConsent whose `modelValue` starts `true` runs this synchronously
  // during setup() via the `immediate: true` watch below, including
  // server-side, where `window`/`document` don't exist. Without this guard
  // that crashes the whole SSR render instead of just skipping a
  // browser-only scrollbar-compensation effect that has no server
  // equivalent anyway.
  if (typeof document === 'undefined') return
  if (lockCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    savedOverflow = document.body.style.overflow
    savedPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      const currentPaddingRight = parseFloat(getComputedStyle(document.body).paddingRight) || 0
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`
    }
  }
  lockCount++
}

function unlock() {
  if (typeof document === 'undefined') return
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow
    document.body.style.paddingRight = savedPaddingRight
  }
}

// `openRef` is a ref/getter tracking whether the overlay using this lock is open.
export function useScrollLock(openRef) {
  let locked = false

  watch(
    openRef,
    (open) => {
      if (open && !locked) {
        lock()
        locked = true
      } else if (!open && locked) {
        unlock()
        locked = false
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (locked) {
      unlock()
      locked = false
    }
  })
}
