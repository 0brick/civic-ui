<script setup>
// A general-purpose top nav bar: brand on the left, nav items in the
// middle/right, and an automatic hamburger that opens the nav items in a
// Modal (placement="end") below the `mobileBreakpoint`. Bring your own items
// via slots so this works for a simple 3-link nav or a full institutional
// mega menu.
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import Modal from '../overlay/Modal.vue'
import NavContext from '../internal/NavContext.vue'
import NavItems from '../internal/NavItems.vue'
import { useId } from '../../composables/useId'
import { t } from '../../utils/i18n'

const props = defineProps({
  sticky: { type: Boolean, default: true },
  dark: { type: Boolean, default: false },
  // Where the desktop #links group sits between brand and actions:
  // 'center' spaces it between the two (the default), 'start' packs it right
  // after the brand, 'end' pushes it right up against the actions. Only
  // affects the desktop row: the mobile menu is always a vertical list.
  // Data-driven alternative to the #links slot (the slot wins when both are
  // given): [{ label, href?, newTab?, active?, children? }]: an item with
  // `children` becomes a chevron-label Dropdown, an expanded group in the
  // mobile drawer. `linkTag` renders the links as e.g. RouterLink (usually
  // unnecessary with configureLinks({ linkComponent })).
  items: { type: Array, default: () => [] },
  linkTag: { type: [String, Object], default: null },
  linksAlign: {
    type: String,
    default: 'center',
    validator: (v) => ['start', 'center', 'end'].includes(v)
  },
  // Screen-reader texts, so a non-English site can translate them: the
  // hamburger's name, the mobile drawer's title and close button, and the
  // names of the desktop/mobile <nav> landmarks.
  toggleLabel: { type: String },
  menuLabel: { type: String },
  closeLabel: { type: String },
  navLabel: { type: String },
  mobileNavLabel: { type: String }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  toggleLabel: props.toggleLabel ?? t('navbar.toggle'),
  menuLabel: props.menuLabel ?? t('navbar.menu'),
  closeLabel: props.closeLabel ?? t('navbar.close'),
  navLabel: props.navLabel ?? t('navbar.nav'),
  mobileNavLabel: props.mobileNavLabel ?? t('navbar.mobileNav')
}))


const mobileOpen = ref(false)
// The toggle points at the drawer it opens (aria-controls), like Dropdown's
// trigger at its menu.
const drawerId = useId('cui-navbar-drawer')

// Only following a link closes the drawer: a click on a Dropdown group
// label, a button or the drawer's padding must not.
function onMobileClick(event) {
  if (typeof event.target?.closest === 'function' && event.target.closest('a')) mobileOpen.value = false
}

// A sticky bar publishes its height as --cui-navbar-height on <html>, so
// .cui-sticky elements and in-page anchor jumps (scroll-padding-top in
// base.css) stop below it instead of disappearing underneath.
const rootEl = ref(null)
let resizeObserver = null
function publishHeight() {
  if (!rootEl.value) return
  document.documentElement.style.setProperty('--cui-navbar-height', `${rootEl.value.offsetHeight}px`)
}
onMounted(() => {
  if (!props.sticky || typeof ResizeObserver === 'undefined') return
  publishHeight()
  resizeObserver = new ResizeObserver(publishHeight)
  resizeObserver.observe(rootEl.value)
})
onBeforeUnmount(() => {
  if (!resizeObserver) return
  resizeObserver.disconnect()
  document.documentElement.style.removeProperty('--cui-navbar-height')
})
</script>

<template>
  <header ref="rootEl" class="cui-navbar" :class="{ 'cui-navbar--sticky': sticky, 'cui-navbar--dark': dark }">
    <div class="cui-container cui-navbar__inner">
      <div class="cui-navbar__brand">
        <slot name="brand" />
      </div>

      <nav
        class="cui-navbar__links cui-navbar__links--desktop"
        :class="`cui-navbar__links--align-${linksAlign}`"
        :aria-label="L.navLabel"
      >
        <NavContext mode="desktop">
          <slot name="links"><NavItems :items="items" :link-tag="linkTag" /></slot>
        </NavContext>
      </nav>

      <div class="cui-navbar__actions">
        <slot name="actions" />
        <button
          type="button"
          class="cui-navbar__toggle"
          :aria-label="L.toggleLabel"
          :aria-expanded="String(mobileOpen)"
          :aria-controls="drawerId"
          aria-haspopup="dialog"
          @click="mobileOpen = true"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>

    <Modal :id="drawerId" v-model="mobileOpen" placement="end" :title="L.menuLabel" :close-label="L.closeLabel">
      <nav class="cui-navbar__links cui-navbar__links--mobile" :aria-label="L.mobileNavLabel" @click="onMobileClick">
        <NavContext mode="mobile">
          <slot name="links"><NavItems :items="items" :link-tag="linkTag" /></slot>
        </NavContext>
      </nav>
    </Modal>
  </header>
</template>

<style scoped>
.cui-navbar {
  background: var(--cui-surface);
  border-bottom: 1px solid var(--cui-border);
}

.cui-navbar--sticky {
  position: sticky;
  top: 0;
  z-index: var(--cui-z-sticky);
  /* Translucent + blurred, so content stays faintly visible underneath. */
  background: var(--cui-surface-glass);
  backdrop-filter: saturate(160%) blur(10px);
  -webkit-backdrop-filter: saturate(160%) blur(10px);
}

.cui-navbar--dark {
  background: var(--cui-color-navy);
  border-bottom-color: rgba(255, 255, 255, 0.12);
  color: var(--cui-color-white);
}

.cui-navbar--dark.cui-navbar--sticky {
  background: rgba(0, 29, 53, 0.92);
}

.cui-navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cui-space-4);
  min-height: 7.2rem;
}

.cui-navbar__brand :deep(a) {
  display: flex;
  align-items: center;
  gap: var(--cui-space-2);
  font-family: var(--cui-font-sans);
  font-weight: 700;
  font-size: 1.8rem;
  letter-spacing: -0.01em;
  color: inherit;
  text-decoration: none;
}

/* Link typography reads --cui-nav-* tokens (defaults below), so a site's own
   nav style is a few token overrides instead of selectors into the bar. */
.cui-navbar__links--desktop {
  display: none;
  align-items: center;
  gap: var(--cui-nav-gap, var(--cui-space-5));
  font-size: var(--cui-nav-font-size, 1.3rem);
  font-weight: var(--cui-nav-font-weight, 600);
  letter-spacing: var(--cui-nav-letter-spacing, 0.03em);
  text-transform: var(--cui-nav-text-transform, uppercase);
  color: var(--cui-nav-color, var(--cui-text-muted));
}

.cui-navbar__links--align-start {
  margin-right: auto;
}
.cui-navbar__links--align-end {
  margin-left: auto;
}

.cui-navbar--dark .cui-navbar__links--desktop {
  color: rgba(255, 255, 255, 0.75);
}

/* Direct-child combinator only: a Dropdown (e.g. a "Services ▾" sub-menu)
   placed in the #links slot renders its own <a> sub-links several levels
   deep, on Dropdown's own always-white popup panel. A descendant selector
   here would reach those too and, in --dark mode, force their hover color to
   white: white text on Dropdown's white menu background. Dropdown already
   styles its own menu links completely; this only ever targets the navbar's
   own top-level items. */
.cui-navbar__links--desktop > :deep(a) {
  position: relative;
  padding-block: 0.4rem;
  color: inherit;
  text-decoration: none;
  transition: color var(--cui-duration) var(--cui-ease);
}
.cui-navbar__links--desktop > :deep(a)::after {
  content: '';
  position: absolute;
  left: 0;
  right: 100%;
  bottom: 0;
  height: 2px;
  background: var(--cui-color-yellow);
  transition: right var(--cui-duration-slow) var(--cui-ease);
}
.cui-navbar__links--desktop > :deep(a:hover),
.cui-navbar__links--desktop > :deep(a.router-link-active),
.cui-navbar__links--desktop > :deep(a[aria-current='page']) {
  color: var(--cui-nav-active, var(--cui-text));
}
.cui-navbar--dark .cui-navbar__links--desktop > :deep(a:hover),
.cui-navbar--dark .cui-navbar__links--desktop > :deep(a.router-link-active),
.cui-navbar--dark .cui-navbar__links--desktop > :deep(a[aria-current='page']) {
  color: var(--cui-color-white);
}
.cui-navbar__links--desktop > :deep(a:hover)::after,
.cui-navbar__links--desktop > :deep(a.router-link-active)::after,
.cui-navbar__links--desktop > :deep(a[aria-current='page'])::after {
  right: 0;
}
/* a11y (WCAG 1.4.1 / 1.4.11): the current page is marked by a 3px bar in
   the text color, not by color alone: the active link's ink differs from
   the muted inactive ones by only ~2.5:1, and the yellow hover bar is
   ~1.2:1 on a light bar. Yellow stays for hover, and for the active bar on
   a dark navbar, where it reads at 14:1. */
.cui-navbar__links--desktop > :deep(a.router-link-active)::after,
.cui-navbar__links--desktop > :deep(a[aria-current='page'])::after {
  height: 3px;
  background: var(--cui-nav-active, var(--cui-text));
}
.cui-navbar--dark .cui-navbar__links--desktop > :deep(a.router-link-active)::after,
.cui-navbar--dark .cui-navbar__links--desktop > :deep(a[aria-current='page'])::after {
  background: var(--cui-color-yellow);
}

.cui-navbar__links--mobile {
  display: flex;
  flex-direction: column;
  font-size: 1.6rem;
  font-weight: 600;
}
.cui-navbar__links--mobile :deep(a) {
  display: block;
  padding-block: 1.3rem;
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid var(--cui-border);
}
.cui-navbar__links--mobile :deep(a.router-link-exact-active),
.cui-navbar__links--mobile :deep(a[aria-current='page']) {
  color: var(--cui-nav-active-mobile, var(--cui-link));
  /* Not color alone (WCAG 1.4.1). */
  text-decoration: underline;
  text-decoration-thickness: 3px;
  text-underline-offset: 0.4em;
}

.cui-navbar__actions {
  display: flex;
  align-items: center;
  gap: var(--cui-space-3);
}

.cui-navbar__toggle {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 4rem;
  height: 4rem;
  /* No UA padding (6px a side in Chromium): with the bars' own 1rem inset it
     left them only ~6px wide. */
  padding: 0;
  border: 1.5px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
  background: none;
  cursor: pointer;
}
.cui-navbar--dark .cui-navbar__toggle {
  border-color: rgba(255, 255, 255, 0.3);
}
.cui-navbar__toggle span {
  display: block;
  height: 2px;
  background: currentColor;
  margin-inline: 1rem;
}

@media (min-width: 900px) {
  .cui-navbar__links--desktop {
    display: flex;
  }
  .cui-navbar__toggle {
    display: none;
  }
}
</style>
