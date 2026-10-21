import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { configureLinks, linkAttrs } from '../../src/utils/links'
import AppButton from '../../src/components/button/AppButton.vue'
import Card from '../../src/components/content/Card.vue'
import SiteFooter from '../../src/sections/SiteFooter.vue'
import HeroSection from '../../src/sections/HeroSection.vue'

afterEach(() => configureLinks({ newTabLabel: '(opens in a new tab)' }))

describe('linkAttrs', () => {
  it('returns only a sanitized href by default', () => {
    expect(linkAttrs('javascript:alert(1)')).toEqual({ href: '#' })
  })

  it('adds target and a noopener rel for newTab', () => {
    expect(linkAttrs('https://example.org', true)).toEqual({
      href: 'https://example.org',
      target: '_blank',
      rel: 'noopener noreferrer'
    })
  })
})

describe('newTab links', () => {
  it('opens an AppButton link in a new tab with a screen-reader hint', () => {
    const wrapper = mount(AppButton, { props: { href: 'https://example.org', newTab: true }, slots: { default: 'Go' } })
    expect(wrapper.attributes('target')).toBe('_blank')
    expect(wrapper.attributes('rel')).toBe('noopener noreferrer')
    expect(wrapper.find('.cui-visually-hidden').text()).toContain('opens in a new tab')
  })

  it('ignores newTab on a native button', () => {
    const wrapper = mount(AppButton, { props: { newTab: true } })
    expect(wrapper.attributes('target')).toBeUndefined()
  })

  it('passes action.newTab through a section to its button', () => {
    const wrapper = mount(HeroSection, { props: { title: 'T', primaryAction: { label: 'Go', href: '/x', newTab: true } } })
    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('opens a Card link in a new tab', () => {
    const wrapper = mount(Card, { props: { href: '/doc.pdf', newTab: true, title: 'Doc' } })
    expect(wrapper.attributes('target')).toBe('_blank')
  })

  it('uses the configured hint text, also in aria-labels', () => {
    configureLinks({ newTabLabel: '(neuer Tab)' })
    const wrapper = mount(SiteFooter, {
      props: {
        legalLinks: [{ label: 'Imprint', href: '/imprint', newTab: true }],
        socialLinks: [{ label: 'Mastodon', href: 'https://example.social', icon: '', newTab: true }]
      }
    })
    const [social, legal] = wrapper.findAll('a')
    expect(social.attributes('aria-label')).toBe('Mastodon (neuer Tab)')
    expect(legal.text()).toContain('(neuer Tab)')
    expect(legal.attributes('rel')).toBe('noopener noreferrer')
  })
})

describe('mailtoHref / telHref', () => {
  it('links plain addresses and refuses parameter smuggling', async () => {
    const { mailtoHref, telHref } = await import('../../src/utils/links.js')
    expect(mailtoHref(' buergerbuero@amt.example ')).toBe('mailto:buergerbuero@amt.example')
    expect(mailtoHref('buergerbuero@amt.example?bcc=attacker@evil.example&body=IBAN')).toBeNull()
    expect(mailtoHref('not an address')).toBeNull()
    expect(telHref('+49 351 123 45-6')).toBe('tel:+49351123456')
    expect(telHref('0351?x=1&y')).toBe('tel:03511')
    expect(telHref('n/a')).toBeNull()
  })
})
