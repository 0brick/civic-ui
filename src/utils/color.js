// Pure color math shared by the palette engine (src/utils/palette.js): hex/rgb/hsl
// conversion, WCAG relative luminance + contrast ratio, and a handful of HSL-space
// adjustments (mix, rotateHue, adjustLightness, ...). No DOM/Vue dependency: safe
// to run at build time, in SSR, or in a plain <script> before the app mounts.

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

// #rgb, #rgba, #rrggbb, #rrggbbaa: the alpha digits are accepted and
// ignored (contrast math works on the opaque color).
const HEX_RE = /^#?([a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/i

export function hexToRgb(input) {
  if (typeof input !== 'string') return null
  const m = HEX_RE.exec(input.trim())
  if (!m) return null
  let h = m[1]
  if (h.length <= 4) h = h.slice(0, 3).split('').map((c) => c + c).join('')
  else h = h.slice(0, 6)
  const num = parseInt(h, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

// Legacy comma syntax (rgb(0, 29, 53) / rgba(…, 0.5)) and CSS Color 4's
// space syntax (rgb(0 29 53 / 50%)), with numeric or percentage channels.
const RGB_FN_RE = /^rgba?\(\s*([\d.]+%?)(?:\s*,\s*|\s+)([\d.]+%?)(?:\s*,\s*|\s+)([\d.]+%?)\s*(?:[,/]\s*[\d.]+%?\s*)?\)$/i

function rgbChannel(value) {
  const n = value.endsWith('%') ? parseFloat(value) * 2.55 : parseFloat(value)
  return Number.isFinite(n) ? clamp(Math.round(n), 0, 255) : null
}

// Both legacy comma syntax (hsl(210, 60%, 20%)) and CSS Color 4's
// space-separated syntax (hsl(210 60% 20% / 0.5)): resolveBackground()'s
// COLOR_RE classifies both as a color, so both need to actually parse here.
const HSL_FN_RE = /^hsla?\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%\s*(?:[,/]\s*[\d.]+%?\s*)?\)$/i

// Accepts a hex string, an rgb()/rgba() string, an hsl()/hsla() string, or an
// already-parsed {r,g,b} object.
export function parseColor(input) {
  if (input && typeof input === 'object' && 'r' in input && 'g' in input && 'b' in input) return input
  if (typeof input !== 'string') return null
  const hex = hexToRgb(input)
  if (hex) return hex
  const m = RGB_FN_RE.exec(input.trim())
  if (m) {
    const [r, g, b] = [rgbChannel(m[1]), rgbChannel(m[2]), rgbChannel(m[3])]
    return r === null || g === null || b === null ? null : { r, g, b }
  }
  const h = HSL_FN_RE.exec(input.trim())
  if (h) return hslToRgb({ h: +h[1], s: +h[2], l: +h[3] })
  return null
}

export function isValidColor(input) {
  return parseColor(input) !== null
}

function toHexChannel(n) {
  return clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
}

export function rgbToHex(rgb) {
  return `#${toHexChannel(rgb.r)}${toHexChannel(rgb.g)}${toHexChannel(rgb.b)}`
}

// Normalizes any supported input (hex/rgb()/rgba()) to a lowercase `#rrggbb` string.
// Throws on genuinely invalid input: this is a config-time utility, not a
// user-input sanitizer, so failing loudly beats silently falling back.
export function toHex(input) {
  const rgb = parseColor(input)
  if (!rgb) throw new Error(`civic-ui: invalid color "${input}": use a hex (#rrggbb) or rgb()/rgba() value`)
  return rgbToHex(rgb)
}

export function rgbToHsl(rgbInput) {
  const rgb = typeof rgbInput === 'string' ? parseColor(rgbInput) : rgbInput
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h *= 60
  }
  return { h, s: s * 100, l: l * 100 }
}

function hueToChannel(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

export function hslToRgb({ h, s, l }) {
  const hN = (((h % 360) + 360) % 360) / 360
  const sN = clamp(s, 0, 100) / 100
  const lN = clamp(l, 0, 100) / 100
  if (sN === 0) {
    const v = Math.round(lN * 255)
    return { r: v, g: v, b: v }
  }
  const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN
  const p = 2 * lN - q
  return {
    r: Math.round(hueToChannel(p, q, hN + 1 / 3) * 255),
    g: Math.round(hueToChannel(p, q, hN) * 255),
    b: Math.round(hueToChannel(p, q, hN - 1 / 3) * 255)
  }
}

function channelLuminance(c) {
  const cs = c / 255
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
}

// WCAG 2.x relative luminance (0 = black, 1 = white).
export function relativeLuminance(input) {
  const rgb = typeof input === 'string' ? parseColor(input) : input
  return 0.2126 * channelLuminance(rgb.r) + 0.7152 * channelLuminance(rgb.g) + 0.0722 * channelLuminance(rgb.b)
}

// WCAG 2.x contrast ratio between two colors, 1 (no contrast) to 21 (black/white).
export function getContrastRatio(a, b) {
  const lA = relativeLuminance(a)
  const lB = relativeLuminance(b)
  const lighter = Math.max(lA, lB)
  const darker = Math.min(lA, lB)
  return (lighter + 0.05) / (darker + 0.05)
}

// WCAG 2.x minimum contrast ratios this library designs against.
export const CONTRAST = {
  AA_TEXT: 4.5, // normal text vs. its background
  AA_LARGE: 3, // large text (>=24px, or >=18.66px bold) vs. its background
  AAA_TEXT: 7,
  AAA_LARGE: 4.5,
  UI: 3 // non-text UI (focus rings, meaningful borders) vs. its background: WCAG 1.4.11
}

// Pushes `fg`'s HSL lightness toward black or white (whichever direction moves it
// away from `bg`'s luminance) until it reaches `minRatio` against `bg`, or hits the
// 0/100 lightness bound. Relative luminance is monotonic in HSL lightness for a
// fixed hue/saturation, so this always finds the best a given hue/saturation can
// do: hue and saturation (and therefore brand identity) are preserved whenever a
// passing lightness exists at all; only a genuinely impossible hue/bg combination
// falls through to a flat black/white result at the boundary.
export function ensureContrast(fg, bg, minRatio = CONTRAST.AA_TEXT) {
  const bgRgb = typeof bg === 'string' ? parseColor(bg) : bg
  const fgRgb = typeof fg === 'string' ? parseColor(fg) : fg
  if (!bgRgb || !fgRgb) throw new Error('civic-ui: ensureContrast() received an invalid color')
  let ratio = getContrastRatio(fgRgb, bgRgb)
  if (ratio >= minRatio) return rgbToHex(fgRgb)

  // Which extreme (black or white) has more contrast headroom against this
  // exact bg, NOT a fixed 0.5 luminance split. WCAG contrast is asymmetric
  // (black-on-X grows to 21:1 much faster than white-on-X does as X darkens),
  // so the crossover where white briefly wins for pure black/white pairs sits
  // around 0.18 relative luminance, not 0.5: comparing actual ratios avoids
  // hard-coding that constant and stays correct for any bg.
  const blackRatio = getContrastRatio({ r: 0, g: 0, b: 0 }, bgRgb)
  const whiteRatio = getContrastRatio({ r: 255, g: 255, b: 255 }, bgRgb)
  const direction = whiteRatio > blackRatio ? 1 : -1
  const hsl = rgbToHsl(fgRgb)
  let l = hsl.l
  let candidate = fgRgb
  const atBound = () => (direction < 0 ? l <= 0 : l >= 100)
  for (let i = 0; i < 100 && ratio < minRatio && !atBound(); i++) {
    l = clamp(l + direction, 0, 100)
    candidate = hslToRgb({ h: hsl.h, s: hsl.s, l })
    ratio = getContrastRatio(candidate, bgRgb)
  }
  return rgbToHex(candidate)
}

// Full contrast report for a foreground/background pair: used by the palette
// engine's report and by the playground's live contrast panel.
export function checkContrast(fg, bg) {
  const ratio = getContrastRatio(parseColor(fg), parseColor(bg))
  return {
    ratio: Math.round(ratio * 100) / 100,
    aaText: ratio >= CONTRAST.AA_TEXT,
    aaLarge: ratio >= CONTRAST.AA_LARGE,
    aaaText: ratio >= CONTRAST.AAA_TEXT,
    ui: ratio >= CONTRAST.UI
  }
}

export function mix(a, b, weight = 0.5) {
  const rgbA = typeof a === 'string' ? parseColor(a) : a
  const rgbB = typeof b === 'string' ? parseColor(b) : b
  const w = clamp(weight, 0, 1)
  return rgbToHex({
    r: rgbA.r + (rgbB.r - rgbA.r) * w,
    g: rgbA.g + (rgbB.g - rgbA.g) * w,
    b: rgbA.b + (rgbB.b - rgbA.b) * w
  })
}

export function withAlpha(input, alpha) {
  const rgb = typeof input === 'string' ? parseColor(input) : input
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(alpha, 0, 1)})`
}

export function rotateHue(input, degrees) {
  const hsl = rgbToHsl(input)
  return rgbToHex(hslToRgb({ h: hsl.h + degrees, s: hsl.s, l: hsl.l }))
}

export function adjustLightness(input, delta) {
  const hsl = rgbToHsl(input)
  return rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: clamp(hsl.l + delta, 0, 100) }))
}

export function adjustSaturation(input, delta) {
  const hsl = rgbToHsl(input)
  return rgbToHex(hslToRgb({ h: hsl.h, s: clamp(hsl.s + delta, 0, 100), l: hsl.l }))
}

export function setHsl(input, { h, s, l } = {}) {
  const base = rgbToHsl(input)
  return rgbToHex(
    hslToRgb({
      h: h !== undefined ? h : base.h,
      s: s !== undefined ? s : base.s,
      l: l !== undefined ? l : base.l
    })
  )
}
