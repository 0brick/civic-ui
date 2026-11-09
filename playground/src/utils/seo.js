// Page metadata per route, shared by the running app (head.js) and the build
// (scripts/playground-pages.mjs). Node imports this file directly, so it may
// only import plain data, with file extensions.
import { sectionCategories } from '../registry/sections.js'
import { componentCategories } from '../registry/components.js'
import { docTopics } from '../registry/docs.js'

export const SITE_URL = 'https://civic.servergedoens.de'

const SITE_NAME = 'Civic UI'
const HOME_TITLE = 'Civic UI: Vue 3 Component Library for Public-Sector Websites'
const HOME_DESCRIPTION =
  'Open-source Vue 3 components and page sections for government websites: WCAG 2.2 AA, EN 301 549 and BITV 2.0, no third-party requests, MIT-licensed.'
const DETAIL_SUFFIX = 'Live demo, API reference and copy-paste Vue 3 code.'

export const catalogs = {
  sections: {
    label: 'Sections',
    noun: 'Page Section',
    categories: sectionCategories,
    title: `Vue 3 Page Sections for Public-Sector Websites | ${SITE_NAME}`,
    description: 'Ready-to-drop Vue 3 page sections for government and civic websites: headers, heroes, steps, FAQs, footers and more, accessible by default.'
  },
  components: {
    label: 'Components',
    noun: 'Component',
    categories: componentCategories,
    title: `Accessible Vue 3 Components | ${SITE_NAME}`,
    description: 'Accessible Vue 3 components for government and civic websites: buttons, forms, navigation, feedback and overlays, with live demos and code.'
  }
}

export { docTopics }

export function findCatalogItem(kind, slug) {
  for (const category of catalogs[kind].categories) {
    const item = category.items.find((i) => i.slug === slug)
    if (item) return item
  }
  return null
}

const HOME_CRUMB = { name: 'Home', path: '/' }

function describeCatalog(kind, slug) {
  const catalog = catalogs[kind]
  const crumb = { name: catalog.label, path: `/${kind}` }
  const item = slug ? findCatalogItem(kind, slug) : null
  if (!item) {
    return { title: catalog.title, description: catalog.description, path: crumb.path, type: 'CollectionPage', breadcrumbs: [HOME_CRUMB, crumb] }
  }
  const path = `${crumb.path}/${item.slug}`
  return {
    title: `${item.name}: Accessible Vue 3 ${catalog.noun} | ${SITE_NAME}`,
    description: `${item.summary} ${DETAIL_SUFFIX}`,
    path,
    type: 'TechArticle',
    breadcrumbs: [HOME_CRUMB, crumb, { name: item.name, path }]
  }
}

// { title, description, path (canonical), type (schema.org), breadcrumbs }
export function describeRoute(route) {
  if (route.kind === 'sections' || route.kind === 'components') return describeCatalog(route.kind, route.slug)

  if (route.kind === 'docs') {
    // /docs shows the first topic, so that topic's URL is the canonical one.
    const topic = docTopics.find((t) => t.slug === route.slug) || docTopics[0]
    const path = `/docs/${topic.slug}`
    return {
      title: `${topic.title} | ${SITE_NAME} Documentation`,
      description: topic.description,
      path,
      type: 'TechArticle',
      breadcrumbs: [HOME_CRUMB, { name: topic.title, path }]
    }
  }

  if (route.kind === 'embed') {
    const parent = describeCatalog(route.embedKind, route.slug)
    const item = route.slug ? findCatalogItem(route.embedKind, route.slug) : null
    return { ...parent, title: `${item ? item.name : 'Example'} example | ${SITE_NAME}` }
  }

  if (route.kind === 'theme') {
    return {
      title: `Theme Configurator with WCAG Contrast Checks | ${SITE_NAME}`,
      description: 'Preview and export a custom Civic UI color palette on real components, checked for WCAG contrast as you go.',
      path: '/theme',
      type: 'WebPage',
      breadcrumbs: [HOME_CRUMB, { name: 'Theme', path: '/theme' }]
    }
  }

  return { title: HOME_TITLE, description: HOME_DESCRIPTION, path: '/', type: 'WebPage', breadcrumbs: [] }
}

export function routePath(route) {
  if (route.kind === 'home') return '/'
  return route.slug ? `/${route.kind}/${route.slug}` : `/${route.kind}`
}

export function canonicalUrl(path) {
  return path === '/' ? `${SITE_URL}/` : SITE_URL + path
}

// Every route that gets its own static HTML file at build time.
export function listRoutes() {
  const details = (kind) => catalogs[kind].categories.flatMap((c) => c.items.map((i) => ({ kind, slug: i.slug })))
  return [
    { kind: 'home', slug: null },
    { kind: 'sections', slug: null },
    ...details('sections'),
    { kind: 'components', slug: null },
    ...details('components'),
    { kind: 'docs', slug: null },
    ...docTopics.map((t) => ({ kind: 'docs', slug: t.slug })),
    { kind: 'theme', slug: null }
  ]
}
