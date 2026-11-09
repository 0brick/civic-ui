// Vite plugin for the playground build: writes one static HTML file per route
// and a sitemap listing them. GitHub Pages then answers every route with 200
// instead of the 404 from public/404.html, and crawlers and link previews get
// the right metadata without running JavaScript.
//
// /foo is written as foo.html. A route with children also gets foo/index.html:
// without it, GitHub Pages redirects /foo to /foo/ because the folder exists.
//
// Each page's <noscript> holds its text and links, for visitors and crawlers
// without JavaScript. Vue replaces it on mount.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Marked } from 'marked'

export function playgroundPages() {
  let playgroundRoot
  let outDir

  return {
    name: 'civic-ui:playground-pages',
    apply: 'build',
    configResolved(config) {
      playgroundRoot = config.root
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      // A computed path, so Vite's config bundler leaves the registries (and
      // their lazy .vue imports) alone.
      const load = (file) => import(pathToFileURL(join(playgroundRoot, 'src/utils', file)).href)
      const seo = await load('seo.js')
      const { resolveDocHref } = await load('docLinks.js')

      const marked = new Marked({
        renderer: {
          link({ href, tokens }) {
            return `<a href="${escapeHtml(resolveDocHref(href))}">${this.parser.parseInline(tokens)}</a>`
          }
        }
      })
      const readDoc = (slug) => readFileSync(join(playgroundRoot, '../docs', `${slug}.md`), 'utf8')

      const template = readFileSync(join(outDir, 'index.html'), 'utf8')
      const routes = seo.listRoutes()
      const parents = new Set(routes.filter((r) => r.slug).map((r) => r.kind))

      for (const route of routes) {
        const page = seo.describeRoute(route)
        const body = staticBody(route, page, seo, (slug) => marked.parse(readDoc(slug)))
        const html = fillTemplate(template, page, seo.canonicalUrl(page.path), body)
        for (const file of outputFiles(route, parents)) {
          const target = join(outDir, file)
          mkdirSync(dirname(target), { recursive: true })
          writeFileSync(target, html)
        }
      }

      writeFileSync(join(outDir, 'sitemap.xml'), sitemap(routes, seo))
    }
  }
}

function outputFiles(route, parents) {
  if (route.kind === 'home') return ['index.html']
  if (route.slug) return [`${route.kind}/${route.slug}.html`]
  return parents.has(route.kind) ? [`${route.kind}.html`, `${route.kind}/index.html`] : [`${route.kind}.html`]
}

function sitemap(routes, seo) {
  const lastmod = new Date().toISOString().slice(0, 10)
  const urls = routes
    .filter((route) => seo.describeRoute(route).path === seo.routePath(route))
    .map((route) => `  <url>\n    <loc>${seo.canonicalUrl(seo.routePath(route))}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

// --- <head> ----------------------------------------------------------------

function fillTemplate(template, page, url, body) {
  let html = template
  const swap = (pattern, replacement) => {
    if (!pattern.test(html)) throw new Error(`playground-pages: no match for ${pattern} in index.html`)
    html = html.replace(pattern, () => replacement)
  }
  const setMeta = (attr, key, value) =>
    swap(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`), `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`)

  swap(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
  swap(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
  setMeta('name', 'description', page.description)
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:title', page.title)
  setMeta('property', 'og:description', page.description)
  setMeta('name', 'twitter:title', page.title)
  setMeta('name', 'twitter:description', page.description)
  swap(/<div id="app"><\/div>/, `<div id="app"><noscript>${body}</noscript></div>`)
  return html
}

// --- <noscript> content -----------------------------------------------------

function staticBody(route, page, seo, renderDoc) {
  return siteNav(seo) + '<main>' + mainContent(route, page, seo, renderDoc) + '</main>'
}

function siteNav(seo) {
  const items = [
    ['/', 'Home'],
    ['/sections', seo.catalogs.sections.label],
    ['/components', seo.catalogs.components.label],
    ['/docs/getting-started', 'Documentation'],
    ['/theme', 'Theme']
  ]
  return `<nav aria-label="Main">${list(items.map(([href, label]) => link(href, label)))}</nav>`
}

function mainContent(route, page, seo, renderDoc) {
  if (route.kind === 'docs') {
    return renderDoc(page.path.split('/').pop())
  }
  if (route.kind === 'home') {
    return (
      `<h1>Civic UI</h1><p>${escapeHtml(page.description)}</p>` +
      catalogList('sections', seo, 2) +
      catalogList('components', seo, 2) +
      `<h2>Documentation</h2>${list(seo.docTopics.map((t) => link(`/docs/${t.slug}`, t.title)))}`
    )
  }
  if (route.kind === 'theme') {
    return `<h1>Theme configurator</h1><p>${escapeHtml(page.description)}</p>`
  }
  const catalog = seo.catalogs[route.kind]
  if (!route.slug) {
    return `<h1>${catalog.label}</h1><p>${escapeHtml(page.description)}</p>${catalogList(route.kind, seo, 2, true)}`
  }
  const item = seo.findCatalogItem(route.kind, route.slug)
  return (
    `<h1>${escapeHtml(item.name)}</h1><p>${escapeHtml(item.summary)}</p>` +
    apiTable('Props', ['Prop', 'Type', 'Default', 'Notes'], item.props, (p) => [p.name, p.type, p.default, p.notes]) +
    apiTable('Events', ['Event', 'Notes'], item.events, (e) => [e.name, e.notes]) +
    apiTable('Slots', ['Slot', 'Notes'], item.slots, (s) => [s.name, s.notes]) +
    `<p>${link(`/${route.kind}`, `All ${catalog.label.toLowerCase()}`)}</p>`
  )
}

function catalogList(kind, seo, level, withSummaries = false) {
  const { label, categories } = seo.catalogs[kind]
  const groups = categories.map((category) => {
    const items = category.items.map((item) => {
      const summary = withSummaries ? `: ${escapeHtml(item.summary)}` : ''
      return link(`/${kind}/${item.slug}`, item.name) + summary
    })
    return `<h${level + 1}>${escapeHtml(category.name)}</h${level + 1}>${list(items)}`
  })
  return `<h${level}>${label}</h${level}>${groups.join('')}`
}

function apiTable(title, head, rows, cells) {
  if (!rows?.length) return ''
  const cell = (value) => escapeHtml(String(value ?? '').replaceAll('`', ''))
  const headRow = head.map((h) => `<th scope="col">${h}</th>`).join('')
  const bodyRows = rows.map((row) => `<tr>${cells(row).map((c) => `<td>${cell(c)}</td>`).join('')}</tr>`).join('')
  return `<h2>${title}</h2><table><thead><tr>${headRow}</tr></thead><tbody>${bodyRows}</tbody></table>`
}

function list(items) {
  return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`
}

function link(href, label) {
  return `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
