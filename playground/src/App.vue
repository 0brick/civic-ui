<script setup>
// Playground shell: a tiny hash router (see router.js: no vue-router
// dependency, matching the library's own zero-dependency ethos) switching
// between two documentation sections, "Sections" and "Components", each
// with an overview (names grouped by category) and a detail page per item
// (live preview + copy-paste code example). None of this is part of the
// published package.
import { computed } from 'vue'
import { useRoute } from './router'
import { useDocumentHead } from './utils/head'
import HomePage from './pages/HomePage.vue'
import ComponentsOverviewPage from './pages/ComponentsOverviewPage.vue'
import SectionsOverviewPage from './pages/SectionsOverviewPage.vue'
import DetailPage from './pages/DetailPage.vue'
import DocsPage from './pages/DocsPage.vue'
import ThemePage from './pages/ThemePage.vue'
import EmbedPage from './pages/EmbedPage.vue'
import { ColorModeToggle, Navbar, SiteFooter } from 'civic-ui'

const route = useRoute()
useDocumentHead(route)

// The site's own Navbar: a <header> with a named <nav> of real links (the
// current one marked aria-current="page"), and a burger drawer on narrow
// viewports instead of a strip that gets cut off at 320px. Plain hrefs, like
// the footer below: router.js's delegated click handler turns them into
// pushState navigation.
const navItems = computed(() =>
  [
    { kind: 'home', label: 'Home', href: '/' },
    { kind: 'sections', label: 'Sections', href: '/sections' },
    { kind: 'components', label: 'Components', href: '/components' },
    { kind: 'docs', label: 'Documentation', href: '/docs' },
    { kind: 'theme', label: 'Theme', href: '/theme' }
  ].map(({ kind, ...item }) => ({ ...item, active: route.value.kind === kind }))
)

// Site-wide footer, built from the library's own SiteFooter section.
// Internal links are plain hrefs: router.js's delegated click handler
// turns them into pushState navigation.
const REPO = 'https://github.com/0brick/civic-ui'
const footerColumns = [
  {
    title: 'Library',
    links: [
      { label: 'Sections', href: '/sections' },
      { label: 'Components', href: '/components' },
      { label: 'Theme', href: '/theme' }
    ]
  },
  {
    title: 'Documentation',
    links: [
      { label: 'Getting started', href: '/docs/getting-started' },
      { label: 'Accessibility & privacy', href: '/docs/accessibility' },
      { label: 'Theming', href: '/docs/theming' },
      { label: 'Security', href: '/docs/security' }
    ]
  },
  {
    title: 'Project',
    links: [
      { label: 'Source code', href: REPO, newTab: true },
      { label: 'Report an issue', href: `${REPO}/issues`, newTab: true },
      { label: 'MIT License', href: `${REPO}/src/branch/main/LICENSE`, newTab: true }
    ]
  },
  {
    title: 'Developer',
    links: [
      { label: 'Felix Lohse', href: 'https://felixlohse.de', newTab: true },
      { label: 'felixlohse@proton.me', href: 'mailto:felixlohse@proton.me' }
    ]
  }
]
const copyright = `© ${new Date().getFullYear()} Felix Lohse. Released under the MIT License.`
</script>

<template>
  <EmbedPage v-if="route.kind === 'embed'" :kind="route.embedKind" :slug="route.slug || ''" :example="route.example" />

  <template v-else>
    <a href="#main-content" class="cui-skip-link">Skip to main content</a>

    <!-- Landmarks named, so they stay distinguishable from the demos' own:
         Navbar/SiteHeader demos bring a "Main" nav, and the AppShell preview
         (an iframe, whose landmarks screen readers list with this page's) an
         unnamed banner and main. -->
    <Navbar
      class="cui-playground-nav"
      aria-label="Civic UI"
      dark
      :items="navItems"
      nav-label="Site"
      mobile-nav-label="Site (mobile)"
    >
      <template #brand>
        <a href="/">Civic UI</a>
      </template>
      <template #actions>
        <ColorModeToggle size="sm" class="cui-playground-nav__mode" />
      </template>
    </Navbar>

    <main id="main-content" class="cui-playground-main" tabindex="-1" aria-label="Civic UI">
      <HomePage v-if="route.kind === 'home'" />
      <SectionsOverviewPage v-else-if="route.kind === 'sections' && !route.slug" />
      <DetailPage v-else-if="route.kind === 'sections'" :key="route.slug" kind="sections" :slug="route.slug" />
      <ComponentsOverviewPage v-else-if="route.kind === 'components' && !route.slug" />
      <DetailPage v-else-if="route.kind === 'components'" :key="route.slug" kind="components" :slug="route.slug" />
      <DocsPage v-else-if="route.kind === 'docs'" :key="route.slug" :slug="route.slug || ''" />
      <ThemePage v-else-if="route.kind === 'theme'" />
    </main>

    <!-- Column headings at level 2: the footer follows the page's own content,
         which may end on an h1 (a demo's hero), never a level deeper. -->
    <SiteFooter :columns="footerColumns" :copyright="copyright" :heading-level="2" collapsible>
      <template #brand>
        <p class="cui-playground-footer__name">Civic UI</p>
        <p>
          Open-source Vue 3 components and page sections for civic and public-sector websites: accessible by default,
          privacy-first, zero third-party requests.
        </p>
        <p>
          Built by
          <a href="https://felixlohse.de" target="_blank" rel="noopener noreferrer"
            >Felix Lohse<span class="cui-visually-hidden">&nbsp;(opens in a new tab)</span></a
          >.
        </p>
      </template>
    </SiteFooter>
  </template>
</template>

<style scoped>
/* Page content grows to fill the viewport so the footer sits at the bottom
   even on short pages (e.g. an empty overview or the Theme page). The sticky
   Navbar publishes its own height as --cui-navbar-height. */
.cui-playground-main {
  min-height: calc(100vh - var(--cui-navbar-height, 0px));
  min-height: calc(100dvh - var(--cui-navbar-height, 0px));
}
/* Focus only lands here via the skip link (tabindex="-1"), so screen readers
   continue from the content; a ring around the whole page would just be noise. */
.cui-playground-main:focus {
  outline: none;
}

.cui-playground-footer__name {
  font-weight: 700;
  font-size: 1.8rem;
  margin-bottom: var(--cui-space-2);
}

.cui-footer__brand p + p {
  margin-top: var(--cui-space-3);
}

.cui-footer__brand a {
  color: var(--cui-color-yellow);
}

.cui-playground-nav.cui-navbar.cui-navbar--sticky {
  /* Below every library overlay z-index token (dropdown/offcanvas/modal/
     popover/tooltip/toast all start at 1000+) so this docs-shell chrome
     never paints over a component being demoed. */
  z-index: 900;
  /* Solid brand ink instead of Navbar's fixed translucent navy, so the Theme
     page's palette reskins this bar too. */
  background: var(--cui-color-navy);
  /* Sentence case like the rest of the docs, not Navbar's uppercase default. */
  --cui-nav-text-transform: none;
  --cui-nav-letter-spacing: 0;
  --cui-nav-font-size: 1.4rem;
}

.cui-playground-nav .cui-playground-nav__mode {
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
