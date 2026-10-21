// WCAG 1.3.1 / 4.1.2: the active entry is announced, not only highlighted.
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Sidebar from '../../src/components/navigation/Sidebar.vue'

describe('Sidebar active item', () => {
  it('sets aria-current="page" on the active link only', () => {
    const wrapper = mount(Sidebar, { props: { items: [{ label: 'Dashboard', href: '/', active: true }, { label: 'Reports', href: '/r' }] } })
    const [active, other] = wrapper.findAll('a')
    expect(active.attributes('aria-current')).toBe('page')
    expect(other.attributes('aria-current')).toBeUndefined()
  })

  it('sets aria-current="true" on an active button item', () => {
    const wrapper = mount(Sidebar, { props: { items: [{ label: 'Inbox', active: true }, { label: 'Archive' }] } })
    const [active, other] = wrapper.findAll('button')
    expect(active.attributes('aria-current')).toBe('true')
    expect(other.attributes('aria-current')).toBeUndefined()
  })

  // a button item without href does something; it emits `select`.
  it('emits select with the clicked item', async () => {
    const items = [{ label: 'Inbox', id: 'inbox' }, { label: 'Archive', id: 'archive' }]
    const wrapper = mount(Sidebar, { props: { items } })
    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('select')).toEqual([[items[1]]])
  })
})
