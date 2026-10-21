import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import AppButton from '../../src/components/button/AppButton.vue'

describe('AppButton', () => {
  it('renders as a native button by default', () => {
    const wrapper = mount(AppButton, { slots: { default: 'Click me' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.text()).toBe('Click me')
  })

  it('renders as an anchor when href is passed', () => {
    const wrapper = mount(AppButton, { props: { href: 'https://example.org' } })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('https://example.org')
  })

  it('sanitizes a javascript: href instead of rendering it', () => {
    const wrapper = mount(AppButton, { props: { href: 'javascript:alert(1)' } })
    expect(wrapper.attributes('href')).toBe('#')
  })

  it('applies the variant and size as classes', () => {
    const wrapper = mount(AppButton, { props: { variant: 'danger', size: 'lg' } })
    expect(wrapper.classes()).toContain('cui-btn--danger')
    expect(wrapper.classes()).toContain('cui-btn--lg')
  })

  // a submit button that turns busy while focused must keep focus,
  // so loading uses aria-disabled (clicks blocked) instead of `disabled`.
  it('stays focusable but blocks clicks while loading', async () => {
    const onClick = vi.fn()
    const wrapper = mount(AppButton, { props: { loading: true, type: 'submit' }, attrs: { onClick }, attachTo: document.body })
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    wrapper.element.focus()
    expect(document.activeElement).toBe(wrapper.element)
    const event = new window.MouseEvent('click', { bubbles: true, cancelable: true })
    wrapper.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('keeps the native disabled attribute for a plain disabled button', () => {
    const wrapper = mount(AppButton, { props: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('focusableWhenDisabled uses aria-disabled instead', () => {
    const wrapper = mount(AppButton, { props: { disabled: true, focusableWhenDisabled: true } })
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  // a disabled link button must not navigate.
  it('a disabled link button drops its href and reads as a disabled link', () => {
    const wrapper = mount(AppButton, { props: { href: '/next', disabled: true, newTab: true }, slots: { default: 'Next' } })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('target')).toBeUndefined()
    expect(wrapper.attributes('role')).toBe('link')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    const event = new window.MouseEvent('click', { bubbles: true, cancelable: true })
    wrapper.element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('a loading router-link button renders a plain <a> without `to`', () => {
    const RouterLink = { name: 'RouterLink', props: ['to'], template: '<a :href="to"><slot /></a>' }
    const wrapper = mount(AppButton, { props: { href: '/next', tag: RouterLink, loading: true }, slots: { default: 'Next' } })
    expect(wrapper.findComponent(RouterLink).exists()).toBe(false)
    expect(wrapper.attributes('href')).toBeUndefined()
  })

  const Icon = { render: () => h('svg', { viewBox: '0 0 20 20' }, [h('path', { d: 'M0 0h20v20H0z' })]) }

  it('renders a component icon before the label by default', () => {
    const wrapper = mount(AppButton, { props: { icon: Icon }, slots: { default: 'Save' } })
    const children = [...wrapper.element.children]
    expect(children[0].tagName.toLowerCase()).toBe('svg')
    expect(children[0].classList).toContain('cui-btn__icon')
    expect(children[0].getAttribute('aria-hidden')).toBe('true')
    expect(children[1].textContent).toBe('Save')
  })

  it('renders an image URL icon as a decorative img, after the label with iconPosition end', () => {
    const wrapper = mount(AppButton, { props: { icon: '/icon.svg', iconPosition: 'end' }, slots: { default: 'Next' } })
    const img = wrapper.element.lastElementChild
    expect(img.tagName).toBe('IMG')
    expect(img.getAttribute('src')).toBe('/icon.svg')
    expect(img.getAttribute('alt')).toBe('')
  })

  it('keeps the label as a visually hidden accessible name when icon-only', () => {
    const wrapper = mount(AppButton, { props: { icon: Icon, iconOnly: true }, slots: { default: 'Search' } })
    expect(wrapper.classes()).toContain('cui-btn--icon-only')
    const label = wrapper.find('.cui-btn__label')
    expect(label.classes()).toContain('cui-visually-hidden')
    expect(label.text()).toBe('Search')
  })

  it('swaps the icon for the spinner while loading', () => {
    const wrapper = mount(AppButton, { props: { icon: Icon, loading: true }, slots: { default: 'Save' } })
    expect(wrapper.find('.cui-btn__icon').exists()).toBe(false)
    expect(wrapper.find('.cui-btn__spinner').exists()).toBe(true)
  })

  it('puts the loading spinner where the icon was with iconPosition end', () => {
    const wrapper = mount(AppButton, { props: { icon: Icon, iconPosition: 'end', loading: true }, slots: { default: 'Next' } })
    expect(wrapper.element.lastElementChild.classList).toContain('cui-btn__spinner')
    expect(wrapper.element.firstElementChild.classList).toContain('cui-btn__label')
  })

  it('adds the new-tab hint and rel for a native target="_blank" attribute too', () => {
    const wrapper = mount(AppButton, { props: { href: 'https://example.org' }, attrs: { target: '_blank' }, slots: { default: 'Docs' } })
    expect(wrapper.attributes('rel')).toBe('noopener noreferrer')
    expect(wrapper.text()).toContain('opens in a new tab')
  })

  // jsdom doesn't apply scoped SFC styles, so the token contract is checked
  // against the source: palette roles and button tokens, never fixed colors.
  const source = readFileSync(join(cwd(), 'src', 'components', 'button', 'AppButton.vue'), 'utf8')
  const rule = (selector) => {
    const start = source.indexOf(`${selector} {`)
    expect(start, `${selector} rule missing`).toBeGreaterThan(-1)
    return source.slice(start, source.indexOf('}', start))
  }

  it('labels the accent variant with --cui-accent-contrast', () => {
    const accent = rule('.cui-btn--accent')
    expect(accent).toContain('background: var(--cui-accent)')
    expect(accent).toContain('color: var(--cui-accent-contrast)')
  })

  it('takes radius and font weight from overridable button tokens', () => {
    const base = rule('.cui-btn')
    expect(base).toContain('border-radius: var(--cui-btn-radius)')
    expect(base).toContain('font-weight: var(--cui-btn-font-weight)')
    const tokens = readFileSync(join(cwd(), 'src', 'styles', 'tokens.css'), 'utf8')
    expect(tokens).toMatch(/--cui-btn-radius:\s*var\(--cui-radius-md\)/)
    expect(tokens).toMatch(/--cui-btn-font-weight:/)
  })

  it('switches outline and ghost to light ink on a dark band', () => {
    // each rule is `[data-cui-theme='dark'] X,\n.cui-section--dark X { … }`
    expect(rule('.cui-section--dark .cui-btn--outline')).toContain('color: var(--cui-heading)')
    expect(rule('.cui-section--dark .cui-btn--ghost')).toContain('color: var(--cui-heading)')
    expect(rule('.cui-section--dark .cui-btn--outline:hover:not(:disabled)')).toContain('color: var(--cui-primary)')
    expect(source).toContain("[data-cui-theme='dark'] .cui-btn--outline,\n.cui-section--dark .cui-btn--outline {")
  })
})
