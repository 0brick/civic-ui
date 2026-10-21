<script setup>
// The vertical app-nav rail for AppShell: icon + label items, active state,
// optional grouping, and a collapsed (icon-only) mode for dense layouts.
// Distinct from Navbar/TopBar, which are for marketing-site headers.
//
// Items without `href`/`to` render as buttons: clicking one emits
// `select` with the item (so a view switcher can react). Link items emit it
// too, before navigating: handy for closing a mobile nav.
import NewTabHint from '../internal/NewTabHint.vue'
import { sanitizeHtml } from '../../utils/security'
import { t } from '../../utils/i18n'
import CuiLink from '../internal/CuiLink.vue'

const emit = defineEmits(['select'])

defineProps({
  // [{ label, href?, newTab?, to?, icon?, active?, group? }], `icon` is rendered
  // via v-html as raw SVG markup, routed through sanitizeHtml() (see
  // utils/security.js): a strict icon allowlist by default, or DOMPurify /
  // another sanitizer registered with configureSecurity({ sanitizeHtml }).
  items: { type: Array, default: () => [] },
  collapsed: { type: Boolean, default: false }
})

// a11y (WCAG 1.3.1 / 4.1.2): the active entry says so, not only by its
// highlight: aria-current="page" on a link, "true" on a view-switching
// button. Only set when active, so a router link's own aria-current (from
// the router's exact-active match) isn't overwritten with nothing.
function itemAttrs(item) {
  const isLink = Boolean(item.href || item.to)
  const attrs = isLink ? { href: item.href, newTab: item.newTab, to: item.to } : { type: 'button' }
  if (item.active) attrs['aria-current'] = isLink ? 'page' : 'true'
  return attrs
}
</script>

<template>
  <aside class="cui-sidebar" :class="{ 'cui-sidebar--collapsed': collapsed }">
    <div v-if="$slots.header" class="cui-sidebar__header">
      <slot name="header" />
    </div>

    <nav class="cui-sidebar__nav" :aria-label="t('sidebar.label')">
      <slot>
        <component
          :is="item.href || item.to ? CuiLink : 'button'"
          v-for="item in items"
          :key="item.label"
          v-bind="itemAttrs(item)"
          class="cui-sidebar__item"
          :class="{ 'cui-sidebar__item--active': item.active }"
          @click="emit('select', item)"
        >
          <!-- eslint-disable-next-line vue/no-v-html -- routed through sanitizeHtml(), see utils/security.js -->
          <span v-if="item.icon" class="cui-sidebar__icon" aria-hidden="true" v-html="sanitizeHtml(item.icon)" />
          <span class="cui-sidebar__label">{{ item.label }}<NewTabHint v-if="item.href && item.newTab" /></span>
        </component>
      </slot>
    </nav>

    <div v-if="$slots.footer" class="cui-sidebar__footer">
      <slot name="footer" />
    </div>
  </aside>
</template>

<style scoped>
.cui-sidebar {
  display: flex;
  flex-direction: column;
  width: 26rem;
  flex-shrink: 0;
  height: 100%;
  background: var(--cui-surface);
  border-right: 1px solid var(--cui-border);
  transition: width var(--cui-duration) var(--cui-ease);
}

.cui-sidebar--collapsed {
  width: 7.2rem;
}

.cui-sidebar__header {
  padding: var(--cui-space-4);
  border-bottom: 1px solid var(--cui-border);
}

.cui-sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--cui-space-3);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.cui-sidebar__item {
  display: flex;
  align-items: center;
  gap: var(--cui-space-3);
  width: 100%;
  padding: 1.1rem 1.2rem;
  border: none;
  border-radius: var(--cui-radius-md);
  background: none;
  color: var(--cui-text);
  font: inherit;
  font-weight: 600;
  font-size: 1.4rem;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
}

/* :not(--active): a bare :hover out-specifies the --active class and would
   paint the muted hover fill under the active item's contrast-colored text,
   leaving it unreadable. The active item gets its own darker hover instead. */
.cui-sidebar__item:not(.cui-sidebar__item--active):hover {
  background: var(--cui-bg-muted);
}

.cui-sidebar__item--active {
  background: var(--cui-primary);
  color: var(--cui-primary-contrast);
}

.cui-sidebar__item--active:hover {
  background: var(--cui-primary-hover);
}

.cui-sidebar__icon {
  flex-shrink: 0;
  display: inline-flex;
}
.cui-sidebar__icon :deep(svg) {
  width: 2rem;
  height: 2rem;
}

.cui-sidebar--collapsed .cui-sidebar__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.cui-sidebar--collapsed .cui-sidebar__item {
  justify-content: center;
}

.cui-sidebar__footer {
  padding: var(--cui-space-3);
  border-top: 1px solid var(--cui-border);
}
</style>
