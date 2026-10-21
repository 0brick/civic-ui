import { describe, it, expect, beforeEach } from 'vitest'
import { useCookieConsent, _resetCookieConsentForTests } from '../../src/composables/useCookieConsent.js'

const KEY = 'cui-cookie-consent'

// This jsdom setup has no origin, so window.localStorage is unavailable,
// same in-memory stand-in as useColorMode.spec.js.
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

describe('useCookieConsent', () => {
  beforeEach(() => {
    window.localStorage.clear()
    _resetCookieConsentForTests()
  })

  it('shares one state between instances on the page', () => {
    const a = useCookieConsent()
    const b = useCookieConsent()
    a.accept()
    b.reject()
    expect(a.consent.value).toBe('rejected')
  })

  it('stores a versioned, timestamped record', () => {
    useCookieConsent({ version: '2026-10' }).accept({ analytics: true, marketing: false })
    const record = JSON.parse(window.localStorage.getItem(KEY))
    expect(record).toMatchObject({ v: 1, status: 'accepted', version: '2026-10', categories: { analytics: true, marketing: false } })
    expect(typeof record.ts).toBe('number')
  })

  it('ignores a bare pre-set string, a different policy version and an expired record', () => {
    window.localStorage.setItem(KEY, 'accepted')
    expect(useCookieConsent().consent.value).toBeNull()

    _resetCookieConsentForTests()
    window.localStorage.setItem(KEY, JSON.stringify({ v: 1, status: 'accepted', version: 'old', ts: Date.now() }))
    expect(useCookieConsent({ version: 'new' }).consent.value).toBeNull()

    _resetCookieConsentForTests()
    window.localStorage.setItem(KEY, JSON.stringify({ v: 1, status: 'accepted', version: '', ts: Date.now() - 400 * 864e5 }))
    expect(useCookieConsent().consent.value).toBeNull()
  })

  it('answers per category', () => {
    const { accept, reject, hasConsent } = useCookieConsent()
    accept({ analytics: true, marketing: false })
    expect(hasConsent('analytics')).toBe(true)
    expect(hasConsent('marketing')).toBe(false)
    accept()
    expect(hasConsent('marketing')).toBe(true)
    reject()
    expect(hasConsent('analytics')).toBe(false)
  })

  it('still takes a plain storage key', () => {
    useCookieConsent('app-b').accept()
    expect(window.localStorage.getItem(KEY)).toBeNull()
    expect(JSON.parse(window.localStorage.getItem('app-b')).status).toBe('accepted')
  })
})
