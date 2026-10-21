// Global CSS rules from the audit's chapter 3: reduced motion for everything
// (not just the handful of components with their own media query), a focus
// ring that doesn't reshape the focused element, and two components whose
// styling hid information (Pagination's scrollbar, LanguageSwitcher's dimming).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'

const ROOT = join(cwd(), 'src')
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const base = stripComments(readFileSync(join(ROOT, 'styles', 'base.css'), 'utf8'))
const style = (path) => {
  const sfc = readFileSync(join(ROOT, path), 'utf8')
  return stripComments(sfc.slice(sfc.indexOf('<style')))
}
const rule = (css, selector) => {
  const start = css.indexOf(`${selector} {`)
  expect(start, `${selector} rule missing`).toBeGreaterThan(-1)
  return css.slice(start, css.indexOf('}', start))
}

describe('base.css', () => {
  it(':focus-visible draws an outline without changing the element’s border-radius', () => {
    const focus = rule(base, '\n:focus-visible')
    expect(focus).toMatch(/outline: 2px solid var\(--cui-focus-ring\)/)
    expect(focus).not.toMatch(/border-radius/)
  })

  describe('prefers-reduced-motion', () => {
    // every reduced-motion block in base.css, joined
    const blocks = base.split('@media (prefers-reduced-motion: reduce)').slice(1).join('')

    it('a global rule shortens every transition and animation and turns off smooth scrolling', () => {
      for (const decl of [
        'animation-duration: 0.01ms !important',
        'animation-iteration-count: 1 !important',
        'transition-duration: 0.01ms !important',
        'scroll-behavior: auto !important'
      ]) {
        expect(blocks).toContain(decl)
      }
    })

    it('covers pseudo-elements too, and exempts the Spinner and data-cui-motion="essential"', () => {
      expect(blocks).toMatch(/:not\(\.cui-spinner\):not\(\[data-cui-motion='essential'\]\)::before/)
      expect(blocks).toMatch(/:not\(\.cui-spinner\):not\(\[data-cui-motion='essential'\]\)::after/)
    })
  })
})

describe('component styles', () => {
  it('Pagination keeps its scrollbar visible (the only hint that pages are hidden)', () => {
    const css = style('components/navigation/Pagination.vue')
    expect(css).not.toMatch(/scrollbar-width: none/)
    expect(css).not.toMatch(/::-webkit-scrollbar/)
  })

  it('LanguageSwitcher does not dim items with opacity', () => {
    const css = style('components/navigation/LanguageSwitcher.vue')
    expect(css).not.toMatch(/opacity/)
    expect(rule(css, '.cui-lang-switch__item--active')).toMatch(/text-decoration-thickness: 2px/)
  })
})
