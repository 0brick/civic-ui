import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '../../src/sections/HeroSection.vue'

describe('HeroSection', () => {
  it('renders no empty <h1> when title is left out', () => {
    const wrapper = mount(HeroSection, { props: { eyebrow: 'Hello,', text: 'Some copy.' } })
    expect(wrapper.find('h1').exists()).toBe(false)
    expect(wrapper.text()).toContain('Some copy.')
  })

  it('centers the copy vertically by default and accepts verticalAlign', () => {
    expect(mount(HeroSection, { props: { title: 'T' } }).classes()).toContain('cui-hero--valign-center')
    expect(mount(HeroSection, { props: { title: 'T', verticalAlign: 'end' } }).classes()).toContain('cui-hero--valign-end')
  })

  it('renders the text slot in place of the text prop', () => {
    const wrapper = mount(HeroSection, {
      props: { title: 'T', text: 'plain' },
      slots: { text: '<ul><li>One</li><li>Two</li></ul>' }
    })
    expect(wrapper.findAll('.cui-hero__text-copy li')).toHaveLength(2)
    expect(wrapper.text()).not.toContain('plain')
  })

  it('marks a dark background with data-cui-theme="dark" for nested content', () => {
    const themeOf = (background) => mount(HeroSection, { props: { title: 'Hi', background } }).attributes('data-cui-theme')
    expect(themeOf('navy')).toBe('dark')
    expect(themeOf('/photo.jpg')).toBe('dark') // under the navy veil
    expect(themeOf('gold')).toBeUndefined()
    expect(themeOf('#fdf6e3')).toBeUndefined()
  })

  it('takes the eyebrow color from the section theme', () => {
    expect(mount(HeroSection, { props: { title: 'T', background: 'gold' } }).attributes('style')).toContain('--cui-hero-eyebrow: #3b2781')
    expect(mount(HeroSection, { props: { title: 'T', background: 'navy' } }).attributes('style')).toContain('--cui-hero-eyebrow: #ffed3e')
  })

  it('sets the image focus, veil and title size', () => {
    const wrapper = mount(HeroSection, {
      props: { title: 'T', stage: true, image: '/a.jpg', imageFocus: 'center 30%', imageFocusMobile: '70% top', veil: 'strong', veilFrom: 'start', titleSize: 'display' }
    })
    const style = wrapper.attributes('style')
    expect(style).toContain('--cui-hero-focus: center 30%')
    expect(style).toContain('--cui-hero-focus-mobile: 70% top')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['cui-hero--veil-strong', 'cui-hero--veil-start', 'cui-hero--veil-start-left', 'cui-hero--title-display']))
  })

  it('ignores an image focus that is not plain position syntax', () => {
    const wrapper = mount(HeroSection, { props: { title: 'T', image: '/a.jpg', imageFocus: 'center; background: url(x)' } })
    expect(wrapper.attributes('style')).not.toContain('--cui-hero-focus')
  })
})

describe('HeroSection stage image (WCAG 1.1.1)', () => {
  it('keeps a stage photo with imageAlt in the accessibility tree', () => {
    const img = mount(HeroSection, { props: { title: 'T', stage: true, image: '/a.jpg', imageAlt: 'Town hall at dusk' } }).find('img')
    expect(img.attributes('alt')).toBe('Town hall at dusk')
    expect(img.attributes('aria-hidden')).toBeUndefined()
  })

  it('hides a stage photo without imageAlt as decoration', () => {
    const img = mount(HeroSection, { props: { title: 'T', stage: true, image: '/a.jpg' } }).find('img')
    expect(img.attributes('alt')).toBe('')
    expect(img.attributes('aria-hidden')).toBe('true')
  })
})
