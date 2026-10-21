// Heading tokens (docs/theming.md → Font choice): h1-h3 and every title
// element that isn't an h-tag read --cui-font-heading & co., so a serif/sans
// pair is one token, not a list of component overrides.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'

const read = (...p) => readFileSync(join(cwd(), ...p), 'utf8')

describe('heading tokens', () => {
  it('defines the tokens with defaults that keep the stock design', () => {
    const tokens = read('src', 'styles', 'tokens.css')
    expect(tokens).toMatch(/--cui-font-heading:\s*var\(--cui-font-sans\)/)
    expect(tokens).toMatch(/--cui-heading-weight:\s*700/)
    expect(tokens).toMatch(/--cui-heading-letter-spacing:\s*-0\.02em/)
    expect(tokens).toMatch(/--cui-heading-line-height:\s*1\.15/)
  })

  it('applies them to h1-h3 and wraps long words', () => {
    const base = read('src', 'styles', 'base.css')
    expect(base).toMatch(/h1,\s*h2,\s*h3 \{\s*font-family: var\(--cui-font-heading\)/)
    expect(base).toContain('overflow-wrap: break-word')
  })

  it.each([
    ['src/components/content/Card.vue', '.cui-card__name'],
    ['src/components/content/Card.vue', '.cui-card__title--inline'],
    ['src/sections/HeroSection.vue', '.cui-hero__title'],
    ['src/sections/SiteFooter.vue', '.cui-footer__col-title'],
    ['src/sections/TestimonialSection.vue', '.cui-testimonial-card__name']
  ])('%s %s reads --cui-font-heading', (file, selector) => {
    const css = read(file)
    const start = css.indexOf(`\n${selector} {`)
    expect(start).toBeGreaterThan(-1)
    expect(css.slice(start, css.indexOf('}', start))).toContain('var(--cui-font-heading)')
  })
})
