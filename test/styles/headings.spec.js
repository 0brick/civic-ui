// Heading tokens (docs/theming.md → Font choice): h1-h3 and every title
// element that isn't an h-tag read --cui-font-heading & co., so a serif/sans
// pair is one token, not a list of component overrides.
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
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

  it('defaults to the self-hosted IBM Plex Sans and every face file exists', () => {
    expect(read('src', 'styles', 'tokens.css')).toMatch(/--cui-font-sans:\s*'IBM Plex Sans',/)
    const base = read('src', 'styles', 'base.css')
    const urls = [...base.matchAll(/url\('\.\.\/assets\/fonts\/([^']+)'\)/g)].map((m) => m[1])
    expect(urls.filter((u) => u.startsWith('ibm-plex-sans-'))).toHaveLength(12)
    // Without ?no-inline the library build base64-inlines every font into civic-ui.css.
    for (const url of urls) expect(url, url).toMatch(/\.woff2\?no-inline$/)
    for (const url of urls) {
      const file = url.replace('?no-inline', '')
      expect(existsSync(join(cwd(), 'src', 'assets', 'fonts', file)), file).toBe(true)
    }
  })

  it('ships IBM Plex Mono for code and applies it to code elements', () => {
    expect(read('src', 'styles', 'tokens.css')).toMatch(/--cui-font-mono:\s*'IBM Plex Mono',/)
    const base = read('src', 'styles', 'base.css')
    const mono = [...base.matchAll(/url\('\.\.\/assets\/fonts\/(ibm-plex-mono-[^']+)'\)/g)].map((m) => m[1])
    // 400/600, Latin and Latin Extended
    expect(mono).toHaveLength(4)
    expect(base).toMatch(/code,\s*kbd,\s*pre,\s*samp\s*\{\s*font-family: var\(--cui-font-mono\)/)
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
