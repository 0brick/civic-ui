import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TextInput from '../../src/components/forms/TextInput.vue'

describe('TextInput', () => {
  it('renders the modelValue and emits update:modelValue on input', async () => {
    const wrapper = mount(TextInput, { props: { modelValue: 'hello', label: 'Name' } })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('hello')

    await input.setValue('world')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['world'])
  })

  it('switches to a textarea when multiline is set', () => {
    const wrapper = mount(TextInput, { props: { multiline: true } })
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('wires aria-describedby to the error message when present', () => {
    const wrapper = mount(TextInput, { props: { error: 'Required field' } })
    const input = wrapper.find('input')
    const describedBy = input.attributes('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(wrapper.find(`#${describedBy}`).text()).toContain('Required field')
    expect(input.attributes('aria-invalid')).toBe('true')
  })

  it('puts non-prop attributes on the control, class/style on the wrapper', () => {
    const wrapper = mount(TextInput, { props: { label: 'Name' }, attrs: { name: 'name', maxlength: '80', class: 'extra' } })
    const input = wrapper.find('input')
    expect(input.attributes('name')).toBe('name')
    expect(input.attributes('maxlength')).toBe('80')
    expect(wrapper.classes()).toContain('extra')
    expect(wrapper.attributes('maxlength')).toBeUndefined()
  })

  it('renders a floating textarea when floating and multiline are combined', () => {
    const wrapper = mount(TextInput, { props: { label: 'Message', floating: true, multiline: true, rows: 3 } })
    expect(wrapper.find('textarea').attributes('rows')).toBe('3')
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('shows the hint, autocomplete and (once floated) the placeholder in floating mode', async () => {
    const wrapper = mount(TextInput, { props: { label: 'Code', floating: true, hint: '6 digits', autocomplete: 'one-time-code', placeholder: '123456' } })
    const input = wrapper.find('input')
    expect(wrapper.find('.cui-floating__hint').text()).toBe('6 digits')
    expect(input.attributes('aria-describedby')).toBe(wrapper.find('.cui-floating__hint').attributes('id'))
    expect(input.attributes('autocomplete')).toBe('one-time-code')
    expect(input.attributes('placeholder')).toBe(' ')
    await input.trigger('focus')
    expect(input.attributes('placeholder')).toBe('123456')
  })
})
