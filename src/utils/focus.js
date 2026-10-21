// Move keyboard focus to a target given as an element or a CSS selector,
// used where the control that had focus disappears (a dismissed Alert, the
// BackToTop button fading out). An element that isn't focusable on its own
// (<main>, a heading) gets tabindex="-1" first: focusable by script, but no
// extra Tab stop. Returns whether focus landed.
const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]'

export function resolveElement(target) {
  if (!target || typeof document === 'undefined') return null
  if (typeof target !== 'string') return typeof target.focus === 'function' ? target : null
  try {
    return document.querySelector(target)
  } catch {
    return null // invalid selector
  }
}

export function focusElement(target, options) {
  const el = resolveElement(target)
  if (!el) return false
  if (!el.matches(FOCUSABLE)) el.setAttribute('tabindex', '-1')
  el.focus(options)
  return document.activeElement === el
}
