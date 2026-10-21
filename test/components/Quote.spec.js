import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Quote from '../../src/components/content/Quote.vue'
import TestimonialSection from '../../src/sections/TestimonialSection.vue'

describe('Quote', () => {
  it('renders figure > blockquote + figcaption', () => {
    const wrapper = mount(Quote, { props: { quote: 'Ein Satz.', name: 'Maria', role: 'Lehrerin' } })
    expect(wrapper.element.tagName).toBe('FIGURE')
    expect(wrapper.find('blockquote').text()).toBe('Ein Satz.')
    expect(wrapper.find('figcaption').text()).toContain('Maria')
  })

  it('takes the text from the default slot, and an appearance', () => {
    const wrapper = mount(Quote, { props: { appearance: 'border', name: 'M' }, slots: { default: '<p>Slot text</p>' } })
    expect(wrapper.find('blockquote p').text()).toBe('Slot text')
    expect(wrapper.classes()).toContain('cui-quote--border')
    expect(wrapper.find('.cui-quote__mark').exists()).toBe(false)
  })

  it('tints mark and rule with a theme color', () => {
    expect(mount(Quote, { props: { quote: 'q', color: 'secondary' } }).attributes('style')).toContain('--cui-quote-accent: #02767f')
  })

  it('is what TestimonialSection layout="feature" renders, appearance passed through', () => {
    const wrapper = mount(TestimonialSection, { props: { layout: 'feature', appearance: 'card', items: [{ quote: 'Q', name: 'N' }] } })
    const quote = wrapper.findComponent(Quote)
    expect(quote.exists()).toBe(true)
    expect(quote.props('appearance')).toBe('card')
    expect(quote.props('size')).toBe('lg')
  })
})
