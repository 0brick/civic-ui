// WCAG 1.3.1, 2.4.6: headings follow the page outline
// (`headingLevel`), no empty headings, named regions, no empty landmarks.
import { describe, it, expect, afterEach } from 'vitest'
import { mount, DOMWrapper } from '@vue/test-utils'
import { h } from 'vue'
import Modal from '../../src/components/overlay/Modal.vue'
import Accordion from '../../src/components/content/Accordion.vue'
import AccordionItem from '../../src/components/content/AccordionItem.vue'
import Timeline from '../../src/components/content/Timeline.vue'
import SiteFooter from '../../src/sections/SiteFooter.vue'
import TopicSlider from '../../src/sections/TopicSlider.vue'
import StepsSection from '../../src/sections/StepsSection.vue'

const columns = [{ title: 'Services', links: [{ label: 'Parking', href: '/p' }] }]

describe('heading levels and empty headings', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('Modal without a title renders no heading but keeps its close button', () => {
    mount(Modal, { props: { modelValue: true, ariaLabel: 'Image' }, attachTo: document.body })
    const body = new DOMWrapper(document.body)
    expect(body.find('h2').exists()).toBe(false)
    expect(body.find('.cui-modal__header button').exists()).toBe(true)
  })

  it('Accordion sets the heading level of its items; an item can override it', () => {
    const wrapper = mount(Accordion, {
      props: { headingLevel: 4 },
      slots: { default: () => [h(AccordionItem, { title: 'A' }, () => 'a'), h(AccordionItem, { title: 'B', headingLevel: 2 }, () => 'b')] }
    })
    const headings = wrapper.findAll('.cui-accordion-item__heading')
    expect(headings[0].element.tagName).toBe('H4')
    expect(headings[1].element.tagName).toBe('H2')
  })

  it('a lone AccordionItem defaults to h3', () => {
    expect(mount(AccordionItem, { props: { title: 'A' } }).find('h3').exists()).toBe(true)
  })

  it('AccordionItem names its region by its trigger', () => {
    const wrapper = mount(AccordionItem, { props: { title: 'Opening hours' } })
    const region = wrapper.find('[role="region"]')
    const trigger = wrapper.find('button')
    expect(region.attributes('aria-labelledby')).toBe(trigger.attributes('id'))
  })

  it('Timeline headingLevel', () => {
    const wrapper = mount(Timeline, { props: { headingLevel: 2, items: [{ title: 'Founded' }] } })
    expect(wrapper.find('h2.cui-timeline__title').text()).toBe('Founded')
  })

  it('SiteFooter headingLevel, also inside a collapsible summary', () => {
    expect(mount(SiteFooter, { props: { columns, headingLevel: 2 } }).find('h2').text()).toBe('Services')
    const collapsible = mount(SiteFooter, { props: { columns, collapsible: true } })
    expect(collapsible.find('summary h3').text()).toBe('Services')
  })

  it('SiteFooter renders no legal nav without legal links', () => {
    expect(mount(SiteFooter, { props: { columns } }).find('nav').exists()).toBe(false)
    expect(mount(SiteFooter, { props: { columns, legalLinks: [{ label: 'Imprint', href: '/i' }] } }).find('nav').exists()).toBe(true)
  })

  it('TopicSlider: optional h2 title names the section; slide titles follow headingLevel', () => {
    const items = [{ title: 'Mobility', image: '/a.jpg' }]
    const titled = mount(TopicSlider, { props: { items, title: 'Topics' } })
    const h2 = titled.find('h2')
    expect(h2.text()).toBe('Topics')
    expect(titled.find('section').attributes('aria-labelledby')).toBe(h2.attributes('id'))
    expect(titled.find('h3.cui-topic-slider__title').exists()).toBe(true)
    const level2 = mount(TopicSlider, { props: { items, headingLevel: 2 } })
    expect(level2.find('h2.cui-topic-slider__title').exists()).toBe(true)
    expect(level2.find('section').attributes('aria-labelledby')).toBeUndefined()
  })

  it('StepsSection with only an eyebrow renders no empty h2', () => {
    const wrapper = mount(StepsSection, { props: { eyebrow: 'How it works', steps: [{ title: 'Apply' }] } })
    expect(wrapper.find('h2').exists()).toBe(false)
  })
})
