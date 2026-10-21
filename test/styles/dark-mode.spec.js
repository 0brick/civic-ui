// tokens.css ships the dark color mode for the default palette as literal
// values (no JS needed to use it); they must stay identical to what
// generatePalette('default').darkMode derives, or a configured palette and
// the stock stylesheet would disagree about what "dark" looks like.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { generatePalette } from '../../src/utils/palette.js'

const css = readFileSync(join(cwd(), 'src', 'styles', 'tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

function block(selector) {
  const start = css.indexOf(`${selector} {`)
  expect(start, `${selector} block missing`).toBeGreaterThan(-1)
  const body = css.slice(start + selector.length + 2, css.indexOf('}', start))
  return Object.fromEntries(
    body
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()])
  )
}

describe('dark color mode tokens', () => {
  const expected = generatePalette('default').darkMode

  it('[data-cui-mode=dark] matches generatePalette("default").darkMode', () => {
    expect(block("[data-cui-mode='dark']")).toEqual(expected)
  })

  it('[data-cui-mode=auto] carries the same tokens inside prefers-color-scheme: dark', () => {
    const media = css.indexOf('@media (prefers-color-scheme: dark)')
    expect(media).toBeGreaterThan(-1)
    expect(css.indexOf("[data-cui-mode='auto']")).toBeGreaterThan(media)
    expect(block("[data-cui-mode='auto']")).toEqual(expected)
  })

  it('every token the dark mode sets also has a light default on :root', () => {
    const root = block(':root')
    for (const key of Object.keys(expected)) {
      if (key === 'color-scheme') continue
      expect(root, key).toHaveProperty(key)
    }
  })
})

describe('generatePalette().darkMode', () => {
  it('passes its contrast checks for every preset and a single-color brand', () => {
    for (const input of ['default', 'forest', 'burgundy', 'slate', { primary: '#16120e', accent: '#c41502' }]) {
      const result = generatePalette(input)
      for (const [name, check] of Object.entries(result.contrast.checks)) {
        if (!name.startsWith('Dark mode')) continue
        expect(check.aaText, `${JSON.stringify(input)}: "${name}" only reached ${check.ratio}:1`).toBe(true)
      }
    }
  })

  it('keeps the page background dark and the text light', () => {
    const { darkMode } = generatePalette({ primary: '#0f2e22' })
    expect(darkMode['--cui-bg']).toMatch(/^#[0-3][0-9a-f]/)
    expect(darkMode['--cui-heading']).toBe('#ffffff')
    expect(darkMode['color-scheme']).toBe('dark')
  })
})
