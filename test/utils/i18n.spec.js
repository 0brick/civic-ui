import { describe, it, expect, afterEach } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { mount as baseMount, DOMWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { configureI18n, resetI18n, t } from '../../src/utils/i18n.js'
import { configureLinks } from '../../src/utils/links.js'
import { en, de } from '../../src/locales/index.js'
import Navbar from '../../src/components/navigation/Navbar.vue'
import CookieConsent from '../../src/components/overlay/CookieConsent.vue'
import Carousel from '../../src/components/content/Carousel.vue'
import AppButton from '../../src/components/button/AppButton.vue'

const flatKeys = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' ? flatKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]))

function sources(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sources(path)
    return /\.(vue|js)$/.test(name) ? [path] : []
  })
}

// The catalog is reactive: unmount before resetting it, or a reset would
// re-render components whose DOM afterEach already cleared.
const mounted = []
const mount = (...args) => {
  const wrapper = baseMount(...args)
  mounted.push(wrapper)
  return wrapper
}

describe('i18n', () => {
  afterEach(() => {
    while (mounted.length) mounted.pop().unmount()
    resetI18n()
    document.body.innerHTML = ''
  })

  it('ships a complete German catalog', () => {
    expect(flatKeys(de).sort()).toEqual(flatKeys(en).sort())
  })

  it('has a catalog entry for every key the components use', () => {
    const keys = new Set(flatKeys(en))
    const used = []
    for (const file of sources(join(cwd(), 'src'))) {
      for (const m of readFileSync(file, 'utf8').matchAll(/\bt\(\s*['`]([a-zA-Z.]+)(\$\{[^}]+\})?['`]/g)) {
        if (!m[2]) used.push(m[1])
      }
    }
    expect(used.length).toBeGreaterThan(40)
    expect(used.filter((k) => !keys.has(k))).toEqual([])
  })

  it('interpolates placeholders and falls back to English', () => {
    expect(t('carousel.status', { current: 2, total: 5 })).toBe('Slide 2 of 5')
    configureI18n({ carousel: { status: 'Folie {current} von {total}' } })
    expect(t('carousel.status', { current: 2, total: 5 })).toBe('Folie 2 von 5')
    expect(t('carousel.next')).toBe('Next slide')
    expect(t('does.not.exist')).toBe('does.not.exist')
  })

  it('translates visible and screen-reader texts, reactively', async () => {
    const wrapper = mount(Navbar, { attachTo: document.body })
    expect(wrapper.find('.cui-navbar__toggle').attributes('aria-label')).toBe('Toggle navigation menu')
    configureI18n(de)
    await nextTick()
    expect(wrapper.find('.cui-navbar__toggle').attributes('aria-label')).toBe('Navigationsmenü öffnen')
    expect(wrapper.find('.cui-navbar__links--desktop').attributes('aria-label')).toBe('Hauptnavigation')
  })

  it('lets an instance prop win over the catalog', () => {
    configureI18n(de)
    mount(CookieConsent, { props: { modelValue: true, acceptLabel: 'Einverstanden' }, attachTo: document.body })
    const body = new DOMWrapper(document.body)
    expect(body.text()).toContain('Einverstanden')
    expect(body.text()).toContain('Nur notwendige')
  })

  it('translates live-region announcements', () => {
    configureI18n(de)
    const wrapper = mount(Carousel, { props: { slideCount: 2 }, slots: { default: '<div>a</div><div>b</div>' } })
    expect(wrapper.find('[aria-live="polite"]').text()).toBe('Folie 1 von 2')
  })

  it('keeps configureLinks({ newTabLabel }) working', () => {
    configureLinks({ newTabLabel: '(neues Fenster)' })
    const wrapper = mount(AppButton, { props: { href: 'https://x.example', newTab: true }, slots: { default: 'X' } })
    expect(wrapper.text()).toContain('(neues Fenster)')
  })

  it('rejects non-string texts', () => {
    expect(() => configureI18n({ navbar: { menu: 42 } })).toThrow(TypeError)
  })
})
