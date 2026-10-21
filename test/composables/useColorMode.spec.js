import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  initColorMode,
  setColorMode,
  toggleColorMode,
  getColorMode,
  getResolvedColorMode,
  resetColorMode,
  useColorMode,
  _resetColorModeState
} from '../../src/composables/useColorMode.js'
import ColorModeToggle from '../../src/components/button/ColorModeToggle.vue'
import { applyPalette, generatePalette, resetPalette } from '../../src/utils/palette.js'

function mockSystem(dark) {
  const listeners = []
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: dark,
    addEventListener: (_, fn) => listeners.push(fn)
  }))
  return (next) => listeners.forEach((fn) => fn({ matches: next }))
}

// This jsdom setup has no origin, so window.localStorage is unavailable,
// install a minimal in-memory one.
function memoryStorage() {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    clear: () => data.clear()
  }
}
Object.defineProperty(window, 'localStorage', { value: memoryStorage(), configurable: true, writable: true })

const attr = () => document.documentElement.getAttribute('data-cui-mode')

beforeEach(() => {
  _resetColorModeState()
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-cui-mode')
  mockSystem(false)
})

describe('color mode', () => {
  it('defaults to light and writes the attribute', () => {
    expect(initColorMode()).toBe('light')
    expect(attr()).toBe('light')
  })

  it('uses the configured default when nothing is stored', () => {
    initColorMode({ default: 'auto' })
    expect(getColorMode()).toBe('auto')
    expect(attr()).toBe('auto')
  })

  it('a stored choice wins over the default', () => {
    window.localStorage.setItem('cui-color-mode', 'dark')
    initColorMode({ default: 'auto' })
    expect(attr()).toBe('dark')
  })

  it('ignores a garbage stored value', () => {
    window.localStorage.setItem('cui-color-mode', 'purple')
    expect(initColorMode()).toBe('light')
  })

  it('setColorMode persists and rejects unknown modes', () => {
    setColorMode('dark')
    expect(attr()).toBe('dark')
    expect(window.localStorage.getItem('cui-color-mode')).toBe('dark')
    expect(() => setColorMode('sepia')).toThrow(/unknown color mode/)
  })

  it('does not persist with persist: false', () => {
    initColorMode({ persist: false })
    setColorMode('dark')
    expect(window.localStorage.getItem('cui-color-mode')).toBeNull()
  })

  it('auto resolves against the OS setting and follows changes', () => {
    const emit = mockSystem(true)
    initColorMode({ default: 'auto' })
    const { resolved, isDark } = useColorMode()
    expect(getResolvedColorMode()).toBe('dark')
    expect(isDark.value).toBe(true)
    emit(false)
    expect(resolved.value).toBe('light')
  })

  it('toggle flips what is showing, even from auto', () => {
    mockSystem(true)
    initColorMode({ default: 'auto' })
    expect(toggleColorMode()).toBe('light')
    expect(toggleColorMode()).toBe('dark')
  })

  it('reset forgets the choice', () => {
    initColorMode({ default: 'auto' })
    setColorMode('dark')
    expect(resetColorMode()).toBe('auto')
    expect(window.localStorage.getItem('cui-color-mode')).toBeNull()
  })

  it('survives a throwing localStorage', () => {
    const spy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(initColorMode({ default: 'dark' })).toBe('dark')
    spy.mockRestore()
  })
})

describe('ColorModeToggle', () => {
  it('is a toggle button with a constant name and aria-pressed state', async () => {
    initColorMode()
    const wrapper = mount(ColorModeToggle)
    const btn = wrapper.get('button')
    expect(btn.attributes('aria-label')).toBe('Dark mode')
    expect(btn.attributes('aria-pressed')).toBe('false')
    await btn.trigger('click')
    expect(btn.attributes('aria-pressed')).toBe('true')
    expect(attr()).toBe('dark')
    expect(wrapper.emitted('change')[0]).toEqual(['dark'])
  })

  it('renders a visible label instead of aria-label with showLabel', () => {
    const wrapper = mount(ColorModeToggle, { props: { showLabel: true, label: 'Dunkelmodus' } })
    expect(wrapper.get('button').attributes('aria-label')).toBeUndefined()
    expect(wrapper.text()).toContain('Dunkelmodus')
  })
})

describe('applyPalette dark mode', () => {
  it('writes the dark and auto blocks for a configured palette', () => {
    applyPalette(generatePalette({ primary: '#0f2e22' }))
    const css = document.getElementById('civic-ui-theme-vars').textContent
    expect(css).toContain("[data-cui-mode='dark'] {")
    expect(css).toMatch(/@media \(prefers-color-scheme: dark\) \{\n {2}\[data-cui-mode='auto'\] \{/)
    resetPalette()
  })
})
