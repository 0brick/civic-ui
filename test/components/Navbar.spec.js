import { describe, it, expect, afterEach } from 'vitest'
import { mount, DOMWrapper } from '@vue/test-utils'
import Navbar from '../../src/components/navigation/Navbar.vue'
import SiteHeader from '../../src/sections/SiteHeader.vue'
import AppShell from '../../src/layout/AppShell.vue'
import Dropdown from '../../src/components/navigation/Dropdown.vue'

// The mobile drawer is a Modal, which teleports to <body>.
const body = () => new DOMWrapper(document.body)

const german = {
  toggleLabel: 'Navigationsmenü umschalten',
  menuLabel: 'Menü',
  closeLabel: 'Menü schließen',
  navLabel: 'Hauptnavigation',
  mobileNavLabel: 'Hauptnavigation (mobil)'
}

async function openDrawer(wrapper, toggle) {
  await wrapper.find(toggle).trigger('click')
  return body().find('[role="dialog"]')
}

describe('mobile menu screen-reader labels', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps the English defaults', async () => {
    const wrapper = mount(Navbar, { attachTo: document.body })
    expect(wrapper.find('.cui-navbar__toggle').attributes('aria-label')).toBe('Toggle navigation menu')
    expect(wrapper.find('.cui-navbar__links--desktop').attributes('aria-label')).toBe('Main')
    const dialog = await openDrawer(wrapper, '.cui-navbar__toggle')
    expect(dialog.find('.cui-modal__title, h2').text()).toBe('Menu')
    expect(dialog.find('.cui-close').attributes('aria-label')).toBe('Close dialog')
  })

  it('lets Navbar translate every label', async () => {
    const wrapper = mount(Navbar, { props: german, attachTo: document.body })
    expect(wrapper.find('.cui-navbar__toggle').attributes('aria-label')).toBe(german.toggleLabel)
    expect(wrapper.find('.cui-navbar__links--desktop').attributes('aria-label')).toBe(german.navLabel)
    const dialog = await openDrawer(wrapper, '.cui-navbar__toggle')
    expect(dialog.text()).toContain(german.menuLabel)
    expect(dialog.find('.cui-close').attributes('aria-label')).toBe(german.closeLabel)
    expect(dialog.find('.cui-navbar__links--mobile').attributes('aria-label')).toBe(german.mobileNavLabel)
  })

  it('passes the labels through SiteHeader', async () => {
    const wrapper = mount(SiteHeader, { props: german, attachTo: document.body })
    expect(wrapper.find('.cui-navbar__toggle').attributes('aria-label')).toBe(german.toggleLabel)
    const dialog = await openDrawer(wrapper, '.cui-navbar__toggle')
    expect(dialog.find('.cui-close').attributes('aria-label')).toBe(german.closeLabel)
    expect(dialog.find('.cui-navbar__links--mobile').attributes('aria-label')).toBe(german.mobileNavLabel)
  })

  it('lets AppShell translate its drawer and skip link', async () => {
    const wrapper = mount(AppShell, {
      props: { toggleLabel: german.toggleLabel, menuLabel: german.menuLabel, closeLabel: german.closeLabel, skipLabel: 'Zum Inhalt springen' },
      attachTo: document.body
    })
    expect(wrapper.find('.cui-skip-link').text()).toBe('Zum Inhalt springen')
    expect(wrapper.find('.cui-app-shell__menu-toggle').attributes('aria-label')).toBe(german.toggleLabel)
    const dialog = await openDrawer(wrapper, '.cui-app-shell__menu-toggle')
    expect(dialog.text()).toContain(german.menuLabel)
    expect(dialog.find('.cui-close').attributes('aria-label')).toBe(german.closeLabel)
  })

  it('a sticky Navbar publishes its height as --cui-navbar-height and cleans up', () => {
    const original = globalThis.ResizeObserver
    globalThis.ResizeObserver = class {
      observe() {}
      disconnect() {}
    }
    try {
      const wrapper = mount(Navbar, { attachTo: document.body })
      expect(document.documentElement.style.getPropertyValue('--cui-navbar-height')).toBe('0px')
      wrapper.unmount()
      expect(document.documentElement.style.getPropertyValue('--cui-navbar-height')).toBe('')
    } finally {
      globalThis.ResizeObserver = original
    }
  })

  it('renders a slotted Dropdown as an expanded group in the drawer, and only links close it', async () => {
    const links = {
      components: { Dropdown },
      template: '<a href="/a">A</a><Dropdown trigger-variant="chevron-label" label="Services"><a href="/s1">S1</a><a href="/s2">S2</a></Dropdown>'
    }
    const wrapper = mount(Navbar, { slots: { links }, attachTo: document.body })
    expect(wrapper.find('.cui-navbar__links--desktop .cui-dropdown--group').exists()).toBe(false)
    await wrapper.find('.cui-navbar__toggle').trigger('click')
    const drawer = body().find('.cui-navbar__links--mobile')
    const group = drawer.find('.cui-dropdown--group')
    expect(group.exists()).toBe(true)
    expect(group.findAll('a')).toHaveLength(2)
    await group.find('.cui-dropdown__group-label').trigger('click')
    expect(body().find('.cui-navbar__links--mobile').exists()).toBe(true)
    await group.find('a').trigger('click')
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.vm.$.setupState.mobileOpen).toBe(false)
  })

  it('renders data-driven items with children and aria-current', async () => {
    const items = [
      { label: 'Home', href: '/', active: true },
      { label: 'Services', children: [{ label: 'Permits', href: '/permits' }] }
    ]
    const wrapper = mount(Navbar, { props: { items }, attachTo: document.body })
    const desktop = wrapper.find('.cui-navbar__links--desktop')
    expect(desktop.find('a[aria-current="page"]').text()).toBe('Home')
    expect(desktop.find('.cui-dropdown__trigger-btn--mega').text()).toContain('Services')
    await wrapper.find('.cui-navbar__toggle').trigger('click')
    expect(body().find('.cui-navbar__links--mobile .cui-dropdown--group').text()).toContain('Permits')
  })
})

describe('Dropdown in the Navbar link row', () => {
  it('marks a chevron-label trigger in the desktop row so it takes the nav typography', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: Navbar } = await import('../../src/components/navigation/Navbar.vue')
    const wrapper = mount(Navbar, { props: { items: [{ label: 'Services', children: [{ label: 'A', href: '/a' }] }] } })
    expect(wrapper.find('.cui-navbar__links--desktop .cui-dropdown').classes()).toContain('cui-dropdown--in-nav')
  })

  it('reads the menu surface tokens', async () => {
    const { readFileSync } = await import('node:fs')
    const css = readFileSync('src/components/navigation/Dropdown.vue', 'utf8')
    for (const token of ['--cui-dropdown-bg', '--cui-dropdown-text', '--cui-dropdown-hover-bg']) expect(css).toContain(token)
  })
})

describe('Navbar current page indicator (WCAG 1.4.1 / 1.4.11)', () => {
  it('marks the current page with a 3px bar in the text color, yellow only on a dark navbar', async () => {
    const { readFileSync } = await import('node:fs')
    const css = readFileSync('src/components/navigation/Navbar.vue', 'utf8')
    const style = css.slice(css.indexOf('<style'))
    const bodies = [...style.matchAll(/^\.cui-navbar__links--desktop > :deep\(a\[aria-current='page'\]\)::after \{([^}]*)\}/gm)].map((m) => m[1])
    const light = bodies.find((b) => b.includes('height'))
    expect(light, 'active ::after rule').toBeDefined()
    expect(light).toMatch(/height: 3px/)
    expect(light).toMatch(/background: var\(--cui-nav-active, var\(--cui-text\)\)/)
    expect(style).toMatch(/\.cui-navbar--dark \.cui-navbar__links--desktop > :deep\(a\[aria-current='page'\]\)::after \{\s*background: var\(--cui-color-yellow\)/)
    const mobile = style.match(/\.cui-navbar__links--mobile :deep\(a\[aria-current='page'\]\) \{([^}]*)\}/)
    expect(mobile[1]).toMatch(/text-decoration: underline/)
  })
})
