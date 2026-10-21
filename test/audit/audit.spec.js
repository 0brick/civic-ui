// @vitest-environment node
// End-to-end tests for the project audit (cli/audit): a throwaway fixture
// project with known problems, and a clean one that must stay silent.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { cwd, execPath } from 'node:process'
import { runAudit, formatReport, formatJson } from '../../cli/audit/index.js'

const CLI = join(cwd(), 'cli', 'civic-ui.js')

function project(files) {
  const dir = mkdtempSync(join(tmpdir(), 'civic-audit-'))
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(dir, name, '..'), { recursive: true })
    writeFileSync(join(dir, name), content)
  }
  return dir
}

// Assembled at runtime so secret scanners don't flag this fixture.
const FAKE_STRIPE_KEY = ['sk', 'live', 'abcdefghijklmnopqrstuvwxyz'].join('_')

const BAD = {
  'index.html': `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, user-scalable=no">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">
  <script src="https://cdn.jsdelivr.net/npm/lib@1/lib.js"></script>
</head>
<body><div id="app"></div><button onclick="go()"></button></body>
</html>`,
  'src/App.vue': `<template>
  <main>
    <h1>Welcome</h1>
    <h3>Skipped a level</h3>
    <img src="/logo.png">
    <button><svg viewBox="0 0 1 1"></svg></button>
    <a href="/x"></a>
    <a href="https://example.org" target="_blank">Partner</a>
    <input type="email" placeholder="Email">
    <div @click="open">Open</div>
    <div v-html="userBio"></div>
    <div v-html="userBio + sanitizeHtml('')"></div>
    <a href="javascript:void(0)">Old</a>
    <span tabindex="3">x</span>
    <iframe src="https://www.youtube.com/embed/abc"></iframe>
    <TextInput v-model="name" />
    <AppButton icon-only icon="/i.svg" />
    <Modal v-model="open" />
    <!-- civic-audit-disable-next-line img-alt -->
    <img src="/ignored.png">
    <a href="/more">click here</a>
  </main>
</template>
<script setup>
const apiKey = '${FAKE_STRIPE_KEY}'
document.getElementById('x').innerHTML = location.hash
eval(userInput)
localStorage.setItem('authToken', token)
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter');
</style>`,
  '.env': 'SECRET=1\n',
  'src/App.spec.js': 'eval("ignored: test files are skipped")'
}

const GOOD = {
  'index.html': `<!doctype html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'">
  <title>City of Nordholm</title>
</head>
<body><div id="app"></div></body>
</html>`,
  'src/App.vue': `<template>
  <SiteHeader><template #brand><a href="/">City of Nordholm</a></template></SiteHeader>
  <main id="main-content">
    <h1>Welcome</h1>
    <h2>Services</h2>
    <img src="/town-hall.jpg" alt="The town hall on the market square">
    <img src="/decoration.svg" alt="">
    <button type="button" aria-label="Open menu"><svg aria-hidden="true"></svg></button>
    <label for="mail">Email</label>
    <input id="mail" type="email">
    <label>Name <input type="text"></label>
    <TextInput v-model="name" label="Name" />
    <AppButton icon-only icon="/i.svg">Search</AppButton>
    <Modal v-model="open" title="Confirm">Are you sure?</Modal>
    <div v-html="sanitizeHtml(bio)"></div>
    <a href="https://example.org" target="_blank" rel="noopener noreferrer">Partner<span class="cui-visually-hidden"> (opens in a new tab)</span></a>
    <div class="cui-modal-backdrop" @click="close"><button type="button">Close</button></div>
    <div class="wrapper" @click.stop>content</div>
  </main>
</template>
<script setup>
// eval() in a comment must not be reported; innerHTML = in a comment neither
const key = import.meta.env.VITE_PUBLIC_KEY
el.textContent = value
</script>`,
  '.gitignore': 'node_modules\n.env\n',
  '.env': 'VITE_PUBLIC_KEY=x\n'
}

describe('runAudit: a project with problems', () => {
  let dir
  let result
  beforeAll(async () => {
    dir = project(BAD)
    result = await runAudit({ root: dir, npmAudit: false })
  })
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  const ids = () => new Set(result.findings.map((f) => f.ruleId))

  it.each([
    'html-lang',
    'document-title',
    'meta-viewport-zoom',
    'third-party-request',
    'subresource-integrity',
    'button-name',
    'inline-event-handler',
    'csp-missing',
    'heading-order',
    'img-alt',
    'link-name',
    'new-tab-warning',
    'target-blank-noopener',
    'form-label',
    'click-events-have-key-events',
    'no-unsanitized-v-html',
    'no-javascript-url',
    'tabindex-positive',
    'iframe-title',
    'iframe-sandbox',
    'civic-field-label',
    'civic-icon-button-name',
    'civic-modal-name',
    'link-text-generic',
    'hardcoded-secret',
    'no-inner-html',
    'no-eval',
    'token-in-web-storage',
    'env-file-committed'
  ])('reports %s', (id) => {
    expect(ids()).toContain(id)
  })

  it('points at the right file and line', () => {
    const img = result.findings.find((f) => f.ruleId === 'img-alt')
    expect(img).toMatchObject({ file: 'src/App.vue', line: 5, severity: 'error', category: 'accessibility' })
    expect(img.wcag).toMatch(/1\.1\.1/)
    expect(img.snippet).toBe('<img src="/logo.png">')
  })

  it('only counts v-html as sanitized when the whole expression is one sanitizer call', () => {
    expect(result.findings.filter((f) => f.ruleId === 'no-unsanitized-v-html')).toHaveLength(2)
  })

  it('honors civic-audit-disable-next-line', () => {
    expect(result.findings.filter((f) => f.ruleId === 'img-alt')).toHaveLength(1)
  })

  it('skips test files and redacts secrets', () => {
    expect(result.findings.some((f) => f.file.endsWith('.spec.js'))).toBe(false)
    const secret = result.findings.find((f) => f.ruleId === 'hardcoded-secret')
    expect(secret.message).not.toContain('abcdefghijklmnop')
  })

  it('summarizes and fails', () => {
    expect(result.summary.passed).toBe(false)
    expect(result.summary.errors).toBeGreaterThan(10)
    expect(result.summary.byCategory.security.errors).toBeGreaterThan(0)
    expect(result.summary.byRule[0].count).toBeGreaterThan(0)
  })

  it('formats a detailed text report and JSON', () => {
    const text = formatReport(result)
    expect(text).toContain('src/App.vue')
    expect(text).toContain('WCAG 1.1.1')
    expect(text).toContain('Findings by rule')
    expect(text).toMatch(/✖ \d+ error/)
    expect(JSON.parse(formatJson(result)).summary.errors).toBe(result.summary.errors)
  })

  it('--only and rule overrides narrow the result', async () => {
    const a11y = await runAudit({ root: dir, npmAudit: false, only: 'accessibility' })
    expect(a11y.findings.every((f) => f.category === 'accessibility')).toBe(true)
    const tuned = await runAudit({ root: dir, npmAudit: false, rules: { 'img-alt': 'off', 'heading-order': 'error' } })
    expect(tuned.findings.some((f) => f.ruleId === 'img-alt')).toBe(false)
    expect(tuned.findings.find((f) => f.ruleId === 'heading-order').severity).toBe('error')
  })

  it('reads civic-audit.config.json', async () => {
    writeFileSync(join(dir, 'civic-audit.config.json'), JSON.stringify({ ignore: ['index.html'] }))
    const r = await runAudit({ root: dir, npmAudit: false })
    expect(r.findings.some((f) => f.file === 'index.html')).toBe(false)
    rmSync(join(dir, 'civic-audit.config.json'))
  })
})

describe('runAudit: a clean project', () => {
  it('reports nothing', async () => {
    const dir = project(GOOD)
    const result = await runAudit({ root: dir, npmAudit: false })
    rmSync(dir, { recursive: true, force: true })
    expect(result.findings.map((f) => `${f.ruleId} ${f.file}:${f.line} ${f.message}`)).toEqual([])
    expect(result.summary.passed).toBe(true)
  })
})

describe('rendered pass (axe-core on built HTML)', () => {
  it('runs axe on dist/ pages with the project’s own jsdom + axe-core', async () => {
    // Uses this repo's node_modules (jsdom, axe-core) by auditing a folder in it.
    const dir = join(cwd(), 'test', 'audit', '.tmp-rendered')
    mkdirSync(join(dir, 'dist'), { recursive: true })
    writeFileSync(join(dir, 'package.json'), '{"name":"x"}')
    writeFileSync(join(dir, 'dist', 'index.html'), '<!doctype html><html lang="en"><head><title>T</title></head><body><main><img src="a.png"><button></button></main></body></html>')
    try {
      const result = await runAudit({ root: dir, npmAudit: false, rendered: 'dist', paths: ['dist'] })
      const axeIds = result.findings.filter((f) => f.ruleId.startsWith('axe/')).map((f) => f.ruleId)
      expect(axeIds).toEqual(expect.arrayContaining(['axe/image-alt', 'axe/button-name']))
      expect(result.notes.join(' ')).toMatch(/axe-core: checked 1 built page/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('civic-ui CLI', () => {
  const run = (args, dir) => spawnSync(execPath, [CLI, ...args], { cwd: dir, encoding: 'utf8' })

  it('exits 1 with errors, 0 when clean, and accepts the "civic" alias', () => {
    const bad = project(BAD)
    const good = project(GOOD)
    try {
      const r1 = run(['audit', '--no-npm-audit', '--no-color'], bad)
      expect(r1.status).toBe(1)
      expect(r1.stdout).toContain('civic-ui audit')
      expect(run(['civic', '--no-npm-audit'], good).status).toBe(0)
      expect(run(['audit', '--no-npm-audit', '--fail-on', 'never'], bad).status).toBe(0)
      const json = JSON.parse(run(['audit', '--no-npm-audit', '--json'], bad).stdout)
      expect(json.summary.errors).toBeGreaterThan(0)
      expect(run(['audit', '--bogus'], good).status).toBe(2)
    } finally {
      rmSync(bad, { recursive: true, force: true })
      rmSync(good, { recursive: true, force: true })
    }
  })

  it('--init writes civic.test.js for Vitest projects', () => {
    const dir = project({ 'package.json': JSON.stringify({ scripts: { test: 'vitest run' }, devDependencies: { vitest: '^2' } }) })
    try {
      const r = run(['audit', '--init'], dir)
      expect(r.stdout).toContain('npm run test civic')
      const file = readFileSync(join(dir, 'civic.test.js'), 'utf8')
      expect(file).toContain("from 'civic-ui/audit'")
      expect(file).toContain("from 'vitest'")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('--init adds a test script when the project has none', () => {
    const dir = project({ 'package.json': JSON.stringify({ name: 'site', scripts: { test: 'echo "Error: no test specified" && exit 1' } }) })
    try {
      run(['audit', '--init'], dir)
      expect(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).scripts.test).toBe('civic-ui audit')
      expect(existsSync(join(dir, 'civic.test.js'))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
