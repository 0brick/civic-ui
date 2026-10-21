#!/usr/bin/env node
// `npm run test:a11y-e2e`: the playground end to end in headless Chromium,
// the regression net for what jsdom can't see (layout, color, real requests):
//
//   - axe-core (WCAG 2.0/2.1/2.2 A + AA, plus best-practice) on every route,
//     in the light and the dark color mode, for every example on a component
//     or section page (not only the first one)
//   - reflow (WCAG 1.4.10): no horizontal page scrolling at 320 CSS px
//   - zero third-party requests: every request of every load stays on the
//     playground's own origin
//   - interactions with a real pointer and keyboard: Tooltip hoverable,
//     dismissible and described (1.4.13, 4.1.2), CookieConsent never hiding
//     the focused element (2.4.11), Dropdown/Popover closing when focus
//     leaves them (2.4.3)
//
// Routes are crawled from the home page and the four overview pages, so new
// components and docs topics are picked up without a list to maintain.
// Exits with 1 on any finding. Prefers-reduced-motion is emulated, so scroll
// reveals and transitions don't leave content half-faded while axe measures
// contrast.
//
// Needs Node >= 22 (global WebSocket) and Chrome or Chromium: set CHROME_PATH,
// otherwise the usual binary names are looked up on PATH. No npm dependency
// beyond the axe-core and vite the test suite already uses.
//
// Options:
//   --url <origin>      test an already running playground (skips build + preview)
//   --routes /a,/b      only these routes (no crawling)
//   --concurrency <n>   tabs per color mode (default 3)
//   --first-example     only each page's first example (faster)
//   --no-interactions   skip the pointer/keyboard checks
//   --json <file>       also write the full findings as JSON
import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, delimiter } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
const DESKTOP = { width: 1280, height: 800 }
const REFLOW = { width: 320, height: 640 }
const START_ROUTES = ['/', '/components', '/sections', '/docs', '/theme']
// A component/section page's preview after an example switch: DetailPage
// empties the stage, then mounts the newly imported demo.
const EXAMPLE_READY = `(() => { const s = document.querySelector('.docs-detail-preview__stage'); return !s || s.children.length > 0 })()`
const ROUTE_PATTERN = /^\/(?:(?:components|sections|docs|theme)(?:\/[\w-]+)?|embed\/(?:components|sections)\/[\w-]+\/\d+)?$/

const args = parseArgs(process.argv.slice(2))
const cleanup = []

// ---------------------------------------------------------------------------
// One color mode over a set of routes, `concurrency` tabs in parallel.

async function runPass(cdp, origin, mode, startRoutes, crawl, axeSource) {
  const queue = [...startRoutes]
  const seen = new Set(queue)
  const findings = []
  let loads = 0
  let active = 0

  async function worker() {
    const page = await Page.open(cdp, mode)
    try {
      for (;;) {
        const route = queue.shift()
        if (!route) {
          // Others may still discover routes: wait for them before quitting.
          if (active === 0) return
          await sleep(100)
          continue
        }
        active++
        try {
          const result = await checkRoute(page, origin, route, mode, axeSource)
          loads += result.loads
          findings.push(...result.findings)
          if (crawl) {
            for (const link of result.links) {
              if (!seen.has(link)) {
                seen.add(link)
                queue.push(link)
              }
            }
          }
          progress(mode, seen.size - queue.length - active + 1, seen.size)
        } finally {
          active--
        }
      }
    } finally {
      await page.close()
    }
  }

  await Promise.all(Array.from({ length: args.concurrency }, worker))
  progressDone()
  return { routes: [...seen].sort(), findings, loads }
}

async function checkRoute(page, origin, route, mode, axeSource) {
  const findings = []
  const links = new Set()
  const add = (kind, detail, example) => findings.push({ route, mode, example, kind, ...detail })

  await page.viewport(DESKTOP)
  const url = `${origin}${route}${mode === 'dark' ? '?mode=dark' : ''}`
  const requests = await page.load(url)
  for (const r of thirdParty(requests, origin)) add('third-party', { url: r })

  const state = await page.eval(`(${pageState})()`)
  if (state.notFound) add('broken-route', { message: state.notFound })
  const examples = args.firstExample ? Math.min(1, state.examples) : Math.max(1, state.examples)

  for (let i = 0; i < examples; i++) {
    const example = state.examples > 1 ? state.exampleTitles[i] : undefined
    if (i > 0) {
      const more = await page.during(() => page.eval(`document.querySelectorAll('.docs-detail-examples__tabs button')[${i}].click()`), EXAMPLE_READY)
      for (const r of thirdParty(more, origin)) add('third-party', { url: r }, example)
    }
    for (const link of await page.eval(`(${collectLinks})()`)) links.add(link)

    for (const v of await page.axe(axeSource, AXE_TAGS)) add('axe', v, example)

    if (mode === 'light') {
      await page.viewport(REFLOW)
      const overflow = await page.eval(`(${measureOverflow})()`)
      if (overflow) add('reflow', overflow, example)
      await page.viewport(DESKTOP)
    }
  }

  const routeLinks = [...links].filter((href) => {
    const u = new URL(href)
    return u.origin === origin && ROUTE_PATTERN.test(u.pathname.replace(/\/$/, '') || '/')
  })
  return { findings, links: routeLinks.map((h) => new URL(h).pathname.replace(/(.)\/$/, '$1')), loads: examples }
}

function thirdParty(requests, origin) {
  return requests.filter((u) => /^https?:|^wss?:/i.test(u) && new URL(u).origin !== origin)
}

// --- functions evaluated inside the page (serialized with toString) --------

function pageState() {
  const h1 = document.querySelector('main h1')
  const buttons = [...document.querySelectorAll('.docs-detail-examples__tabs button')]
  return {
    notFound: h1 && /^not found$/i.test(h1.textContent.trim()) ? document.querySelector('main p')?.textContent.trim() : null,
    examples: buttons.length,
    exampleTitles: buttons.map((b) => b.textContent.trim())
  }
}

function collectLinks() {
  const out = []
  for (const el of document.querySelectorAll('a[href], iframe[src]')) out.push(el.href || el.src)
  return out.filter((h) => /^https?:/.test(h))
}

function measureOverflow() {
  const de = document.documentElement
  const limit = de.clientWidth
  if (de.scrollWidth <= limit) return null
  const label = (el) => {
    const cls = typeof el.className === 'string' && el.className.trim() ? `.${el.className.trim().split(/\s+/).join('.')}` : ''
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls}`
  }
  // Outermost elements sticking out past the viewport, skipping anything
  // inside a scroll container (that one scrolls, the page doesn't).
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX
      if (o !== 'visible') return true
    }
    return false
  }
  const culprits = []
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect()
    if (!r.width || r.right <= limit + 0.5) continue
    if (clipped(el)) continue
    const parent = el.parentElement
    if (parent && parent !== document.body && parent.getBoundingClientRect().right > limit + 0.5) continue
    culprits.push(`${label(el)} (right edge ${Math.round(r.right)}px)`)
    if (culprits.length >= 5) break
  }
  return { message: `page is ${de.scrollWidth}px wide at a ${limit}px viewport`, nodes: culprits }
}

// ---------------------------------------------------------------------------
// Interactions: the acceptance checks that need a real pointer and keyboard.
// Each check gets a fresh light-mode tab and returns its failure messages.

const INTERACTIONS = [
  ['Tooltip: hoverable, Escape closes it, text is the trigger description (1.4.13, 4.1.2)', checkTooltip],
  ['Tooltip: a long text wraps inside a 320px viewport (1.4.10)', checkTooltipReflow],
  ['CookieConsent: no focused element fully hidden, modal and non-modal (2.4.11)', checkCookieConsent],
  ['Dropdown/Popover: close when Tab leaves them, focus stays put (2.4.3)', checkMenusCloseOnFocusOut]
]

async function runInteractions(cdp, origin) {
  const findings = []
  for (const [check, fn] of INTERACTIONS) {
    const page = await Page.open(cdp, 'light')
    try {
      for (const message of await fn(page, origin)) findings.push({ kind: 'interaction', check, route: '', mode: 'light', message })
    } catch (err) {
      findings.push({ kind: 'interaction', check, route: '', mode: 'light', message: `check crashed: ${err.message}` })
    } finally {
      await page.close()
    }
  }
  return findings
}

// Loads a component page at `viewport` and switches to the example `title`.
async function openExample(page, origin, route, title, viewport = DESKTOP) {
  await page.viewport(viewport)
  await page.load(`${origin}${route}`)
  if (!title) return
  const pick = `[...document.querySelectorAll('.docs-detail-examples__tabs button')].find((x) => x.textContent.trim() === ${JSON.stringify(title)})`
  const state = await page.eval(`(() => { const b = ${pick}; return b ? b.getAttribute('aria-pressed') : 'missing' })()`)
  if (state === 'missing') throw new Error(`${route}: no example "${title}"`)
  if (state !== 'true') await page.during(() => page.eval(`${pick}.click()`), EXAMPLE_READY)
}

const PREVIEW = '.docs-detail-preview'

async function checkTooltip(page, origin) {
  const fails = []
  for (const title of ['Basic usage', 'Placements']) {
    await openExample(page, origin, '/components/tooltip', title)
    const count = await page.eval(`document.querySelectorAll('${PREVIEW} .cui-tooltip-wrap').length`)
    if (!count) fails.push(`"${title}": no tooltip found`)
    for (let k = 0; k < count; k++) {
      const wrap = `document.querySelectorAll('${PREVIEW} .cui-tooltip-wrap')[${k}]`
      const where = `"${title}" #${k + 1}`
      const visible = () => page.eval(`getComputedStyle(${wrap}.querySelector('.cui-tooltip')).display !== 'none'`)
      const rect = (sel) => page.eval(`(() => { const r = ${wrap}.querySelector('${sel}').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })()`)
      await page.eval(`${wrap}.scrollIntoView({ block: 'center' })`)
      await page.settle()

      const from = await rect('button, a, [tabindex]')
      await page.mouse(from.x, from.y)
      if (!(await visible())) fails.push(`${where}: hovering the trigger doesn't show the tooltip`)
      const to = await rect('.cui-tooltip')
      let stayed = true
      for (let i = 1; i <= 12; i++) {
        await page.mouse(from.x + ((to.x - from.x) * i) / 12, from.y + ((to.y - from.y) * i) / 12)
        if (!(await visible())) stayed = false
      }
      if (!stayed) fails.push(`${where}: the tooltip closes while the pointer moves onto it`)
      await page.key('Escape')
      if (await visible()) fails.push(`${where}: Escape doesn't close the hovered tooltip`)
      await page.mouse(1, 1)

      await page.eval(`${wrap}.querySelector('button, a, [tabindex]').focus()`)
      await page.settle()
      if (!(await visible())) fails.push(`${where}: focusing the trigger doesn't show the tooltip`)
      await page.key('Escape')
      if (await visible()) fails.push(`${where}: Escape doesn't close the focused tooltip`)
      if (!(await page.eval(`document.activeElement === ${wrap}.querySelector('button, a, [tabindex]')`))) fails.push(`${where}: Escape moved focus away from the trigger`)

      const text = await page.eval(`${wrap}.querySelector('.cui-tooltip').textContent.trim()`)
      await page.eval(`${wrap}.querySelector('button, a, [tabindex]').setAttribute('data-e2e-trigger', '')`)
      const { description } = await page.axNode('[data-e2e-trigger]')
      await page.eval(`document.querySelector('[data-e2e-trigger]').removeAttribute('data-e2e-trigger')`)
      if (description !== text) fails.push(`${where}: trigger description is "${description}", expected "${text}"`)
    }
  }
  return fails
}

async function checkTooltipReflow(page, origin) {
  await openExample(page, origin, '/components/tooltip', 'Basic usage', REFLOW)
  const r = await page.eval(`(() => {
    const wrap = document.querySelector('${PREVIEW} .cui-tooltip-wrap')
    wrap.querySelector('.cui-tooltip').firstChild.textContent = 'An eighty character hint that has to wrap on a narrow phone screen, not overflow it.'
    wrap.querySelector('button, a, [tabindex]').focus()
    return new Promise((done) => requestAnimationFrame(() => {
      const t = wrap.querySelector('.cui-tooltip').getBoundingClientRect()
      done({ left: t.left, right: t.right, width: document.documentElement.scrollWidth, limit: document.documentElement.clientWidth })
    }))
  })()`)
  return r.left >= 0 && r.right <= r.limit && r.width <= r.limit ? [] : [`80-character tooltip spans ${Math.round(r.left)}-${Math.round(r.right)}px, page ${r.width}px wide at ${r.limit}px`]
}

async function checkCookieConsent(page, origin) {
  const fails = []
  for (const [title, modal] of [['Basic usage', true], ['Non-modal', false]]) {
    for (const viewport of [{ width: 1280, height: 600 }, { width: 320, height: 256 }]) {
      const where = `"${title}" at ${viewport.width}×${viewport.height}`
      await openExample(page, origin, '/components/cookie-consent', title, viewport)
      await page.eval(`[...document.querySelectorAll('${PREVIEW} button')].find((b) => /show cookie banner/i.test(b.textContent)).click()`)
      await page.settle()
      const seen = new Set()
      let stops = 0
      for (let i = 0; i < 200; i++) {
        await page.key('Tab')
        const st = await page.eval(`(${focusVisibility})()`)
        if (!st) continue
        if (seen.has(st.key)) break
        seen.add(st.key)
        stops++
        if (st.hidden) fails.push(`${where}: focused ${st.what} is completely hidden`)
        if (modal && !st.inBanner) {
          fails.push(`${where}: focus left the modal banner (${st.what})`)
          break
        }
      }
      if (!stops) fails.push(`${where}: no focus stops reached`)
      if (!modal) {
        await page.eval(`document.querySelector('.cui-cookie-consent').focus()`)
        await page.key('Escape')
        const ok = await page.eval(`!!document.querySelector('.cui-cookie-consent__inner--collapsed') && document.querySelector('.cui-cookie-consent').contains(document.activeElement) && document.activeElement.tagName === 'BUTTON'`)
        if (!ok) fails.push(`${where}: Escape doesn't collapse the banner with focus on its expand button`)
      }
    }
  }
  return fails
}

// In the page: is the focused element visible anywhere (hit-tested, so
// whatever paints over it (banner, sticky header) counts)?
function focusVisibility() {
  const a = document.activeElement
  const banner = document.querySelector('.cui-cookie-consent')
  if (!a || a === document.body || !banner) return null
  const r = a.getBoundingClientRect()
  const x0 = Math.max(0, r.left)
  const x1 = Math.min(window.innerWidth, r.right)
  const y0 = Math.max(0, r.top)
  const y1 = Math.min(window.innerHeight, r.bottom)
  // pointer-events: none would make hit-testing skip the element itself
  const prev = a.style.pointerEvents
  a.style.pointerEvents = 'auto'
  let seen = false
  for (let i = 0; i < 7 && !seen && x1 > x0 && y1 > y0; i++) {
    for (let j = 0; j < 7 && !seen; j++) {
      const el = document.elementFromPoint(x0 + ((x1 - x0) * (i + 0.5)) / 7, y0 + ((y1 - y0) * (j + 0.5)) / 7)
      if (el && (el === a || a.contains(el))) seen = true
    }
  }
  a.style.pointerEvents = prev
  const what = `<${a.tagName.toLowerCase()}> "${(a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 40)}"`
  // One id per element, so the Tab walk ends exactly when it comes round again.
  if (!a.dataset.e2eFocusId) a.dataset.e2eFocusId = String((window.__e2eFocusIds = (window.__e2eFocusIds || 0) + 1))
  return { key: a.dataset.e2eFocusId, what, inBanner: banner.contains(a), hidden: !seen }
}

async function checkMenusCloseOnFocusOut(page, origin) {
  const fails = []
  const cases = [
    ['/components/dropdown', 'Basic usage (custom trigger)', '.cui-dropdown', `(() => { const m = document.querySelector('${PREVIEW} .cui-dropdown__menu'); return !!m && getComputedStyle(m).display !== 'none' })()`],
    ['/components/popover', 'Basic usage', '.cui-popover-wrap', `!!document.querySelector('${PREVIEW} .cui-popover')`]
  ]
  for (const [route, title, rootSel, isOpen] of cases) {
    await openExample(page, origin, route, title)
    const root = `document.querySelector('${PREVIEW} ${rootSel}')`
    await page.eval(`${root}.querySelector('button').focus()`)
    await page.key('Enter')
    await page.settle()
    if (!(await page.eval(isOpen))) {
      fails.push(`${route}: Enter on the trigger doesn't open it`)
      continue
    }
    let left = false
    for (let i = 0; i < 12 && !left; i++) {
      await page.key('Tab')
      left = !(await page.eval(`${root}.contains(document.activeElement)`))
    }
    await sleep(400)
    await page.settle()
    if (!left) fails.push(`${route}: Tab never left the menu`)
    else if (await page.eval(isOpen)) fails.push(`${route}: still open after focus moved past it`)
    else if (await page.eval(`${root}.contains(document.activeElement) || document.activeElement === document.body`)) fails.push(`${route}: focus was pulled back instead of staying where Tab put it`)
  }
  return fails
}

// ---------------------------------------------------------------------------
// Report

function report(findings, routeCount, loadCount, ms) {
  console.log('')
  const byKind = (k) => findings.filter((f) => f.kind === k)
  const axe = byKind('axe')
  const reflow = byKind('reflow')
  const third = byKind('third-party')
  const broken = byKind('broken-route')
  const interaction = byKind('interaction')

  if (axe.length) {
    console.log(`axe violations (${axe.length}):`)
    const rules = new Map()
    for (const f of axe) rules.set(f.id, [...(rules.get(f.id) || []), f])
    for (const [id, list] of rules) {
      console.log(`\n  ${id} [${list[0].impact}]: ${list[0].help} (${list.length}×)`)
      for (const f of list.slice(0, 12)) console.log(`    ${where(f)}\n      ${f.nodes.slice(0, 3).join('\n      ')}`)
      if (list.length > 12) console.log(`    … and ${list.length - 12} more`)
    }
    console.log('')
  }
  if (reflow.length) {
    console.log(`Reflow failures at ${REFLOW.width}px (${reflow.length}):`)
    for (const f of reflow) console.log(`  ${where(f)}: ${f.message}\n    ${f.nodes.join('\n    ')}`)
    console.log('')
  }
  if (third.length) {
    console.log(`Third-party requests (${third.length}):`)
    for (const f of third) console.log(`  ${where(f)} → ${f.url}`)
    console.log('')
  }
  if (broken.length) {
    console.log(`Broken routes (${broken.length}):`)
    for (const f of broken) console.log(`  ${f.route}: ${f.message}`)
    console.log('')
  }

  if (interaction.length) {
    console.log(`Interaction failures (${interaction.length}):`)
    for (const f of interaction) console.log(`  ${f.check}: ${f.message}`)
    console.log('')
  }

  const status = findings.length ? 'FAIL' : 'PASS'
  console.log(
    `${status}: ${routeCount} routes, ${loadCount} page states (light + dark) in ${(ms / 1000).toFixed(0)}s, ` +
      `${axe.length} axe, ${reflow.length} reflow, ${third.length} third-party, ${broken.length} broken` +
      (args.interactions ? `, ${interaction.length} interaction` : '')
  )
}

function where(f) {
  return `${f.route} [${f.mode}]${f.example ? ` · example "${f.example}"` : ''}`
}

// ---------------------------------------------------------------------------
// Infrastructure: build + preview server, Chrome, a minimal CDP client.

async function startPreview() {
  const outDir = mkdtempSync(join(tmpdir(), 'civic-ui-e2e-'))
  cleanup.push(() => rmSync(outDir, { recursive: true, force: true }))
  log('Building the playground …')
  const build = spawnSync('npx', ['vite', 'build', '--outDir', outDir, '--emptyOutDir', '--logLevel', 'warn'], { cwd: root, stdio: 'inherit' })
  if (build.status !== 0) fail('Playground build failed.')

  const { preview } = await import('vite')
  const server = await preview({
    root: join(root, 'playground'),
    configFile: join(root, 'vite.config.js'),
    logLevel: 'warn',
    build: { outDir },
    preview: { host: '127.0.0.1', port: 4319, strictPort: false, open: false }
  })
  cleanup.push(() => server.close())
  const url = server.resolvedUrls?.local?.[0]
  if (!url) fail('vite preview did not report a URL.')
  return url.replace(/\/$/, '')
}

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const names = ['chromium', 'chromium-browser', 'google-chrome-stable', 'google-chrome', 'chrome']
  for (const dir of (process.env.PATH || '').split(delimiter)) {
    for (const name of names) {
      const file = join(dir, name)
      if (existsSync(file)) return file
    }
  }
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  if (existsSync(mac)) return mac
  fail('No Chrome/Chromium found: set CHROME_PATH.')
}

async function launchChrome() {
  const profile = mkdtempSync(join(tmpdir(), 'civic-ui-e2e-chrome-'))
  const proc = spawn(
    findChrome(),
    ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--disable-extensions', '--mute-audio',
      // Overlay-style scrollbars: the 320px reflow check then measures a
      // 320 CSS px content width, as on a 320px phone or at 400 % zoom,
      // instead of 305px beside a classic scrollbar.
      '--hide-scrollbars', 'about:blank'],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  )
  cleanup.push(async () => {
    proc.kill()
    await new Promise((r) => (proc.exitCode !== null ? r() : proc.once('exit', r)))
    rmSync(profile, { recursive: true, force: true })
  })
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = ''
    const timer = setTimeout(() => reject(new Error(`Chrome did not start:\n${buf}`)), 20000)
    proc.stderr.on('data', (chunk) => {
      buf += chunk
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/)
      if (m) {
        clearTimeout(timer)
        resolve(m[1])
      }
    })
    proc.once('exit', (code) => reject(new Error(`Chrome exited (${code}):\n${buf}`)))
  })
  return { wsUrl }
}

class CDP {
  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new globalThis.WebSocket(url)
      ws.onopen = () => resolve(new CDP(ws))
      ws.onerror = () => reject(new Error(`Cannot connect to ${url}`))
    })
  }

  constructor(ws) {
    this.ws = ws
    this.nextId = 0
    this.pending = new Map()
    this.listeners = new Set()
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id !== undefined) {
        const p = this.pending.get(msg.id)
        if (!p) return
        this.pending.delete(msg.id)
        if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`))
        else p.resolve(msg.result)
      } else {
        for (const fn of this.listeners) fn(msg)
      }
    }
  }

  send(method, params = {}, sessionId) {
    const id = ++this.nextId
    this.ws.send(JSON.stringify({ id, method, params, sessionId }))
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject, method }))
  }

  on(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  close() {
    this.ws.close()
  }
}

// One tab in its own browser context (own storage, so the light and the dark
// tabs don't share a stored color mode).
class Page {
  static async open(cdp, mode) {
    const { browserContextId } = await cdp.send('Target.createBrowserContext', { disposeOnDetach: true })
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank', browserContextId })
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })
    const page = new Page(cdp, sessionId, targetId, browserContextId)
    await page.send('Page.enable')
    await page.send('Network.enable')
    await page.send('Runtime.enable')
    await page.send('Emulation.setEmulatedMedia', {
      features: [
        { name: 'prefers-color-scheme', value: mode },
        { name: 'prefers-reduced-motion', value: 'reduce' }
      ]
    })
    return page
  }

  constructor(cdp, sessionId, targetId, browserContextId) {
    Object.assign(this, { cdp, sessionId, targetId, browserContextId })
    this.inflight = new Set()
    this.requests = []
    this.lastActivity = Date.now()
    this.loadWaiters = []
    this.off = cdp.on((msg) => {
      if (msg.sessionId !== sessionId) return
      const p = msg.params
      if (msg.method === 'Network.requestWillBeSent') {
        this.requests.push(p.request.url)
        if (!/^data:|^blob:/.test(p.request.url)) this.inflight.add(p.requestId)
        this.lastActivity = Date.now()
      } else if (msg.method === 'Network.loadingFinished' || msg.method === 'Network.loadingFailed') {
        this.inflight.delete(p.requestId)
        this.lastActivity = Date.now()
      } else if (msg.method === 'Page.loadEventFired') {
        for (const fn of this.loadWaiters.splice(0)) fn()
      }
    })
  }

  send(method, params) {
    return this.cdp.send(method, params, this.sessionId)
  }

  async viewport({ width, height }) {
    await this.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
    await this.settle()
  }

  // Navigates and returns every request URL the load made.
  async load(url) {
    this.requests = []
    const loaded = new Promise((r) => this.loadWaiters.push(r))
    const { errorText } = await this.send('Page.navigate', { url })
    if (errorText) throw new Error(`${url}: ${errorText}`)
    await Promise.race([loaded, sleep(20000)])
    await this.idle()
    await this.eval('document.fonts ? document.fonts.ready.then(() => true) : true')
    await this.settle()
    return this.requests.slice()
  }

  // Runs an action (a click that swaps the example) and returns its
  // requests, once `ready` (an expression) holds and the network is quiet.
  async during(action, ready = 'true') {
    this.requests = []
    await action()
    await this.settle()
    await this.waitFor(ready)
    await this.idle()
    await this.settle()
    return this.requests.slice()
  }

  async waitFor(expression, timeoutMs = 10000) {
    const end = Date.now() + timeoutMs
    while (Date.now() < end) {
      if (await this.eval(expression)) return
      await sleep(50)
    }
    throw new Error(`timed out waiting for ${expression}`)
  }

  async idle(quietMs = 400, maxMs = 15000) {
    const end = Date.now() + maxMs
    while (Date.now() < end) {
      if (this.inflight.size === 0 && Date.now() - this.lastActivity >= quietMs) return
      await sleep(50)
    }
  }

  // Two animation frames plus a beat, for layout, transitions (0.01ms under
  // reduced motion) and ResizeObservers to catch up.
  async settle() {
    await this.eval('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => r(true), 120))))')
  }

  async key(name) {
    const keys = { Tab: ['Tab', 9], Escape: ['Escape', 27], Enter: ['Enter', 13] }
    const [code, vk] = keys[name]
    const enter = name === 'Enter' ? { text: '\r' } : {}
    await this.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: name, code, windowsVirtualKeyCode: vk })
    if (enter.text) await this.send('Input.dispatchKeyEvent', { type: 'char', key: name, code, windowsVirtualKeyCode: vk, ...enter })
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code, windowsVirtualKeyCode: vk })
    await this.settle()
  }

  async mouse(x, y) {
    await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
    await sleep(30)
  }

  // { role, name, description } of the first element matching `selector`,
  // as the browser's accessibility tree computes them.
  async axNode(selector) {
    const { root } = await this.send('DOM.getDocument', { depth: 0 })
    const { nodeId } = await this.send('DOM.querySelector', { nodeId: root.nodeId, selector })
    if (!nodeId) throw new Error(`no element ${selector}`)
    const { nodes } = await this.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })
    const n = nodes[0] || {}
    return { role: n.role?.value, name: n.name?.value, description: n.description?.value }
  }

  async eval(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (exceptionDetails) throw new Error(`Evaluation failed: ${exceptionDetails.exception?.description || exceptionDetails.text}`)
    return result.value
  }

  async axe(source, tags) {
    const loaded = await this.eval('typeof window.axe === "object"')
    if (!loaded) await this.eval(`${source};true`)
    return this.eval(`axe.run(document, { runOnly: { type: 'tag', values: ${JSON.stringify(tags)} }, iframes: false, resultTypes: ['violations'] })
      .then((r) => r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map((n) => n.target.join(' ') + ': ' + (n.failureSummary || '').replace(/\\s+/g, ' ').slice(0, 220))
      })))`)
  }

  async close() {
    this.off()
    await this.cdp.send('Target.closeTarget', { targetId: this.targetId })
    await this.cdp.send('Target.disposeBrowserContext', { browserContextId: this.browserContextId }).catch(() => {})
  }
}

// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { concurrency: 3, firstExample: false, interactions: true, url: null, routes: null, json: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--url') out.url = argv[++i]
    else if (a === '--routes') out.routes = argv[++i].split(',').map((r) => r.trim()).filter(Boolean)
    else if (a === '--concurrency') out.concurrency = Math.max(1, Number(argv[++i]) || 1)
    else if (a === '--first-example') out.firstExample = true
    else if (a === '--no-interactions') out.interactions = false
    else if (a === '--json') out.json = argv[++i]
    else fail(`Unknown option ${a}`)
  }
  return out
}

let lastProgress = ''
function progress(mode, done, total) {
  if (!process.stdout.isTTY) return
  const line = `  ${mode}: ${done}/${total}`
  if (line !== lastProgress) process.stdout.write(`\r${line}   `)
  lastProgress = line
}
function progressDone() {
  if (process.stdout.isTTY && lastProgress) process.stdout.write('\n')
  lastProgress = ''
}

function log(msg) {
  console.log(msg)
}

function fail(msg) {
  throw new Error(msg)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ---------------------------------------------------------------------------

async function main() {
  if (typeof globalThis.WebSocket === 'undefined') fail('Node 22 or newer is required (global WebSocket).')
  const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
  let exitCode
  try {
    const origin = args.url ? args.url.replace(/\/$/, '') : await startPreview()
    const browser = await launchChrome()
    const cdp = await CDP.connect(browser.wsUrl)
    cleanup.push(() => cdp.close())

    const started = Date.now()
    log(`Playground: ${origin}`)

    // Light pass crawls; the dark pass then visits the same routes.
    const light = await runPass(cdp, origin, 'light', args.routes ?? START_ROUTES, !args.routes, axeSource)
    const dark = await runPass(cdp, origin, 'dark', light.routes, false, axeSource)

    const interactions = args.interactions ? await runInteractions(cdp, origin) : []

    const findings = [...light.findings, ...dark.findings, ...interactions]
    report(findings, light.routes.length, light.loads + dark.loads, Date.now() - started)
    if (args.json) writeFileSync(args.json, JSON.stringify(findings, null, 2))
    exitCode = findings.length ? 1 : 0
  } catch (err) {
    console.error(err?.stack || err)
    exitCode = 1
  } finally {
    for (const fn of cleanup.reverse()) {
      try {
        await fn()
      } catch {
        // best effort
      }
    }
  }
  process.exit(exitCode)
}

main()
