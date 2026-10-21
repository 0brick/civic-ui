// Guards against scoped-CSS compile surprises: `:global(x) .y` in a scoped
// block compiles to a bare `x { … }` (the `.y` part is dropped), which once
// made AppButton's on-dark rules restyle every [data-cui-theme="dark"]
// element instead of the buttons inside it.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { parse, compileStyle } from 'vue/compiler-sfc'

const ROOT = join(cwd(), 'src')
function vueFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return vueFiles(path)
    return name.endsWith('.vue') ? [path] : []
  })
}

describe('scoped CSS', () => {
  it('never combines :global(...) with a following selector', () => {
    const offenders = vueFiles(ROOT).filter((f) => /:global\([^)]*\)\s+[.#[\w]/.test(readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')))
    expect(offenders).toEqual([])
  })

  it('AppButton scopes its on-dark rules to the button', () => {
    const file = join(ROOT, 'components', 'button', 'AppButton.vue')
    const { descriptor } = parse(readFileSync(file, 'utf8'), { filename: file })
    const css = descriptor.styles.map((s) => compileStyle({ source: s.content, filename: file, id: 'data-v-test', scoped: s.scoped }).code).join('\n')
    expect(css).toMatch(/\[data-cui-theme='dark'\] \.cui-btn--outline\[data-v-test\]/)
    expect(css).toMatch(/\.cui-section--dark \.cui-btn--outline\[data-v-test\]/)
    expect(css).not.toMatch(/(^|\})\s*\[data-cui-theme='dark'\]\s*\{/)
  })
})
