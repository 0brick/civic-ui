// WCAG 4.1.1 / 4.1.2: per-instance ids, and aria-controls that always point
// at an existing panel.
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Tabs from '../../src/components/navigation/Tabs.vue'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' }
]
const slots = { overview: () => h('p', 'Overview content'), details: () => h('p', 'Details content') }

describe('Tabs ids and relations', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('every aria-controls points at an existing tabpanel labelled by its tab', () => {
    const wrapper = mount(Tabs, { props: { tabs }, slots, attachTo: document.body })
    for (const tab of wrapper.findAll('[role="tab"]')) {
      const panel = document.getElementById(tab.attributes('aria-controls'))
      expect(panel, tab.text()).not.toBeNull()
      expect(panel.getAttribute('role')).toBe('tabpanel')
      expect(panel.getAttribute('aria-labelledby')).toBe(tab.attributes('id'))
    }
  })

  it('only the active panel is shown and holds content', () => {
    const wrapper = mount(Tabs, { props: { tabs }, slots, attachTo: document.body })
    const [first, second] = wrapper.findAll('[role="tabpanel"]')
    expect(first.attributes('hidden')).toBeUndefined()
    expect(first.text()).toBe('Overview content')
    expect(first.attributes('tabindex')).toBe('0')
    expect(second.attributes('hidden')).toBeDefined()
    expect(second.text()).toBe('')
    expect(second.attributes('tabindex')).toBeUndefined()
  })

  it('switching tabs swaps the visible panel', async () => {
    const wrapper = mount(Tabs, { props: { tabs }, slots, attachTo: document.body, global: { stubs: { transition: false } } })
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    await nextTick()
    const [first, second] = wrapper.findAll('[role="tabpanel"]')
    expect(first.attributes('hidden')).toBeDefined()
    expect(second.attributes('hidden')).toBeUndefined()
    expect(second.text()).toBe('Details content')
  })

  it('two instances with the same tab ids produce no duplicate ids', () => {
    mount(Tabs, { props: { tabs }, slots, attachTo: document.body })
    mount(Tabs, { props: { tabs }, slots, attachTo: document.body })
    const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id)
    expect(ids.length).toBe(8)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
