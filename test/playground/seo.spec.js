import { describe, expect, it } from 'vitest'
import { canonicalUrl, describeRoute, listRoutes, routePath } from '../../playground/src/utils/seo.js'

describe('playground route metadata', () => {
  const routes = listRoutes().filter((r) => describeRoute(r).path === routePath(r))
  const pages = routes.map(describeRoute)

  it('gives every page a title and description that fit a search result', () => {
    for (const { title, description } of pages) {
      expect(title.length, title).toBeLessThanOrEqual(70)
      expect(description.length, description).toBeGreaterThan(50)
    }
  })

  it('does not repeat a title or description across pages', () => {
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length)
    expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length)
  })

  it('points /docs at the topic it shows', () => {
    expect(describeRoute({ kind: 'docs', slug: null }).path).toBe('/docs/getting-started')
  })

  it('points an isolated example at its detail page', () => {
    expect(describeRoute({ kind: 'embed', embedKind: 'components', slug: 'app-button', example: 0 }).path).toBe('/components/app-button')
  })

  it('builds canonical URLs without a trailing slash except for the root', () => {
    expect(canonicalUrl('/')).toBe('https://civic.servergedoens.de/')
    expect(canonicalUrl('/components/app-button')).toBe('https://civic.servergedoens.de/components/app-button')
  })
})
