// Smaller accessibility fixes (audit chapter 3): text alternatives that were
// missing or doubled, ARIA state on menu toggles, the DataTable's loading and
// scroll states, RangeSlider's value text, reduced motion in BackToTop.
import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, DOMWrapper } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import RangeSlider from '../../src/components/forms/RangeSlider.vue'
import Avatar from '../../src/components/content/Avatar.vue'
import Card from '../../src/components/content/Card.vue'
import Quote from '../../src/components/content/Quote.vue'
import TestimonialSection from '../../src/sections/TestimonialSection.vue'
import Breadcrumb from '../../src/components/navigation/Breadcrumb.vue'
import Alert from '../../src/components/feedback/Alert.vue'
import Toast from '../../src/components/feedback/Toast.vue'
import Navbar from '../../src/components/navigation/Navbar.vue'
import AppShell from '../../src/layout/AppShell.vue'
import DataTable from '../../src/components/content/DataTable.vue'
import BackToTop from '../../src/components/navigation/BackToTop.vue'
import Dropdown from '../../src/components/navigation/Dropdown.vue'
import { configureI18n, resetI18n } from '../../src/utils/i18n'
import { de } from '../../src/locales/index.js'

const hiddenTexts = (wrapper) => wrapper.findAll('.cui-visually-hidden').map((n) => n.text())

describe('RangeSlider', () => {
  it('sets aria-valuetext and the readout from valueText (string or function)', () => {
    const fn = mount(RangeSlider, { props: { modelValue: 40, label: 'Share', valueText: (v) => `${v} %` } })
    expect(fn.find('input').attributes('aria-valuetext')).toBe('40 %')
    expect(fn.find('.cui-range__meta span').text()).toBe('40 %')

    const str = mount(RangeSlider, { props: { modelValue: 3, label: 'Rooms', valueText: '3 rooms' } })
    expect(str.find('input').attributes('aria-valuetext')).toBe('3 rooms')
  })

  it('omits aria-valuetext without valueText', () => {
    const wrapper = mount(RangeSlider, { props: { modelValue: 40, label: 'Volume' } })
    expect(wrapper.find('input').attributes('aria-valuetext')).toBeUndefined()
    expect(wrapper.find('.cui-range__meta span').text()).toBe('40')
  })

  it('does not divide by zero when max === min, and clamps the fill', () => {
    const fill = (props) => mount(RangeSlider, { props: { label: 'x', ...props } }).find('input').attributes('style')
    expect(fill({ modelValue: 5, min: 5, max: 5 })).toContain('--cui-range-fill: 0%')
    expect(fill({ modelValue: 150, min: 0, max: 100 })).toContain('--cui-range-fill: 100%')
    expect(fill({ modelValue: -10, min: 0, max: 100 })).toContain('--cui-range-fill: 0%')
  })
})

describe('Avatar name', () => {
  it('keeps the name when an unsafe src is dropped (initials shown)', () => {
    const wrapper = mount(Avatar, { props: { name: 'Ada Lovelace', src: 'javascript:alert(1)' } })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(hiddenTexts(wrapper)).toEqual(['Ada Lovelace'])
  })

  it('names the person once: via alt with an image, via hidden text without', () => {
    const img = mount(Avatar, { props: { name: 'Ada', src: '/ada.jpg' } })
    expect(img.find('img').attributes('alt')).toBe('Ada')
    expect(hiddenTexts(img)).toEqual([])
  })

  it('decorative: alt="" and no hidden name, the status is still said', () => {
    const img = mount(Avatar, { props: { name: 'Ada', src: '/ada.jpg', decorative: true, status: 'busy' } })
    expect(img.find('img').attributes('alt')).toBe('')
    expect(hiddenTexts(img)).toEqual(['Busy'])
    const initials = mount(Avatar, { props: { name: 'Ada', decorative: true } })
    expect(hiddenTexts(initials)).toEqual([])
  })

  it('Card person layout shows the name as text, so its avatar is decorative', () => {
    const wrapper = mount(Card, { props: { layout: 'person', title: 'Ada Lovelace', media: '/ada.jpg' } })
    expect(wrapper.find('.cui-avatar img').attributes('alt')).toBe('')
    expect(wrapper.find('.cui-card__name').text()).toBe('Ada Lovelace')
  })
})

describe('Dropdown user trigger', () => {
  it('names the account once: decorative avatar, name and role as text', () => {
    const wrapper = mount(Dropdown, { props: { triggerVariant: 'user', name: 'Anna Berger', role: 'Administrator', avatar: '/anna.jpg' } })
    const btn = wrapper.find('.cui-dropdown__trigger-btn--user')
    expect(btn.find('.cui-avatar img').attributes('alt')).toBe('')
    expect(btn.findAll('.cui-avatar .cui-visually-hidden')).toHaveLength(0)
    expect(btn.find('.cui-dropdown__user-info').text()).toBe('Anna BergerAdministrator')
  })

  it('narrow screens hide name and role visually, not with display:none', () => {
    const sfc = readFileSync(join(cwd(), 'src/components/navigation/Dropdown.vue'), 'utf8')
    const css = sfc.slice(sfc.indexOf('<style'))
    const rule = css.slice(css.indexOf('.cui-dropdown__user-info {'), css.indexOf('}', css.indexOf('.cui-dropdown__user-info {')))
    expect(rule).not.toMatch(/display: none/)
    expect(rule).toMatch(/clip: rect\(0, 0, 0, 0\)/)
  })
})

describe('Quote and TestimonialSection', () => {
  it('Quote: the avatar next to the name has alt=""', () => {
    const wrapper = mount(Quote, { props: { quote: 'Q', name: 'Maria', avatar: '/maria.jpg' } })
    expect(wrapper.find('.cui-quote__avatar').attributes('alt')).toBe('')
  })

  it('grid: the avatar next to the name is decorative', () => {
    const wrapper = mount(TestimonialSection, { props: { items: [{ quote: 'Q', name: 'Maria', avatar: '/maria.jpg', rating: 4 }] } })
    expect(wrapper.find('.cui-avatar img').attributes('alt')).toBe('')
  })

  it('shows stars only for a given rating', () => {
    const wrapper = mount(TestimonialSection, {
      props: { items: [{ quote: 'A', name: 'A', rating: 4 }, { quote: 'B', name: 'B' }] }
    })
    const cards = wrapper.findAll('.cui-testimonial-card')
    expect(cards[0].findAll('.cui-testimonial-card__stars svg[fill="currentColor"]')).toHaveLength(4)
    expect(cards[0].text()).toContain('4 out of 5 stars')
    expect(cards[1].find('.cui-testimonial-card__stars').exists()).toBe(false)
    expect(cards[1].text()).not.toContain('stars')
  })

  it('clamps an out-of-range rating so icons and text agree', () => {
    const wrapper = mount(TestimonialSection, { props: { items: [{ quote: 'A', name: 'A', rating: 9 }] } })
    expect(wrapper.text()).toContain('5 out of 5 stars')
  })
})

describe('Breadcrumb separators', () => {
  it('are aria-hidden spans between items, none after the last', () => {
    const wrapper = mount(Breadcrumb, {
      props: { items: [{ label: 'Home', href: '/' }, { label: 'Services', href: '/s' }, { label: 'Permits' }] }
    })
    const seps = wrapper.findAll('.cui-breadcrumb__sep')
    expect(seps).toHaveLength(2)
    for (const sep of seps) expect(sep.attributes('aria-hidden')).toBe('true')
    expect(wrapper.findAll('li').at(-1).find('.cui-breadcrumb__sep').exists()).toBe(false)
  })
})

describe('Alert and Toast say their variant', () => {
  afterEach(() => resetI18n())

  it('Alert: hidden prefix before the title, or before the text without one', () => {
    const titled = mount(Alert, { props: { variant: 'warning', title: 'Heads up' }, slots: { default: 'Body' } })
    expect(titled.find('.cui-alert__title').text()).toBe('Warning: Heads up')
    const plain = mount(Alert, { props: { variant: 'danger' }, slots: { default: 'Failed.' } })
    expect(plain.find('.cui-alert__text').text()).toBe('Error: Failed.')
  })

  it('Alert neutral has no prefix', () => {
    const wrapper = mount(Alert, { props: { variant: 'neutral' }, slots: { default: 'Note' } })
    expect(wrapper.find('.cui-visually-hidden').exists()).toBe(false)
  })

  it('Toast: same prefixes, localized', () => {
    configureI18n(de)
    const wrapper = mount(Toast, { props: { variant: 'success' }, slots: { default: 'Gespeichert.' } })
    expect(wrapper.find('.cui-toast__text').text()).toBe('Erfolg: Gespeichert.')
  })

  it('Toast with an unknown variant gets no prefix (not a raw key)', () => {
    const wrapper = mount(Toast, { props: { variant: 'custom' }, slots: { default: 'Hi' } })
    expect(wrapper.find('.cui-visually-hidden').exists()).toBe(false)
  })
})

describe('menu toggles', () => {
  const body = () => new DOMWrapper(document.body)
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('Navbar toggle: aria-controls points at the drawer it opens', async () => {
    const wrapper = mount(Navbar, { attachTo: document.body })
    const toggle = wrapper.find('.cui-navbar__toggle')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(toggle.attributes('aria-haspopup')).toBe('dialog')
    const id = toggle.attributes('aria-controls')
    expect(id).toBeTruthy()
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(body().find('[role="dialog"]').attributes('id')).toBe(id)
    wrapper.unmount()
  })

  it('AppShell menu button: aria-expanded, aria-haspopup and aria-controls', async () => {
    const wrapper = mount(AppShell, { attachTo: document.body })
    const toggle = wrapper.find('.cui-app-shell__menu-toggle')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(toggle.attributes('aria-haspopup')).toBe('dialog')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(body().find('[role="dialog"]').attributes('id')).toBe(toggle.attributes('aria-controls'))
    wrapper.unmount()
  })
})

describe('DataTable loading and scrolling', () => {
  const columns = [{ key: 'name', label: 'Name' }]
  const rows = [{ id: 1, name: 'Ada' }]

  it('marks the table busy and says "Loading…" in a live region that is always there', async () => {
    const wrapper = mount(DataTable, { props: { columns, rows } })
    const status = wrapper.find('[role="status"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toBe('')
    expect(wrapper.find('table').attributes('aria-busy')).toBeUndefined()

    await wrapper.setProps({ loading: true })
    expect(wrapper.find('table').attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[role="status"]').text()).toBe('Loading…')
  })

  it('the scroll wrapper is a focusable region named by the caption', () => {
    const wrapper = mount(DataTable, { props: { columns, rows, caption: 'Open tickets' } })
    const wrap = wrapper.find('.cui-table-wrap')
    expect(wrap.attributes('tabindex')).toBe('0')
    expect(wrap.attributes('role')).toBe('region')
    expect(wrapper.find(`#${wrap.attributes('aria-labelledby')}`).text()).toBe('Open tickets')
  })

  it('without a caption, the region gets a generic label', () => {
    const wrap = mount(DataTable, { props: { columns, rows } }).find('.cui-table-wrap')
    expect(wrap.attributes('aria-label')).toBe('Table')
  })

  it('a table that fits gets no extra tab stop, one that overflows does', async () => {
    let onResize = null
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb) {
          onResize = cb
        }
        observe() {}
        disconnect() {}
      }
    )
    try {
      // jsdom has no layout: scrollWidth === clientWidth === 0, i.e. "fits"
      const wrapper = mount(DataTable, { props: { columns, rows } })
      await wrapper.vm.$nextTick()
      const wrap = wrapper.find('.cui-table-wrap')
      expect(wrap.attributes('tabindex')).toBeUndefined()
      expect(wrap.attributes('role')).toBeUndefined()

      // the viewport shrinks, the table now overflows its wrapper
      Object.defineProperty(wrap.element, 'scrollWidth', { value: 900, configurable: true })
      Object.defineProperty(wrap.element, 'clientWidth', { value: 300, configurable: true })
      onResize()
      await wrapper.vm.$nextTick()
      expect(wrap.attributes('tabindex')).toBe('0')
      expect(wrap.attributes('role')).toBe('region')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('BackToTop and reduced motion', () => {
  afterEach(() => vi.restoreAllMocks())

  it.each([
    [true, 'auto'],
    [false, 'smooth']
  ])('prefers-reduced-motion %s scrolls with behavior %s', async (reduce, behavior) => {
    window.matchMedia = () => ({ matches: reduce })
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo
    window.scrollY = 1000
    const wrapper = mount(BackToTop)
    window.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    await wrapper.find('button').trigger('click')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior })
    wrapper.unmount()
  })
})
