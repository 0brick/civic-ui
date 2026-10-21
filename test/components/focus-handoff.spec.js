// WCAG 2.4.3: when the focused control goes away, focus lands
// somewhere sensible instead of <body>.
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Alert from '../../src/components/feedback/Alert.vue'
import BackToTop from '../../src/components/navigation/BackToTop.vue'

describe('focus handoff', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('a dismissed Alert hands focus to focusTarget', async () => {
    document.body.innerHTML = '<h2 id="next">Results</h2><div id="app"></div>'
    const wrapper = mount(Alert, {
      props: { dismissible: true, focusTarget: '#next' },
      slots: { default: 'Saved.' },
      attachTo: '#app',
      global: { stubs: { transition: false } }
    })
    const close = wrapper.find('button')
    close.element.focus()
    await close.trigger('click')
    await nextTick()
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
    const next = document.getElementById('next')
    expect(document.activeElement).toBe(next)
    expect(next.getAttribute('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('BackToTop moves focus to the main content', async () => {
    document.body.innerHTML = '<main id="main-content">Content</main><div id="app"></div>'
    window.scrollTo = () => {}
    Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true })
    const wrapper = mount(BackToTop, { attachTo: '#app', global: { stubs: { transition: false } } })
    await nextTick()
    await wrapper.find('button').trigger('click')
    expect(document.activeElement).toBe(document.getElementById('main-content'))
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    wrapper.unmount()
  })
})
