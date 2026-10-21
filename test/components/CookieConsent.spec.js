// WCAG 2.4.11 Focus Not Obscured: the bottom-fixed banner must not hide the
// element that has focus. Modal by default (focus stays in the banner); a
// non-modal banner publishes its height for scroll-padding-bottom and
// collapses on Escape.
import { describe, it, expect, afterEach } from 'vitest'
import { mount, DOMWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import CookieConsent from '../../src/components/overlay/CookieConsent.vue'

const body = () => new DOMWrapper(document.body)
const banner = () => body().find('.cui-cookie-consent')
const escape = (target = document.body) => target.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

describe('CookieConsent', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.documentElement.style.removeProperty('--cui-cookie-consent-height')
  })

  it('is modal by default: aria-modal and focus inside the banner', async () => {
    mount(CookieConsent, { props: { modelValue: true }, attachTo: document.body })
    await nextTick()
    expect(banner().attributes('aria-modal')).toBe('true')
    expect(banner().element.contains(document.activeElement)).toBe(true)
  })

  it('modal: Escape does not collapse or close it: a choice is required', async () => {
    const wrapper = mount(CookieConsent, { props: { modelValue: true }, attachTo: document.body })
    await nextTick()
    escape(document.activeElement)
    await nextTick()
    expect(body().find('.cui-cookie-consent__inner--collapsed').exists()).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('modal: publishes no height (nothing behind it can take focus)', async () => {
    mount(CookieConsent, { props: { modelValue: true }, attachTo: document.body })
    await nextTick()
    await nextTick()
    expect(document.documentElement.style.getPropertyValue('--cui-cookie-consent-height')).toBe('')
  })

  it('non-modal: publishes its height on <html> and removes it when closed', async () => {
    const wrapper = mount(CookieConsent, { props: { modelValue: true, modal: false }, attachTo: document.body })
    await nextTick()
    await nextTick()
    expect(document.documentElement.style.getPropertyValue('--cui-cookie-consent-height')).toMatch(/^\d+px$/)
    await wrapper.setProps({ modelValue: false })
    await nextTick()
    expect(document.documentElement.style.getPropertyValue('--cui-cookie-consent-height')).toBe('')
  })

  it('non-modal: removes the height when unmounted', async () => {
    const wrapper = mount(CookieConsent, { props: { modelValue: true, modal: false }, attachTo: document.body })
    await nextTick()
    await nextTick()
    wrapper.unmount()
    expect(document.documentElement.style.getPropertyValue('--cui-cookie-consent-height')).toBe('')
  })

  it('non-modal: Escape collapses it to a bar, focus moves to the expand button, which restores it', async () => {
    mount(CookieConsent, { props: { modelValue: true, modal: false }, attachTo: document.body })
    await nextTick()
    expect(document.activeElement).toBe(banner().element)
    escape(document.activeElement)
    await nextTick()
    await nextTick()
    const expand = body().find('.cui-cookie-consent__inner--collapsed button')
    expect(expand.exists()).toBe(true)
    expect(expand.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(expand.element)
    expect(body().find('.cui-cookie-consent__actions').exists()).toBe(false)
    await expand.trigger('click')
    await nextTick()
    expect(body().find('.cui-cookie-consent__actions').exists()).toBe(true)
    expect(document.activeElement).toBe(banner().element)
  })

  it('non-modal: Escape anywhere on the page collapses it, focus stays where it was', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    mount(CookieConsent, { props: { modelValue: true, modal: false }, attachTo: document.body })
    await nextTick()
    outside.focus()
    escape(outside)
    await nextTick()
    expect(body().find('.cui-cookie-consent__inner--collapsed').exists()).toBe(true)
    expect(document.activeElement).toBe(outside)
  })

  it("non-modal: Escape inside another modal dialog is left to that dialog", async () => {
    const dialog = document.createElement('div')
    dialog.setAttribute('aria-modal', 'true')
    const inner = document.createElement('button')
    dialog.appendChild(inner)
    document.body.appendChild(dialog)
    mount(CookieConsent, { props: { modelValue: true, modal: false }, attachTo: document.body })
    await nextTick()
    escape(inner)
    await nextTick()
    expect(body().find('.cui-cookie-consent__inner--collapsed').exists()).toBe(false)
  })

  it('reopening the banner shows it expanded again', async () => {
    const wrapper = mount(CookieConsent, { props: { modelValue: true, modal: false }, attachTo: document.body })
    await nextTick()
    escape()
    await nextTick()
    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    await nextTick()
    expect(body().find('.cui-cookie-consent__actions').exists()).toBe(true)
  })

  it('scrolls itself at large zoom instead of growing past the viewport', () => {
    const sfc = readFileSync(join(cwd(), 'src/components/overlay/CookieConsent.vue'), 'utf8')
    const css = sfc.slice(sfc.indexOf('.cui-cookie-consent {'), sfc.indexOf('}', sfc.indexOf('.cui-cookie-consent {')))
    expect(css).toMatch(/max-height: 100dvh/)
    expect(css).toMatch(/overflow-y: auto/)
  })

  // On 320×256 the full banner plus a sticky header covered the whole
  // viewport, so no focused element could be scrolled into view.
  it('non-modal: takes at most half the viewport, the modal one all of it', async () => {
    const sfc = readFileSync(join(cwd(), 'src/components/overlay/CookieConsent.vue'), 'utf8')
    const rule = sfc.slice(sfc.indexOf('.cui-cookie-consent--non-modal {'), sfc.indexOf('}', sfc.indexOf('.cui-cookie-consent--non-modal {')))
    expect(rule).toMatch(/max-height: 50dvh/)
    const nonModal = mount(CookieConsent, { props: { modelValue: true, modal: false }, attachTo: document.body })
    await nextTick()
    expect(banner().classes()).toContain('cui-cookie-consent--non-modal')
    nonModal.unmount()
    mount(CookieConsent, { props: { modelValue: true }, attachTo: document.body })
    await nextTick()
    expect(banner().classes()).not.toContain('cui-cookie-consent--non-modal')
  })

  // GDPR Art. 4 Nr. 11 / Art. 7: rejecting as prominent as accepting.
  const choiceButtons = () => {
    const buttons = banner().findAll('.cui-cookie-consent__actions button')
    return { reject: buttons.find((b) => b.text() === 'Necessary only'), accept: buttons.find((b) => b.text() === 'Accept all') }
  }

  it('gives accept and reject the same variant and size by default', async () => {
    mount(CookieConsent, { props: { modelValue: true }, attachTo: document.body })
    await nextTick()
    const { accept, reject } = choiceButtons()
    expect(accept.classes()).toEqual(reject.classes())
    expect(accept.classes()).toContain('cui-btn--primary')
    expect(accept.classes()).toContain('cui-btn--sm')
  })

  it('equalWeight=false brings back the highlighted accept button', async () => {
    mount(CookieConsent, { props: { modelValue: true, equalWeight: false }, attachTo: document.body })
    await nextTick()
    const { accept, reject } = choiceButtons()
    expect(accept.classes()).toContain('cui-btn--accent')
    expect(reject.classes()).toContain('cui-btn--outline')
  })

  it('base.css turns the published height into scroll-padding-bottom', () => {
    const css = readFileSync(join(cwd(), 'src/styles/base.css'), 'utf8')
    expect(css).toMatch(/scroll-padding-bottom: var\(--cui-cookie-consent-height, 0px\)/)
    // …and into room below the page's last element, which scroll-padding
    // alone can't lift above the banner.
    expect(css).toMatch(/padding-bottom: var\(--cui-cookie-consent-height, 0px\)/)
  })
})
