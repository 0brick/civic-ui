import { describe, it, expect, afterEach } from 'vitest'
import { mount, DOMWrapper } from '@vue/test-utils'
import Modal from '../../src/components/overlay/Modal.vue'

// Modal renders through <teleport to="body">, so its content lands outside
// the mounted wrapper's own root: query the real document instead.
const body = () => new DOMWrapper(document.body)

describe('Modal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when closed', () => {
    mount(Modal, { props: { modelValue: false, title: 'Confirm' }, attachTo: document.body })
    expect(body().find('[role="dialog"]').exists()).toBe(false)
  })

  it('renders the dialog when open, with the title wired to aria-labelledby', () => {
    mount(Modal, { props: { modelValue: true, title: 'Confirm' }, attachTo: document.body })
    const dialog = body().find('[role="dialog"]')
    expect(dialog.exists()).toBe(true)
    const labelledBy = dialog.attributes('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(body().find(`#${labelledBy}`).text()).toBe('Confirm')
  })

  it('emits update:modelValue(false) when the backdrop is clicked', async () => {
    const wrapper = mount(Modal, {
      props: { modelValue: true, title: 'Confirm', closeOnBackdrop: true },
      attachTo: document.body
    })
    await body().find('.cui-modal-backdrop').trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
  })

  it('does not close on backdrop click when closeOnBackdrop is false', async () => {
    const wrapper = mount(Modal, {
      props: { modelValue: true, title: 'Confirm', closeOnBackdrop: false },
      attachTo: document.body
    })
    await body().find('.cui-modal-backdrop').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('aligns the footer via footerAlign', () => {
    mount(Modal, { props: { modelValue: true, title: 'T', footerAlign: 'stretch' }, slots: { footer: '<button>OK</button>' }, attachTo: document.body })
    expect(body().find('.cui-modal__footer').classes()).toContain('cui-modal__footer--stretch')
  })

  it('uses a single, placement-specific transition', () => {
    const wrapper = mount(Modal, { props: { modelValue: true, title: 'T', placement: 'end' }, attachTo: document.body })
    const names = wrapper.findAllComponents({ name: 'Transition' }).map((t) => t.props('name'))
    expect(names).toEqual(['cui-modal-end'])
  })

  // the bottom sheet's handle really is draggable.
  describe('sheet drag-to-dismiss', () => {
    const sheet = () => mount(Modal, { props: { modelValue: true, placement: 'bottom', handle: true, ariaLabel: 'Filters' }, attachTo: document.body })
    const pointer = (el, type, clientY) => el.dispatchEvent(new window.MouseEvent(type, { bubbles: true, clientY, button: 0 }))

    it('closes after dragging the handle down far enough, without a second close from the click', async () => {
      const wrapper = sheet()
      const handle = body().find('.cui-modal__handle').element
      pointer(handle, 'pointerdown', 100)
      pointer(handle, 'pointermove', 220)
      await wrapper.vm.$nextTick()
      expect(body().find('.cui-modal').attributes('style')).toContain('--cui-sheet-drag: 120px')
      pointer(handle, 'pointerup', 220)
      handle.click()
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    })

    it('springs back after a short drag and stays open', async () => {
      const wrapper = sheet()
      const handle = body().find('.cui-modal__handle').element
      pointer(handle, 'pointerdown', 100)
      pointer(handle, 'pointermove', 130)
      pointer(handle, 'pointerup', 130)
      handle.click()
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(body().find('.cui-modal').attributes('style') || '').not.toContain('--cui-sheet-drag')
    })

    it('a plain tap (or Enter/Space) on the handle still closes', () => {
      const wrapper = sheet()
      body().find('.cui-modal__handle').element.click()
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    })
  })
})
