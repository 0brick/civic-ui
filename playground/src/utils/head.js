// Keeps the tab title and meta description in sync with the route, so
// bookmarks and screen readers (WCAG 2.4.2) see where they are. Crawlers
// only index the root (see public/sitemap.xml).
import { watchEffect } from 'vue'
import { sectionCategories } from '../registry/sections'
import { componentCategories } from '../registry/components'
import { docTopics } from '../registry/docs'

const SITE_NAME = 'Civic UI'
const DEFAULT_DESCRIPTION =
  'Civic UI is an open-source Vue 3 component library and page-building kit for government and civic websites: accessible by default, privacy-first, and MIT-licensed.'

function findItem(categories, slug) {
  for (const category of categories) {
    const item = category.items.find((i) => i.slug === slug)
    if (item) return item
  }
  return null
}

function describe(route) {
  if (route.kind === 'sections') {
    if (!route.slug) return { title: `Sections | ${SITE_NAME}`, description: 'Ready-to-drop page sections for civic and government websites: headers, heroes, steps, testimonials, and more.' }
    const item = findItem(sectionCategories, route.slug)
    return item
      ? { title: `${item.name} | ${SITE_NAME} Sections`, description: item.summary }
      : { title: `Sections | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION }
  }

  if (route.kind === 'components') {
    if (!route.slug) return { title: `Components | ${SITE_NAME}`, description: 'Accessible Vue 3 components for civic and government websites: buttons, forms, navigation, feedback, and more.' }
    const item = findItem(componentCategories, route.slug)
    return item
      ? { title: `${item.name} | ${SITE_NAME} Components`, description: item.summary }
      : { title: `Components | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION }
  }

  if (route.kind === 'docs') {
    const topic = docTopics.find((t) => t.slug === route.slug) || docTopics[0]
    return { title: `${topic.title} | ${SITE_NAME} Docs`, description: DEFAULT_DESCRIPTION }
  }

  if (route.kind === 'embed') {
    const item = findItem(route.embedKind === 'sections' ? sectionCategories : componentCategories, route.slug)
    return { title: `${item ? item.name : 'Example'} example | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION }
  }

  if (route.kind === 'theme') {
    return { title: `Theme configurator | ${SITE_NAME}`, description: 'Preview and export a custom Civic UI color palette, checked for WCAG contrast as you go.' }
  }

  return { title: `${SITE_NAME} | Vue 3 Component Library for Public-Sector Websites`, description: DEFAULT_DESCRIPTION }
}

function setMetaDescription(content) {
  let tag = document.querySelector('meta[name="description"]')
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', 'description')
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

export function useDocumentHead(route) {
  watchEffect(() => {
    const { title, description } = describe(route.value)
    document.title = title
    setMetaDescription(description)
  })
}
