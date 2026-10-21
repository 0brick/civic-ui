// input bounds and double-submit protection on the forms that
// collect personal data.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TagInput from '../../src/components/forms/TagInput.vue'
import AppointmentSection from '../../src/sections/AppointmentSection.vue'
import NewsletterSection from '../../src/sections/NewsletterSection.vue'

afterEach(() => vi.useRealTimers())

describe('TagInput limits', () => {
  async function type(wrapper, value) {
    const input = wrapper.find('input')
    await input.setValue(value)
    await input.trigger('keydown', { key: 'Enter' })
  }

  it('rejects over-long tags, too many tags and invalid ones', async () => {
    const wrapper = mount(TagInput, { props: { modelValue: ['a'], maxLength: 5, maxTags: 1, validate: (v) => v !== 'bad' } })
    expect(wrapper.find('input').attributes('maxlength')).toBe('5')
    await type(wrapper, 'x'.repeat(100000))
    await type(wrapper, 'b')
    expect(wrapper.emitted('reject').map(([r]) => r.reason)).toEqual(['length', 'count'])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ maxTags: 0 })
    await type(wrapper, 'bad')
    expect(wrapper.emitted('reject')[2][0].reason).toBe('invalid')
  })
})

describe('AppointmentSection', () => {
  it('bounds every field', () => {
    const wrapper = mount(AppointmentSection, { props: { title: 'Book', zipPattern: '[0-9]{5}' } })
    for (const name of ['name', 'phone', 'email', 'street', 'houseNumber', 'zip', 'city', 'message']) {
      const el = wrapper.find(`[name="${name}"]`)
      expect(el.exists(), name).toBe(true)
      expect(el.attributes('maxlength'), name).toBeTruthy()
    }
    expect(wrapper.find('[name="zip"]').attributes('pattern')).toBe('[0-9]{5}')
  })

  it('emits submit once until the host reports progress or the cooldown ends', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AppointmentSection, { props: { title: 'Book' } })
    const form = wrapper.find('form')
    for (let i = 0; i < 20; i++) await form.trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(1)
    await wrapper.setProps({ status: 'sending' })
    await wrapper.setProps({ status: 'error' })
    await form.trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(2)
    vi.advanceTimersByTime(3000)
    await form.trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(3)
  })
})

describe('NewsletterSection', () => {
  it('has translatable labels and a submit cooldown', async () => {
    vi.useFakeTimers()
    const wrapper = mount(NewsletterSection, { props: { label: 'E-Mail-Adresse', submitLabel: 'Abonnieren' } })
    expect(wrapper.text()).toContain('E-Mail-Adresse')
    expect(wrapper.find('button').text()).toBe('Abonnieren')
    expect(wrapper.find('input').attributes('maxlength')).toBe('254')
    await wrapper.find('form').trigger('submit')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })
})
