import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '../../src/components/content/EmptyState.vue'

describe('EmptyState', () => {
  it('defaults to h3, inbox icon, a div panel', () => {
    const wrapper = mount(EmptyState, { props: { title: 'Nothing here' } })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.find('h3').text()).toBe('Nothing here')
    expect(wrapper.find('.cui-empty-state__icon svg').exists()).toBe(true)
  })

  it('renders a built-in icon, or none', () => {
    const calendar = mount(EmptyState, { props: { title: 'T', icon: 'calendar' } })
    const inbox = mount(EmptyState, { props: { title: 'T' } })
    expect(calendar.find('svg').html()).not.toBe(inbox.find('svg').html())
    expect(mount(EmptyState, { props: { title: 'T', icon: 'none' } }).find('.cui-empty-state__icon').exists()).toBe(false)
  })

  it('lets the icon slot win over the icon prop', () => {
    const wrapper = mount(EmptyState, { props: { title: 'T', icon: 'none' }, slots: { icon: '<img alt="" src="x.svg">' } })
    expect(wrapper.find('.cui-empty-state__icon img').exists()).toBe(true)
  })

  it('sets the heading level', () => {
    expect(mount(EmptyState, { props: { title: 'T', headingLevel: 1 } }).find('h1').text()).toBe('T')
  })

  it('renders action as a link button before the slot content', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'T', action: { label: 'Home', href: '/start', newTab: true } },
      slots: { default: '<button class="extra">Reset</button>' }
    })
    const actions = wrapper.find('.cui-empty-state__actions')
    const link = actions.find('a')
    expect(link.text()).toContain('Home')
    expect(link.attributes('href')).toBe('/start')
    expect(link.attributes('target')).toBe('_blank')
    expect(actions.element.lastElementChild.classList.contains('extra')).toBe(true)
  })

  it('size="page" brings section and container', () => {
    const wrapper = mount(EmptyState, { props: { title: 'Not found', size: 'page', headingLevel: 1 } })
    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['cui-section', 'cui-empty-state--page']))
    expect(wrapper.find('.cui-container h1').exists()).toBe(true)
  })
})
