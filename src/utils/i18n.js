// Localization of the library's own UI texts: visible ones ("Learn more",
// "Accept all") and the screen-reader-only labels (navigation landmarks,
// icon-button names, live-region announcements). WCAG 3.1.2 (Language of
// Parts): on a German page those must be German too, or a screen reader
// reads English words with German pronunciation.
//
//   import { configureI18n } from 'civic-ui'
//   import { de } from 'civic-ui/locales'
//   configureI18n(de)                                   // whole catalog
//   configureI18n({ navbar: { menu: 'Navigation' } })   // or single texts
//
// The catalog is reactive, so calling it after mount re-renders. A
// component's own label prop (`menuLabel`, `acceptLabel`, …) still wins
// for that one instance.
import { reactive } from 'vue'
import en from '../locales/en.js'

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

const catalog = reactive(clone(en))

function merge(target, source, path) {
  for (const [key, value] of Object.entries(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue
    if (value && typeof value === 'object') {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {}
      merge(target[key], value, `${path}${key}.`)
    } else if (typeof value === 'string') {
      target[key] = value
    } else if (value != null) {
      throw new TypeError(`civic-ui: configureI18n() expects strings, got ${typeof value} for "${path}${key}"`)
    }
  }
}

/** Merges `messages` (a whole locale or just some texts) into the catalog. */
export function configureI18n(messages = {}) {
  if (!messages || typeof messages !== 'object') throw new TypeError('civic-ui: configureI18n() expects an object')
  merge(catalog, messages, '')
}

/** Back to the built-in English texts. */
export function resetI18n() {
  for (const key of Object.keys(catalog)) delete catalog[key]
  merge(catalog, en, '')
}

function lookup(source, key) {
  return key.split('.').reduce((node, part) => (node && Object.prototype.hasOwnProperty.call(node, part) ? node[part] : undefined), source)
}

/**
 * The text for `key` ("navbar.menu"), with `{name}` placeholders filled in
 * from `params`. Falls back to English, then to the key itself.
 */
export function t(key, params) {
  let text = lookup(catalog, key)
  if (typeof text !== 'string') text = lookup(en, key)
  if (typeof text !== 'string') return key
  return params ? text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match)) : text
}
