// WCAG 4.1.2/4.1.3, 2.2.2: the active slide follows swipes/scrolling,
// autoplay doesn't chatter in the live region and pauses while focus is inside.
import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Carousel from '../../src/components/content/Carousel.vue'

const slides = () => [1, 2, 3].map((n) => h('div', { class: 'slide' }, `Slide ${n}`))

describe('Carousel', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  // WCAG 2.1.1: the scrollable track is reachable by keyboard even when the
  // slides themselves hold nothing focusable.
  it('makes the scrollable track a focusable, named group', () => {
    const wrapper = mount(Carousel, { props: { slideCount: 3 }, slots: { default: slides } })
    const track = wrapper.find('.cui-carousel__track')
    expect(track.attributes('tabindex')).toBe('0')
    expect(track.attributes('role')).toBe('group')
    expect(track.attributes('aria-label')).toBe('Slides')
  })

  it('updates the active dot after the track is swiped to slide 3', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Carousel, { props: { slideCount: 3 }, slots: { default: slides } })
    const track = wrapper.find('.cui-carousel__track').element
    Object.defineProperty(track, 'clientWidth', { value: 300, configurable: true })
    track.scrollLeft = 600
    track.dispatchEvent(new Event('scroll'))
    vi.advanceTimersByTime(150)
    await wrapper.vm.$nextTick()
    const dots = wrapper.findAll('.cui-carousel__dot')
    expect(dots[2].attributes('aria-current')).toBe('true')
    expect(dots[0].attributes('aria-current')).toBeUndefined()
    expect(wrapper.find('[aria-live]').text()).toContain('3')
  })

  it('silences the live region while autoplay runs, and pauses on focus', async () => {
    window.matchMedia = () => ({ matches: false })
    vi.useFakeTimers()
    window.Element.prototype.scrollIntoView = () => {}
    const wrapper = mount(Carousel, { props: { slideCount: 3, autoplay: true, interval: 1000 }, slots: { default: slides }, attachTo: document.body })
    await wrapper.vm.$nextTick()
    const live = () => wrapper.find('.cui-visually-hidden[aria-live]').attributes('aria-live')
    expect(live()).toBe('off')

    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.cui-carousel__dot')[1].attributes('aria-current')).toBe('true')

    await wrapper.find('.cui-carousel__dot').trigger('focusin')
    expect(live()).toBe('polite')
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.cui-carousel__dot')[1].attributes('aria-current')).toBe('true')
    wrapper.unmount()
  })
})
