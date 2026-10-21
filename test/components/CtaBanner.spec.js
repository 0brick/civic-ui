import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CtaBanner from '../../src/sections/CtaBanner.vue'

const action = { label: 'Donate', href: '/donate' }
const variantOf = (background) => mount(CtaBanner, { props: { title: 'Support us', action, background } }).find('.cui-btn').classes()

describe('CtaBanner', () => {
  it('uses the light accent button on dark themes, by legacy name or role name', () => {
    for (const bg of ['navy', 'primary', 'purple', 'tertiary', 'teal', 'secondary', 'neutral']) {
      expect(variantOf(bg), bg).toContain('cui-btn--accent')
    }
  })

  it('uses the primary button on light themes', () => {
    for (const bg of ['gold', 'accent', 'sky', 'highlight', 'light']) {
      expect(variantOf(bg), bg).toContain('cui-btn--primary')
    }
  })

  it('marks a dark band with data-cui-theme="dark" so nested content adapts', () => {
    const themeOf = (background) => mount(CtaBanner, { props: { title: 'Support us', action, background } }).attributes('data-cui-theme')
    expect(themeOf('navy')).toBe('dark')
    expect(themeOf('#c41502')).toBe('dark')
    expect(themeOf('gold')).toBeUndefined()
    expect(themeOf('#fdf6e3')).toBeUndefined()
  })

  it('renders a secondary outline action, light on a dark band', () => {
    const wrapper = mount(CtaBanner, { props: { title: 'Support', action, background: 'navy', secondaryAction: { label: 'Learn more', href: '/more' } } })
    const buttons = wrapper.findAll('.cui-btn')
    expect(buttons).toHaveLength(2)
    expect(buttons[1].classes()).toContain('cui-btn--outline')
    expect(wrapper.attributes('data-cui-theme')).toBe('dark')
  })

  it('switches layout and alignment, and takes a #text slot', () => {
    const wrapper = mount(CtaBanner, { props: { title: 'T', action, layout: 'stacked', align: 'center' }, slots: { text: '<p>Rich <a href="/x">text</a></p>' } })
    expect(wrapper.find('.cui-cta__inner').classes()).toEqual(expect.arrayContaining(['cui-cta__inner--stacked', 'cui-cta__inner--align-center']))
    expect(wrapper.find('.cui-cta__text--rich a').exists()).toBe(true)
    expect(mount(CtaBanner, { props: { title: 'T', action } }).find('.cui-cta__inner').classes()).toContain('cui-cta__inner--split')
  })
})
