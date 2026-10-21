import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from '../../src/components/content/Card.vue'

describe('Card', () => {
  it('renders a visible action label with → for internal and ↗ for external links', () => {
    const internal = mount(Card, { props: { title: 'T', href: '/more', actionLabel: 'Mehr erfahren' } })
    expect(internal.find('.cui-card__action').text()).toBe('Mehr erfahren→')
    const external = mount(Card, { props: { title: 'T', href: 'https://blaswerk.example', actionLabel: 'blaswerk.example' } })
    expect(external.find('.cui-card__action-icon').text()).toBe('↗')
    expect(mount(Card, { props: { title: 'T', actionLabel: 'x' } }).find('.cui-card__action').exists()).toBe(false)
  })

  it('draws an accent edge in a theme color', () => {
    const wrapper = mount(Card, { props: { title: 'T', accent: 'top', accentColor: 'secondary' } })
    expect(wrapper.classes()).toContain('cui-card--accent-top')
    expect(wrapper.attributes('style')).toContain('--cui-card-accent: #02767f')
    expect(mount(Card, { props: { title: 'T', accent: 'start', accentColor: 'url(x)' } }).attributes('style')).toContain('var(--cui-accent)')
  })

  it('takes a dark background theme and marks itself dark', () => {
    const wrapper = mount(Card, { props: { title: 'T', background: 'primary' } })
    expect(wrapper.classes()).toContain('cui-card--themed')
    expect(wrapper.attributes('data-cui-theme')).toBe('dark')
    expect(wrapper.attributes('style')).toContain('--cui-card-bg: #001d35')
  })

  it('renders number, heading level and the text prop in the grid layout', () => {
    const wrapper = mount(Card, { props: { title: 'Option', number: '01', headingLevel: 2, text: 'Plain text' } })
    expect(wrapper.find('.cui-card__number').text()).toBe('01')
    expect(wrapper.find('h2.cui-card__title').exists()).toBe(true)
    expect(wrapper.find('.cui-card__content').text()).toBe('Plain text')
    expect(mount(Card, { props: { title: 'T', text: 'prop' }, slots: { default: 'slot' } }).find('.cui-card__content').text()).toBe('slot')
  })
})

describe('Card layout="person"', () => {
  it('takes email and phone directly and renders safe contact links', () => {
    const wrapper = mount(Card, { props: { layout: 'person', title: 'Anna Example', subtitle: 'Chair', email: 'anna@association.example', phone: '0049 351 123 45' } })
    expect(wrapper.find('a[href="mailto:anna@association.example"]').exists()).toBe(true)
    expect(wrapper.find('a[href="tel:+4935112345"]').exists()).toBe(true)
  })

  it('shows labels in a definition list with showLabels', () => {
    const wrapper = mount(Card, { props: { layout: 'person', title: 'A', email: 'a@b.example', phone: '123', showLabels: true } })
    const dts = wrapper.findAll('.cui-card__contact dt').map((d) => d.text())
    expect(dts).toEqual(['Email', 'Phone'])
  })

  it('controls the avatar', () => {
    expect(mount(Card, { props: { layout: 'person', title: 'A B' } }).find('.cui-avatar').exists()).toBe(true)
    expect(mount(Card, { props: { layout: 'person', title: 'A B', avatar: 'none', media: '/a.jpg' } }).find('.cui-avatar').exists()).toBe(false)
    expect(mount(Card, { props: { layout: 'person', title: 'A B', avatar: 'auto' } }).find('.cui-avatar').exists()).toBe(false)
    expect(mount(Card, { props: { layout: 'person', title: 'A B', avatar: 'auto', media: '/a.jpg' } }).find('.cui-avatar').exists()).toBe(true)
  })

  // WCAG 4.1.1/4.1.2: a linked card is one <a>; no links inside it.
  it('a linked card renders contact and meta links as text, never nested <a>', () => {
    const wrapper = mount(Card, {
      props: { layout: 'person', title: 'Ada Lovelace', href: '/people/ada', email: 'ada@example.org', phone: '0351 123', meta: [{ label: 'Profile', href: '/x' }] }
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.element.querySelectorAll('a')).toHaveLength(0)
    expect(wrapper.text()).toContain('ada@example.org')
    expect(wrapper.text()).toContain('Profile')
  })

  it('an unlinked card keeps them as links', () => {
    const wrapper = mount(Card, { props: { layout: 'person', title: 'Ada Lovelace', email: 'ada@example.org', meta: [{ label: 'Profile', href: '/x' }] } })
    expect(wrapper.findAll('a').map((a) => a.attributes('href'))).toEqual(['mailto:ada@example.org', '/x'])
  })
})
