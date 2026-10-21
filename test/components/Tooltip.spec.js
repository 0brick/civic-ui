// WCAG 1.4.13 (hoverable, dismissible) and 1.3.1 / 4.1.2 (the hint is the
// trigger's accessible description).
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import Tooltip from '../../src/components/overlay/Tooltip.vue'
import Modal from '../../src/components/overlay/Modal.vue'

const button = () => h('button', { type: 'button' }, 'Info')

function escape(target = document.body) {
  target.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

describe('Tooltip', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('is always rendered (hidden while closed) and describes the trigger', async () => {
    const wrapper = mount(Tooltip, { props: { text: 'Extra context shown on hover' }, slots: { default: button }, attachTo: document.body })
    await nextTick()
    const tip = wrapper.find('[role="tooltip"]')
    expect(tip.exists()).toBe(true)
    expect(tip.isVisible()).toBe(false)
    expect(tip.attributes('id')).toMatch(/^cui-tooltip-\d+$/)
    expect(wrapper.find('button').attributes('aria-describedby')).toBe(tip.attributes('id'))
  })

  it('appends to an existing aria-describedby instead of replacing it', async () => {
    const wrapper = mount(Tooltip, {
      props: { text: 'Hint' },
      slots: { default: () => h('button', { type: 'button', 'aria-describedby': 'other' }, 'Info') },
      attachTo: document.body
    })
    await nextTick()
    const id = wrapper.find('[role="tooltip"]').attributes('id')
    expect(wrapper.find('button').attributes('aria-describedby')).toBe(`other ${id}`)
  })

  it('hands its id to the slot and does not wire it twice', async () => {
    const wrapper = mount(Tooltip, {
      props: { text: 'Hint' },
      slots: { default: ({ describedby }) => h('button', { type: 'button', 'aria-describedby': describedby }, 'Info') },
      attachTo: document.body
    })
    await nextTick()
    const id = wrapper.find('[role="tooltip"]').attributes('id')
    expect(wrapper.find('button').attributes('aria-describedby')).toBe(id)
  })

  it('stays open while the pointer is on the tooltip itself (it is inside the hover area)', async () => {
    const wrapper = mount(Tooltip, { props: { text: 'Hint' }, slots: { default: button }, attachTo: document.body })
    await wrapper.trigger('mouseenter')
    const tip = wrapper.find('[role="tooltip"]')
    expect(tip.isVisible()).toBe(true)
    // The tooltip is a child of the hover wrapper, and doesn't opt out of
    // pointer events: moving onto it never leaves the wrapper.
    expect(wrapper.element.contains(tip.element)).toBe(true)
    await wrapper.trigger('mouseleave')
    expect(tip.isVisible()).toBe(false)
  })

  it('opens on focus and closes on Escape without moving focus', async () => {
    const wrapper = mount(Tooltip, { props: { text: 'Hint' }, slots: { default: button }, attachTo: document.body })
    const trigger = wrapper.find('button').element
    trigger.focus()
    await wrapper.find('button').trigger('focusin')
    const tip = wrapper.find('[role="tooltip"]')
    expect(tip.isVisible()).toBe(true)
    escape(trigger)
    await nextTick()
    expect(tip.isVisible()).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on Escape while only hovered (focus elsewhere)', async () => {
    const wrapper = mount(Tooltip, { props: { text: 'Hint' }, slots: { default: button }, attachTo: document.body })
    await wrapper.trigger('mouseenter')
    escape()
    await nextTick()
    expect(wrapper.find('[role="tooltip"]').isVisible()).toBe(false)
    // A fresh hover shows it again.
    await wrapper.trigger('mouseleave')
    await wrapper.trigger('mouseenter')
    expect(wrapper.find('[role="tooltip"]').isVisible()).toBe(true)
  })

  it('keeps open while focus is on the trigger even after the pointer leaves', async () => {
    const wrapper = mount(Tooltip, { props: { text: 'Hint' }, slots: { default: button }, attachTo: document.body })
    await wrapper.find('button').trigger('focusin')
    await wrapper.trigger('mouseenter')
    await wrapper.trigger('mouseleave')
    expect(wrapper.find('[role="tooltip"]').isVisible()).toBe(true)
  })

  it('the first Escape closes only the tooltip, not a surrounding Modal', async () => {
    let open = true
    const wrapper = mount(Modal, {
      props: { modelValue: true, title: 'Dialog', 'onUpdate:modelValue': (v) => (open = v) },
      slots: { default: () => h(Tooltip, { text: 'Hint' }, { default: button }) },
      attachTo: document.body,
      global: { stubs: { transition: false } }
    })
    await nextTick()
    const trigger = document.querySelector('.cui-tooltip-wrap button')
    trigger.focus()
    trigger.dispatchEvent(new window.FocusEvent('focusin', { bubbles: true }))
    await nextTick()
    escape(trigger)
    await nextTick()
    expect(document.querySelector('[role="tooltip"]').style.display).toBe('none')
    expect(open).toBe(true)
    escape(trigger)
    await nextTick()
    expect(open).toBe(false)
    wrapper.unmount()
  })

  it('removes its document listener when unmounted', async () => {
    const wrapper = mount(Tooltip, { props: { text: 'Hint' }, slots: { default: button }, attachTo: document.body })
    await wrapper.trigger('mouseenter')
    wrapper.unmount()
    expect(() => escape()).not.toThrow()
  })
})
