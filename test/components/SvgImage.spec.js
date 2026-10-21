import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SvgImage from '../../src/components/content/SvgImage.vue'

describe('SvgImage', () => {
  it('renders a plain img with the file colors by default', () => {
    const wrapper = mount(SvgImage, { props: { src: '/logo.svg', alt: 'City logo' } })
    expect(wrapper.element.tagName).toBe('IMG')
    expect(wrapper.attributes('src')).toBe('/logo.svg')
    expect(wrapper.attributes('alt')).toBe('City logo')
  })

  it('blocks a javascript: src', () => {
    const wrapper = mount(SvgImage, { props: { src: 'javascript:alert(1)' } })
    expect(wrapper.attributes('src')).toBeFalsy()
  })

  it('recolors via a mask in the text color with contrast="theme"', () => {
    const wrapper = mount(SvgImage, { props: { src: '/logo.svg', contrast: 'theme' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    const style = wrapper.attributes('style')
    expect(style).toContain('/logo.svg')
    expect(style).toContain('currentcolor')
  })

  it('exposes a labelled graphic as role="img", a decorative one as aria-hidden', () => {
    const labelled = mount(SvgImage, { props: { src: '/logo.svg', contrast: 'theme', alt: 'City logo' } })
    expect(labelled.attributes('role')).toBe('img')
    expect(labelled.attributes('aria-label')).toBe('City logo')
    const decorative = mount(SvgImage, { props: { src: '/logo.svg', contrast: 'theme' } })
    expect(decorative.attributes('role')).toBeUndefined()
    expect(decorative.attributes('aria-hidden')).toBe('true')
  })

  it('picks a light color on a dark background with contrast="auto"', async () => {
    const host = document.createElement('div')
    host.style.backgroundColor = 'rgb(0, 29, 53)'
    document.body.appendChild(host)
    const wrapper = mount(SvgImage, { props: { src: '/logo.svg', contrast: 'auto' }, attachTo: host })
    await nextTick()
    expect(wrapper.attributes('style')).toMatch(/background-color: (#fff|rgb\(255, 255, 255\))/i)
    wrapper.unmount()
    host.remove()
  })

  it('picks a dark color on a light background with contrast="auto"', async () => {
    const host = document.createElement('div')
    host.style.backgroundColor = 'rgb(255, 255, 255)'
    document.body.appendChild(host)
    const wrapper = mount(SvgImage, { props: { src: '/logo.svg', contrast: 'auto' }, attachTo: host })
    await nextTick()
    expect(wrapper.attributes('style')).not.toMatch(/background-color: (#fff|rgb\(255, 255, 255\))/i)
    expect(wrapper.attributes('style')).not.toContain('currentcolor')
    wrapper.unmount()
    host.remove()
  })

  it('treats numbers and numeric strings as px', () => {
    const wrapper = mount(SvgImage, { props: { src: '/logo.svg', contrast: 'theme', width: '56', height: 40 } })
    const style = wrapper.attributes('style')
    expect(style).toContain('width: 56px')
    expect(style).toContain('height: 40px')
  })
})
