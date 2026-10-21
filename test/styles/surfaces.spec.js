// Guards the surface-token contract (docs/theming.md → Surfaces): component
// styles paint their boxes with --cui-surface / --cui-surface-raised /
// --cui-surface-glass, never a literal white: otherwise a dark color mode or
// a paper-toned brand surface has to override every component one by one.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'

// vitest runs from the package root (jsdom rewrites import.meta.url).
const ROOT = join(cwd(), 'src')

function vueFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return vueFiles(path)
    return name.endsWith('.vue') ? [path] : []
  })
}

// Deliberate exceptions: small controls drawn *on top of* a colored track or
// photo, not a surface: the Switch knob, HeroSection's scroll cue on the image.
const ALLOWED = [/Switch\.vue$/, /HeroSection\.vue$/]

const WHITE_BG = /background(?:-color)?\s*:[^;]*(?:var\(--cui-color-white\)|#fff\b|#ffffff\b|\bwhite\b|rgba\(255,\s*255,\s*255,\s*0?\.9\d*\))/i

describe('surface tokens', () => {
  const files = [join(ROOT, 'components'), join(ROOT, 'sections'), join(ROOT, 'layout')].flatMap(vueFiles)

  it('finds the component files', () => {
    expect(files.length).toBeGreaterThan(40)
  })

  it('no component paints a surface with a literal white', () => {
    const offenders = []
    for (const file of files) {
      if (ALLOWED.some((re) => re.test(file))) continue
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (WHITE_BG.test(line)) offenders.push(`${file.slice(ROOT.length + 1)}:${i + 1}: ${line.trim()}`)
        })
    }
    expect(offenders).toEqual([])
  })

  it('tokens.css defines every surface token', () => {
    const css = readFileSync(join(ROOT, 'styles', 'tokens.css'), 'utf8')
    for (const token of ['--cui-surface', '--cui-surface-raised', '--cui-surface-glass', '--cui-on-surface']) {
      expect(css).toMatch(new RegExp(`${token}:`))
    }
  })
})
