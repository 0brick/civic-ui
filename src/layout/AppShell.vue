<script setup>
// The fastest path to a webapp screen (as opposed to a marketing page):
// a fixed Sidebar, a top bar strip for search/user menu, and a scrollable
// content area. The sidebar becomes a Modal (placement="start") below
// `mobileBreakpoint` automatically. This is the webapp counterpart to
// SiteHeader+SiteFooter for marketing pages.
import { ref, computed } from 'vue'
import Modal from '../components/overlay/Modal.vue'
import { useId } from '../composables/useId'
import { t } from '../utils/i18n'

const props = defineProps({
  title: { type: String, default: '' },
  // Screen-reader texts, so a non-English app can translate them: the
  // hamburger's name, the drawer title used when `title` is empty, the
  // drawer's close button and the skip link.
  toggleLabel: { type: String },
  menuLabel: { type: String },
  closeLabel: { type: String },
  skipLabel: { type: String }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  toggleLabel: props.toggleLabel ?? t('navbar.toggle'),
  menuLabel: props.menuLabel ?? t('navbar.menu'),
  closeLabel: props.closeLabel ?? t('navbar.close'),
  skipLabel: props.skipLabel ?? t('appShell.skip')
}))


const mobileOpen = ref(false)
// a11y (WCAG 2.4.1 Bypass Blocks): AppShell owns both the repeated
// sidebar/topbar chrome and the <main> landmark, so it can wire a skip link
// straight to its own content without any consumer configuration.
const contentId = useId('cui-app-shell-content')
// a11y (WCAG 4.1.2): the hamburger says what it opens (a dialog), which one
// (aria-controls) and whether it's open (aria-expanded).
const drawerId = useId('cui-app-shell-drawer')
</script>

<template>
  <div class="cui-app-shell">
    <a :href="`#${contentId}`" class="cui-skip-link">{{ L.skipLabel }}</a>

    <div class="cui-app-shell__sidebar-desktop">
      <slot name="sidebar" />
    </div>

    <Modal :id="drawerId" v-model="mobileOpen" placement="start" :title="title || L.menuLabel" :close-label="L.closeLabel">
      <slot name="sidebar" />
    </Modal>

    <div class="cui-app-shell__main">
      <header class="cui-app-shell__topbar">
        <button
          type="button"
          class="cui-app-shell__menu-toggle"
          :aria-label="L.toggleLabel"
          :aria-expanded="String(mobileOpen)"
          :aria-controls="drawerId"
          aria-haspopup="dialog"
          @click="mobileOpen = true"
        >
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
        </button>
        <div class="cui-app-shell__topbar-start"><slot name="topbar-start" /></div>
        <div class="cui-app-shell__topbar-end"><slot name="topbar-end" /></div>
      </header>
      <main :id="contentId" class="cui-app-shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.cui-app-shell {
  position: relative;
  display: flex;
  min-height: 100vh;
  background: var(--cui-bg-subtle);
}

.cui-app-shell__sidebar-desktop {
  display: none;
}

.cui-app-shell__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cui-app-shell__topbar {
  display: flex;
  align-items: center;
  gap: var(--cui-space-4);
  min-height: 6.4rem;
  padding-inline: var(--cui-space-5);
  background: var(--cui-surface);
  border-bottom: 1px solid var(--cui-border);
  position: sticky;
  top: 0;
  z-index: var(--cui-z-sticky);
}

.cui-app-shell__menu-toggle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.8rem;
  height: 3.8rem;
  border: 1.5px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
  background: none;
  cursor: pointer;
}

.cui-app-shell__topbar-start {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--cui-space-3);
}

.cui-app-shell__topbar-end {
  display: flex;
  align-items: center;
  gap: var(--cui-space-3);
  flex-shrink: 0;
}

.cui-app-shell__content {
  flex: 1;
  padding: var(--cui-space-5);
}

@media (min-width: 1024px) {
  .cui-app-shell__sidebar-desktop {
    display: block;
  }
  .cui-app-shell__menu-toggle {
    display: none;
  }
  .cui-app-shell__content {
    padding: var(--cui-space-6);
  }
}
</style>
