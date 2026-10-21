// Single, overridable choke point for every untrusted-data sink: raw HTML
// rendered via v-html and URLs bound to href, src or CSS url()
// (OWASP ASVS 5.0 V1.2/V1.3, BSI IT-Grundschutz APP.3.1).
// Hosts register their own sanitizer (DOMPurify, a backend allowlist) once
// via configureSecurity(). No dependency is bundled; the defaults below are
// conservative fallbacks.

import { sanitizeMarkup } from './sanitizeMarkup'

/* global process -- read only as `process.env.NODE_ENV`, which consumer bundlers replace */
const securityConfig = {
  sanitizeHtml: null,
  sanitizeUrl: null,
  sanitizeMediaUrl: null,
  allowedUrlSchemes: null,
  allowedMediaSchemes: null,
  referrerPolicy: 'strict-origin-when-cross-origin'
}
let securityLocked = false

const SANITIZER_KEYS = ['sanitizeHtml', 'sanitizeUrl', 'sanitizeMediaUrl']
const SCHEME_LIST_KEYS = ['allowedUrlSchemes', 'allowedMediaSchemes']

// Dev-only warnings: consumer bundlers replace process.env.NODE_ENV, so these
// drop out of a production build; without a `process` global they're off.
const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production'
const warned = new Set()
// Internal (not re-exported from index.js): components use it for dev hints.
export function warnOnce(key, message) {
  if (!isDev || warned.has(key)) return
  warned.add(key)
  console.warn(`[civic-ui] ${message}`)
}

/**
 * Registers custom sanitizers for every civic-ui component. Call once at
 * startup, e.g. `configureSecurity({ sanitizeHtml: (raw) => DOMPurify.sanitize(raw) })`.
 * Fails closed: a non-function sanitizer throws, `null` restores the default.
 * `allowedUrlSchemes` / `allowedMediaSchemes` replace the scheme allowlists.
 * `{ lock: true }` makes any later call throw.
 */
export function configureSecurity(options = {}, { lock = false } = {}) {
  if (securityLocked) throw new Error('[civic-ui] configureSecurity() is locked: it was called with { lock: true } earlier.')
  for (const key of SANITIZER_KEYS) {
    if (!(key in options)) continue
    const value = options[key]
    if (value !== null && value !== undefined && typeof value !== 'function') {
      throw new TypeError(`[civic-ui] configureSecurity: "${key}" must be a function or null, got ${typeof value}.`)
    }
    securityConfig[key] = value ?? null
  }
  for (const key of SCHEME_LIST_KEYS) {
    if (!(key in options)) continue
    const value = options[key]
    if (value === null || value === undefined) {
      securityConfig[key] = null
      continue
    }
    if (!Array.isArray(value) || !value.every((v) => typeof v === 'string' && /^[a-z][a-z0-9+.-]*:$/i.test(v))) {
      throw new TypeError(`[civic-ui] configureSecurity: "${key}" must be an array of schemes like "https:".`)
    }
    securityConfig[key] = Object.freeze(value.map((v) => v.toLowerCase()))
  }
  if ('referrerPolicy' in options) {
    const value = options.referrerPolicy ?? 'strict-origin-when-cross-origin'
    if (!REFERRER_POLICIES.includes(value)) throw new TypeError(`[civic-ui] configureSecurity: unknown referrerPolicy "${value}".`)
    securityConfig.referrerPolicy = value
  }
  if (lock) securityLocked = true
}

const REFERRER_POLICIES = [
  'no-referrer',
  'no-referrer-when-downgrade',
  'origin',
  'origin-when-cross-origin',
  'same-origin',
  'strict-origin',
  'strict-origin-when-cross-origin',
  'unsafe-url'
]

/**
 * security / privacy: the `referrerpolicy` every library <img>
 * carries, so an external image host gets at most the origin, never the full
 * page URL (with its path and query): independent of the server's
 * Referrer-Policy header. Set `configureSecurity({ referrerPolicy:
 * 'no-referrer' })` to send nothing at all.
 */
export function mediaReferrerPolicy() {
  return securityConfig.referrerPolicy
}

// Test-only escape hatch so a suite can lock and then reset configuration.
export function _resetSecurityForTests() {
  securityLocked = false
  for (const key of [...SANITIZER_KEYS, ...SCHEME_LIST_KEYS]) securityConfig[key] = null
  securityConfig.referrerPolicy = 'strict-origin-when-cross-origin'
}

/**
 * security (OWASP ASVS 5.0 1.3.1): the v-html choke point. Every icon-rendering
 * component calls this instead of binding v-html directly. The built-in
 * default (utils/sanitizeMarkup.js) is a strict SVG/icon allowlist: no
 * event handlers, scripts, links, `style` or external url(), so a CMS-fed
 * `<img src=x onerror=…>` renders inert out of the box. Registering
 * `sanitizeHtml` via `configureSecurity()` replaces it (e.g. DOMPurify for
 * richer markup, or a Trusted Types policy).
 */
export function sanitizeHtml(value) {
  if (typeof securityConfig.sanitizeHtml === 'function') return securityConfig.sanitizeHtml(value)
  if (typeof DOMParser === 'undefined' && typeof value === 'string' && value.trim() !== '') {
    warnOnce('sanitizeHtml-ssr', 'Icon markup was dropped: the built-in sanitizer needs a DOM. For SSR, register one via configureSecurity({ sanitizeHtml }).')
  }
  return sanitizeMarkup(value)
}

// security (OWASP ASVS 5.0 1.2.2): an allowlist, not a blocklist,
// besides the scriptable javascript:/vbscript:/data: URIs, a blocklist lets
// file:, intent: and OS protocol handlers (ms-msdt:, search-ms:, known
// attack vectors) through. Links default to the schemes a site actually
// links to; scheme-less values (relative paths, `#fragment`, `?query`,
// `//host/path`) always pass. Media sinks additionally allow blob: and
// data:image|video|audio previews, which never execute as script.
// Overridable via configureSecurity({ allowedUrlSchemes, allowedMediaSchemes }).
const DEFAULT_URL_SCHEMES = Object.freeze(['http:', 'https:', 'mailto:', 'tel:'])
const DEFAULT_MEDIA_SCHEMES = Object.freeze(['http:', 'https:', 'blob:'])
const MEDIA_DATA_RE = /^data:(image|video|audio)\//
// The scheme is detected on a control-character/whitespace-stripped,
// lower-cased copy, so `"java\tscript:..."` / leading-newline obfuscation
// (a documented javascript: URI filter bypass) can't slip past.
// eslint-disable-next-line no-control-regex -- deliberately strips C0/C1 control chars to defeat a documented javascript: URI obfuscation bypass (see comment above); written with \x escapes instead of raw bytes for readability
const CONTROL_OR_WHITESPACE_RE = /[\x00-\x20\x7f-\x9f]/g
const SCHEME_RE = /^([a-z][a-z0-9+.-]*:)/

function schemeOf(value) {
  const match = SCHEME_RE.exec(value.replace(CONTROL_OR_WHITESPACE_RE, '').toLowerCase())
  return match ? match[1] : null
}

function normalizedSchemeless(value) {
  return value.replace(CONTROL_OR_WHITESPACE_RE, '').toLowerCase()
}

// security: Vue stringifies whatever is bound to an attribute, so
// an array/URL/object from JSON (`href: ["javascript:…"]`) must be checked
// as the string it will become, not passed through unchecked. Returns
// null for values that can't be turned into a string.
function toUrlString(value) {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  try {
    const str = String(value)
    return typeof str === 'string' ? str : null
  } catch {
    return null
  }
}

/**
 * security (OWASP ASVS 5.0 1.2.2, href injection): guards
 * every `:href` binding fed by a data prop (nav items, footer links, card
 * actions, section CTAs, ...). Returns `#` for any scheme outside the
 * allowlist (http:, https:, mailto:, tel: by default) and for values that
 * aren't strings and don't stringify; scheme-less URLs pass unchanged.
 * `null`/`undefined`/`''` come back as-is (no attribute rendered). A
 * registered custom sanitizer always receives the normalized string.
 */
export function sanitizeUrl(value) {
  if (value === null || value === undefined || value === '') return value
  const url = toUrlString(value)
  if (url === null) return '#'
  if (typeof securityConfig.sanitizeUrl === 'function') return securityConfig.sanitizeUrl(url)
  const scheme = schemeOf(url)
  if (scheme === null) return url
  return (securityConfig.allowedUrlSchemes || DEFAULT_URL_SCHEMES).includes(scheme) ? url : '#'
}

/**
 * security: same guard as sanitizeUrl but for `src`-like sinks (img/video/
 * poster, CSS url()): allows blob: and data:image|video|audio, returns ''
 * (no request) for anything else outside the allowlist.
 */
export function sanitizeMediaUrl(value) {
  if (value === null || value === undefined || value === '') return value
  const url = toUrlString(value)
  if (url === null) return ''
  if (typeof securityConfig.sanitizeMediaUrl === 'function') return securityConfig.sanitizeMediaUrl(url)
  const scheme = schemeOf(url)
  if (scheme === null) return url
  if (scheme === 'data:') return MEDIA_DATA_RE.test(normalizedSchemeless(url)) ? url : ''
  return (securityConfig.allowedMediaSchemes || DEFAULT_MEDIA_SCHEMES).includes(scheme) ? url : ''
}

/**
 * security (OWASP ASVS 5.0 1.2.1, CSS injection): builds a `background-image:
 * url(...)` value from a developer/CMS-supplied path. Vue's `:style`
 * object binding already sets this through the CSSOM (one property
 * assignment, not string-spliced into `style.cssText`), so a `;`-based
 * declaration escape isn't reachable today: this additionally rejects
 * scriptable URL schemes and quotes+escapes the value so the same call
 * stays safe even if a future refactor ever concatenates it into a raw
 * stylesheet string.
 */
export function sanitizeCssUrl(value) {
  const safe = sanitizeMediaUrl(value)
  if (!safe) return 'none'
  const escaped = safe.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `url("${escaped}")`
}

/**
 * Own-property lookup for tables keyed by data (theme names, icon names), so
 * a key like 'constructor' can't resolve through Object.prototype
 * (OWASP ASVS 5.0 3.2.3).
 */
export function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}
