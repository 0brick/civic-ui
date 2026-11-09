// Where a link inside one of the docs/*.md files points once rendered. Used
// by markdown.js in the app and by the static pages at build time, so this
// file may not import anything.

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
export function resolveDocHref(href) {
  if (/^(https?:|mailto:|#)/i.test(href)) return href
  const [pathPart, hash] = href.split('#')
  const slug = INTERNAL_DOCS[pathPart]
  if (slug) return `/docs/${slug}${hash ? `#${hash}` : ''}`
  return new URL(href, DOCS_BASE).href
}
