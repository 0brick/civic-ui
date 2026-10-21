// hint and error texts tied to every form control,
// visible rejection messages, a name for TagInput, focus kept after removals.
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick, ref } from 'vue'
import Checkbox from '../../src/components/forms/Checkbox.vue'
import Radio from '../../src/components/forms/Radio.vue'
import RadioGroup from '../../src/components/forms/RadioGroup.vue'
import Switch from '../../src/components/forms/Switch.vue'
import FileUpload from '../../src/components/forms/FileUpload.vue'
import TagInput from '../../src/components/forms/TagInput.vue'
import AppointmentSection from '../../src/sections/AppointmentSection.vue'

const describedText = (wrapper, input) =>
  (input.attributes('aria-describedby') || '')
    .split(' ')
    .filter(Boolean)
    .map((id) => wrapper.find(`#${id}`).text())
    .join(' ')

describe('hint/error on choice controls', () => {
  for (const [name, Component, props] of [
    ['Checkbox', Checkbox, { label: 'I agree' }],
    ['Switch', Switch, { label: 'Notifications' }],
    ['Radio', Radio, { label: 'Mail', value: 'mail', name: 'contact' }]
  ]) {
    it(`${name}: hint is the description`, () => {
      const wrapper = mount(Component, { props: { ...props, hint: 'Shown on your profile.' } })
      const input = wrapper.find('input')
      expect(describedText(wrapper, input)).toBe('Shown on your profile.')
      expect(input.attributes('aria-invalid')).toBeUndefined()
    })

    it(`${name}: an error replaces the hint and marks the control invalid`, () => {
      const wrapper = mount(Component, { props: { ...props, hint: 'Hint', error: 'Required.' } })
      const input = wrapper.find('input')
      expect(describedText(wrapper, input)).toBe('Required.')
      expect(input.attributes('aria-invalid')).toBe('true')
      expect(wrapper.find(`#${input.attributes('aria-errormessage')}`).text()).toBe('Required.')
      expect(wrapper.text()).not.toContain('Hint')
    })
  }
})

describe('RadioGroup', () => {
  it('is a fieldset/radiogroup named by its legend, with hint and error', () => {
    const wrapper = mount(RadioGroup, { props: { legend: 'Contact by', options: ['Mail', 'Phone'], required: true, error: 'Choose one.' } })
    const group = wrapper.find('fieldset')
    expect(group.attributes('role')).toBe('radiogroup')
    expect(wrapper.find(`#${group.attributes('aria-labelledby')}`).text()).toContain('Contact by')
    expect(describedText(wrapper, group)).toBe('Choose one.')
    expect(group.attributes('aria-invalid')).toBe('true')
    expect(group.attributes('aria-required')).toBe('true')
    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios).toHaveLength(2)
    expect(radios[0].attributes('name')).toBe(radios[1].attributes('name'))
    expect(radios[0].attributes('aria-invalid')).toBe('true')
    expect(radios[0].attributes('required')).toBeDefined()
  })

  it('v-model through slotted Radios', async () => {
    const value = ref('a')
    const wrapper = mount({
      render: () =>
        h(RadioGroup, { legend: 'Pick', modelValue: value.value, 'onUpdate:modelValue': (v) => (value.value = v) }, () => [
          h(Radio, { value: 'a', label: 'A' }),
          h(Radio, { value: 'b', label: 'B' })
        ])
    })
    const [a, b] = wrapper.findAll('input')
    expect(a.element.checked).toBe(true)
    await b.trigger('change')
    expect(value.value).toBe('b')
    await nextTick()
    expect(wrapper.findAll('input')[1].element.checked).toBe(true)
  })
})

describe('FileUpload', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  const file = (name, type = 'text/plain', size = 10) => {
    const f = new File(['x'.repeat(size)], name, { type })
    return f
  }

  it('ties the error to the input', () => {
    const wrapper = mount(FileUpload, { props: { label: 'Attachment', error: 'Add a file.' } })
    const input = wrapper.find('input[type="file"]')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(describedText(wrapper, input)).toContain('Add a file.')
  })

  it('shows a rejected file with the reason in a live region that already existed', async () => {
    const wrapper = mount(FileUpload, { props: { label: 'Attachment', accept: '.pdf' } })
    const region = wrapper.find('[role="status"]')
    expect(region.exists()).toBe(true)
    expect(region.text()).toBe('')
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file('notes.txt')], configurable: true })
    await input.trigger('change')
    expect(wrapper.emitted('reject')[0][0][0].reason).toBe('type')
    expect(wrapper.find('[role="status"]').text()).toContain('notes.txt')
    expect(describedText(wrapper, input)).toContain('notes.txt')
  })

  it('showRejections: false leaves the message to the page', async () => {
    const wrapper = mount(FileUpload, { props: { label: 'Attachment', accept: '.pdf', showRejections: false } })
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file('notes.txt')], configurable: true })
    await input.trigger('change')
    expect(wrapper.find('[role="status"]').text()).toBe('')
  })

  it('moves focus to the next remove button, then to the file input', async () => {
    const files = ref([file('a.txt'), file('b.txt')])
    const wrapper = mount(
      { render: () => h(FileUpload, { label: 'Files', modelValue: files.value, 'onUpdate:modelValue': (v) => (files.value = v) }) },
      { attachTo: document.body }
    )
    let buttons = wrapper.findAll('.cui-file-upload__list button')
    buttons[0].element.focus()
    await buttons[0].trigger('click')
    await nextTick()
    buttons = wrapper.findAll('.cui-file-upload__list button')
    expect(buttons).toHaveLength(1)
    expect(document.activeElement).toBe(buttons[0].element)
    await buttons[0].trigger('click')
    await nextTick()
    expect(document.activeElement).toBe(wrapper.find('input[type="file"]').element)
    wrapper.unmount()
  })
})

describe('TagInput', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('always has an accessible name', () => {
    expect(mount(TagInput).find('input').attributes('aria-label')).toBe('Tags')
    expect(mount(TagInput, { props: { ariaLabel: 'Keywords' } }).find('input').attributes('aria-label')).toBe('Keywords')
    const labelled = mount(TagInput, { props: { label: 'Keywords' } })
    expect(labelled.find('input').attributes('aria-label')).toBeUndefined()
    expect(labelled.find('label').attributes('for')).toBe(labelled.find('input').attributes('id'))
  })

  it('renders the tags as a list', () => {
    const wrapper = mount(TagInput, { props: { modelValue: ['parks', 'roads'] } })
    expect(wrapper.findAll('ul > li')).toHaveLength(2)
  })

  it('ties hint and error to the field', () => {
    const wrapper = mount(TagInput, { props: { label: 'Tags', hint: 'Press Enter.' } })
    expect(describedText(wrapper, wrapper.find('input'))).toBe('Press Enter.')
    const invalid = mount(TagInput, { props: { label: 'Tags', error: 'Add one.' } })
    expect(invalid.find('input').attributes('aria-invalid')).toBe('true')
    expect(describedText(invalid, invalid.find('input'))).toBe('Add one.')
  })

  it('names a rejected tag and the reason on screen', async () => {
    const wrapper = mount(TagInput, { props: { label: 'Tags', maxTags: 1, modelValue: ['parks'] } })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    const input = wrapper.find('input')
    await input.setValue('roads')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('reject')[0][0].reason).toBe('count')
    expect(wrapper.find('[role="status"]').text()).toContain('roads')
    expect(wrapper.find('[role="status"]').text()).toContain('1')
  })

  it('keeps focus in the field after removing a tag with its × button', async () => {
    const tags = ref(['parks', 'roads'])
    const wrapper = mount(
      { render: () => h(TagInput, { label: 'Tags', modelValue: tags.value, 'onUpdate:modelValue': (v) => (tags.value = v) }) },
      { attachTo: document.body }
    )
    const remove = wrapper.find('li button')
    remove.element.focus()
    await remove.trigger('click')
    await nextTick()
    expect(tags.value).toEqual(['roads'])
    expect(document.activeElement).toBe(wrapper.find('input').element)
    wrapper.unmount()
  })
})

describe('AppointmentSection', () => {
  it('explains the asterisk before the first field', () => {
    const wrapper = mount(AppointmentSection, { props: { title: 'Book' } })
    const form = wrapper.find('form').element
    const hint = wrapper.find('.cui-appointment__required-hint').element
    const firstField = form.querySelector('input')
    expect(hint.textContent).toContain('*')
    expect(hint.compareDocumentPosition(firstField) & window.Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('keeps the submit button focusable while sending', () => {
    const wrapper = mount(AppointmentSection, { props: { title: 'Book', status: 'sending' } })
    const submit = wrapper.find('button[type="submit"]')
    expect(submit.attributes('disabled')).toBeUndefined()
    expect(submit.attributes('aria-disabled')).toBe('true')
  })
})
