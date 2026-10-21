// Page-wide light/dark color mode (docs/theming.md → Dark and light mode).
//
// The CSS side is plain attributes on <html> (src/styles/tokens.css):
//   data-cui-mode="light" | "dark" | "auto"   ("auto" follows prefers-color-scheme)
// This module only manages that attribute: remembers the visitor's choice in
// localStorage, and exposes one shared reactive state so every
// <ColorModeToggle> / useColorMode() caller on the page agrees.
//
// Usage:
//   // main.js: once, before mount (or pass { colorMode } to app.use(CivicUI))
//   initColorMode({ default: 'auto' })
//   // anywhere
//   const { mode, resolved, setMode, toggle } = useColorMode()
import { ref, computed, readonly } from 'vue'

export const COLOR_MODES = Object.freeze(['light', 'dark', 'auto'])
const STORAGE_KEY = 'cui-color-mode'
const ATTR = 'data-cui-mode'

const config = { default: 'light', storageKey: STORAGE_KEY, persist: true }
const mode = ref('light')
const systemDark = ref(false)
let mediaQuery = null
let initialized = false

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

function readStored() {
  try {
    const value = window.localStorage.getItem(config.storageKey)
    return COLOR_MODES.includes(value) ? value : null
  } catch {
    // localStorage can throw (private mode, blocked storage): fall back to
    // the configured default for this page view instead of breaking.
    return null
  }
}

function writeStored(value) {
  if (!config.persist) return
  try {
    if (value === null) window.localStorage.removeItem(config.storageKey)
    else window.localStorage.setItem(config.storageKey, value)
  } catch {
    // Ignored: see readStored().
  }
}

function applyAttribute() {
  if (!isBrowser()) return
  document.documentElement.setAttribute(ATTR, mode.value)
}

function watchSystem() {
  if (mediaQuery || !isBrowser() || typeof window.matchMedia !== 'function') return
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = mediaQuery.matches
  const onChange = (e) => {
    systemDark.value = e.matches
  }
  if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', onChange)
  else if (mediaQuery.addListener) mediaQuery.addListener(onChange)
}

/**
 * Reads the stored choice (or `options.default`), writes the attribute and
 * starts following the OS setting. Safe to call more than once: the last
 * call's options win. Returns the active mode.
 */
export function initColorMode(options = {}) {
  if (options.default !== undefined) {
    if (!COLOR_MODES.includes(options.default)) {
      throw new Error(`civic-ui: unknown color mode "${options.default}": choose one of ${COLOR_MODES.join(', ')}`)
    }
    config.default = options.default
  }
  if (options.storageKey) config.storageKey = options.storageKey
  if (options.persist !== undefined) config.persist = !!options.persist
  initialized = true
  if (!isBrowser()) {
    mode.value = config.default
    return mode.value
  }
  mode.value = readStored() || config.default
  watchSystem()
  applyAttribute()
  return mode.value
}

function ensureInit() {
  if (!initialized) initColorMode()
}

/** The chosen mode: 'light' | 'dark' | 'auto'. */
export function getColorMode() {
  ensureInit()
  return mode.value
}

/** What is actually showing: 'light' | 'dark' ('auto' resolved against the OS). */
export function getResolvedColorMode() {
  ensureInit()
  if (mode.value === 'auto') return systemDark.value ? 'dark' : 'light'
  return mode.value
}

/** Switches the page to `next` and remembers it. */
export function setColorMode(next) {
  if (!COLOR_MODES.includes(next)) {
    throw new Error(`civic-ui: unknown color mode "${next}": choose one of ${COLOR_MODES.join(', ')}`)
  }
  ensureInit()
  mode.value = next
  writeStored(next)
  applyAttribute()
  return next
}

/**
 * Flips between light and dark based on what is *showing*, so on an 'auto'
 * page that currently renders dark, the first toggle goes to light.
 */
export function toggleColorMode() {
  return setColorMode(getResolvedColorMode() === 'dark' ? 'light' : 'dark')
}

/** Forgets the stored choice and goes back to the configured default. */
export function resetColorMode() {
  ensureInit()
  writeStored(null)
  mode.value = config.default
  applyAttribute()
  return mode.value
}

export function useColorMode() {
  ensureInit()
  return {
    mode: readonly(mode),
    resolved: computed(() => (mode.value === 'auto' ? (systemDark.value ? 'dark' : 'light') : mode.value)),
    isDark: computed(() => (mode.value === 'auto' ? systemDark.value : mode.value === 'dark')),
    setMode: setColorMode,
    toggle: toggleColorMode,
    reset: resetColorMode
  }
}

// Test hook: forget module state between tests.
export function _resetColorModeState() {
  config.default = 'light'
  config.storageKey = STORAGE_KEY
  config.persist = true
  mode.value = 'light'
  systemDark.value = false
  mediaQuery = null
  initialized = false
}
