// Every colored content block uses one of a handful of named "color
// themes": picking a theme sets the block's background AND
// its headline/body text color together, so they're never chosen
// separately and never clash. HeroSection and CtaBanner share this map via
// their `background` prop; StepsSection's `layout="chain"` looks each step
// up individually via its own `step.theme` key instead.
// `eyebrow` is the small uppercase kicker above a hero title: checked for
// normal-text contrast (4.5:1), since it's small; generatePalette() derives
// it per palette the same way.
export const sectionThemes = {
  navy: { bg: '#001d35', text: 'rgba(255, 255, 255, 0.86)', heading: '#ffffff', eyebrow: '#ffed3e' },
  purple: { bg: '#3b2781', text: 'rgba(255, 255, 255, 0.86)', heading: '#ffed3e', eyebrow: '#ffed3e' },
  violet: { bg: '#6e57ce', text: 'rgba(255, 255, 255, 0.9)', heading: '#ffed3e', eyebrow: '#ffffff' },
  teal: { bg: '#02767f', text: 'rgba(255, 255, 255, 0.88)', heading: '#ffffff', eyebrow: '#ffffff' },
  sky: { bg: '#80cdeb', text: '#0b2f42', heading: '#3b2781', eyebrow: '#3b2781' },
  gold: { bg: '#ffed3e', text: '#3b2f00', heading: '#3b2781', eyebrow: '#3b2781' },
  anthracite: { bg: '#30353b', text: 'rgba(255, 255, 255, 0.85)', heading: '#ffffff', eyebrow: '#ffed3e' },
  light: { bg: '#ffffff', text: '#4b5259', heading: '#001d35', eyebrow: '#02767f' }
}

// The keys above are named after the *default* palette's colors, but they're
// really palette roles (see generatedSectionThemes in utils/palette.js): with a
// configured brand, `navy` is whatever `primary` is. These aliases let a page
// say what it means: background="highlight" instead of guessing that `sky`
// is the highlight color. Each alias is the *same object* as its legacy key,
// so applyPalette()/resetPalette() update both at once; they're
// non-enumerable so iterating sectionThemes still lists every theme once.
export const themeRoles = {
  primary: 'navy',
  secondary: 'teal',
  tertiary: 'purple',
  quaternary: 'violet',
  accent: 'gold',
  highlight: 'sky',
  neutral: 'anthracite'
}
Object.freeze(themeRoles)

export function addRoleAliases(themes) {
  for (const [role, key] of Object.entries(themeRoles)) {
    if (themes[key]) Object.defineProperty(themes, role, { value: themes[key], enumerable: false, configurable: true, writable: true })
  }
  return themes
}

addRoleAliases(sectionThemes)

import { hasOwn } from './security'
import { ensureContrast, relativeLuminance, parseColor, CONTRAST } from './color'

const COLOR_RE = /^(#|rgb|hsl)/i

// security: sectionThemes stays writable on purpose (applyPalette()
// re-colors it), but whatever ends up there flows into inline CSS custom
// properties, `sectionThemes.navy.bg = 'url(https://tracker/p.gif)'` would
// paint `background: var(--cui-hero-bg)` with an external request. Reads go
// through themeColors(), which only hands out values that parse as colors
// and falls back to the shipped value otherwise.
const SHIPPED_THEMES = JSON.parse(JSON.stringify(sectionThemes))

export function themeColors(key) {
  if (!hasOwn(sectionThemes, key)) return null
  const name = hasOwn(SHIPPED_THEMES, key) ? key : themeRoles[key]
  const theme = sectionThemes[key] || {}
  const shipped = SHIPPED_THEMES[name] || SHIPPED_THEMES.navy
  const pick = (field) => (typeof theme[field] === 'string' && parseColor(theme[field]) ? theme[field] : shipped[field])
  return { bg: pick('bg'), text: pick('text'), heading: pick('heading'), eyebrow: pick('eyebrow') }
}

/**
 * Resolves the `background` prop shared by section components: a named
 * theme key (see sectionThemes), a raw CSS color, or an image URL.
 */
export function resolveBackground(value) {
  if (!value || typeof value !== 'string') return null
  // security (prototype-pollution-adjacent lookup, see utils/security.js):
  // hasOwn() keeps a `background="constructor"` from resolving to
  // Object.prototype's Function instead of falling through to the image
  // branch below.
  if (hasOwn(sectionThemes, value)) return { type: 'theme', key: themeRoles[value] || value, ...themeColors(value) }
  // security: only a color parseColor() actually understands counts
  // as one: a prefix match alone let `rgb(0 0 0) url(…)` or an unparsed
  // value through, which then crashed the contrast math during render. A
  // color-looking value that doesn't parse falls back to the default theme.
  if (COLOR_RE.test(value.trim())) return parseColor(value) ? { type: 'color', bg: value.trim() } : null
  return { type: 'image', image: value }
}

/**
 * Whether a background reads as dark (light text on it): the same threshold
 * deriveContrastText() uses. Sections use it to set data-cui-theme="dark" on
 * themselves, so nested components (outline buttons, links, focus rings)
 * switch to their on-dark treatment automatically.
 */
export function isDarkBackground(bg) {
  try {
    return relativeLuminance(parseColor(bg)) < 0.5
  } catch {
    return false
  }
}

/**
 * A caller passing a raw CSS color to `background` (instead of a named
 * theme key) gets no curated text/heading pairing: unlike sectionThemes,
 * which the palette engine (generatePalette()) keeps WCAG-safe for every
 * configured palette. Derive one on the fly instead of assuming the usual
 * light-on-dark treatment, which breaks silently for a light custom color
 * (e.g. background="#fdf6e3"). Picks a navy-ink or white seed by the bg's
 * own luminance, then lets ensureContrast() push it only as far as needed,
 * so a bg that's already safe with the brand ink/white keeps that exact
 * color instead of drifting to flat black/white.
 */
export function deriveContrastText(bg) {
  // An unparseable value gets the default dark band's pairing instead of a
  // TypeError mid-render.
  if (!parseColor(bg)) {
    const navy = themeColors('navy')
    return { text: navy.text, heading: navy.heading, eyebrow: navy.eyebrow }
  }
  const seed = relativeLuminance(parseColor(bg)) < 0.5 ? '#ffffff' : themeColors('light').heading
  const text = ensureContrast(seed, bg, CONTRAST.AA_TEXT)
  return {
    text,
    heading: ensureContrast(seed, bg, CONTRAST.AA_LARGE),
    eyebrow: text
  }
}
