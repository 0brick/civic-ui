// Minimal path-based router for the playground/docs shell: no vue-router
// dependency, matching the library's own zero-dependency ethos.
//
// Routes:
//   /                        -> landing page
//   /sections                -> sections overview (grouped by category)
//   /sections/:slug          -> single section doc page
//   /components              -> components overview (grouped by category)
//   /components/:slug        -> single component doc page
//   /docs                    -> documentation (defaults to "Getting started")
//   /docs/:slug              -> a single documentation topic
//   /theme                   -> color palette configurator
//   /embed/:kind/:slug/:i    -> example i alone, for DetailPage's iframe
//                               preview of `isolated` registry entries
//
// A direct hit on e.g. /components/app-button has no matching file on static
// hosting. public/404.html round-trips the path through index.html's decode
// script, which restores the real URL before this router reads it.
import { ref, onMounted, onUnmounted } from 'vue'

const KINDS = ['sections', 'components', 'docs', 'theme']

function parsePath(pathname) {
  const clean = pathname.replace(/^\/|\/$/g, '')
  const [kindPart, slugPart, ...rest] = clean.split('/')
  if (kindPart === 'embed' && KINDS.includes(slugPart)) {
    return { kind: 'embed', embedKind: slugPart, slug: rest[0] || null, example: Number(rest[1]) || 0 }
  }
  const kind = KINDS.includes(kindPart) ? kindPart : 'home'
  return { kind, slug: slugPart || null }
}

export function useRoute() {
  const route = ref(parsePath(window.location.pathname))

  function onPopState() {
    route.value = parsePath(window.location.pathname)
  }

  // Delegated click handler so plain `<a href="/sections">`-style links,
  // used throughout (HomePage's hero/CTA actions, DocsPage's sidebar, and
  // markdown-rendered cross-links between docs topics): navigate via
  // pushState instead of a full page reload, without needing a router-link
  // component or a per-link click handler.
  function onClick(event) {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const anchor = event.target.closest('a')
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return
    const url = new URL(anchor.href, window.location.href)
    if (url.origin !== window.location.origin) return
    // In-page anchors: docs headings, or a live demo's own ScrollspyNav
    // links: must fall through to native same-page hash scrolling.
    if (url.pathname === window.location.pathname && url.hash) return
    event.preventDefault()
    if (url.pathname === window.location.pathname && url.search === window.location.search) return
    window.history.pushState(null, '', url.pathname + url.search)
    route.value = parsePath(url.pathname)
    window.scrollTo({ top: 0 })
  }

  onMounted(() => {
    window.addEventListener('popstate', onPopState)
    document.addEventListener('click', onClick)
  })
  onUnmounted(() => {
    window.removeEventListener('popstate', onPopState)
    document.removeEventListener('click', onClick)
  })

  return route
}

export function navigate(kind, slug) {
  const target = kind === 'home' ? '/' : slug ? `/${kind}/${slug}` : `/${kind}`
  if (window.location.pathname === target) return
  window.history.pushState(null, '', target)
  // pushState fires no event of its own: dispatch one manually so every
  // useRoute() listener (just App.vue's, but the router doesn't assume that)
  // picks up the change the same way it would a back/forward navigation.
  window.dispatchEvent(new Event('popstate'))
  window.scrollTo({ top: 0 })
}
