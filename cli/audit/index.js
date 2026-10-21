// civic-ui project audit: static accessibility (WCAG 2.2) and security checks
// for a whole project that uses civic-ui (or any Vue/HTML project), with a
// detailed report. Zero dependencies; Node ≥ 18.
//
//   import { runAudit, formatReport } from 'civic-ui/audit'
//   const result = await runAudit({ root: process.cwd() })
//   console.log(formatReport(result))
//
// CLI: `npx civic-ui audit` (see cli/civic-ui.js), or `npm run test civic`
// after `npx civic-ui audit --init`: docs/audit.md.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, extname, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { parseMarkup, splitSfc, lineIndex } from './parse.js'
import { a11yRules } from './rules/a11y.js'
import { securityTemplateRules, securityCodeRules, securityCssRules } from './rules/security.js'

export { formatReport, formatJson } from './report.js'

const SEVERITIES = ['error', 'warning', 'info']
const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/.nuxt/**',
  '**/.output/**',
  '**/.vite/**',
  '**/.cache/**',
  '**/vendor/**',
  '**/*.min.js',
  '**/*.spec.*',
  '**/*.test.*',
  '**/__tests__/**'
]
const EXTENSIONS = {
  '.vue': 'vue',
  '.html': 'html',
  '.htm': 'html',
  '.js': 'js',
  '.mjs': 'js',
  '.cjs': 'js',
  '.ts': 'js',
  '.jsx': 'js',
  '.tsx': 'js',
  '.css': 'css',
  '.scss': 'css',
  '.sass': 'css',
  '.less': 'css'
}

export const rules = [
  ...a11yRules.map((r) => ({ ...r, category: 'accessibility', target: 'markup' })),
  ...securityTemplateRules.map((r) => ({ ...r, category: 'security', target: 'markup' })),
  ...securityCodeRules.map((r) => ({ ...r, category: 'security', target: 'code' })),
  ...securityCssRules.map((r) => ({ ...r, category: 'security', target: 'css' }))
]

// ---- globbing ----
function globToRegExp(glob) {
  let re = ''
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]
    if (c === '*') {
      if (glob[i + 1] === '*') {
        re += '.*'
        i++
        if (glob[i + 1] === '/') i++
      } else re += '[^/]*'
    } else if (c === '?') re += '[^/]'
    else if ('.+^${}()|[]\\'.includes(c)) re += `\\${c}`
    else re += c
  }
  return new RegExp(`^${re}$`)
}

function matcher(globs) {
  const res = globs.map(globToRegExp)
  return (rel) => res.some((re) => re.test(rel) || re.test(`${rel}/`))
}

function collectFiles(root, paths, isIgnored) {
  const out = []
  const visit = (abs) => {
    const rel = relative(root, abs).split(sep).join('/')
    if (rel && isIgnored(rel)) return
    let st
    try {
      st = statSync(abs)
    } catch {
      return
    }
    if (st.isDirectory()) {
      for (const name of readdirSync(abs)) visit(join(abs, name))
    } else if (EXTENSIONS[extname(abs).toLowerCase()] && st.size < 2_000_000) out.push(abs)
  }
  for (const p of paths) visit(p)
  return out.sort()
}

// ---- config ----
export function loadConfig(root) {
  const file = join(root, 'civic-audit.config.json')
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'))
  const pkgFile = join(root, 'package.json')
  if (existsSync(pkgFile)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'))
      if (pkg.civicAudit) return pkg.civicAudit
    } catch {
      // A broken package.json is reported by npm itself; audit with defaults.
    }
  }
  return {}
}

// ---- inline disables ----
// <!-- civic-audit-disable-next-line img-alt --> / // civic-audit-disable-next-line
// and civic-audit-disable-file anywhere in the file.
function disabledLines(source) {
  const map = new Map()
  const lines = source.split('\n')
  lines.forEach((line, i) => {
    // An existing eslint-plugin-vue suppression for v-html states the same
    // "reviewed, it's sanitized" decision: honor it instead of asking twice.
    if (/eslint-disable-next-line[^\n]*vue\/no-v-html/.test(line)) {
      map.set(i + 2, new Set(['no-unsanitized-v-html']))
      return
    }
    const m = /civic-audit-disable-next-line\b([^\n>*]*)/.exec(line)
    if (!m) return
    const ids = m[1].replace(/-->|\*\//g, '').trim().split(/[\s,]+/).filter(Boolean)
    map.set(i + 2, ids.length ? new Set(ids) : null)
  })
  return {
    file: /civic-audit-disable-file/.test(source),
    isDisabled(line, ruleId) {
      if (!map.has(line)) return false
      const ids = map.get(line)
      return ids === null || ids.has(ruleId)
    }
  }
}

function stripComments(line, state) {
  // Removes // and /* */ comments from a line (string-unaware, good enough
  // to keep examples in comments from being reported).
  let out = ''
  let i = 0
  while (i < line.length) {
    if (state.inBlock) {
      const end = line.indexOf('*/', i)
      if (end === -1) return out
      state.inBlock = false
      i = end + 2
      continue
    }
    const block = line.indexOf('/*', i)
    const lineC = line.search(/(^|[^:'"`])\/\//)
    const lineIdx = lineC === -1 ? -1 : line.indexOf('//', lineC)
    if (lineIdx !== -1 && lineIdx >= i && (block === -1 || lineIdx < block)) return out + line.slice(i, lineIdx)
    if (block !== -1) {
      out += line.slice(i, block)
      state.inBlock = true
      i = block + 2
      continue
    }
    return out + line.slice(i)
  }
  return out
}

function auditFile(abs, root, activeRules, only) {
  const rel = relative(root, abs).split(sep).join('/')
  const kind = EXTENSIONS[extname(abs).toLowerCase()]
  const source = readFileSync(abs, 'utf8')
  const disabled = disabledLines(source)
  if (disabled.file) return []
  const pos = lineIndex(source)
  const lines = source.split('\n')
  const findings = []

  const push = (rule, offset, message) => {
    const { line, column } = pos(offset)
    if (disabled.isDisabled(line, rule.id)) return
    findings.push({
      ruleId: rule.id,
      category: rule.category,
      severity: rule.severity,
      file: rel,
      line,
      column,
      message: message || rule.title,
      title: rule.title,
      help: rule.help,
      wcag: rule.wcag,
      ref: rule.ref,
      snippet: (lines[line - 1] || '').trim().slice(0, 160)
    })
  }

  const markupBlocks = []
  const codeBlocks = []
  const cssBlocks = []
  if (kind === 'vue') {
    for (const b of splitSfc(source)) {
      if (b.type === 'template' && !/lang=["']?(pug|jade)/.test(b.attrs)) markupBlocks.push(b)
      if (b.type === 'script') codeBlocks.push(b)
      if (b.type === 'style') cssBlocks.push(b)
    }
  } else if (kind === 'html') {
    markupBlocks.push({ content: source, offset: 0 })
  } else if (kind === 'js') {
    codeBlocks.push({ content: source, offset: 0 })
  } else if (kind === 'css') {
    cssBlocks.push({ content: source, offset: 0 })
  }

  for (const block of markupBlocks) {
    const tree = parseMarkup(block.content, block.offset, { vue: kind === 'vue' })
    // Inline <script>/<style> inside HTML pages are code/CSS too.
    const collect = (node) => {
      for (const c of node.children || []) {
        if (c.type !== 'element') continue
        if (c.lname === 'script' && c.rawText) codeBlocks.push({ content: c.rawText, offset: c.rawOffset })
        if (c.lname === 'style' && c.rawText) cssBlocks.push({ content: c.rawText, offset: c.rawOffset })
        collect(c)
      }
    }
    collect(tree)
    for (const rule of activeRules) {
      if (rule.target !== 'markup') continue
      if (rule.kinds && !rule.kinds.includes(kind)) continue
      rule.check({
        tree,
        kind,
        file: rel,
        report: (node, message) => push(rule, typeof node === 'number' ? node : node.offset, message)
      })
    }
  }

  const scanLines = (block, target) => {
    const state = { inBlock: false }
    const blockLines = block.content.split('\n')
    let offset = block.offset
    for (const raw of blockLines) {
      const code = target === 'code' ? stripComments(raw, state) : raw
      for (const rule of activeRules) {
        if (rule.target !== target) continue
        const m = rule.pattern.exec(code)
        if (!m || (rule.skipIf && rule.skipIf.test(code))) continue
        const message = rule.redact ? `${rule.title} (${m[0].slice(0, 12)}…)` : `${rule.title}: ${m[0].trim().slice(0, 60)}`
        push(rule, offset + m.index, message)
      }
      offset += raw.length + 1
    }
  }
  for (const block of codeBlocks) scanLines(block, 'code')
  for (const block of cssBlocks) scanLines(block, 'css')

  return only ? findings.filter((f) => f.category === only) : findings
}

// ---- project-level checks ----
function projectChecks(root) {
  const findings = []
  const add = (f) => findings.push({ category: 'security', line: 0, column: 0, snippet: '', ...f })
  const gitignore = existsSync(join(root, '.gitignore')) ? readFileSync(join(root, '.gitignore'), 'utf8') : ''
  for (const name of ['.env', '.env.local', '.env.production']) {
    if (!existsSync(join(root, name))) continue
    const patterns = gitignore
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && !l.startsWith('!'))
      .map((l) => l.replace(/^\//, ''))
    const ignored = patterns.length > 0 && matcher(patterns.flatMap((p) => [p, `**/${p}`]))(name)
    if (!ignored) {
      add({
        ruleId: 'env-file-committed',
        severity: 'error',
        file: name,
        message: `${name} is not listed in .gitignore`,
        title: 'Environment file may be committed',
        help: `Add ${name} to .gitignore and rotate any secret that was committed. Only VITE_/public values end up in the bundle anyway: secrets belong on the server.`,
        ref: 'OWASP A05 Security Misconfiguration'
      })
    }
  }
  return findings
}

function runNpmAudit(root, args) {
  const res = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['audit', '--json', ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 60_000,
    shell: process.platform === 'win32'
  })
  let data
  try {
    data = JSON.parse(res.stdout || '{}')
  } catch {
    return { error: 'npm audit returned no JSON' }
  }
  if (data.error) return { error: data.error.summary || 'npm audit failed (offline?)' }
  return { vulnerabilities: data.vulnerabilities || {} }
}

// Runtime dependencies are audited at full severity. Dev dependencies (the
// build tool, the test runner, a dev server exposed on the network) are
// audited too, one severity level lower, unless `includeDev` is false.
function npmAudit(root, { includeDev = true } = {}) {
  if (!existsSync(join(root, 'package-lock.json'))) return { findings: [], ran: false, reason: 'no package-lock.json' }
  const prod = runNpmAudit(root, ['--omit=dev'])
  if (prod.error) return { findings: [], ran: false, reason: prod.error }
  const all = includeDev ? runNpmAudit(root, []) : { vulnerabilities: {} }
  const devOnly = Object.values(all.vulnerabilities || {}).filter((v) => !(v.name in prod.vulnerabilities))
  const map = { critical: 'error', high: 'error', moderate: 'warning', low: 'info', info: 'info' }
  const devMap = { critical: 'warning', high: 'warning', moderate: 'info', low: 'info', info: 'info' }
  const entries = [
    ...Object.values(prod.vulnerabilities).map((v) => [v, false]),
    ...devOnly.map((v) => [v, true])
  ]
  const findings = entries.map(([v, dev]) => {
    const advisory = (v.via || []).find((x) => typeof x === 'object')
    return {
      ruleId: 'vulnerable-dependency',
      category: 'security',
      severity: (dev ? devMap : map)[v.severity] || 'warning',
      file: 'package-lock.json',
      line: 0,
      column: 0,
      message: `${v.name}${dev ? ' (dev dependency)' : ''} (${v.range || 'installed version'}), ${v.severity}${advisory ? `: ${advisory.title}` : ''}`,
      title: 'Dependency with a known vulnerability',
      help: v.fixAvailable ? `Run \`npm audit fix\`${v.fixAvailable.isSemVerMajor ? ' --force (major upgrade: test afterwards)' : ''}.` : 'No fix published yet: check the advisory for a workaround.',
      ref: advisory?.url || 'OWASP A06 Vulnerable and Outdated Components',
      snippet: ''
    }
  })
  return { findings, ran: true }
}

// Optional: run axe-core (the engine behind Lighthouse / axe DevTools) on
// built HTML pages. Uses the project's own jsdom + axe-core, if installed.
async function renderedAudit(root, dir, only) {
  const require = createRequire(join(root, 'package.json'))
  let JSDOM
  let axeSource
  try {
    ;({ JSDOM } = require('jsdom'))
    axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
  } catch {
    return {
      ran: false,
      reason: 'install jsdom and axe-core as devDependencies to enable it (npm i -D jsdom axe-core)',
      findings: []
    }
  }
  const abs = join(root, dir)
  if (!existsSync(abs)) return { ran: false, reason: `${dir}/ not found: build the site first`, findings: [] }
  const pages = collectFiles(abs, [abs], matcher(['**/node_modules/**'])).filter((f) => /\.html?$/.test(f))
  const findings = []
  for (const page of pages) {
    const dom = new JSDOM(readFileSync(page, 'utf8'), { runScripts: 'outside-only', pretendToBeVisual: true })
    dom.window.eval(axeSource)
    const result = await dom.window.axe.run(dom.window.document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      rules: { 'color-contrast': { enabled: false } }
    })
    for (const v of result.violations) {
      for (const node of v.nodes) {
        findings.push({
          ruleId: `axe/${v.id}`,
          category: 'accessibility',
          severity: v.impact === 'minor' ? 'warning' : 'error',
          file: relative(root, page).split(sep).join('/'),
          line: 0,
          column: 0,
          message: `${v.help} → ${node.target.join(' ')}`,
          title: v.help,
          help: node.failureSummary?.replace(/\n\s*/g, ' ') || v.description,
          wcag: v.tags.filter((t) => /^wcag\d{3,}$/.test(t)).map((t) => t.replace(/^wcag(\d)(\d)(\d+)$/, '$1.$2.$3')).join(', '),
          ref: v.helpUrl,
          snippet: node.html.slice(0, 160)
        })
      }
    }
    dom.window.close()
  }
  return { ran: true, pages: pages.length, findings: only && only !== 'accessibility' ? [] : findings }
}

/**
 * Audits a project. Options:
 *   root       project directory (default: process.cwd())
 *   paths      files/directories to scan, relative to root (default: the whole project)
 *   ignore     extra glob patterns to skip
 *   only       'accessibility' | 'security'
 *   rules      { [ruleId]: 'off' | 'info' | 'warning' | 'error' } severity overrides
 *   npmAudit   run `npm audit` for dependency vulnerabilities (default: true)
 *   npmAuditDev  include dev dependencies in it, one severity level lower (default: true)
 *   rendered   directory of built HTML to check with axe-core, e.g. 'dist' (default: off)
 * Options not given are read from civic-audit.config.json or package.json "civicAudit".
 */
export async function runAudit(options = {}) {
  const root = options.root || process.cwd()
  const config = { ...loadConfig(root), ...stripUndefined(options) }
  const only = normalizeOnly(config.only)
  const overrides = config.rules || {}
  const activeRules = rules
    .filter((r) => overrides[r.id] !== 'off')
    .map((r) => (SEVERITIES.includes(overrides[r.id]) ? { ...r, severity: overrides[r.id] } : r))
  const isIgnored = matcher([...DEFAULT_IGNORE, ...(config.ignore || [])])
  const paths = (config.paths && config.paths.length ? config.paths : ['.']).map((p) => join(root, p))

  const started = Date.now()
  const files = collectFiles(root, paths, isIgnored)
  let findings = []
  for (const file of files) findings.push(...auditFile(file, root, activeRules, only))

  const notes = []
  if (only !== 'accessibility') {
    findings.push(...projectChecks(root))
    if (config.npmAudit !== false) {
      const res = npmAudit(root, { includeDev: config.npmAuditDev !== false })
      findings.push(...res.findings)
      notes.push(res.ran ? `npm audit: ${res.findings.length} vulnerable package(s)` : `npm audit skipped: ${res.reason}`)
    }
  }
  if (config.rendered) {
    const res = await renderedAudit(root, config.rendered, only)
    findings.push(...res.findings)
    notes.push(res.ran ? `axe-core: checked ${res.pages} built page(s) in ${config.rendered}/` : `axe-core pass skipped: ${res.reason}`)
  }

  findings = findings
    .map((f) => (SEVERITIES.includes(overrides[f.ruleId]) ? { ...f, severity: overrides[f.ruleId] } : f))
    .filter((f) => overrides[f.ruleId] !== 'off')
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column)

  return {
    root,
    files: files.map((f) => relative(root, f).split(sep).join('/')),
    findings,
    notes,
    durationMs: Date.now() - started,
    summary: summarize(findings, files.length)
  }
}

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([k, v]) => v !== undefined && k !== 'root'))
}

function normalizeOnly(value) {
  if (!value) return null
  if (/^a11y|access/i.test(value)) return 'accessibility'
  if (/^sec/i.test(value)) return 'security'
  throw new Error(`civic-ui audit: --only must be "accessibility" or "security", got "${value}"`)
}

export function summarize(findings, fileCount) {
  const count = (sev) => findings.filter((f) => f.severity === sev).length
  const byRule = {}
  for (const f of findings) {
    byRule[f.ruleId] ??= { ruleId: f.ruleId, title: f.title, category: f.category, severity: f.severity, count: 0 }
    byRule[f.ruleId].count++
  }
  const byCategory = {}
  for (const cat of ['accessibility', 'security']) {
    const list = findings.filter((f) => f.category === cat)
    byCategory[cat] = {
      errors: list.filter((f) => f.severity === 'error').length,
      warnings: list.filter((f) => f.severity === 'warning').length,
      infos: list.filter((f) => f.severity === 'info').length
    }
  }
  return {
    files: fileCount,
    errors: count('error'),
    warnings: count('warning'),
    infos: count('info'),
    byCategory,
    byRule: Object.values(byRule).sort((a, b) => b.count - a.count),
    passed: count('error') === 0
  }
}
