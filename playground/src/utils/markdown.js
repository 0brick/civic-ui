// Renders one of this repo's own docs/*.md files (imported via `?raw`) to
// HTML for the Documentation tab. The content is fully trusted (static files
// bundled at build time, never user input), but every v-html sink in this
// codebase is still routed through sanitizeHtml() by convention: see
// utils/security.js, so this is no exception.
import { Marked } from 'marked'
import { sanitizeHtml, sanitizeUrl } from 'civic-ui'

// Base for relative links in docs/*.md that the playground doesn't render.
const DOCS_BASE = 'https://github.com/0brick/civic-ui/blob/main/docs/'

// docs/*.md filename -> the slug DocsPage renders it at, so a link from one
// of these files to another (e.g. security.md linking to "accessibility.md")
// navigates inside this app instead of leaving it.
const INTERNAL_DOCS = {
  'getting-started.md': 'getting-started',
  'accessibility.md': 'accessibility',
  'security.md': 'security',
  'audit.md': 'audit',
  'theming.md': 'theming',
  'utilities.md': 'utilities',
  'composables.md': 'composables'
}

// Only a bare, same-directory reference ("security.md") counts as internal,
// "sections/hero-section.md" or "../SECURITY.md" point at real files this
// tab doesn't render, and must resolve externally instead.
function resolveHref(href) {
  if (/^(https?:|mailto:|#)/i.test(href)) return href
  const [pathPart, hash] = href.split('#')
  const slug = INTERNAL_DOCS[pathPart]
  if (slug) return `/docs/${slug}${hash ? `#${hash}` : ''}`
  return new URL(href, DOCS_BASE).href
}

// GitHub-style heading slug, matching the anchors these docs already link to
// each other with (e.g. "](#how-to-verify-this-yourself)").
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
}

const marked = new Marked({
  renderer: {
    heading({ tokens, depth, text }) {
      const id = slugify(text)
      return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>`
    },
    link({ href, title, tokens }) {
      const safeHref = sanitizeUrl(resolveHref(href))
      const titleAttr = title ? ` title="${title}"` : ''
      const external = safeHref.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${safeHref}"${titleAttr}${external}>${this.parser.parseInline(tokens)}</a>`
    }
  }
})

// marked's stock table renderer emits a plain, attribute-less <table> sized
// to its content (table-layout defaults to auto): a table with enough
// columns is routinely wider than a phone viewport. Wrap it in a
// horizontally-scrollable div instead of letting it push the whole page
// wider (a max-width/overflow-x on the <table> itself would work too, but
// forces its columns to compress and wrap awkwardly instead of scrolling).
function wrapTables(html) {
  return html.replace(/<table>/g, '<div class="cui-docs-table-wrap"><table>').replace(/<\/table>/g, '</table></div>')
}

// a11y (WCAG 2.1.1): code blocks and table wrappers wider than the column
// scroll, so they have to be focusable for keyboard users, as named
// regions, numbered so that several on one page stay distinguishable
// landmarks. Added after sanitizeHtml(), whose allowlist drops tabindex; it
// only rewrites the literal tags marked and wrapTables() emit, never
// document content (which marked escapes).
function focusableScrollers(html) {
  let code = 0
  let table = 0
  return html
    .replace(/<pre>/g, () => `<pre tabindex="0" role="region" aria-label="Code example ${++code}">`)
    .replace(/<div class="cui-docs-table-wrap">/g, () => `<div class="cui-docs-table-wrap" tabindex="0" role="region" aria-label="Table ${++table}">`)
}

export function renderMarkdown(raw) {
  return focusableScrollers(sanitizeHtml(wrapTables(marked.parse(raw))))
}
