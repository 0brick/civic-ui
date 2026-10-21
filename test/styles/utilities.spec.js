// utilities.css contract (docs/utilities.md).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'

const read = (...p) => readFileSync(join(cwd(), ...p), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const utilities = read('src', 'styles', 'utilities.css')

describe('utilities', () => {
  it('gives .cui-section--dark the dark-band tokens (headings stay readable)', () => {
    expect(read('src', 'styles', 'tokens.css')).toMatch(/\[data-cui-theme='dark'\],\s*\.cui-section--dark \{/)
  })

  it('never uses a bare 1fr track (long words would overflow)', () => {
    expect(utilities).not.toMatch(/repeat\(\d+,\s*1fr\)/)
    expect(utilities).not.toMatch(/columns:\s*1fr/)
  })

  it('has the section padding token, paper band, aside grid and sticky helper', () => {
    expect(utilities).toContain('padding-block: var(--cui-section-padding, var(--cui-space-8))')
    for (const cls of ['.cui-section--paper', '.cui-grid--aside', '.cui-grid--aside-start', '.cui-sticky']) expect(utilities).toContain(cls)
    expect(utilities).toMatch(/\.cui-sticky \{[^}]*var\(--cui-navbar-height, 0px\)/)
  })
})

describe('text utilities', () => {
  it('ships .cui-prose, .cui-lead, .cui-label and .cui-eyebrow--lined', () => {
    for (const cls of ['.cui-prose {', '.cui-lead {', '.cui-label {', '.cui-eyebrow--lined {']) expect(utilities).toContain(cls)
    expect(utilities).toMatch(/\.cui-prose \{[^}]*var\(--cui-prose-max, 68ch\)/)
  })

  it('reads the eyebrow and lead tokens everywhere', () => {
    expect(utilities).toMatch(/\.cui-eyebrow \{[^}]*var\(--cui-eyebrow-color, var\(--cui-text-secondary\)\)/)
    for (const file of ['ListSection', 'TeaserGrid', 'FaqSection', 'TestimonialSection', 'AppointmentSection']) {
      expect(read('src', 'sections', `${file}.vue`), file).toContain('font-size: var(--cui-fz-lead)')
    }
  })
})
