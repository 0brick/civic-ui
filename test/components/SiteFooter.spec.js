import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteFooter from '../../src/sections/SiteFooter.vue'

describe('SiteFooter', () => {
  it('marks the default navy footer as a dark band, so brand-slot links get on-dark colors', () => {
    const wrapper = mount(SiteFooter, { slots: { brand: '<a href="mailto:info@city.example">info@city.example</a>' } })
    expect(wrapper.attributes('data-cui-theme')).toBe('dark')
    expect(wrapper.attributes('style')).toContain('--cui-footer-theme-bg: #001d35')
  })

  it('takes a light theme without the dark marker', () => {
    const wrapper = mount(SiteFooter, { props: { background: 'light' } })
    expect(wrapper.attributes('data-cui-theme')).toBeUndefined()
    expect(wrapper.attributes('style')).toContain('--cui-footer-theme-heading: #001d35')
  })

  it('renders address, email and phone as a contact block with safe links', () => {
    const wrapper = mount(SiteFooter, { props: { address: ['Town Hall Square 1', '12345 Nordholm'], email: 'info@city.example', phone: '+49 351 123' } })
    const contact = wrapper.find('address.cui-footer__contact')
    expect(contact.text()).toContain('Town Hall Square 1')
    expect(contact.find('a[href="mailto:info@city.example"]').exists()).toBe(true)
    expect(contact.find('a[href="tel:+49351123"]').exists()).toBe(true)
    const smuggled = mount(SiteFooter, { props: { email: 'a@b.example?bcc=x@evil.example' } })
    expect(smuggled.find('.cui-footer__contact a').exists()).toBe(false)
  })
})

// From 900px up a collapsible footer's columns are plain blocks: a <summary>
// there was a tab stop whose Enter hid the links, with no way for a mouse to
// reopen them.
describe('SiteFooter collapsible columns', () => {
  const columns = [{ title: 'Services', links: [{ label: 'Parking', href: '/parking' }] }]
  const stubMatchMedia = (matches) => {
    const original = window.matchMedia
    window.matchMedia = (query) => ({ matches, media: query, addEventListener() {}, removeEventListener() {} })
    return () => (window.matchMedia = original)
  }

  it('renders <details>/<summary> with the heading inside on narrow screens', () => {
    const restore = stubMatchMedia(false)
    const wrapper = mount(SiteFooter, { props: { collapsible: true, columns, headingLevel: 2 } })
    expect(wrapper.find('details.cui-footer__col').attributes('open')).toBeDefined()
    expect(wrapper.find('summary h2').text()).toBe('Services')
    restore()
  })

  it('renders plain blocks with a heading, no summary, on wide screens', async () => {
    const restore = stubMatchMedia(true)
    const wrapper = mount(SiteFooter, { props: { collapsible: true, columns, headingLevel: 2 } })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('details').exists()).toBe(false)
    expect(wrapper.find('summary').exists()).toBe(false)
    expect(wrapper.find('div.cui-footer__col h2').text()).toBe('Services')
    expect(wrapper.find('div.cui-footer__col').attributes('open')).toBeUndefined()
    restore()
  })
})
