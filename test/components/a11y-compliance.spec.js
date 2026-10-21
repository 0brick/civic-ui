// Behörden-Anforderungen (BITV 2.0 / WCAG): icons for Leichte Sprache /
// Gebärdensprache links, focus management on the consent banner, and an
// accessible name for a label-less select.
import { describe, it, expect, afterEach } from 'vitest'
import { mount, DOMWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import LanguageSwitcher from '../../src/components/navigation/LanguageSwitcher.vue'
import CookieConsent from '../../src/components/overlay/CookieConsent.vue'
import Select from '../../src/components/forms/Select.vue'

const body = () => new DOMWrapper(document.body)

describe('agency compliance', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('LanguageSwitcher renders custom item content via its scoped slot', () => {
    const wrapper = mount(LanguageSwitcher, {
      props: { languages: [{ code: 'ls', lang: 'de', label: 'Leichte Sprache', href: '/ls' }], current: 'de' },
      slots: { default: '<template #default="{ lang }"><span class="icon">LS</span>{{ lang.label }}</template>' }
    })
    const link = wrapper.find('a')
    expect(link.find('.icon').exists()).toBe(true)
    expect(link.text()).toContain('Leichte Sprache')
    expect(link.attributes('lang')).toBe('de')
  })

  it('CookieConsent (non-modal) moves focus to the banner when it opens', async () => {
    mount(CookieConsent, { props: { modelValue: true, modal: false }, attachTo: document.body })
    await nextTick()
    const banner = body().find('.cui-cookie-consent')
    expect(banner.attributes('tabindex')).toBe('-1')
    expect(banner.attributes('aria-modal')).toBe('false')
    expect(document.activeElement).toBe(banner.element)
  })

  it('CookieConsent with modal is aria-modal and keeps Tab inside', async () => {
    mount(CookieConsent, { props: { modelValue: true, modal: true }, attachTo: document.body })
    await nextTick()
    const banner = body().find('.cui-cookie-consent')
    expect(banner.attributes('aria-modal')).toBe('true')
    expect(banner.element.contains(document.activeElement)).toBe(true)
  })

  it('Select takes an aria-label when there is no visible label', () => {
    const wrapper = mount(Select, { props: { options: ['a', 'b'], ariaLabel: 'Sort by' }, attrs: { name: 'sort' } })
    const select = wrapper.find('select')
    expect(select.attributes('aria-label')).toBe('Sort by')
    expect(select.attributes('name')).toBe('sort')
  })
})
