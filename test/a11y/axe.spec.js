// Runs axe-core (the engine behind axe DevTools and Lighthouse's
// accessibility audit) against every exported component and section,
// restricted to the WCAG 2.0/2.1/2.2 A + AA rule set: the bar
// docs/accessibility.md claims. Each component is mounted with realistic
// props (labels, links, content), the way it would actually ship on a page.
//
// Not covered here, by design: color-contrast (jsdom has no layout/paint,
// contrast is guaranteed by the palette engine instead, see
// test/utils/palette.spec.js) and page-level rules that only make sense for a
// whole document (landmarks, a single <h1>, page title).
import { describe, it, expect, afterEach } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import axe from 'axe-core'
import * as CivicUI from '../../src/index.js'

const link = (label = 'Services') => ({ label, href: '/services' })
const action = { label: 'Apply now', href: '/apply' }

// Realistic content per component. Anything not listed mounts with {} and
// a text default slot where one makes sense (see `slots` below).
const fixtures = {
  AppButton: { props: {}, slots: { default: 'Save changes' } },
  ButtonGroup: { slots: { default: () => [h(CivicUI.AppButton, null, () => 'One'), h(CivicUI.AppButton, null, () => 'Two')] } },
  Alert: { props: { title: 'Saved' }, slots: { default: 'Your changes were saved.' } },
  Badge: { slots: { default: 'New' } },
  StatusDot: { props: { label: 'Online' } },
  Toast: { props: { title: 'Saved' }, slots: { default: 'Done.' } },
  ProgressBar: { props: { value: 40, label: 'Upload progress' } },
  Breadcrumb: { props: { items: [link('Home'), link('Services'), { label: 'Parking permits' }] } },
  Pagination: { props: { modelValue: 2, total: 5 } },
  Tabs: { props: { tabs: [{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Details' }] } },
  Dropdown: { props: { label: 'Services' }, slots: { default: () => h('a', { href: '/a' }, 'Parking') } },
  ScrollspyNav: { props: { items: [{ id: 'intro', label: 'Introduction' }] } },
  LanguageSwitcher: {
    props: { languages: [{ code: 'en', label: 'English', href: '/en' }, { code: 'de', label: 'Deutsch', href: '/de' }], current: 'en' }
  },
  Navbar: { slots: { brand: () => h('a', { href: '/' }, 'City'), links: () => [h('a', { href: '/a' }, 'Services')] } },
  Sidebar: { props: { items: [{ label: 'Dashboard', href: '/', active: true }, { label: 'Reports', href: '/r' }] } },
  Modal: { props: { modelValue: true, title: 'Confirm' }, slots: { default: 'Are you sure?' } },
  Tooltip: { props: { text: 'More information' }, slots: { default: () => h('button', { type: 'button' }, 'Info') } },
  Popover: { props: { title: 'Help' }, slots: { trigger: () => h('button', { type: 'button' }, 'Help'), default: 'Details' } },
  CookieConsent: { props: { modelValue: true } },
  Card: { props: { title: 'Quick start', href: '/start' }, slots: { default: 'Get going.' } },
  Quote: { props: { quote: 'The best decision we made.', name: 'Jane Doe', role: 'Resident', appearance: 'border' } },
  DescriptionList: { props: { items: [{ term: 'IBAN', value: 'DE12 3456', copyable: true }, { term: 'Web', value: 'example.org', href: 'https://example.org' }] } },
  ConsentEmbed: { props: { provider: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'Concert recording', poster: 'poster.jpg', remember: true } },
  ImageGallery: { props: { images: [{ src: 'a.jpg', alt: 'Town hall' }, { src: 'b.jpg', alt: 'Park', caption: 'The new park' }] } },
  Lightbox: { props: { modelValue: true, images: [{ src: 'a.jpg', alt: 'Town hall', caption: 'Front' }, { src: 'b.jpg', alt: 'Park' }] } },
  Collapse: { props: { label: 'More details' }, slots: { default: 'Hidden content' } },
  ListGroup: { props: { items: [{ label: 'Profile', href: '/p' }, { label: 'Settings', href: '/s' }] } },
  Carousel: { props: { slideCount: 2, label: 'Highlights' }, slots: { default: () => [h('div', 'One'), h('div', 'Two')] } },
  Avatar: { props: { name: 'Ada Lovelace' } },
  SvgImage: { props: { src: '/logo.svg', alt: 'City logo' } },
  EmptyState: { props: { title: 'Nothing here', text: 'Try another search.' } },
  Timeline: { props: { items: [{ title: 'Submitted', date: '2026-01-01' }] } },
  StatCard: { props: { label: 'Visitors', value: 42 } },
  Toolbar: { props: { label: 'Filters' }, slots: { default: () => h('button', { type: 'button' }, 'Filter') } },
  DataTable: { props: { columns: [{ key: 'name', label: 'Name' }], rows: [{ name: 'Ada' }], caption: 'People' } },
  TextInput: { props: { label: 'Email', modelValue: '' } },
  InputGroup: { props: { label: 'Amount' } },
  Select: { props: { label: 'Department', options: [{ value: 'a', label: 'A' }] } },
  Checkbox: { props: { label: 'I agree' } },
  Radio: { props: { value: 'a', name: 'group', label: 'Option A' } },
  RadioGroup: { props: { legend: 'Contact by', options: [{ value: 'mail', label: 'Mail' }, { value: 'phone', label: 'Phone' }], hint: 'Pick one.' } },
  Switch: { props: { label: 'Notifications' } },
  RangeSlider: { props: { modelValue: 5, label: 'Budget' } },
  SearchField: { props: { label: 'Search' } },
  TagInput: { props: { label: 'Tags', modelValue: [] } },
  FileUpload: { props: { label: 'Attachment' } },
  AppShell: { slots: { default: 'Content' } },
  HeroSection: { props: { title: 'Welcome to the city', text: 'Services online.', primaryAction: action } },
  PageIntro: { props: { title: 'Parking permits', text: 'Apply online.' } },
  TopBar: { props: { utilityLinks: [link('Contact')] } },
  SiteHeader: { slots: { brand: () => h('a', { href: '/' }, 'City'), links: () => [h('a', { href: '/a' }, 'Services')] } },
  SiteFooter: { props: { columns: [{ title: 'Services', links: [link()] }], legalLinks: [link('Imprint')] } },
  AlertBanner: { props: { text: 'Office closed on Friday.' } },
  TeaserGrid: { props: { title: 'Topics', items: [{ title: 'Housing', href: '/h' }] } },
  CtaBanner: { props: { title: 'Ready?', action } },
  StatsSection: { props: { title: 'In numbers', stats: [{ value: '12', label: 'Offices' }] } },
  NewsletterSection: { props: { title: 'Newsletter' } },
  StepsSection: { props: { title: 'How it works', steps: [{ title: 'Apply' }, { title: 'Wait' }] } },
  TopicSlider: { props: { items: [{ title: 'Housing', text: 'Affordable homes.', href: '/h' }] } },
  FaqSection: { props: { title: 'FAQ', items: [{ question: 'Hours?', answer: '9-5' }] } },
  RelatedLinks: { props: { links: [link()] } },
  ListSection: { props: { title: 'News', items: [{ title: 'Budget passed', href: '/n' }] } },
  MediaTextSection: { props: { title: 'Our town hall', text: 'Open daily.' } },
  AppointmentSection: { props: { title: 'Book an appointment' } },
  TestimonialSection: { props: { title: 'Voices', items: [{ quote: 'Great.', name: 'A. Person' }] } },
  ColorModeToggle: {}
}

const RULES = {
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
  rules: {
    'color-contrast': { enabled: false }
  }
}

async function violations(el) {
  const result = await axe.run(el, RULES)
  return result.violations.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.html).join(' | ')}`)
}

describe('axe-core WCAG 2.2 AA', () => {
  let wrapper = null
  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    document.body.innerHTML = ''
  })

  const entries = Object.entries(CivicUI).filter(([, value]) => value && (value.render || value.setup))

  it('has a realistic fixture for every exported component', () => {
    const missing = entries.map(([name]) => name).filter((name) => !(name in fixtures) && name !== 'Accordion' && name !== 'AccordionItem' && name !== 'ToastContainer' && name !== 'Spinner' && name !== 'Placeholder' && name !== 'CloseButton' && name !== 'BackToTop' && name !== 'NotificationCenter')
    expect(missing).toEqual([])
  })

  for (const [name, Component] of entries) {
    it(`<${name}> has no WCAG A/AA violations`, async () => {
      const fx = fixtures[name] || {}
      wrapper =
        name === 'AccordionItem' || name === 'Accordion'
          ? mount(CivicUI.Accordion, {
              attachTo: document.body,
              slots: { default: () => h(CivicUI.AccordionItem, { title: 'Opening hours' }, () => 'Mon-Fri 9-5') }
            })
          : mount(Component, {
              attachTo: document.body,
              props: fx.props || {},
              slots: fx.slots || {},
              global: { stubs: { transition: false } }
            })
      await wrapper.vm.$nextTick()
      expect(await violations(document.body)).toEqual([])
    })
  }
})

// States and variants where accessible names/relations are easiest to lose.
const variants = [
  ['AppButton iconOnly', CivicUI.AppButton, { props: { iconOnly: true, icon: '/i.svg' }, slots: { default: 'Search' } }],
  ['AppButton as new-tab link', CivicUI.AppButton, { props: { href: 'https://example.org', newTab: true }, slots: { default: 'Partner' } }],
  ['TextInput with error', CivicUI.TextInput, { props: { label: 'Email', error: 'Enter a valid email', required: true } }],
  ['TextInput multiline', CivicUI.TextInput, { props: { label: 'Message', multiline: true } }],
  ['TextInput floating', CivicUI.TextInput, { props: { label: 'Name', floating: true } }],
  ['Select with error', CivicUI.Select, { props: { label: 'Office', error: 'Required', options: [{ value: 'a', label: 'A' }] } }],
  ['Card person', CivicUI.Card, { props: { layout: 'person', title: 'Ada Lovelace', subtitle: 'Mayor', meta: [{ label: 'ada@example.org', href: 'mailto:ada@example.org' }] } }],
  ['Card row', CivicUI.Card, { props: { layout: 'row', title: 'Budget passed', href: '/n', date: '2026-01-01', text: 'The council…' } }],
  ['Card download', CivicUI.Card, { props: { layout: 'download', title: 'Annual report', href: '/r.pdf', fileType: 'PDF', fileSize: '2 MB' } }],
  ['Modal without title', CivicUI.Modal, { props: { modelValue: true, ariaLabel: 'Filters' }, slots: { default: 'Content' } }],
  ['Tabs pills', CivicUI.Tabs, { props: { variant: 'pills', tabs: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] } }],
  ['SiteFooter social links', CivicUI.SiteFooter, { props: { socialLinks: [{ label: 'Mastodon', href: 'https://example.social', icon: 'mastodon' }] } }],
  ['HeroSection stage', CivicUI.HeroSection, { props: { title: 'Welcome', size: 'stage', background: 'navy', primaryAction: action } }],
  ['StepsSection chain', CivicUI.StepsSection, { props: { layout: 'chain', steps: [{ title: 'Apply', text: 'Online' }, { title: 'Receive' }] } }],
  ['CookieConsent non-modal', CivicUI.CookieConsent, { props: { modelValue: true, modal: false } }],
  ['Avatar with status', CivicUI.Avatar, { props: { name: 'Ada Lovelace', status: 'busy' } }],
  ['StatCard falling trend', CivicUI.StatCard, { props: { label: 'Visitors', value: '1,204', trend: -2.1 } }],
  ['DataTable with rowLink', CivicUI.DataTable, { props: { columns: [{ key: 'name', label: 'Name' }], rows: [{ id: 1, name: 'Ada' }], rowLink: (row) => `/people/${row.id}`, selectable: true } }],
  ['DataTable with row-click', CivicUI.DataTable, { props: { columns: [{ key: 'name', label: 'Name' }], rows: [{ id: 1, name: 'Ada' }], onRowClick: () => {} } }],
  ['Sidebar with active button item', CivicUI.Sidebar, { props: { items: [{ label: 'Inbox', active: true }, { label: 'Archive' }] } }],
  ['Modal bottom sheet', CivicUI.Modal, { props: { modelValue: true, placement: 'bottom', handle: true, ariaLabel: 'Filters' }, slots: { default: 'Content' } }],
  ['RadioGroup with error', CivicUI.RadioGroup, { props: { legend: 'Contact by', required: true, error: 'Choose one.', options: ['Mail', 'Phone'] } }],
  ['Checkbox with error', CivicUI.Checkbox, { props: { label: 'I agree', required: true, error: 'Please agree.' } }],
  ['Switch with hint', CivicUI.Switch, { props: { label: 'Notifications', hint: 'Sent by email.' } }],
  ['FileUpload with error', CivicUI.FileUpload, { props: { label: 'Attachment', error: 'Add a file.', required: true } }],
  ['TagInput without label, with tags', CivicUI.TagInput, { props: { modelValue: ['parks', 'roads'], hint: 'Press Enter to add.' } }],
  ['Card linked person with email', CivicUI.Card, { props: { layout: 'person', title: 'Ada Lovelace', href: '/people/ada', email: 'ada@example.org', meta: [{ label: 'Profile', href: '/x' }] } }],
  ['SiteFooter collapsible without legal links', CivicUI.SiteFooter, { props: { collapsible: true, columns: [{ title: 'Services', links: [link()] }] } }],
  ['StepsSection eyebrow only', CivicUI.StepsSection, { props: { eyebrow: 'How it works', steps: [{ title: 'Apply' }] } }],
  ['TopicSlider with title', CivicUI.TopicSlider, { props: { title: 'Topics', items: [{ title: 'Mobility', image: '/a.jpg' }] } }],
  ['Timeline headingLevel 2', CivicUI.Timeline, { props: { headingLevel: 2, items: [{ title: 'Founded', date: '1956' }] } }],
  ['Navbar dark sticky', CivicUI.Navbar, { props: { dark: true, sticky: true }, slots: { brand: () => h('a', { href: '/' }, 'City'), links: () => [h('a', { href: '/a' }, 'Services')] } }]
]

describe('axe-core WCAG 2.2 AA: variants', () => {
  let wrapper = null
  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    document.body.innerHTML = ''
  })

  for (const [label, Component, fx] of variants) {
    it(`${label} has no WCAG A/AA violations`, async () => {
      wrapper = mount(Component, { attachTo: document.body, props: fx.props, slots: fx.slots || {}, global: { stubs: { transition: false } } })
      await wrapper.vm.$nextTick()
      expect(await violations(document.body)).toEqual([])
    })
  }
})

// States that only break with more than one instance or after interaction.
describe('axe-core WCAG 2.2 AA: page states', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('two Tabs with the same tab ids produce no duplicate ids or dangling aria-controls', async () => {
    const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'details', label: 'Details' }]
    const a = mount(CivicUI.Tabs, { attachTo: document.body, props: { tabs } })
    const b = mount(CivicUI.Tabs, { attachTo: document.body, props: { tabs } })
    await a.vm.$nextTick()
    expect(await violations(document.body)).toEqual([])
    a.unmount()
    b.unmount()
  })

  it('NotificationCenter open with unread items', async () => {
    const wrapper = mount(CivicUI.NotificationCenter, {
      attachTo: document.body,
      props: { items: [{ id: 1, title: 'New reply', read: false }, { id: 2, title: 'Saved', read: true }] }
    })
    await wrapper.find('button').trigger('click')
    expect(await violations(document.body)).toEqual([])
    wrapper.unmount()
  })

  it('Tooltip shown on focus, its text wired as the trigger description', async () => {
    const wrapper = mount(CivicUI.Tooltip, {
      attachTo: document.body,
      props: { text: 'Extra context shown on hover' },
      slots: { default: () => h('button', { type: 'button' }, 'Info') }
    })
    const trigger = wrapper.find('button')
    await trigger.trigger('focusin')
    const tip = wrapper.find('[role="tooltip"]')
    expect(tip.isVisible()).toBe(true)
    expect(trigger.attributes('aria-describedby')).toBe(tip.attributes('id'))
    expect(await violations(document.body)).toEqual([])
    wrapper.unmount()
  })

  it('Dropdown with its menu open', async () => {
    const wrapper = mount(CivicUI.Dropdown, {
      attachTo: document.body,
      props: { label: 'Services', triggerVariant: 'chevron-label' },
      slots: { default: () => [h('a', { href: '/a' }, 'Parking'), h('a', { href: '/b' }, 'Permits')] }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(await violations(document.body)).toEqual([])
    wrapper.unmount()
  })

  it('Popover open', async () => {
    const wrapper = mount(CivicUI.Popover, {
      attachTo: document.body,
      props: { title: 'Help' },
      slots: { trigger: () => h('button', { type: 'button' }, 'Help'), default: 'Details' },
      global: { stubs: { transition: false } }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(await violations(document.body)).toEqual([])
    wrapper.unmount()
  })

  it('Accordion with a panel expanded', async () => {
    const wrapper = mount(CivicUI.Accordion, {
      attachTo: document.body,
      props: { headingLevel: 2 },
      slots: {
        default: () => [
          h(CivicUI.AccordionItem, { title: 'Opening hours' }, () => 'Mon-Fri 9-5'),
          h(CivicUI.AccordionItem, { title: 'Address' }, () => 'Town hall')
        ]
      }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(await violations(document.body)).toEqual([])
    wrapper.unmount()
  })

  it('ToastContainer showing a polite and an urgent toast', async () => {
    const wrapper = mount(CivicUI.ToastContainer, { attachTo: document.body, global: { stubs: { transition: false } } })
    const toast = CivicUI.useToast()
    toast.success('Saved.', { duration: 0 })
    toast.danger('Failed.')
    await wrapper.vm.$nextTick()
    expect(await violations(document.body)).toEqual([])
    toast.toasts.splice(0)
    wrapper.unmount()
  })
})
