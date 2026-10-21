import { describe, it, expect } from 'vitest'
import { sectionThemes, themeRoles, resolveBackground, deriveContrastText } from '../../src/utils/themes.js'
import { generatePalette, applyPalette, resetPalette } from '../../src/utils/palette.js'
import { getContrastRatio, parseColor, CONTRAST } from '../../src/utils/color.js'

describe('resolveBackground', () => {
  it('resolves a named theme key', () => {
    expect(resolveBackground('navy')).toEqual({ type: 'theme', key: 'navy', ...sectionThemes.navy })
  })

  it('resolves a raw hex/rgb/hsl color', () => {
    expect(resolveBackground('#fdf6e3')).toEqual({ type: 'color', bg: '#fdf6e3' })
    expect(resolveBackground('rgb(10, 20, 30)')).toEqual({ type: 'color', bg: 'rgb(10, 20, 30)' })
    expect(resolveBackground('hsl(210, 60%, 20%)')).toEqual({ type: 'color', bg: 'hsl(210, 60%, 20%)' })
  })

  it('falls through to image for anything else', () => {
    expect(resolveBackground('/photo.jpg')).toEqual({ type: 'image', image: '/photo.jpg' })
  })

  it('does not resolve inherited Object.prototype keys as a theme', () => {
    expect(resolveBackground('constructor')).toEqual({ type: 'image', image: 'constructor' })
  })

  it('returns null for empty/non-string input', () => {
    expect(resolveBackground('')).toBeNull()
    expect(resolveBackground(undefined)).toBeNull()
  })
})

// HeroSection/CtaBanner pass every named theme's `bg` through deriveContrastText
// as a sanity check on custom colors, but a *raw* background (not one of
// sectionThemes) has no curated pairing at all: this is the "user sets a
// background prop directly" worst case from the design audit: a very light
// custom color, a very dark one, and an hsl() string all need a readable
// result, not the library's old hardcoded assumption of white-on-dark.
describe('deriveContrastText', () => {
  it('meets WCAG AA against light, dark, midtone and hsl() backgrounds', () => {
    const cases = ['#fdf6e3', '#001122', '#808080', '#ffffff', '#000000', 'hsl(50, 90%, 95%)', 'hsl(210, 60%, 15%)']
    for (const bg of cases) {
      const { text, heading } = deriveContrastText(bg)
      const bgRgb = parseColor(bg)
      expect(getContrastRatio(parseColor(text), bgRgb)).toBeGreaterThanOrEqual(CONTRAST.AA_TEXT)
      expect(getContrastRatio(parseColor(heading), bgRgb)).toBeGreaterThanOrEqual(CONTRAST.AA_LARGE)
    }
  })

  it('keeps the brand navy heading on a light background instead of drifting to flat black', () => {
    expect(deriveContrastText('#ffffff').heading).toBe(sectionThemes.light.heading)
  })
})

describe('palette-role theme aliases', () => {
  it('every role alias resolves to the same theme as its legacy key', () => {
    for (const [role, key] of Object.entries(themeRoles)) {
      expect(sectionThemes[role]).toBe(sectionThemes[key])
      expect(resolveBackground(role)).toEqual(resolveBackground(key))
    }
  })

  it('aliases stay out of enumeration, so each theme is listed once', () => {
    expect(Object.keys(sectionThemes)).toEqual(['navy', 'purple', 'violet', 'teal', 'sky', 'gold', 'anthracite', 'light'])
  })

  it('applyPalette() re-colors the alias too', () => {
    applyPalette(generatePalette({ primary: '#16120e', highlight: '#f5a800' }))
    expect(sectionThemes.highlight.bg).toBe(sectionThemes.sky.bg)
    expect(resolveBackground('highlight').bg).toBe(generatePalette({ primary: '#16120e', highlight: '#f5a800' }).sectionThemes.sky.bg)
    expect(generatePalette('default').sectionThemes.primary.bg).toBe('#001d35')
    resetPalette()
    expect(sectionThemes.highlight.bg).toBe('#80cdeb')
  })
})
