<script setup>
// The full header pattern: an optional utility TopBar + main Navbar stacked
// together, a common pattern for institutional sites. The TopBar (the navy
// strip) only renders when `topBar` is set, so a plain SiteHeader is just the
// Navbar plus the skip link.
import TopBar from './TopBar.vue'
import Navbar from '../components/navigation/Navbar.vue'
import { computed } from 'vue'
import { t } from '../utils/i18n'

const props = defineProps({
  // Renders the navy TopBar utility strip above the Navbar. Off by default,
  // utilityLinks / the #utility slot only show up once this is set.
  topBar: { type: Boolean, default: false },
  utilityLinks: { type: Array, default: () => [] },
  // a11y (WCAG 2.4.1 Bypass Blocks): SiteHeader is the repeated nav block at
  // the top of every page, so it's the natural place for a skip link, but
  // unlike AppShell it doesn't render the page's <main> itself, so the
  // target id has to match whatever the consuming page uses.
  skipToId: { type: String, default: 'main-content' },
  skipLabel: { type: String },
  // Passed through to Navbar: 'start' | 'center' | 'end'.
  linksAlign: { type: String, default: 'center' },
  // Passed through to Navbar: data-driven nav items (used when the #links
  // slot is empty) and the element/component their links render as.
  items: { type: Array, default: () => [] },
  linkTag: { type: [String, Object], default: null },
  // Screen-reader texts of the mobile menu, passed through to Navbar.
  toggleLabel: { type: String },
  menuLabel: { type: String },
  closeLabel: { type: String },
  navLabel: { type: String },
  mobileNavLabel: { type: String }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  skipLabel: props.skipLabel ?? t('siteHeader.skip')
}))
</script>

<template>
  <div class="cui-site-header">
    <a :href="`#${skipToId}`" class="cui-skip-link">{{ L.skipLabel }}</a>
    <TopBar v-if="topBar" :links="utilityLinks">
      <slot name="utility" />
    </TopBar>
    <Navbar
      :links-align="linksAlign"
      :items="items"
      :link-tag="linkTag"
      :toggle-label="toggleLabel"
      :menu-label="menuLabel"
      :close-label="closeLabel"
      :nav-label="navLabel"
      :mobile-nav-label="mobileNavLabel"
    >
      <template #brand><slot name="brand" /></template>
      <template v-if="$slots.links" #links><slot name="links" /></template>
      <template #actions><slot name="actions" /></template>
    </Navbar>
  </div>
</template>

<style scoped>
/* .cui-skip-link is positioned absolute + off-screen (see base.css) on the
   assumption that this is its containing block, without a position here,
   it escapes to whatever ancestor the consuming page happens to have
   positioned, landing it on-screen and permanently visible instead of
   hidden until focused. */
.cui-site-header {
  position: relative;
}
</style>
