import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ScrollspyNav from '../../src/components/navigation/ScrollspyNav.vue'

const items = [
  { id: 'spy-a', label: 'A' },
  { id: 'spy-b', label: 'B' }
]

describe('ScrollspyNav', () => {
  beforeEach(() => {
    globalThis.IntersectionObserver = class {
      observe() {}
      disconnect() {}
    }
    document.body.innerHTML = '<section id="spy-a"></section><section id="spy-b" style="scroll-margin-top: 1px"></section>'
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps the default: plain, labelled "On this page", not sticky', () => {
    const wrapper = mount(ScrollspyNav, { props: { items } })
    expect(wrapper.attributes('aria-label')).toBe('On this page')
    expect(wrapper.classes()).toContain('cui-scrollspy--plain')
    expect(wrapper.classes()).not.toContain('cui-sticky')
    expect(wrapper.find('.cui-scrollspy__title').exists()).toBe(false)
  })

  it('shows a title that names the nav', () => {
    const wrapper = mount(ScrollspyNav, { props: { items, title: 'Inhalt' } })
    const title = wrapper.find('.cui-scrollspy__title')
    expect(title.text()).toBe('Inhalt')
    expect(wrapper.attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })

  it('applies appearance="card" and sticky', () => {
    const wrapper = mount(ScrollspyNav, { props: { items, appearance: 'card', sticky: true } })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['cui-scrollspy--card', 'cui-sticky']))
  })

  it('sets scroll-margin-top on the targets and restores it on unmount', () => {
    const wrapper = mount(ScrollspyNav, { props: { items, scrollOffset: '2rem' }, attachTo: document.body })
    expect(document.getElementById('spy-a').style.scrollMarginTop).toBe('2rem')
    expect(document.getElementById('spy-b').style.scrollMarginTop).toBe('2rem')
    wrapper.unmount()
    expect(document.getElementById('spy-a').style.scrollMarginTop).toBe('')
    expect(document.getElementById('spy-b').style.scrollMarginTop).toBe('1px')
  })

  it('leaves the targets alone without scrollOffset', () => {
    mount(ScrollspyNav, { props: { items } })
    expect(document.getElementById('spy-a').style.scrollMarginTop).toBe('')
  })
})
