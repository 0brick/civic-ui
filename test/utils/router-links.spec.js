// configureLinks({ linkComponent }): internal links navigate client-side
// through the router component everywhere.
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { configureLinks, defaultIsInternal, resolveLink } from '../../src/utils/links.js'
import AppButton from '../../src/components/button/AppButton.vue'
import Card from '../../src/components/content/Card.vue'
import SiteFooter from '../../src/sections/SiteFooter.vue'
import TeaserGrid from '../../src/sections/TeaserGrid.vue'
import ListGroup from '../../src/components/content/ListGroup.vue'
import RelatedLinks from '../../src/sections/RelatedLinks.vue'

const RouterLinkStub = defineComponent({
  name: 'RouterLinkStub',
  props: { to: { type: [String, Object], required: true } },
  setup: (props, { slots }) => () => h('a', { href: String(props.to), 'data-router': '' }, slots.default?.())
})

afterEach(() => configureLinks({ linkComponent: null, isInternal: null }))

describe('router links', () => {
  it('classifies internal hrefs', () => {
    for (const href of ['/contact', '/news?page=2', '/#team']) expect(defaultIsInternal(href), href).toBe(true)
    for (const href of ['//cdn.example/x', 'https://x.example/', 'mailto:a@b.de', '/downloads/bylaws.pdf', '#top']) expect(defaultIsInternal(href), href).toBe(false)
  })

  it('renders <a> without a configured link component', () => {
    expect(resolveLink('/contact').is).toBe('a')
    expect(mount(AppButton, { props: { href: '/contact' } }).element.tagName).toBe('A')
  })

  it('uses the configured component for internal links only', () => {
    configureLinks({ linkComponent: RouterLinkStub })
    const internal = mount(AppButton, { props: { href: '/contact' }, slots: { default: 'Contact' } })
    expect(internal.findComponent(RouterLinkStub).props('to')).toBe('/contact')
    expect(mount(AppButton, { props: { href: 'https://x.example' } }).findComponent(RouterLinkStub).exists()).toBe(false)
    expect(mount(AppButton, { props: { href: '/contact', newTab: true } }).findComponent(RouterLinkStub).exists()).toBe(false)
    expect(mount(AppButton, { props: { href: '/bylaws.pdf' } }).findComponent(RouterLinkStub).exists()).toBe(false)
  })

  it('reaches cards, teasers, footers, list groups and related links', () => {
    configureLinks({ linkComponent: RouterLinkStub })
    expect(mount(Card, { props: { title: 'T', href: '/a' } }).findComponent(RouterLinkStub).exists()).toBe(true)
    expect(mount(Card, { props: { title: 'T', href: '/a.pdf', layout: 'download' } }).findComponent(RouterLinkStub).exists()).toBe(false)
    const teasers = mount(TeaserGrid, { props: { title: 'T', items: [{ title: 'A', href: '/a' }, { title: 'B', href: 'https://b.example' }] } })
    expect(teasers.findAllComponents(RouterLinkStub)).toHaveLength(1)
    const footer = mount(SiteFooter, { props: { columns: [{ title: 'C', links: [{ label: 'Legal notice', href: '/legal-notice' }] }], legalLinks: [{ label: 'Privacy', href: '/privacy' }] } })
    expect(footer.findAllComponents(RouterLinkStub)).toHaveLength(2)
    const list = mount(ListGroup, { props: { items: [{ label: 'X', to: '/x' }, { label: 'Y', href: '/y' }] } })
    expect(list.findAllComponents(RouterLinkStub)).toHaveLength(2)
    const related = mount(RelatedLinks, { props: { links: [{ label: 'R', href: '/r' }] } })
    expect(related.findComponent(RouterLinkStub).exists()).toBe(true)
  })

  it('honors a custom isInternal', () => {
    configureLinks({ linkComponent: RouterLinkStub, isInternal: (href) => href.startsWith('/app/') })
    expect(resolveLink('/app/x').is).toBe(RouterLinkStub)
    expect(resolveLink('/other').is).toBe('a')
  })
})
