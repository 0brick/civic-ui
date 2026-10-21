// Persisted consent state for <CookieConsent>, which only emits events.
// Gate every tracker on this composable.
//
//   const { consent, accept, reject, hasConsent } = useCookieConsent({ version: '2026-10' })
//   <CookieConsent :model-value="consent === null" @accept="accept" @reject="reject" />
//   if (hasConsent('analytics')) loadAnalytics()
//
// security / GDPR:
// - One shared state per storage key, synced across tabs via `storage`.
// - Stored as versioned JSON ({ v, status, version, ts, categories }). A
//   record from another `version`, an expired or a malformed one counts as
//   undecided, so the banner asks again.
// - localStorage is shared per origin: apps under different paths should
//   pass their own `storageKey`.
import { ref } from 'vue'

const STORAGE_KEY = 'cui-cookie-consent'
const RECORD_VERSION = 1
const STATUSES = ['accepted', 'rejected']
const DAY = 24 * 60 * 60 * 1000

const stores = new Map()

function readRecord(storageKey) {
  try {
    return parseRecord(window.localStorage.getItem(storageKey))
  } catch {
    // localStorage can throw in private-browsing/locked-down environments,
    // fall back to in-memory-only state (re-asks every page load) instead
    // of breaking the page.
    return null
  }
}

function parseRecord(raw) {
  if (typeof raw !== 'string') return null
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (!data || typeof data !== 'object' || data.v !== RECORD_VERSION) return null
  if (!STATUSES.includes(data.status) || typeof data.ts !== 'number' || !Number.isFinite(data.ts)) return null
  const categories = sanitizeCategories(data.categories)
  return { status: data.status, version: typeof data.version === 'string' ? data.version : '', ts: data.ts, categories }
}

function sanitizeCategories(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const out = {}
  for (const [key, granted] of Object.entries(value)) {
    if (typeof granted === 'boolean' && key !== '__proto__') out[key] = granted
  }
  return out
}

function writeRecord(storageKey, record) {
  try {
    if (record === null) window.localStorage.removeItem(storageKey)
    else window.localStorage.setItem(storageKey, JSON.stringify({ v: RECORD_VERSION, ...record }))
  } catch {
    // Ignored: see readRecord().
  }
}

function isValid(record, { version, maxAgeDays }) {
  if (!record) return false
  if ((record.version || '') !== version) return false
  if (maxAgeDays > 0 && Date.now() - record.ts > maxAgeDays * DAY) return false
  return record.ts <= Date.now() + DAY // a timestamp from the future was not written by us
}

function storeFor(storageKey, options) {
  const id = `${storageKey}\u0000${options.version}\u0000${options.maxAgeDays}`
  if (stores.has(id)) return stores.get(id)
  const consent = ref(null)
  const categories = ref(null)
  const decidedAt = ref(null)

  function load() {
    const record = typeof window === 'undefined' ? null : readRecord(storageKey)
    const valid = isValid(record, options)
    consent.value = valid ? record.status : null
    categories.value = valid ? record.categories : null
    decidedAt.value = valid ? new Date(record.ts) : null
  }
  load()

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('storage', (event) => {
      if (event.key === storageKey || event.key === null) load()
    })
  }

  const store = { consent, categories, decidedAt, load }
  stores.set(id, store)
  return store
}

// `options` may also be a plain string, the storage key (older signature).
export function useCookieConsent(options = {}) {
  const opts = typeof options === 'string' ? { storageKey: options } : options || {}
  const storageKey = opts.storageKey || STORAGE_KEY
  const settings = {
    version: typeof opts.version === 'string' ? opts.version : '',
    maxAgeDays: typeof opts.maxAgeDays === 'number' ? opts.maxAgeDays : 365
  }
  const store = storeFor(storageKey, settings)

  function decide(status, categories) {
    const ts = Date.now()
    const cats = status === 'accepted' ? sanitizeCategories(categories) : null
    store.consent.value = status
    store.categories.value = cats
    store.decidedAt.value = new Date(ts)
    writeRecord(storageKey, { status, version: settings.version, ts, categories: cats })
  }

  // accept() with no argument grants everything; accept({ analytics: true,
  // marketing: false }) records a "customize" choice.
  function accept(categories = null) {
    decide('accepted', categories && typeof categories === 'object' ? categories : null)
  }
  function reject() {
    decide('rejected', null)
  }
  function reset() {
    store.consent.value = null
    store.categories.value = null
    store.decidedAt.value = null
    writeRecord(storageKey, null)
  }

  // True only for an accepted decision that covers `category`: every
  // category for a plain accept(), only the granted ones for a custom choice.
  function hasConsent(category) {
    if (store.consent.value !== 'accepted') return false
    if (!category || store.categories.value === null) return true
    return store.categories.value[category] === true
  }

  return {
    consent: store.consent,
    categories: store.categories,
    decidedAt: store.decidedAt,
    accept,
    reject,
    reset,
    hasConsent
  }
}

// ConsentEmbed's "always load from <provider>" choice is an ordinary consent
// record under this key, `provider` is 'youtube' | 'vimeo' | 'osm', or the
// embed URL's host for provider="iframe".
export function embedConsentKey(provider) {
  return `cui-consent-embed:${provider}`
}

// GDPR Art. 7(3): withdrawing must be as easy as consenting. Revokes a
// remembered ConsentEmbed load, e.g. from a privacy page; embeds of that
// provider on the page unload right away (they share the store).
export function revokeEmbedConsent(provider) {
  useCookieConsent({ storageKey: embedConsentKey(provider) }).reset()
}

// Test-only: forget the shared per-key state between test cases.
export function _resetCookieConsentForTests() {
  stores.clear()
}
