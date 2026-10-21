#!/usr/bin/env node
// civic-ui command line: currently one command, the project audit.
//
//   npx civic-ui audit [paths…] [options]    accessibility + security report
//   npx civic-ui audit --init                wire it up as `npm run test civic`
//
// `civic` is accepted as an alias of `audit`, so a package.json with
// "test": "civic-ui" also answers to `npm run test civic`.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { runAudit, formatReport, formatJson } from './audit/index.js'

const HELP = `civic-ui audit: accessibility (WCAG 2.2 AA) and security checks for your project

Usage
  npx civic-ui audit [paths…] [options]
  npm run test civic                      after running --init once

Options
  --init                 Set up \`npm run test civic\` (adds civic.test.js for Vitest/Jest,
                         or a "test" script when the project has none)
  --only <area>          accessibility | security
  --fail-on <level>      error (default) | warning | never: sets the exit code
  --min-severity <lvl>   Hide lower findings in the report: info (default) | warning | error
  --ignore <glob>        Skip matching files (repeatable), e.g. --ignore "src/legacy/**"
  --rendered [dir]       Also run axe-core on built HTML pages (default dir: dist);
                         needs jsdom + axe-core installed in your project
  --no-npm-audit         Skip the dependency vulnerability check
  --no-npm-audit-dev     Check runtime dependencies only (dev dependencies are
                         otherwise reported one severity level lower)
  --json                 Machine-readable output
  --no-color             Plain output
  -h, --help             This help

Configuration: civic-audit.config.json or a "civicAudit" key in package.json, e.g.
  { "ignore": ["src/legacy/**"], "rules": { "new-tab-warning": "off", "heading-order": "error" } }
Silence one line: <!-- civic-audit-disable-next-line img-alt --> or // civic-audit-disable-next-line
Docs: https://github.com/0brick/civic-ui/blob/main/docs/audit.md
`

function parseArgs(argv) {
  const opts = { paths: [], ignore: [], failOn: 'error', color: process.stdout.isTTY && !process.env.NO_COLOR }
  const take = (i) => {
    const arg = argv[i]
    const eq = arg.indexOf('=')
    if (eq !== -1) return [arg.slice(eq + 1), i]
    return [argv[i + 1], i + 1]
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const name = arg.split('=')[0]
    if (name === 'audit' || name === 'civic') continue
    if (name === '-h' || name === '--help' || name === 'help') opts.help = true
    else if (name === '--init') opts.init = true
    else if (name === '--json') opts.json = true
    else if (name === '--no-color') opts.color = false
    else if (name === '--color') opts.color = true
    else if (name === '--no-npm-audit') opts.npmAudit = false
    else if (name === '--no-npm-audit-dev') opts.npmAuditDev = false
    else if (name === '--rendered') {
      const next = arg.includes('=') ? arg.split('=')[1] : argv[i + 1] && !argv[i + 1].startsWith('-') ? argv[++i] : 'dist'
      opts.rendered = next
    } else if (['--only', '--fail-on', '--min-severity', '--ignore'].includes(name)) {
      const [value, j] = take(i)
      i = j
      if (!value) throw new Error(`${name} needs a value`)
      if (name === '--only') opts.only = value
      if (name === '--fail-on') opts.failOn = value
      if (name === '--min-severity') opts.minSeverity = value
      if (name === '--ignore') opts.ignore.push(value)
    } else if (arg.startsWith('-')) throw new Error(`unknown option ${arg}`)
    else opts.paths.push(arg)
  }
  if (!['error', 'warning', 'never'].includes(opts.failOn)) throw new Error('--fail-on must be error, warning or never')
  return opts
}

const VITEST_FILE = `// Added by \`npx civic-ui audit --init\`. Run it with: npm run test civic
// Fails when the civic-ui audit finds accessibility or security errors and
// prints the full report. Configure rules in civic-audit.config.json.
import { test, expect } from 'vitest'
import { runAudit, formatReport } from 'civic-ui/audit'

test('civic-ui audit: accessibility (WCAG 2.2 AA) and security', async () => {
  const result = await runAudit({ root: process.cwd() })
  console.log(formatReport(result, { color: true }))
  expect(result.summary.errors, 'the civic-ui audit found errors: see the report above').toBe(0)
}, 120_000)
`

const JEST_FILE = `// Added by \`npx civic-ui audit --init\`. Run it with: npm run test civic
// Fails when the civic-ui audit finds accessibility or security errors and
// prints the full report. Configure rules in civic-audit.config.json.
const { spawnSync } = require('node:child_process')

test('civic-ui audit: accessibility (WCAG 2.2 AA) and security', () => {
  const cli = require.resolve('civic-ui/cli/civic-ui.js')
  const run = spawnSync(process.execPath, [cli, 'audit', '--color'], { cwd: process.cwd(), encoding: 'utf8' })
  console.log(run.stdout + run.stderr)
  expect(run.status).toBe(0)
}, 120000)
`

function init(root) {
  const pkgFile = join(root, 'package.json')
  if (!existsSync(pkgFile)) throw new Error('no package.json in the current directory')
  const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'))
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }
  const testScript = pkg.scripts?.test || ''
  const runner = /\bvitest\b/.test(testScript) || (!testScript && deps.vitest) ? 'vitest' : /\bjest\b/.test(testScript) ? 'jest' : null

  if (runner) {
    const file = join(root, 'civic.test.js')
    if (existsSync(file)) {
      console.log('civic.test.js already exists: nothing to do. Run: npm run test civic')
      return
    }
    writeFileSync(file, runner === 'vitest' ? VITEST_FILE : JEST_FILE)
    if (!testScript) {
      pkg.scripts = { ...pkg.scripts, test: 'vitest run' }
      writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`)
      console.log('Added "test": "vitest run" to package.json.')
    }
    console.log(`Created civic.test.js (${runner}). Run: npm run test civic`)
    console.log(`(${runner} treats "civic" as a file filter, so only the audit runs.)`)
    return
  }
  if (!testScript || /no test specified/.test(testScript)) {
    pkg.scripts = { ...pkg.scripts, test: 'civic-ui audit' }
    writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`)
    console.log('Added "test": "civic-ui audit" to package.json. Run: npm run test civic  (or just npm test)')
    return
  }
  console.log(`Your "test" script (${testScript}) isn't Vitest or Jest, so it was left alone.`)
  console.log('Add a script instead:  "test:civic": "civic-ui audit"   and run: npm run test:civic')
}

async function main() {
  let opts
  try {
    opts = parseArgs(process.argv.slice(2))
  } catch (err) {
    console.error(`civic-ui: ${err.message}\n\n${HELP}`)
    return 2
  }
  if (opts.help) {
    console.log(HELP)
    return 0
  }
  const root = process.cwd()
  if (opts.init) {
    init(root)
    return 0
  }
  const result = await runAudit({
    root,
    paths: opts.paths.length ? opts.paths : undefined,
    ignore: opts.ignore.length ? opts.ignore : undefined,
    only: opts.only,
    npmAudit: opts.npmAudit,
    npmAuditDev: opts.npmAuditDev,
    rendered: opts.rendered
  })
  if (opts.json) console.log(formatJson(result))
  else console.log(formatReport(result, { color: opts.color, minSeverity: opts.minSeverity }))
  if (opts.failOn === 'never') return 0
  if (result.summary.errors > 0) return 1
  if (opts.failOn === 'warning' && result.summary.warnings > 0) return 1
  return 0
}

main().then(
  (code) => {
    process.exitCode = code
  },
  (err) => {
    console.error(`civic-ui audit failed: ${err.stack || err.message}`)
    process.exitCode = 2
  }
)
