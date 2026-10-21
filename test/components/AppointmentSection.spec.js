import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppointmentSection from '../../src/sections/AppointmentSection.vue'

describe('AppointmentSection', () => {
  const nameField = (wrapper) => wrapper.find('input[autocomplete="name"]')
  const emailField = (wrapper) => wrapper.find('input[autocomplete="email"]')
  const privacyCheckbox = (wrapper) => wrapper.find('input[type="checkbox"]')

  it('clears the local form once the consuming app reports success', async () => {
    const wrapper = mount(AppointmentSection, { props: { title: 'Book', status: 'idle' } })

    await nameField(wrapper).setValue('Test Name')
    await emailField(wrapper).setValue('test@example.com')
    await privacyCheckbox(wrapper).setValue(true)
    expect(nameField(wrapper).element.value).toBe('Test Name')

    await wrapper.setProps({ status: 'success' })

    expect(nameField(wrapper).element.value).toBe('')
    expect(emailField(wrapper).element.value).toBe('')
    expect(privacyCheckbox(wrapper).element.checked).toBe(false)
  })

  it('does not clear the form while merely sending or on error', async () => {
    const wrapper = mount(AppointmentSection, { props: { title: 'Book', status: 'idle' } })
    await nameField(wrapper).setValue('Test Name')

    await wrapper.setProps({ status: 'sending' })
    expect(nameField(wrapper).element.value).toBe('Test Name')

    await wrapper.setProps({ status: 'error' })
    expect(nameField(wrapper).element.value).toBe('Test Name')
  })

  it('emits submit with the collected field values', async () => {
    const wrapper = mount(AppointmentSection, { props: { title: 'Book', status: 'idle' } })
    await nameField(wrapper).setValue('Test Name')
    await emailField(wrapper).setValue('test@example.com')
    await wrapper.find('form').trigger('submit')

    const payload = wrapper.emitted('submit')[0][0]
    expect(payload.name).toBe('Test Name')
    expect(payload.email).toBe('test@example.com')
  })
})

describe('AppointmentSection a11y', () => {
  it('keeps the status live region in the DOM before any message (WCAG 4.1.3)', async () => {
    const wrapper = mount(AppointmentSection, { props: { title: 'Book', status: 'idle' } })
    const region = wrapper.find('.cui-appointment__status')
    expect(region.exists()).toBe(true)
    expect(region.attributes('role')).toBe('status')
    expect(region.text()).toBe('')
    await wrapper.setProps({ status: 'error' })
    const sameRegion = wrapper.find('.cui-appointment__status')
    expect(sameRegion.element).toBe(region.element)
    expect(sameRegion.find('.cui-alert').exists()).toBe(true)
    // The Alert inside doesn't bring a second live role along.
    expect(sameRegion.find('.cui-alert').attributes('role')).toBeUndefined()
    await wrapper.setProps({ status: 'success' })
    expect(wrapper.find('.cui-appointment__status').element).toBe(region.element)
    expect(wrapper.find('.cui-appointment__status .cui-alert--success').exists()).toBe(true)
  })

  it('gives the house number no (wrong) autocomplete token (WCAG 1.3.5)', () => {
    const wrapper = mount(AppointmentSection, { props: { title: 'Book' } })
    expect(wrapper.find('input[name="houseNumber"]').attributes('autocomplete')).toBeUndefined()
    expect(wrapper.find('input[autocomplete="address-line2"]').exists()).toBe(false)
    expect(wrapper.find('input[name="street"]').attributes('autocomplete')).toBe('address-line1')
  })
})
