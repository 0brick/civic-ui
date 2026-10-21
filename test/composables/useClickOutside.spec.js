// WCAG 2.4.11/2.4.3: an open menu/popover closes when focus leaves it,
// not only on an outside click, and doesn't pull focus back when it does.
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Dropdown from '../../src/components/navigation/Dropdown.vue'
import Popover from '../../src/components/overlay/Popover.vue'

function page(component, slots) {
  return mount(
    { render: () => [h(component, null, slots), h('a', { href: '/footer', id: 'after' }, 'Footer link')] },
    { attachTo: document.body }
  )
}

describe('useClickOutside: focus leaving', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('Dropdown closes when Tab moves focus past its last item', async () => {
    const wrapper = page(Dropdown, {
      trigger: () => h('button', { type: 'button', id: 'trigger' }, 'Options'),
      default: () => [h('a', { href: '/a', id: 'item' }, 'Item')]
    })
    await wrapper.find('#trigger').trigger('click')
    expect(wrapper.find('#item').exists()).toBe(true)
    wrapper.find('#item').element.focus()
    const after = document.getElementById('after')
    after.focus()
    await nextTick()
    expect(wrapper.find('#item').exists()).toBe(false)
    expect(document.activeElement).toBe(after)
    wrapper.unmount()
  })

  it('Popover closes without stealing focus back to its trigger', async () => {
    const wrapper = page(Popover, {
      trigger: () => h('button', { type: 'button', id: 'trigger' }, 'Info'),
      default: () => h('a', { href: '/x', id: 'inner' }, 'More')
    })
    const trigger = wrapper.find('#trigger')
    trigger.element.focus()
    await trigger.trigger('click')
    expect(wrapper.find('.cui-popover').exists()).toBe(true)
    const after = document.getElementById('after')
    after.focus()
    await nextTick()
    expect(wrapper.find('.cui-popover').exists()).toBe(false)
    expect(document.activeElement).toBe(after)
    wrapper.unmount()
  })

  it('focus moving inside the popover keeps it open', async () => {
    const wrapper = page(Popover, {
      trigger: () => h('button', { type: 'button', id: 'trigger' }, 'Info'),
      default: () => h('a', { href: '/x', id: 'inner' }, 'More')
    })
    await wrapper.find('#trigger').trigger('click')
    wrapper.find('#inner').element.focus()
    await nextTick()
    expect(wrapper.find('.cui-popover').exists()).toBe(true)
    wrapper.unmount()
  })
})
