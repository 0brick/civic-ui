// Every label drawn on an accent fill must read --cui-accent-contrast, not a
// fixed navy ink: with a dark brand accent (e.g. red) generatePalette() picks
// white for it, and a hardcoded navy would drop below WCAG AA.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'

const ROOT = join(cwd(), 'src')

function styleFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return styleFiles(path)
    return /\.(vue|css)$/.test(name) ? [path] : []
  })
}

const ACCENT_BG = /background(?:-color)?\s*:\s*var\(--cui-(?:accent|color-yellow)\)/

describe('accent label contrast', () => {
  it('pairs every accent background that sets a text color with --cui-accent-contrast', () => {
    const offenders = []
    for (const file of styleFiles(ROOT)) {
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      for (const [, body] of css.matchAll(/\{([^{}]*)\}/g)) {
        if (!ACCENT_BG.test(body)) continue
        const color = /(?:^|[;\s])color\s*:\s*([^;]+)/.exec(body)
        if (color && color[1].trim() !== 'var(--cui-accent-contrast)') offenders.push(`${file.slice(ROOT.length + 1)}: color: ${color[1].trim()}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
