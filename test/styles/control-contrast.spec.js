// Non-text contrast of controls (WCAG 1.4.11): the outline of a form field,
// the off-track of a Switch, inactive Carousel dots, the ProgressBar track and
// fills and the bottom-sheet handle all need 3:1 against what they sit on.
// They read --cui-border-control (not the decorative 14 % --cui-border), and
// these tests pin its values: shipped tokens.css and every generated palette
// and which components use it.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { generatePalette, presetPalettes } from '../../src/utils/palette.js'
import { getContrastRatio } from '../../src/utils/color.js'

const ROOT = join(cwd(), 'src')
const tokensCss = readFileSync(join(ROOT, 'styles', 'tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
// A component's <style> block, comments stripped (only the style block: a
// template attribute like accept="image/*" would look like a comment start).
const source = (path) => {
  const sfc = readFileSync(join(ROOT, path), 'utf8')
  return sfc.slice(sfc.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')
}

function block(selector) {
  const start = tokensCss.indexOf(`${selector} {`)
  expect(start, `${selector} block missing`).toBeGreaterThan(-1)
  const body = tokensCss.slice(start + selector.length + 2, tokensCss.indexOf('}', start))
  return Object.fromEntries(
    body
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()])
  )
}

// The CSS rule body for `selector` in a component's <style>.
function rule(css, selector) {
  const start = css.indexOf(`${selector} {`)
  expect(start, `${selector} rule missing`).toBeGreaterThan(-1)
  return css.slice(start, css.indexOf('}', start))
}

const UI = 3
const ratio = (a, b) => getContrastRatio(a, b)

describe('--cui-border-control (shipped tokens.css)', () => {
  const root = block(':root')
  const dark = block("[data-cui-mode='dark']")
  const band = block("[data-cui-theme='dark'],\n.cui-section--dark")

  it('is defined for light, dark mode and dark bands', () => {
    expect(root['--cui-border-control']).toMatch(/^#[0-9a-f]{6}$/)
    expect(dark['--cui-border-control']).toMatch(/^#[0-9a-f]{6}$/)
    expect(band['--cui-border-control']).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('light: 3:1 against white surfaces and the light backgrounds', () => {
    const border = root['--cui-border-control']
    for (const bg of ['#ffffff', '#f6f6f8', '#eeeeee']) {
      expect(ratio(border, bg), `${border} on ${bg}`).toBeGreaterThanOrEqual(UI)
    }
  })

  it('dark mode: 3:1 against bg, surfaces and muted backgrounds', () => {
    const border = dark['--cui-border-control']
    for (const key of ['--cui-bg', '--cui-bg-subtle', '--cui-bg-muted', '--cui-surface', '--cui-surface-raised']) {
      expect(ratio(border, dark[key]), `${border} on ${key}`).toBeGreaterThanOrEqual(UI)
    }
  })

  it('dark band: 3:1 against the navy band', () => {
    expect(ratio(band['--cui-border-control'], '#001d35')).toBeGreaterThanOrEqual(UI)
  })

  it('matches what generatePalette("default") derives', () => {
    const result = generatePalette('default')
    expect(root['--cui-border-control']).toBe(result.tokens['--cui-border-control'])
    expect(band['--cui-border-control']).toBe(result.dark['--cui-border-control'])
    expect(dark['--cui-border-control']).toBe(result.darkMode['--cui-border-control'])
  })
})

describe('--cui-border-control (generatePalette)', () => {
  const inputs = [...Object.keys(presetPalettes), { primary: '#16120e', accent: '#c41502' }, { primary: '#ffcc00' }, { primary: '#8168ee' }]

  it('holds 3:1 against every background in light, dark mode and on a band', () => {
    for (const input of inputs) {
      const { tokens, dark, darkMode } = generatePalette(input)
      const label = JSON.stringify(input)
      for (const key of ['--cui-bg', '--cui-bg-subtle', '--cui-bg-muted', '--cui-surface', '--cui-surface-raised']) {
        expect(ratio(tokens['--cui-border-control'], tokens[key]), `${label} light on ${key}`).toBeGreaterThanOrEqual(UI)
        expect(ratio(darkMode['--cui-border-control'], darkMode[key]), `${label} dark mode on ${key}`).toBeGreaterThanOrEqual(UI)
      }
      expect(ratio(dark['--cui-border-control'], dark['--cui-bg']), `${label} band`).toBeGreaterThanOrEqual(UI)
    }
  })

  it('is part of the contrast report', () => {
    const { checks } = generatePalette('default').contrast
    expect(checks['Control border on background'].ratio).toBeGreaterThanOrEqual(UI)
    expect(checks['Control border on dark-mode raised surface'].ratio).toBeGreaterThanOrEqual(UI)
  })
})

describe('controls use --cui-border-control', () => {
  it('form field outlines', () => {
    const fields = {
      'components/forms/TextInput.vue': ['.cui-field__control', '.cui-floating__control'],
      'components/forms/Select.vue': ['.cui-select__control'],
      'components/forms/InputGroup.vue': ['.cui-input-group'],
      'components/forms/SearchField.vue': ['.cui-search-field'],
      'components/forms/TagInput.vue': ['.cui-tag-input'],
      'components/forms/FileUpload.vue': ['.cui-file-upload']
    }
    for (const [file, selectors] of Object.entries(fields)) {
      const css = source(file)
      for (const selector of selectors) {
        expect(rule(css, selector), `${file} ${selector}`).toMatch(/border:[^;]*var\(--cui-border-control\)/)
      }
    }
  })

  it('Switch: off-track filled with it, thumb outlined with it', () => {
    const css = source('components/forms/Switch.vue')
    expect(rule(css, '.cui-switch__track')).toMatch(/background: var\(--cui-border-control\)/)
    expect(rule(css, '.cui-switch__thumb')).toMatch(/border: 1px solid var\(--cui-border-control\)/)
  })

  it('Carousel: inactive dots use it, the active one is a wider pill (not color alone)', () => {
    const css = source('components/content/Carousel.vue')
    expect(rule(css, '.cui-carousel__dot::before')).toMatch(/background: var\(--cui-border-control\)/)
    const dot = rule(css, '.cui-carousel__dot::before').match(/width: ([\d.]+)rem/)[1]
    const active = rule(css, '.cui-carousel__dot--active::before').match(/width: ([\d.]+)rem/)[1]
    expect(Number(active)).toBeGreaterThan(Number(dot))
  })

  it('Modal bottom-sheet handle: pill in that color', () => {
    expect(rule(source('components/overlay/Modal.vue'), '.cui-modal__handle::before')).toMatch(/background: var\(--cui-border-control\)/)
  })

  it('ProgressBar: outlined track, accent fill with an ink edge', () => {
    const css = source('components/feedback/ProgressBar.vue')
    expect(rule(css, '.cui-progress')).toMatch(/border: 1px solid var\(--cui-border-control\)/)
    expect(rule(css, '.cui-progress__bar--accent')).toMatch(/box-shadow: inset 0 0 0 1px var\(--cui-accent-contrast\)/)
  })
})

describe('ProgressBar fills against the track', () => {
  // Light: track #eeeeee (--cui-bg-muted); dark mode: its own --cui-bg-muted.
  const root = block(':root')
  const dark = block("[data-cui-mode='dark']")
  const resolve = (tokens, value) => {
    let v = value
    for (let i = 0; i < 5 && v.startsWith('var('); i++) v = tokens[v.slice(4, -1)] ?? root[v.slice(4, -1)]
    return v
  }

  it('every status fill reads at 3:1 on the track in light and dark mode', () => {
    for (const key of ['--cui-primary', '--cui-text-success', '--cui-text-warning', '--cui-text-danger']) {
      const light = resolve(root, `var(${key})`)
      expect(ratio(light, resolve(root, 'var(--cui-bg-muted)')), `light ${key}`).toBeGreaterThanOrEqual(UI)
      const darkFill = resolve(dark, `var(${key})`)
      expect(ratio(darkFill, dark['--cui-bg-muted']), `dark ${key}`).toBeGreaterThanOrEqual(UI)
    }
  })

  it('the track outline reads at 3:1 against the page', () => {
    expect(ratio(root['--cui-border-control'], '#ffffff')).toBeGreaterThanOrEqual(UI)
    expect(ratio(dark['--cui-border-control'], dark['--cui-bg'])).toBeGreaterThanOrEqual(UI)
  })
})

describe('target size (WCAG 2.5.8)', () => {
  const rem = (css, selector, prop) => Number(rule(css, selector).match(new RegExp(`\\n\\s*${prop}: ([\\d.]+)rem`))[1])

  it('Carousel dots are 24×24 buttons', () => {
    const css = source('components/content/Carousel.vue')
    expect(rem(css, '.cui-carousel__dot', 'width')).toBeGreaterThanOrEqual(2.4)
    expect(rem(css, '.cui-carousel__dot', 'height')).toBeGreaterThanOrEqual(2.4)
  })

  it('the bottom-sheet handle is at least 44×24', () => {
    const css = source('components/overlay/Modal.vue')
    expect(rem(css, '.cui-modal__handle', 'width')).toBeGreaterThanOrEqual(4.4)
    expect(rem(css, '.cui-modal__handle', 'height')).toBeGreaterThanOrEqual(2.4)
  })

  // Chapter 3: these passed only through the spacing exception before.
  it.each([
    ['FileUpload remove buttons', 'components/forms/FileUpload.vue', '.cui-file-upload__list button', 'min-width', 'min-height'],
    ['TagInput remove buttons', 'components/forms/TagInput.vue', '.cui-tag-input__tag button', 'min-width', 'min-height'],
    ['the ConsentEmbed remember checkbox', 'components/content/ConsentEmbed.vue', '.cui-consent-embed__remember input', 'width', 'height']
  ])('%s are at least 24×24', (_, path, selector, w, h) => {
    const css = source(path)
    expect(rem(css, selector, w)).toBeGreaterThanOrEqual(2.4)
    expect(rem(css, selector, h)).toBeGreaterThanOrEqual(2.4)
  })
})

describe('status texts keep a contrast reserve', () => {
  // ensureContrast() stops one step past its target; the default dark danger
  // text used to land at 4.5002:1. Generated status texts aim for 4.6.
  const pairs = (vars) => ['success', 'warning', 'danger', 'info'].map((k) => [k, vars[`--cui-${k}-text`], vars[`--cui-${k}-bg`]])

  it('shipped tokens.css: every status text is at least 4.6:1 on its tint, light and dark', () => {
    for (const [mode, tokens] of [['light', block(':root')], ['dark', block("[data-cui-mode='dark']")]]) {
      for (const [key, text, bg] of pairs(tokens)) {
        expect(ratio(text, bg), `${mode} ${key} ${text} on ${bg}`).toBeGreaterThanOrEqual(4.6)
      }
    }
  })

  it('every preset palette, light and dark', () => {
    for (const name of Object.keys(presetPalettes)) {
      const palette = generatePalette(name)
      for (const [mode, vars] of [['light', palette.tokens], ['dark', palette.darkMode]]) {
        for (const [key, text, bg] of pairs(vars)) {
          expect(ratio(text, bg), `${name} ${mode} ${key}`).toBeGreaterThanOrEqual(4.6)
        }
      }
    }
  })
})

describe('RangeSlider track', () => {
  it('outlines the track in the control-border color (the muted rest of it is ~1.2:1)', () => {
    const css = source('components/forms/RangeSlider.vue')
    expect(rule(css, '.cui-range__control')).toMatch(/border: 1px solid var\(--cui-border-control\)/)
  })
})
