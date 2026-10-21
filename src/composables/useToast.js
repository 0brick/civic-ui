// Tiny global toast queue. Kept outside any component so `useToast()` works
// the same whether it's called from a page, a form handler, or a store,
// there's exactly one queue for the whole app, rendered by <ToastContainer>.
import { reactive } from 'vue'

let uid = 0
const toasts = reactive([])
// a11y (WCAG 2.2.1 Timing Adjustable): a toast that vanishes on its own is a
// time limit on reading it, and pausing on hover/focus alone doesn't satisfy
// 2.2.1 (a screen-reader user never hovers it). So:
// - `danger` and `warning` toasts stay until dismissed, unless the caller
//   passes a `duration` explicitly.
// - every other auto-closing toast lasts at least `minDuration` (10 s by
//   default), `configureToast()` sets app-wide defaults, e.g.
//   `configureToast({ duration: 0 })` from a "keep notifications open" user
//   setting turns auto-closing off entirely.
// `pause`/`resume` (wired to hover/focus in ToastContainer) still stop the
// clock while someone is reading: tracked outside `toasts` since it's timer
// bookkeeping, not render state.
const timers = new Map() // id -> { timeoutId, duration, startedAt, remaining }

const DEFAULTS = Object.freeze({ duration: 10000, minDuration: 10000 })
const STICKY_VARIANTS = ['danger', 'warning']
const config = { ...DEFAULTS }

// App-wide toast timing: `duration` (ms, 0 = never auto-close) for toasts
// that don't pass their own, and `minDuration` (ms), the floor every
// auto-closing toast is raised to. Returns the resulting settings.
// configureToast() with no argument restores the defaults.
export function configureToast(options) {
  if (options === undefined) {
    Object.assign(config, DEFAULTS)
    return { ...config }
  }
  for (const key of Object.keys(DEFAULTS)) {
    const value = options?.[key]
    if (value === undefined) continue
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      throw new TypeError(`civic-ui: configureToast() expects ${key} to be a number of milliseconds >= 0`)
    }
    config[key] = value
  }
  return { ...config }
}

function resolveDuration(variant, duration) {
  if (duration === undefined) duration = STICKY_VARIANTS.includes(variant) ? 0 : config.duration
  if (!(duration > 0)) return 0
  return Math.max(duration, config.minDuration)
}

function schedule(id, duration) {
  if (!(duration > 0)) return
  const timeoutId = setTimeout(() => dismiss(id), duration)
  timers.set(id, { timeoutId, duration, startedAt: Date.now(), remaining: duration })
}

function push(message, { variant = 'info', title = '', duration } = {}) {
  const id = ++uid
  toasts.push({ id, message, variant, title })
  schedule(id, resolveDuration(variant, duration))
  return id
}

function dismiss(id) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer.timeoutId)
    timers.delete(id)
  }
  const index = toasts.findIndex((t) => t.id === id)
  if (index !== -1) toasts.splice(index, 1)
}

function pause(id) {
  const timer = timers.get(id)
  if (!timer || timer.timeoutId === null) return
  clearTimeout(timer.timeoutId)
  timer.remaining -= Date.now() - timer.startedAt
  timer.timeoutId = null
}

function resume(id) {
  const timer = timers.get(id)
  if (!timer || timer.timeoutId !== null) return
  timer.startedAt = Date.now()
  timer.timeoutId = setTimeout(() => dismiss(id), Math.max(timer.remaining, 0))
}

export function useToast() {
  return {
    toasts,
    push,
    dismiss,
    pause,
    resume,
    success: (message, opts) => push(message, { ...opts, variant: 'success' }),
    danger: (message, opts) => push(message, { ...opts, variant: 'danger' }),
    warning: (message, opts) => push(message, { ...opts, variant: 'warning' }),
    info: (message, opts) => push(message, { ...opts, variant: 'info' })
  }
}
