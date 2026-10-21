// Renders every component the library exports with the minimum props it
// requires (see each component's `required: true` prop declarations) and
// asserts it mounts without throwing. This is a coverage floor, not a
// behavioral test suite: it exists to catch "this component is broken at
// import/render time" regressions across all ~64 exports at once.
import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { mount } from '@vue/test-utils'
import * as CivicUI from '../src/index.js'

const item = { label: 'Item', href: '#' }
const action = { label: 'Action', href: '#' }

// Minimal valid props for components that declare `required: true` props.
// Anything not listed here has no required props and mounts with `{}`.
const fixtures = {
  DataTable: { columns: [{ key: 'name', label: 'Name' }] },
  Select: { options: [{ value: 'a', label: 'A' }] },
  Breadcrumb: { items: [item] },
  LanguageSwitcher: { languages: [{ code: 'en', label: 'English', href: '#' }], current: 'en' },
  ScrollspyNav: { items: [{ id: 'a', label: 'A' }] },
  Tabs: { tabs: [{ id: 'a', label: 'A' }] },
  CtaBanner: { title: 'Title', action },
  RelatedLinks: { links: [item] },
  StatsSection: { stats: [{ value: '1', label: 'One' }] },
  StepsSection: { steps: [{ title: 'Step 1' }] },
  TeaserGrid: { title: 'Title', items: [item] },
  TestimonialSection: { items: [{ quote: 'Great.', name: 'A. Person' }] },
  TopicSlider: { items: [item] },
  Pagination: { modelValue: 1, total: 5 },
  Tooltip: { text: 'Tip' },
  EmptyState: { title: 'Nothing here' },
  SvgImage: { src: '/logo.svg' },
  StatCard: { label: 'Visitors', value: 42 },
  Collapse: { label: 'More' },
  RangeSlider: { modelValue: 5 },
  Carousel: { slideCount: 3 },
  Switch: { label: 'Enabled' },
  Radio: { value: 'a', name: 'group', label: 'Option A' },
  FaqSection: { title: 'FAQ' },
  AlertBanner: { text: 'Heads up' },
  AccordionItem: { title: 'Section' },
  AppointmentSection: { title: 'Book an appointment' },
  ListSection: { title: 'Listing' },
  HeroSection: { title: 'Welcome' }
}

describe('component library smoke tests', () => {
  const entries = Object.entries(CivicUI).filter(([, value]) => value && (value.render || value.setup || value.template))

  it('exports at least the documented set of components', () => {
    expect(entries.length).toBeGreaterThanOrEqual(60)
  })

  for (const [name, Component] of entries) {
    it(`mounts <${name}> without throwing`, () => {
      // AccordionItem reads its open/toggle state via provide/inject from a
      // parent <Accordion>: mounting it standalone isn't a supported usage.
      const wrapper = name === 'AccordionItem'
        ? mount(CivicUI.Accordion, { slots: { default: () => h(Component, fixtures[name] ?? {}) } })
        : mount(Component, {
            props: fixtures[name] ?? {},
            global: { stubs: { transition: false, teleport: true } }
          })
      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
    })
  }
})
