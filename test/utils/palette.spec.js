import { describe, it, expect, beforeEach } from 'vitest'
import { generatePalette, applyPalette, resetPalette, presetPalettes, paletteRoles } from '../../src/utils/palette.js'
import { sectionThemes } from '../../src/utils/themes.js'
import { hslToRgb, rgbToHex, checkContrast } from '../../src/utils/color.js'

function expectAllContrastPasses(result, label) {
  for (const [name, check] of Object.entries(result.contrast.checks)) {
    expect(check.aaText || check.aaLarge, `${label}: "${name}" only reached ${check.ratio}:1`).toBe(true)
  }
}

describe('generatePalette: mode 1: presets', () => {
  it('has every preset pass its own contrast report', () => {
    for (const name of Object.keys(presetPalettes)) {
      const result = generatePalette(name)
      expectAllContrastPasses(result, `preset "${name}"`)
    }
  })

  it('the default preset reproduces the shipped tokens.css palette', () => {
    const result = generatePalette('default')
    expect(result.tokens['--cui-color-navy']).toBe('#001d35')
    expect(result.tokens['--cui-color-yellow']).toBe('#ffed3e')
    expect(result.tokens['--cui-color-teal']).toBe('#02767f')
    expect(result.tokens['--cui-bg']).toBe('#ffffff')
  })

  it('emits the surface tokens components paint with', () => {
    const result = generatePalette('default')
    expect(result.tokens['--cui-surface']).toBe('#ffffff')
    expect(result.tokens['--cui-surface-raised']).toBe('#ffffff')
    expect(result.tokens['--cui-surface-glass']).toMatch(/^rgba\(255, 255, 255, 0\.94\)$/)
    expect(result.tokens['--cui-on-surface']).toBe(result.tokens['--cui-text'])
  })

  it('rejects an unknown preset name', () => {
    expect(() => generatePalette('does-not-exist')).toThrow(/unknown preset/)
  })
})

// Regression: found by hand while browser-testing the "Forest"/"Burgundy"/
// "Slate" presets against the real AppButton: its `quaternary` variant pairs
// `--cui-color-violet` directly with a hardcoded white label (see
// src/components/button/AppButton.vue), not a derived "-contrast" token.
// The generic auto-derived "interaction accent" formula (lightness ~58%) is
// too light to hold white text, so every non-"default" preset originally
// shipped with this file rendered illegibly. See enforceHardcodedPairingSafety
// in src/utils/palette.js.
describe('generatePalette: hardcoded white-text pairings stay legible', () => {
  it('every preset holds white text on every role components pair with white', () => {
    for (const name of Object.keys(presetPalettes)) {
      const { roles } = generatePalette(name)
      for (const role of ['primary', 'secondary', 'tertiary', 'quaternary', 'neutralDark', 'success', 'danger']) {
        expect(checkContrast('#ffffff', roles[role]).aaText, `preset "${name}": white on ${role} (${roles[role]})`).toBe(true)
      }
      expect(checkContrast(roles.primary, roles.accent).aaText, `preset "${name}": primary ink on accent`).toBe(true)
    }
  })

  it('adjusts an explicitly light quaternary (violet) rather than shipping illegible button text', () => {
    const { roles } = generatePalette({ primary: '#001d35', quaternary: '#9977cc' }) // ~2.6:1 against white as given
    expect(checkContrast('#ffffff', roles.quaternary).aaText).toBe(true)
  })

  it('labels a dark accent with white instead of nudging the brand ink (accent button)', () => {
    const { tokens } = generatePalette({ primary: '#001d35', accent: '#C41502' }) // white on it ≈ 5.6:1
    expect(tokens['--cui-accent-contrast']).toBe('#ffffff')
  })

  it('keeps the brand ink as the label on a light accent', () => {
    const { tokens } = generatePalette({ primary: '#001d35', accent: '#ffed3e' })
    expect(tokens['--cui-accent-contrast']).toBe('#001d35')
  })

  it('adjusts an explicitly light accent rather than shipping illegible warning-banner text', () => {
    const { roles } = generatePalette({ primary: '#001d35', accent: '#ffe680' }) // too light for navy ink at strong contrast
    expect(checkContrast(roles.primary, roles.accent).aaText || checkContrast(roles.primary, roles.accent).aaLarge).toBe(true)
  })
})

describe('generatePalette: mode 2: one primary color', () => {
  it('derives a complete, passing palette from primary alone', () => {
    const result = generatePalette({ primary: '#123456' })
    for (const role of paletteRoles) expect(result.roles[role.key]).toBeTruthy()
    expectAllContrastPasses(result, 'primary-only #123456')
  })

  it('derives sensible colors even from a very light or fully saturated primary', () => {
    for (const primary of ['#ffcc00', '#ff0000', '#eef2f5', '#050608']) {
      const result = generatePalette({ primary })
      expectAllContrastPasses(result, `primary-only ${primary}`)
    }
  })
})

describe('generatePalette: mode 3: individual colors', () => {
  it('fills in whatever a caller omits, keeping what they gave as the swatch', () => {
    const result = generatePalette({ accent: '#00aaff', success: '#009966' })
    expect(result.tokens['--cui-color-yellow']).toBe('#00aaff')
    expectAllContrastPasses(result, 'individual accent+success')
  })

  // Regression: AppButton/AlertBanner/Badge/NotificationCenter pair several
  // swatches DIRECTLY with a hardcoded white label (not a derived "-contrast"
  // token), so a caller-supplied value for one of those roles must still be
  // adjusted if it doesn't hold up against literal white, even though the
  // caller gave it explicitly.
  it('adjusts a caller-supplied role that cannot hold white text, since components pair it with white directly', () => {
    const result = generatePalette({ success: '#009966' }) // only 3.65:1 against white
    expect(checkContrast('#ffffff', result.tokens['--cui-color-success']).aaText).toBe(true)
  })

  it('keeps a caller-supplied role unchanged when it already holds white text fine', () => {
    const result = generatePalette({ success: '#0e7a3f' }) // the shipped default, already safe
    expect(result.tokens['--cui-color-success']).toBe('#0e7a3f')
  })

  it('defaults info to secondary when info is not given', () => {
    const result = generatePalette({ secondary: '#114466' })
    expect(result.roles.info).toBe('#114466')
  })

  it('ignores unknown keys and empty values rather than throwing', () => {
    const result = generatePalette({ primary: '#123456', notARole: '#ff00ff', accent: '' })
    expect(result.roles.notARole).toBeUndefined()
    expectAllContrastPasses(result, 'unknown-key tolerance')
  })
})

describe('generatePalette: mode 4: every color given', () => {
  it('still guarantees contrast even when the caller supplies a clashing set', () => {
    const result = generatePalette({
      primary: '#8899aa', // deliberately too light/low-contrast to use as-is for button text
      accent: '#ffdd55',
      secondary: '#4477aa',
      tertiary: '#663388',
      quaternary: '#9977cc',
      highlight: '#bbddee',
      neutralDark: '#445566',
      success: '#33aa55',
      warning: '#cc8800',
      danger: '#cc3333',
      info: '#4477aa',
      bg: '#ffffff'
    })
    expectAllContrastPasses(result, 'full mode, clashing input')
  })

  it('rejects a dark bg: that is what [data-cui-theme="dark"] is for', () => {
    expect(() => generatePalette({ primary: '#001d35', bg: '#111111' })).toThrow(/bg.*light/i)
  })
})

describe('generatePalette: fuzz sweep', () => {
  it('always produces a fully passing palette across a randomized hue/lightness/saturation sweep', () => {
    let seed = 42
    const rand = () => {
      // deterministic PRNG so a failure is reproducible
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    for (let i = 0; i < 60; i++) {
      const primary = rgbToHex(hslToRgb({ h: rand() * 360, s: 20 + rand() * 80, l: 5 + rand() * 90 }))
      const result = generatePalette({ primary })
      expectAllContrastPasses(result, `fuzz primary=${primary}`)
    }
  })
})

describe('applyPalette / resetPalette', () => {
  const shipped = JSON.parse(JSON.stringify(sectionThemes))

  beforeEach(() => {
    resetPalette()
    document.getElementById('civic-ui-theme-vars')?.remove()
  })

  it('injects a single style element carrying the full token set', () => {
    const result = generatePalette({ primary: '#123456' })
    applyPalette(result)
    const styleEl = document.getElementById('civic-ui-theme-vars')
    expect(styleEl).not.toBeNull()
    expect(styleEl.textContent).toContain('--cui-color-navy: #123456')
    expect(styleEl.textContent).toContain(":root")
    expect(styleEl.textContent).toContain("[data-cui-theme='dark']")
  })

  it('updates the shared sectionThemes map so Hero/Cta/Steps background themes follow', () => {
    const result = generatePalette({ primary: '#123456' })
    applyPalette(result)
    expect(sectionThemes.navy.bg).toBe('#123456')
  })

  it('resetPalette restores the exact shipped sectionThemes', () => {
    applyPalette(generatePalette({ primary: '#654321' }))
    expect(sectionThemes.navy.bg).toBe('#654321')
    resetPalette()
    expect(sectionThemes).toEqual(shipped)
    expect(document.getElementById('civic-ui-theme-vars')).toBeNull()
  })

  it('applyPalette returns a revert function equivalent to resetPalette', () => {
    const revert = applyPalette(generatePalette({ primary: '#654321' }))
    expect(sectionThemes.navy.bg).toBe('#654321')
    revert()
    expect(sectionThemes).toEqual(shipped)
  })
})

describe('shared state can\'t inject CSS', () => {
  it('applyPalette refuses token values that break out of their rule', async () => {
    const { applyPalette, resetPalette } = await import('../../src/utils/palette.js')
    const evil = { tokens: { '--cui-primary': 'red; } body { background:url(//tracker/x) } :root { --y: 1' }, dark: {}, sectionThemes: {} }
    expect(() => applyPalette(evil)).toThrow(TypeError)
    expect(() => applyPalette({ tokens: { 'background-image': 'none' }, dark: {}, sectionThemes: {} })).toThrow(TypeError)
    expect(() => applyPalette({ tokens: { '--cui-x': 'url(//tracker/x)' }, dark: {}, sectionThemes: {} })).toThrow(TypeError)
    resetPalette()
  })

  it('applyPalette ignores __proto__ and non-color theme values', async () => {
    const { applyPalette, resetPalette, generatePalette } = await import('../../src/utils/palette.js')
    const { sectionThemes } = await import('../../src/utils/themes.js')
    const base = generatePalette('default')
    const themes = JSON.parse('{"navy": {"__proto__": {"polluted": true}, "bg": "url(https://tracker/p.gif)"}}')
    applyPalette({ ...base, sectionThemes: themes })
    expect(sectionThemes.navy.polluted).toBeUndefined()
    expect(sectionThemes.navy.bg).not.toContain('url(')
    resetPalette()
  })

  it('a hand-mutated sectionThemes value never reaches a section style', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: HeroSection } = await import('../../src/sections/HeroSection.vue')
    const { sectionThemes } = await import('../../src/utils/themes.js')
    const original = sectionThemes.navy.bg
    sectionThemes.navy.bg = 'url(https://tracker/p.gif)'
    try {
      expect(mount(HeroSection, { props: { title: 'T' } }).attributes('style')).not.toContain('tracker')
    } finally {
      sectionThemes.navy.bg = original
    }
  })

  it('freezes exported reference data', async () => {
    const { presetPalettes, paletteRoles } = await import('../../src/utils/palette.js')
    const { themeRoles } = await import('../../src/utils/themes.js')
    const { COLOR_MODES } = await import('../../src/composables/useColorMode.js')
    for (const value of [presetPalettes, presetPalettes.default, paletteRoles, paletteRoles[0], themeRoles, COLOR_MODES]) {
      expect(Object.isFrozen(value)).toBe(true)
    }
  })
})

describe('section theme eyebrow', () => {
  it('keeps the accent eyebrow where it reads, white where it would not', () => {
    expect(generatePalette('default').sectionThemes.navy.eyebrow).toBe('#ffed3e')
    expect(generatePalette({ primary: '#16120E', accent: '#C41502' }).sectionThemes.navy.eyebrow).toBe('#ffffff')
  })

  it('every generated eyebrow meets normal-text contrast on its field', () => {
    for (const name of Object.keys(presetPalettes)) {
      const themes = generatePalette(name).sectionThemes
      for (const [key, theme] of Object.entries(themes)) {
        expect(checkContrast(theme.eyebrow, theme.bg).aaText, `${name}/${key}`).toBe(true)
      }
    }
  })
})
