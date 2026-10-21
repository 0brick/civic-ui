import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ImageGallery from '../../src/components/content/ImageGallery.vue'
import Lightbox from '../../src/components/overlay/Lightbox.vue'

const images = [
  { src: '/a.jpg', thumb: '/a-thumb.webp', alt: 'School from outside', caption: 'The new building' },
  { src: '/b.jpg', alt: 'Klassenzimmer' },
  { src: '/c.jpg', alt: '' }
]

describe('ImageGallery + Lightbox', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders thumbnails as buttons named after the image', () => {
    const wrapper = mount(ImageGallery, { props: { images } })
    const buttons = wrapper.findAll('button.cui-image-gallery__tile')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].attributes('aria-label')).toBe('Enlarge image: School from outside')
    expect(buttons[2].attributes('aria-label')).toBe('Enlarge image 3')
    expect(wrapper.find('img').attributes('src')).toBe('/a-thumb.webp')
    expect(wrapper.find('figcaption').text()).toBe('The new building')
  })

  it('renders plain images with alt text when lightbox is off', () => {
    const wrapper = mount(ImageGallery, { props: { images, lightbox: false } })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('img').attributes('alt')).toBe('School from outside')
    expect(wrapper.findComponent(Lightbox).exists()).toBe(false)
  })

  it('sets ratio and a fixed column count', () => {
    const wrapper = mount(ImageGallery, { props: { images, ratio: '1/1', columns: 3 } })
    expect(wrapper.find('.cui-image-gallery__tile').attributes('style')).toContain('aspect-ratio: 1/1')
    expect(wrapper.find('ul').attributes('style')).toContain('/ 3')
  })

  it('opens the lightbox at the clicked image', async () => {
    const wrapper = mount(ImageGallery, { props: { images }, attachTo: document.body })
    await wrapper.findAll('button.cui-image-gallery__tile')[1].trigger('click')
    await nextTick()
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog.querySelector('.cui-lightbox__img').getAttribute('src')).toBe('/b.jpg')
    expect(dialog.textContent).toContain('Image 2 of 3')
    wrapper.unmount()
  })

  it('steps with the buttons and the arrow keys, wrapping around', async () => {
    const wrapper = mount(Lightbox, { props: { images, modelValue: true, index: 0 }, attachTo: document.body })
    await nextTick()
    const src = () => document.querySelector('.cui-lightbox__img').getAttribute('src')
    document.querySelector('.cui-lightbox__nav--prev').click()
    await nextTick()
    expect(src()).toBe('/c.jpg')
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await nextTick()
    expect(src()).toBe('/a.jpg')
    expect(wrapper.emitted('update:index').map((e) => e[0])).toEqual([2, 0])
    expect(document.querySelector('[aria-live="polite"]').textContent).toBe('Image 1 of 3: School from outside')
    wrapper.unmount()
  })

  it('opens via the exposed open() and closes', async () => {
    const wrapper = mount(Lightbox, { props: { images }, attachTo: document.body })
    wrapper.vm.open(2)
    await nextTick()
    expect(document.querySelector('.cui-lightbox__img').getAttribute('src')).toBe('/c.jpg')
    wrapper.vm.close()
    await nextTick()
    expect(wrapper.emitted('update:modelValue').map((e) => e[0])).toEqual([true, false])
    wrapper.unmount()
  })
})
