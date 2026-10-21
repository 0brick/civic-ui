import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  rgbToHex,
  parseColor,
  isValidColor,
  toHex,
  rgbToHsl,
  hslToRgb,
  relativeLuminance,
  getContrastRatio,
  checkContrast,
  ensureContrast,
  mix,
  withAlpha,
  rotateHue,
  adjustLightness,
  CONTRAST
} from '../../src/utils/color.js'

describe('hex/rgb conversions', () => {
  it('parses 3- and 6-digit hex the same way', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('001d35')).toEqual({ r: 0, g: 29, b: 53 })
  })

  it('rejects invalid hex', () => {
    expect(hexToRgb('not-a-color')).toBeNull()
    expect(hexToRgb('#12')).toBeNull()
  })

  it('round-trips rgb -> hex -> rgb', () => {
    expect(rgbToHex({ r: 0, g: 29, b: 53 })).toBe('#001d35')
    expect(rgbToHex(hexToRgb('#ffed3e'))).toBe('#ffed3e')
  })

  it('parseColor understands rgb()/rgba() too', () => {
    expect(parseColor('rgb(0, 29, 53)')).toEqual({ r: 0, g: 29, b: 53 })
    expect(parseColor('rgba(0, 29, 53, 0.5)')).toEqual({ r: 0, g: 29, b: 53 })
  })

  // Regression: resolveBackground()'s COLOR_RE classifies "hsl(...)"/"hsla(...)"
  // strings as a color (see utils/themes.js), but parseColor only understood
  // hex/rgb(): an hsl() background would silently fail every ensureContrast()
  // call downstream. Covers both the legacy comma syntax and CSS Color 4's
  // space-separated syntax.
  it('parseColor understands hsl()/hsla() too', () => {
    expect(parseColor('hsl(210, 60%, 20%)')).toEqual({ r: 20, g: 51, b: 82 })
    expect(parseColor('hsla(210, 60%, 20%, 0.5)')).toEqual({ r: 20, g: 51, b: 82 })
    expect(parseColor('hsl(210 60% 20% / 0.5)')).toEqual({ r: 20, g: 51, b: 82 })
    expect(parseColor('hsl(210deg, 60%, 20%)')).toEqual({ r: 20, g: 51, b: 82 })
  })

  it('isValidColor/toHex', () => {
    expect(isValidColor('#001d35')).toBe(true)
    expect(isValidColor('hsl(210, 60%, 20%)')).toBe(true)
    expect(isValidColor('banana')).toBe(false)
    expect(toHex('rgb(255, 0, 0)')).toBe('#ff0000')
    expect(() => toHex('banana')).toThrow(/invalid color/)
  })
})

describe('hsl round-trip', () => {
  it('recovers the same hex through hsl and back', () => {
    for (const hex of ['#001d35', '#ffed3e', '#02767f', '#b3261e', '#808080', '#ffffff', '#000000']) {
      const hsl = rgbToHsl(hexToRgb(hex))
      expect(rgbToHex(hslToRgb(hsl))).toBe(hex)
    }
  })
})

describe('contrast math', () => {
  it('black vs white is the maximum 21:1', () => {
    expect(getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 0)
  })

  it('identical colors have a ratio of 1', () => {
    expect(getContrastRatio({ r: 100, g: 100, b: 100 }, { r: 100, g: 100, b: 100 })).toBeCloseTo(1, 5)
  })

  it('is symmetric', () => {
    const a = { r: 10, g: 20, b: 30 }
    const b = { r: 200, g: 210, b: 220 }
    expect(getContrastRatio(a, b)).toBeCloseTo(getContrastRatio(b, a), 10)
  })

  it('relativeLuminance is 0 for black and 1 for white', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5)
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5)
  })

  it('checkContrast reports the AA/AAA/UI thresholds', () => {
    const report = checkContrast('#001d35', '#ffffff')
    expect(report.ratio).toBeGreaterThan(CONTRAST.AA_TEXT)
    expect(report.aaText).toBe(true)
    expect(report.aaaText).toBe(true)
  })
})

describe('ensureContrast', () => {
  it('is a no-op when the ratio already passes', () => {
    expect(ensureContrast('#001d35', '#ffffff', CONTRAST.AA_TEXT)).toBe('#001d35')
  })

  // Regression: a naive "walk toward whichever bound clamp() picks" loop can
  // get stuck when the starting lightness is already exactly at the bound it
  // needs to move away from (pure white text needing to darken, or pure
  // black text needing to lighten): the loop guard must be direction-aware,
  // not a blanket `l > 0 && l < 100`.
  it('darkens pure white text that starts at the lightness bound', () => {
    const result = ensureContrast('#ffffff', '#ffcc00', CONTRAST.AA_TEXT)
    expect(checkContrast(result, '#ffcc00').aaText).toBe(true)
  })

  // Regression: the black/white pick can't use a fixed 0.5 luminance split,
  // WCAG contrast is asymmetric (black-on-X reaches high ratios much faster
  // than white-on-X as X darkens), so the true crossover sits near 0.18, and
  // a 0.5 split picks the *worse* extreme for mid-tone backgrounds.
  it('picks whichever of black/white actually has more contrast headroom, not a 0.5 luminance split', () => {
    const bg = '#8899aa' // relative luminance ~0.31: below 0.5, but black-on-it beats white-on-it
    const result = ensureContrast('#ffffff', bg, CONTRAST.AA_TEXT)
    expect(checkContrast(result, bg).aaText).toBe(true)
  })

  it('preserves hue/saturation when a passing lightness exists', () => {
    const result = ensureContrast('#4477aa', '#ffffff', CONTRAST.AA_TEXT)
    const hsl = rgbToHsl(hexToRgb(result))
    const original = rgbToHsl(hexToRgb('#4477aa'))
    expect(hsl.h).toBeCloseTo(original.h, 0)
  })

  it('never fails to return a valid contrasting color across a hue sweep', () => {
    for (let h = 0; h < 360; h += 15) {
      for (const l of [5, 25, 50, 75, 95]) {
        const fg = rgbToHex(hslToRgb({ h, s: 80, l }))
        for (const bg of ['#ffffff', '#000000', '#8899aa', '#001d35', '#ffed3e']) {
          const result = ensureContrast(fg, bg, CONTRAST.AA_TEXT)
          expect(isValidColor(result)).toBe(true)
        }
      }
    }
  })
})

describe('color adjustments', () => {
  it('mix blends toward the second color', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff')
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
  })

  it('withAlpha produces an rgba() string', () => {
    expect(withAlpha('#001d35', 0.14)).toBe('rgba(0, 29, 53, 0.14)')
  })

  it('rotateHue changes hue but keeps saturation/lightness', () => {
    const original = rgbToHsl(hexToRgb('#02767f'))
    const rotated = rgbToHsl(hexToRgb(rotateHue('#02767f', 90)))
    expect(rotated.h).toBeCloseTo(((original.h + 90) % 360), 0)
    expect(rotated.s).toBeCloseTo(original.s, 0)
  })

  it('adjustLightness clamps to [0, 100]', () => {
    expect(adjustLightness('#ffffff', 50)).toBe('#ffffff')
    expect(adjustLightness('#000000', -50)).toBe('#000000')
  })
})

describe('parseColor: CSS Color 4 syntax', () => {
  it('reads space-separated rgb(), percentages and 4/8-digit hex', async () => {
    const { parseColor } = await import('../../src/utils/color.js')
    expect(parseColor('rgb(0 29 53)')).toEqual({ r: 0, g: 29, b: 53 })
    expect(parseColor('rgb(0 0 0 / 50%)')).toEqual({ r: 0, g: 0, b: 0 })
    expect(parseColor('rgb(100%, 0%, 0%)')).toEqual({ r: 255, g: 0, b: 0 })
    expect(parseColor('#0008')).toEqual({ r: 0, g: 0, b: 0 })
    expect(parseColor('#001d35cc')).toEqual({ r: 0, g: 29, b: 53 })
    expect(parseColor('rgb(0 0 0) url(x)')).toBeNull()
  })
})

describe('sections never crash on a color-looking background', () => {
  it('renders HeroSection and CtaBanner for modern and malformed colors', async () => {
    const { mount } = await import('@vue/test-utils')
    const { default: HeroSection } = await import('../../src/sections/HeroSection.vue')
    const { default: CtaBanner } = await import('../../src/sections/CtaBanner.vue')
    for (const background of ['rgb(0 0 0)', '#0008', 'rgb(0 0 0 / 50%)', 'rgb(nope)', 'rgb(0 0 0) url(https://tracker/x)']) {
      const hero = mount(HeroSection, { props: { title: 'T', background } })
      expect(hero.attributes('style') || '', background).not.toContain('url(')
      mount(CtaBanner, { props: { title: 'T', background, action: { label: 'Go', href: '/' } } })
    }
  })
})
