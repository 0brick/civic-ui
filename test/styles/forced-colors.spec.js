// CSS contracts that jsdom can't render, checked on the
// <style> blocks instead.
// - Form fields: focus never `outline: none`: under forced colors the
//   box-shadow halo is dropped, a transparent outline is what the system paints.
// - Radio/Switch: a forced-colors block keeps the checked state visible.
// - Tooltip: wraps instead of overflowing a 320px viewport.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'

const ROOT = join(cwd(), 'src', 'components')
const style = (path) => {
  const sfc = readFileSync(join(ROOT, path), 'utf8')
  return sfc.slice(sfc.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')
}
function rule(css, selector) {
  const start = css.indexOf(`${selector} {`)
  expect(start, `${selector} rule missing`).toBeGreaterThan(-1)
  return css.slice(start, css.indexOf('}', start))
}

describe('forced colors: focus outline on form fields', () => {
  const fields = {
    'forms/TextInput.vue': ['.cui-field__control:focus-visible', '.cui-floating__control:focus-visible'],
    'forms/Select.vue': ['.cui-select__control:focus-visible'],
    'forms/SearchField.vue': ['.cui-search-field__input:focus-visible'],
    'forms/TagInput.vue': ['.cui-tag-input__field:focus-visible'],
    'forms/InputGroup.vue': [':deep(select:focus)']
  }
  for (const [file, selectors] of Object.entries(fields)) {
    it(`${file}: no outline:none, a transparent outline on focus`, () => {
      const css = style(file)
      expect(css).not.toMatch(/outline:\s*(none|0)\s*;/)
      for (const selector of selectors) expect(rule(css, selector)).toMatch(/outline:\s*2px solid transparent/)
    })
  }
})

describe('forced colors: checked state of Radio and Switch', () => {
  it('Radio paints its dot in CanvasText', () => {
    const css = style('forms/Radio.vue')
    const block = css.slice(css.indexOf('@media (forced-colors: active)'))
    expect(block).toMatch(/\.cui-radio__dot::after\s*\{[^}]*forced-color-adjust:\s*none[^}]*background:\s*CanvasText/)
  })
  it('Switch outlines the track and paints the thumb', () => {
    const css = style('forms/Switch.vue')
    const block = css.slice(css.indexOf('@media (forced-colors: active)'))
    expect(block).toMatch(/\.cui-switch__track\s*\{[^}]*border:\s*1px solid CanvasText/)
    expect(block).toMatch(/\.cui-switch__thumb\s*\{[^}]*background:\s*CanvasText/)
  })
})

describe('Tooltip reflow', () => {
  it('wraps and is capped to the viewport', () => {
    const body = rule(style('overlay/Tooltip.vue'), '.cui-tooltip')
    expect(body).toMatch(/white-space:\s*normal/)
    expect(body).toMatch(/max-width:\s*min\(28rem, calc\(100vw - 2rem\)\)/)
  })
})
