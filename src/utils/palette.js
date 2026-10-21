// Color palette configuration engine.
//
// Four ways a consuming app can configure color (see docs/theming.md):
//   1. Preset: pick one of `presetPalettes` by name.
//   2. Primary only: give one brand/ink color, everything else is derived.
//   3. Individual: give any subset of `paletteRoles`, the rest is derived.
//   4. Full: give every role explicitly.
//
// These aren't four code paths: `generatePalette(colors)` always runs the same
// pipeline: fill in whatever roles are missing from what's given (a no-op when
// everything is already given), then run every text/background pairing the
// components actually render through `ensureContrast` so the result meets WCAG
// AA regardless of which roles came from the caller vs. were derived. A preset
// is just a curated, complete `colors` object handed to the same pipeline.
import {
  parseColor,
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  relativeLuminance,
  ensureContrast,
  checkContrast,
  getContrastRatio,
  mix,
  withAlpha,
  adjustLightness,
  toHex,
  clamp,
  CONTRAST
} from './color'
import { sectionThemes, addRoleAliases } from './themes'
import { hasOwn } from './security'

export const paletteRoles = [
  { key: 'primary', label: 'Primary (ink)', hint: 'Body text, headings, dark surfaces' },
  { key: 'accent', label: 'Accent (CTA)', hint: 'Primary buttons, highlights' },
  { key: 'secondary', label: 'Secondary (links)', hint: 'Links, secondary accent' },
  { key: 'tertiary', label: 'Deep accent', hint: 'Hover states, second color accent' },
  { key: 'quaternary', label: 'Interaction accent', hint: 'Hover/active states, third color accent' },
  { key: 'highlight', label: 'Light accent', hint: 'Illustrative surfaces, light highlight' },
  { key: 'neutralDark', label: 'Neutral dark', hint: 'Neutral dark accent (e.g. footer, badges)' },
  { key: 'success', label: 'Success', hint: 'Success messages' },
  { key: 'warning', label: 'Warning', hint: 'Warning messages' },
  { key: 'danger', label: 'Danger', hint: 'Error messages' },
  { key: 'info', label: 'Information', hint: 'Info messages (default: secondary)' },
  { key: 'bg', label: 'Page background', hint: 'Must stay light: use [data-cui-theme="dark"] for dark surfaces' }
]

// security: shared, read-only reference data; frozen so no other
// script on the page can quietly rewrite a preset or role list.
paletteRoles.forEach((role) => Object.freeze(role))
Object.freeze(paletteRoles)

const ROLE_KEYS = paletteRoles.map((r) => r.key)

// Hand-curated, ready-made palettes. `default`
// mirrors the color values shipped in src/styles/tokens.css exactly: picking
// it (or configuring nothing at all) reproduces the library's stock look.
export const presetPalettes = {
  default: {
    primary: '#001d35',
    accent: '#ffed3e',
    secondary: '#02767f',
    tertiary: '#3b2781',
    quaternary: '#6e57ce',
    highlight: '#80cdeb',
    neutralDark: '#30353b',
    success: '#0e7a3f',
    warning: '#a15c00',
    danger: '#b3261e',
    info: '#02767f',
    bg: '#ffffff'
  },
  forest: {
    primary: '#0f2e22',
    accent: '#f2b632',
    secondary: '#3c7a5d',
    tertiary: '#1f4d3a',
    quaternary: '#6fa287',
    highlight: '#bfe3cf',
    neutralDark: '#2b2e2b',
    success: '#1c7a43',
    warning: '#a1660b',
    danger: '#ad3223',
    info: '#3c7a5d',
    bg: '#ffffff'
  },
  burgundy: {
    primary: '#3a1220',
    accent: '#e8b84b',
    secondary: '#7a3450',
    tertiary: '#4a1730',
    quaternary: '#b5677c',
    highlight: '#f0c9d2',
    neutralDark: '#332327',
    success: '#0e7a3f',
    warning: '#a15c00',
    danger: '#a92f2a',
    info: '#7a3450',
    bg: '#ffffff'
  },
  slate: {
    primary: '#132531',
    accent: '#ffb547',
    secondary: '#2f7fa6',
    tertiary: '#22405c',
    quaternary: '#5b8aa6',
    highlight: '#bcdeeb',
    neutralDark: '#2e343a',
    success: '#0e7a3f',
    warning: '#a15c00',
    danger: '#b3261e',
    info: '#2f7fa6',
    bg: '#ffffff'
  }
}
for (const preset of Object.values(presetPalettes)) Object.freeze(preset)
Object.freeze(presetPalettes)

const STATUS_DEFAULTS = { success: '#0e7a3f', warning: '#a15c00', danger: '#b3261e' }

function normHue(h) {
  return ((h % 360) + 360) % 360
}

// Fills in whichever of the 12 roles weren't supplied, informed by whatever
// *was* supplied, so "primary only" and "a handful of roles" are the same
// code path, just with more of the blanks already pre-filled.
function deriveRoles(seed) {
  const roles = { ...seed }

  if (!roles.primary) {
    const donor = roles.accent || roles.secondary || roles.tertiary || roles.quaternary || roles.highlight || roles.neutralDark
    if (donor) {
      const hsl = rgbToHsl(parseColor(donor))
      roles.primary = rgbToHex(hslToRgb({ h: hsl.h, s: clamp(hsl.s * 0.7, 20, 55), l: 12 }))
    } else {
      roles.primary = presetPalettes.default.primary
    }
  }
  const primaryHsl = rgbToHsl(parseColor(roles.primary))

  if (!roles.bg) roles.bg = '#ffffff'
  if (relativeLuminance(parseColor(roles.bg)) < 0.7) {
    throw new Error(
      'civic-ui: the "bg" role must stay a light page background, for a dark section, use the built-in [data-cui-theme="dark"] surface instead of theming bg dark'
    )
  }

  if (!roles.accent) {
    let hue = normHue(primaryHsl.h + 150)
    // Keep a CTA color out of the "danger red" band so a primary button never
    // reads as an error/delete action.
    if (hue < 15 || hue > 345) hue = normHue(hue + 55)
    roles.accent = rgbToHex(hslToRgb({ h: hue, s: clamp(Math.max(primaryHsl.s, 70), 70, 96), l: 82 }))
  }

  if (!roles.secondary) {
    const hue = normHue(primaryHsl.h - 35)
    roles.secondary = rgbToHex(hslToRgb({ h: hue, s: clamp(primaryHsl.s, 45, 80), l: 30 }))
  }
  const secondaryHsl = rgbToHsl(parseColor(roles.secondary))

  if (!roles.tertiary) {
    const hue = normHue(primaryHsl.h - 15)
    roles.tertiary = rgbToHex(hslToRgb({ h: hue, s: clamp(primaryHsl.s + 10, 45, 92), l: 28 }))
  }

  if (!roles.quaternary) {
    const tertiaryHsl = rgbToHsl(parseColor(roles.tertiary))
    roles.quaternary = rgbToHex(hslToRgb({ h: tertiaryHsl.h, s: clamp(tertiaryHsl.s - 10, 35, 82), l: 58 }))
  }

  if (!roles.highlight) {
    roles.highlight = rgbToHex(hslToRgb({ h: secondaryHsl.h, s: clamp(secondaryHsl.s - 15, 25, 55), l: 78 }))
  }

  if (!roles.neutralDark) {
    roles.neutralDark = rgbToHex(hslToRgb({ h: primaryHsl.h, s: clamp(primaryHsl.s * 0.18, 3, 14), l: 21 }))
  }

  for (const key of ['success', 'warning', 'danger']) {
    if (!roles[key]) roles[key] = STATUS_DEFAULTS[key]
  }
  if (!roles.info) roles.info = roles.secondary

  return roles
}

// Several components pair these swatches DIRECTLY with a hardcoded white
// label instead of a dedicated "-contrast" token: AppButton's primary/
// quaternary/danger variants, Badge's primary variant, AlertBanner's info/
// success/danger variants, NotificationCenter's danger badge, SiteFooter,
// Tooltip, ... So the swatch itself has to stay safe for that literal
// pairing in every configuration, even a "full"/"individual" one where a
// caller supplies it explicitly: a derived "-contrast" token nobody reads
// doesn't help. `accent` is *not* in this list: everything that puts a label
// on an accent fill reads the derived --cui-accent-contrast, and accent used
// as text on the primary band reads --cui-accent-on-primary, so a brand's
// accent swatch (e.g. a signal red) stays exactly as given.
const WHITE_TEXT_ROLES = ['primary', 'secondary', 'tertiary', 'quaternary', 'neutralDark', 'success', 'danger']

function enforceHardcodedPairingSafety(roles) {
  for (const key of WHITE_TEXT_ROLES) {
    roles[key] = ensureContrast(roles[key], '#ffffff', CONTRAST.AA_TEXT)
  }
  return roles
}

// A soft, contrast-guaranteed "dimmed" tone for body copy sitting on `bgHex`
// as a dark/solid band (hero sections, footers, ...): a small step off pure
// white/black toward `bgHex` itself, then pushed back to the WCAG floor if
// that step wasn't enough.
function dimmedOn(bgHex, ratio = CONTRAST.AA_TEXT) {
  const towardWhite = relativeLuminance(parseColor(bgHex)) < 0.5
  const base = mix(towardWhite ? '#ffffff' : '#000000', bgHex, 0.14)
  return ensureContrast(base, bgHex, ratio)
}

// Nudges `base` until it holds non-text contrast (3:1) against every
// background in `against`: all of them lie on the same side of it (all
// light, or all dark), so each step only ever pushes further the same way.
function controlBorderOn(base, against) {
  return against.reduce((color, bg) => ensureContrast(color, bg, CONTRAST.UI), base)
}

// ensureContrast() stops at the first lightness step past its target, which
// can land a hair above it (the default dark danger text came out at
// 4.5002:1): a checker that rounds or blends a little differently then
// reports a fail. Status texts aim for a small reserve instead.
const STATUS_TEXT_MIN = CONTRAST.AA_TEXT + 0.1

function statusPair(hex, bg) {
  const tintBg = mix(bg, hex, 0.12)
  const tintText = ensureContrast(hex, tintBg, STATUS_TEXT_MIN)
  return { bg: tintBg, text: tintText }
}

function buildResult(roles) {
  const { primary, accent, secondary, tertiary, quaternary, highlight, neutralDark, success, warning, danger, info, bg } = roles

  const inkNeutral = rgbToHex(
    hslToRgb({ h: rgbToHsl(parseColor(primary)).h, s: clamp(rgbToHsl(parseColor(primary)).s * 0.16, 0, 12), l: 30 })
  )
  const grey50 = mix(bg, inkNeutral, 0.05)
  const grey100 = mix(bg, inkNeutral, 0.11)
  const grey300 = mix(bg, inkNeutral, 0.3)
  const grey500 = mix(bg, inkNeutral, 0.58)
  const grey700 = mix(bg, inkNeutral, 0.85)

  const text = ensureContrast(primary, bg, CONTRAST.AA_TEXT)
  const heading = ensureContrast(primary, bg, CONTRAST.AA_TEXT)
  const textMuted = ensureContrast(mix(primary, bg, 0.32), bg, CONTRAST.AA_TEXT)

  const primaryContrast = ensureContrast('#ffffff', primary, CONTRAST.AA_TEXT)
  // Label on an accent fill: whichever of the brand ink and white reads
  // better on it, nudged only as far as needed (same idea as
  // deriveContrastText() in themes.js). Yellow keeps the navy ink; a red
  // accent gets white.
  const accentSeed = getContrastRatio(primary, accent) >= getContrastRatio('#ffffff', accent) ? primary : '#ffffff'
  const accentContrast = ensureContrast(accentSeed, accent, CONTRAST.AA_TEXT)
  const accentOnPrimary = ensureContrast(accent, primary, CONTRAST.AA_TEXT)

  const link = ensureContrast(secondary, bg, CONTRAST.AA_TEXT)
  const linkHover = ensureContrast(tertiary, bg, CONTRAST.AA_TEXT)
  const focusRing = ensureContrast(secondary, bg, CONTRAST.UI)

  const successPair = statusPair(success, bg)
  const warningPair = statusPair(warning, bg)
  const dangerPair = statusPair(danger, bg)
  const infoPair = statusPair(info, bg)

  const line = withAlpha(primary, 0.14)
  const lineStrong = withAlpha(primary, 0.26)
  const borderStrong = ensureContrast(primary, bg, CONTRAST.UI)

  const bgSubtle = mix(bg, text, 0.04)
  const bgMuted = mix(bg, text, 0.09)
  // a11y (WCAG 1.4.11): the outline of a form field, the off-track of a
  // Switch, inactive Carousel dots, ...: the only thing that shows where a
  // control is, so it needs 3:1 against every light field it can sit on.
  // `--cui-border` (14 % ink) stays for decorative dividers and card frames.
  const borderControl = controlBorderOn(mix(primary, bg, 0.46), [bg, '#ffffff', bgSubtle, bgMuted])

  const tokens = {
    '--cui-color-navy': primary,
    '--cui-color-navy-700': mix(primary, '#ffffff', 0.16),
    '--cui-color-navy-600': neutralDark,
    '--cui-color-anthracite': neutralDark,
    '--cui-color-teal': secondary,
    '--cui-color-purple': tertiary,
    '--cui-color-violet': quaternary,
    '--cui-color-sky': highlight,
    '--cui-color-yellow': accent,
    '--cui-color-yellow-ring': adjustLightness(accent, -4),
    '--cui-color-white': '#ffffff',
    '--cui-color-grey-50': grey50,
    '--cui-color-grey-100': grey100,
    '--cui-color-grey-300': grey300,
    '--cui-color-grey-500': grey500,
    '--cui-color-grey-700': grey700,
    '--cui-color-success': success,
    '--cui-color-warning': warning,
    '--cui-color-danger': danger,
    '--cui-color-info': info,
    '--cui-success-bg': successPair.bg,
    '--cui-success-text': successPair.text,
    '--cui-warning-bg': warningPair.bg,
    '--cui-warning-text': warningPair.text,
    '--cui-danger-bg': dangerPair.bg,
    '--cui-danger-text': dangerPair.text,
    '--cui-info-bg': infoPair.bg,
    '--cui-info-text': infoPair.text,
    '--cui-color-line': line,
    '--cui-color-line-strong': lineStrong,
    '--cui-text': text,
    '--cui-text-muted': textMuted,
    '--cui-text-on-dark': '#ffffff',
    '--cui-heading': heading,
    '--cui-bg': bg,
    '--cui-bg-subtle': bgSubtle,
    '--cui-bg-muted': bgMuted,
    '--cui-border': line,
    '--cui-border-strong': borderStrong,
    '--cui-border-control': borderControl,
    '--cui-primary-hover': mix(primary, '#ffffff', 0.16),
    '--cui-text-secondary': ensureContrast(secondary, bg, CONTRAST.AA_TEXT),
    '--cui-text-danger': ensureContrast(danger, bg, CONTRAST.AA_TEXT),
    '--cui-text-success': ensureContrast(success, bg, CONTRAST.AA_TEXT),
    '--cui-text-warning': ensureContrast(warning, bg, CONTRAST.AA_TEXT),
    '--cui-surface': '#ffffff',
    '--cui-surface-raised': '#ffffff',
    '--cui-surface-glass': withAlpha('#ffffff', 0.94),
    '--cui-on-surface': text,
    '--cui-primary': primary,
    '--cui-primary-contrast': primaryContrast,
    '--cui-accent': accent,
    '--cui-accent-contrast': accentContrast,
    '--cui-accent-on-primary': accentOnPrimary,
    '--cui-accent-hover': adjustLightness(accent, -6),
    '--cui-link': link,
    '--cui-link-hover': linkHover,
    '--cui-focus-ring': focusRing
  }

  const dark = {
    '--cui-text': dimmedOn(primary, CONTRAST.AA_TEXT),
    '--cui-heading': ensureContrast('#ffffff', primary, CONTRAST.AA_LARGE),
    '--cui-bg': primary,
    '--cui-bg-subtle': mix(primary, '#ffffff', 0.12),
    '--cui-border': withAlpha(ensureContrast('#ffffff', primary, CONTRAST.UI), 0.24),
    // Toward white on a dark band, toward black on a light one (as dimmedOn).
    '--cui-border-control': controlBorderOn(
      mix(relativeLuminance(parseColor(primary)) < 0.5 ? '#ffffff' : '#000000', primary, 0.45),
      [primary]
    ),
    '--cui-link': ensureContrast(highlight, primary, CONTRAST.AA_TEXT),
    '--cui-focus-ring': ensureContrast(highlight, primary, CONTRAST.UI)
  }

  const darkMode = buildDarkMode(roles)

  const onLight = (base, against) => ensureContrast(base, against, CONTRAST.AA_TEXT)
  const headingOnLight = (base, against) => ensureContrast(base, against, CONTRAST.AA_LARGE)

  // eyebrow: the small kicker above a hero title, so normal-text contrast.
  // The accent only where it already reads on that field as-is: a red
  // accent nudged to pass on near-black looks muddy; the white/heading
  // ink takes its place then.
  const eyebrowOn = (base, against, fallback = '#ffffff') =>
    getContrastRatio(base, against) >= CONTRAST.AA_TEXT ? base : ensureContrast(fallback, against, CONTRAST.AA_TEXT)
  const generatedSectionThemes = {
    navy: { bg: primary, text: dimmedOn(primary), heading: ensureContrast('#ffffff', primary, CONTRAST.AA_LARGE), eyebrow: eyebrowOn(accent, primary) },
    purple: { bg: tertiary, text: dimmedOn(tertiary), heading: ensureContrast(accent, tertiary, CONTRAST.AA_LARGE), eyebrow: eyebrowOn(accent, tertiary) },
    violet: { bg: quaternary, text: dimmedOn(quaternary), heading: ensureContrast(accent, quaternary, CONTRAST.AA_LARGE), eyebrow: eyebrowOn(accent, quaternary) },
    teal: { bg: secondary, text: dimmedOn(secondary), heading: ensureContrast('#ffffff', secondary, CONTRAST.AA_LARGE), eyebrow: eyebrowOn('#ffffff', secondary) },
    sky: { bg: highlight, text: onLight(primary, highlight), heading: headingOnLight(tertiary, highlight), eyebrow: onLight(tertiary, highlight) },
    gold: { bg: accent, text: onLight(primary, accent), heading: headingOnLight(tertiary, accent), eyebrow: onLight(tertiary, accent) },
    anthracite: { bg: neutralDark, text: dimmedOn(neutralDark), heading: ensureContrast('#ffffff', neutralDark, CONTRAST.AA_LARGE), eyebrow: eyebrowOn(accent, neutralDark) },
    light: { bg, text: textMuted, heading, eyebrow: ensureContrast(secondary, bg, CONTRAST.AA_TEXT) }
  }

  const contrastChecks = {
    'Text on background': checkContrast(text, bg),
    'Heading on background': checkContrast(heading, bg),
    'Link on background': checkContrast(link, bg),
    // These mirror the literal (not derived) pairings the components render,
    // AppButton primary/quaternary/danger, Badge primary, AlertBanner info/
    // success/warning/danger, SiteFooter, Tooltip, ...: see
    // enforceHardcodedPairingSafety() above.
    'White text on primary (buttons, badges, footer)': checkContrast('#ffffff', primary),
    'Label on accent (accent button, badge, warning banner)': checkContrast(accentContrast, accent),
    'Accent text on primary (hero eyebrow, stat values)': checkContrast(accentOnPrimary, primary),
    'White text on secondary (info banner)': checkContrast('#ffffff', secondary),
    'White text on deep accent (hero/CTA surfaces)': checkContrast('#ffffff', tertiary),
    'White text on interaction accent (quaternary button)': checkContrast('#ffffff', quaternary),
    'White text on neutral dark': checkContrast('#ffffff', neutralDark),
    'White text on success (banner)': checkContrast('#ffffff', success),
    'White text on danger (button, banner, badge)': checkContrast('#ffffff', danger),
    'Focus ring on background': checkContrast(focusRing, bg),
    'Control border on background': checkContrast(borderControl, bg),
    'Control border on muted background': checkContrast(borderControl, bgMuted),
    'Success text on success surface': checkContrast(successPair.text, successPair.bg),
    'Warning text on warning surface': checkContrast(warningPair.text, warningPair.bg),
    'Error text on error surface': checkContrast(dangerPair.text, dangerPair.bg),
    'Info text on info surface': checkContrast(infoPair.text, infoPair.bg),
    'Text on dark surface (hero/footer)': checkContrast(dark['--cui-text'], primary),
    'Heading on dark surface': checkContrast(dark['--cui-heading'], primary),
    'Control border on dark surface': checkContrast(dark['--cui-border-control'], primary),
    // Dark color mode: every text token is checked against the *lightest*
    // dark surface it can land on (a raised Modal/Dropdown), the worst case.
    'Dark mode: text on raised surface': checkContrast(darkMode['--cui-text'], darkMode['--cui-surface-raised']),
    'Dark mode: muted text on raised surface': checkContrast(darkMode['--cui-text-muted'], darkMode['--cui-surface-raised']),
    'Dark mode: link on raised surface': checkContrast(darkMode['--cui-link'], darkMode['--cui-surface-raised']),
    'Dark mode: secondary text on raised surface': checkContrast(darkMode['--cui-text-secondary'], darkMode['--cui-surface-raised']),
    'Dark mode: error text on raised surface': checkContrast(darkMode['--cui-text-danger'], darkMode['--cui-surface-raised']),
    'Dark mode: label on primary fill': checkContrast(darkMode['--cui-primary-contrast'], darkMode['--cui-primary']),
    // Non-text contrast (3:1), so not under the "Dark mode:" text checks.
    'Control border on dark-mode background': checkContrast(darkMode['--cui-border-control'], darkMode['--cui-bg']),
    'Control border on dark-mode raised surface': checkContrast(darkMode['--cui-border-control'], darkMode['--cui-surface-raised']),
    'Control border on dark-mode muted background': checkContrast(darkMode['--cui-border-control'], darkMode['--cui-bg-muted'])
  }
  const allPass = Object.values(contrastChecks).every((c) => c.aaText || c.aaLarge)

  return { roles, tokens, dark, darkMode, sectionThemes: addRoleAliases(generatedSectionThemes), contrast: { checks: contrastChecks, allPass } }
}

// The page-wide dark color mode (docs/theming.md → Dark and light mode),
// not to be confused with `dark` above, which only re-colors content sitting
// on a navy *band* inside an otherwise light page. Everything is derived from
// the same roles, so a configured brand gets a matching dark mode for free:
// the page becomes a very dark, faintly primary-tinted field, surfaces step
// up in lightness with elevation, and emphasis fills (primary buttons, active
// tabs/pagination, checked boxes, tooltips) invert to a light ink so they
// still stand out against the dark page. Colored swatches (--cui-color-*)
// are left alone: components pair those with a literal white label, which
// stays legible whatever the page mode.
function buildDarkMode(roles) {
  const { primary, secondary, highlight, success, warning, danger, info } = roles
  const { h, s } = rgbToHsl(parseColor(primary))

  const bg = rgbToHex(hslToRgb({ h, s: clamp(s * 0.45, 8, 40), l: 8 }))
  const surface = mix(bg, '#ffffff', 0.05)
  const surfaceRaised = mix(bg, '#ffffff', 0.09)
  const aa = (fg) => ensureContrast(fg, surfaceRaised, CONTRAST.AA_TEXT)

  const text = aa(mix('#ffffff', bg, 0.1))
  const bgSubtle = mix(bg, '#ffffff', 0.04)
  const bgMuted = mix(bg, '#ffffff', 0.1)
  const inkFill = rgbToHex(hslToRgb({ h, s: clamp(s * 0.35, 5, 30), l: 90 }))
  const status = (hex) => statusPair(hex, bg)
  const successPair = status(success)
  const warningPair = status(warning)
  const dangerPair = status(danger)
  const infoPair = status(info)

  return {
    'color-scheme': 'dark',
    '--cui-color-grey-50': mix(bg, '#ffffff', 0.05),
    '--cui-color-grey-100': mix(bg, '#ffffff', 0.11),
    '--cui-color-grey-300': mix(bg, '#ffffff', 0.3),
    '--cui-color-grey-500': mix(bg, '#ffffff', 0.55),
    '--cui-color-grey-700': mix(bg, '#ffffff', 0.8),
    '--cui-color-line': withAlpha('#ffffff', 0.14),
    '--cui-color-line-strong': withAlpha('#ffffff', 0.28),
    '--cui-success-bg': successPair.bg,
    '--cui-success-text': successPair.text,
    '--cui-warning-bg': warningPair.bg,
    '--cui-warning-text': warningPair.text,
    '--cui-danger-bg': dangerPair.bg,
    '--cui-danger-text': dangerPair.text,
    '--cui-info-bg': infoPair.bg,
    '--cui-info-text': infoPair.text,
    '--cui-text': text,
    '--cui-text-muted': aa(mix('#ffffff', bg, 0.34)),
    '--cui-text-secondary': aa(secondary),
    '--cui-text-danger': aa(danger),
    '--cui-text-success': aa(success),
    '--cui-text-warning': aa(warning),
    '--cui-heading': '#ffffff',
    '--cui-bg': bg,
    '--cui-bg-subtle': bgSubtle,
    '--cui-bg-muted': bgMuted,
    '--cui-border': withAlpha('#ffffff', 0.14),
    '--cui-border-strong': ensureContrast(mix('#ffffff', bg, 0.3), bg, CONTRAST.UI),
    '--cui-border-control': controlBorderOn(mix('#ffffff', bg, 0.55), [bg, surface, surfaceRaised, bgSubtle, bgMuted]),
    '--cui-surface': surface,
    '--cui-surface-raised': surfaceRaised,
    '--cui-surface-glass': withAlpha(bg, 0.9),
    '--cui-on-surface': text,
    '--cui-primary': inkFill,
    '--cui-primary-contrast': ensureContrast(bg, inkFill, CONTRAST.AA_TEXT),
    '--cui-primary-hover': '#ffffff',
    '--cui-link': aa(highlight),
    '--cui-link-hover': aa(mix(highlight, '#ffffff', 0.4)),
    '--cui-focus-ring': ensureContrast(highlight, bg, CONTRAST.UI),
    '--cui-shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.4)',
    '--cui-shadow-md': '0 8px 24px rgba(0, 0, 0, 0.45)',
    '--cui-shadow-lg': '0 20px 48px rgba(0, 0, 0, 0.5)',
    '--cui-shadow-float': '0 12px 28px rgba(0, 0, 0, 0.5)'
  }
}

// Normalizes the four configuration modes to one `{ roles, tokens, dark,
// sectionThemes, contrast }` result. `colors` may be a preset name (string),
// or a partial/complete object keyed by `paletteRoles`: any role you omit is
// derived from the ones you did give; the ones you do give are used as-is for
// the "swatch" (--cui-color-*) but may still be lightness-adjusted for the
// specific "semantic" slot (--cui-text, --cui-link, ...) that must guarantee
// contrast against its actual background.
export function generatePalette(colors = {}) {
  let seed
  if (typeof colors === 'string') {
    if (!hasOwn(presetPalettes, colors)) {
      throw new Error(`civic-ui: unknown preset "${colors}": choose one of ${Object.keys(presetPalettes).join(', ')}`)
    }
    seed = { ...presetPalettes[colors] }
  } else if (colors && typeof colors === 'object') {
    seed = {}
    for (const key of Object.keys(colors)) {
      if (!hasOwn(colors, key) || !ROLE_KEYS.includes(key)) continue
      const value = colors[key]
      if (value == null || value === '') continue
      seed[key] = toHex(value)
    }
  } else {
    throw new Error('civic-ui: generatePalette() expects a preset name or a { role: color } object')
  }

  const roles = enforceHardcodedPairingSafety(deriveRoles(seed))
  return buildResult(roles)
}

const STYLE_ID = 'civic-ui-theme-vars'

// Snapshot of the shipped defaults, taken once at module load, so resetPalette()
// can restore sectionThemes exactly even after repeated applyPalette() calls.
const shippedSectionThemes = JSON.parse(JSON.stringify(sectionThemes))

// security: applyPalette() writes values into a <style> element,
// so a result loaded from JSON (a saved theme, a theme editor, a backend)
// must not be able to break out of its rule, `red; } body { background:
// url(//tracker) } :root { --x: 1` would. Keys must be civic-ui custom
// properties; values a color, or the plain token syntax generatePalette()
// itself produces (shadows, `color-scheme`) without ; { } < > quotes,
// backslashes, url() or @-rules.
const TOKEN_KEY_RE = /^(--cui-[a-z0-9-]+|color-scheme)$/
const SAFE_VALUE_RE = /^[\w\s#().,%/+-]+$/
const UNSAFE_VALUE_RE = /url\s*\(|expression\s*\(|image-set|@/i

function assertSafeTokens(tokens, where) {
  if (tokens == null) return {}
  if (typeof tokens !== 'object') throw new TypeError(`civic-ui: applyPalette() expected an object for ${where}`)
  for (const [key, value] of Object.entries(tokens)) {
    if (value == null) continue
    if (!TOKEN_KEY_RE.test(key)) throw new TypeError(`civic-ui: applyPalette() refused token "${key}" in ${where}, not a --cui-* custom property`)
    const str = String(value)
    if (!parseColor(str) && (!SAFE_VALUE_RE.test(str) || UNSAFE_VALUE_RE.test(str))) {
      throw new TypeError(`civic-ui: applyPalette() refused the value of ${key} in ${where}`)
    }
  }
  return tokens
}

const THEME_FIELDS = ['bg', 'text', 'heading', 'eyebrow']

function toCssBlock(selector, tokens) {
  const body = Object.entries(tokens)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
  return `${selector} {\n${body}\n}`
}

// Applies a generatePalette() result to the document: injects/updates a single
// <style> element with the full `:root` + `[data-cui-theme="dark"]` token
// override, and updates the shared `sectionThemes` map (see utils/themes.js)
// so HeroSection/CtaBanner/StepsSection's `background="navy"`-style theme
// keys follow the new palette too. Returns a function that reverts both.
export function applyPalette(result, options = {}) {
  const doc = options.document || (typeof document !== 'undefined' ? document : null)
  if (!doc) {
    throw new Error('civic-ui: applyPalette() needs a DOM document, in SSR, use generatePalette(...).tokens directly instead')
  }
  const id = options.styleId || STYLE_ID
  let styleEl = doc.getElementById(id)
  if (!styleEl) {
    styleEl = doc.createElement('style')
    styleEl.id = id
    if (options.nonce) styleEl.setAttribute('nonce', options.nonce)
    doc.head.appendChild(styleEl)
  }
  if (!result || typeof result !== 'object') throw new TypeError('civic-ui: applyPalette() expects a generatePalette() result')
  const tokens = assertSafeTokens(result.tokens, 'tokens')
  const dark = assertSafeTokens(result.dark, 'dark')
  const darkMode = result.darkMode ? assertSafeTokens(result.darkMode, 'darkMode') : null
  const blocks = [toCssBlock(':root', tokens), toCssBlock("[data-cui-theme='dark'],\n.cui-section--dark", dark)]
  if (darkMode) blocks.push(...darkModeCss(darkMode))
  styleEl.textContent = blocks.join('\n\n')

  // Only the known theme fields, and only real colors, never Object.assign
  // a whole JSON object (an own `__proto__` key would re-parent the theme).
  const themes = result.sectionThemes && typeof result.sectionThemes === 'object' ? result.sectionThemes : {}
  for (const key of Object.keys(themes)) {
    if (!hasOwn(sectionThemes, key) || !hasOwn(shippedSectionThemes, key)) continue
    const source = themes[key]
    if (!source || typeof source !== 'object') continue
    for (const field of THEME_FIELDS) {
      if (hasOwn(source, field) && typeof source[field] === 'string' && parseColor(source[field])) sectionThemes[key][field] = source[field]
    }
  }

  return () => resetPalette({ document: doc, styleId: id })
}

// The two places the dark color-mode tokens apply: mirrors the selectors in
// src/styles/tokens.css: always under data-cui-mode="dark", and under
// data-cui-mode="auto" while the OS/browser prefers a dark scheme. A band
// ([data-cui-theme='dark']) nested inside keeps its own tokens, since it's a
// more specific, later rule.
export const DARK_MODE_SELECTOR = "[data-cui-mode='dark']"
export const AUTO_MODE_SELECTOR = "[data-cui-mode='auto']"

function darkModeCss(tokens) {
  return [
    toCssBlock(DARK_MODE_SELECTOR, tokens),
    `@media (prefers-color-scheme: dark) {\n${toCssBlock(AUTO_MODE_SELECTOR, tokens).replace(/^/gm, '  ')}\n}`
  ]
}

// Reverts applyPalette(): removes the injected <style> element and restores
// sectionThemes to the values shipped in src/utils/themes.js.
export function resetPalette(options = {}) {
  const doc = options.document || (typeof document !== 'undefined' ? document : null)
  const id = options.styleId || STYLE_ID
  const styleEl = doc && doc.getElementById(id)
  if (styleEl) styleEl.remove()
  for (const key of Object.keys(shippedSectionThemes)) {
    if (hasOwn(sectionThemes, key)) Object.assign(sectionThemes[key], shippedSectionThemes[key])
  }
}
