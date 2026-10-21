<script setup>
// The Documentation tab: renders the narrative guides from docs/. The
// per-component reference lives in the Sections and Components tabs.
import { computed } from 'vue'
import { Sidebar } from 'civic-ui'
import { renderMarkdown } from '../utils/markdown'
import { docTopics } from '../registry/docs'

import gettingStartedRaw from '../../../docs/getting-started.md?raw'
import accessibilityRaw from '../../../docs/accessibility.md?raw'
import securityRaw from '../../../docs/security.md?raw'
import auditRaw from '../../../docs/audit.md?raw'
import themingRaw from '../../../docs/theming.md?raw'
import utilitiesRaw from '../../../docs/utilities.md?raw'
import composablesRaw from '../../../docs/composables.md?raw'

const props = defineProps({
  slug: { type: String, default: '' }
})

const rawBySlug = {
  'getting-started': gettingStartedRaw,
  accessibility: accessibilityRaw,
  security: securityRaw,
  audit: auditRaw,
  theming: themingRaw,
  utilities: utilitiesRaw,
  composables: composablesRaw
}
const topics = docTopics.map((t) => ({ ...t, raw: rawBySlug[t.slug] }))

const activeSlug = computed(() => (topics.some((t) => t.slug === props.slug) ? props.slug : 'getting-started'))
const activeTopic = computed(() => topics.find((t) => t.slug === activeSlug.value))
const html = computed(() => renderMarkdown(activeTopic.value.raw))

const sidebarItems = computed(() => topics.map((t) => ({ label: t.title, href: `/docs/${t.slug}`, active: t.slug === activeSlug.value })))
</script>

<template>
  <div class="cui-docs-page">
    <div class="cui-container cui-docs-page__inner">
      <Sidebar class="cui-docs-page__sidebar" :items="sidebarItems">
        <template #header>
          <span class="cui-docs-page__sidebar-title">Documentation</span>
        </template>
      </Sidebar>

      <!-- eslint-disable-next-line vue/no-v-html -- routed through renderMarkdown()'s sanitizeHtml() call, see utils/markdown.js -->
      <article :key="activeSlug" class="cui-docs-page__prose" v-html="html" />
    </div>
  </div>
</template>

<style scoped>
.cui-docs-page__inner {
  display: flex;
  flex-direction: column;
  gap: var(--cui-space-6);
  padding-block: var(--cui-space-6) var(--cui-space-8);
  /* Stacked (mobile) layout needs the default `stretch` so the sidebar and
     the prose column both fill the available width, `flex-start` (needed
     below for the side-by-side row layout, so the two columns don't stretch
     to match each other's height) instead sized .cui-docs-page__prose to
     its own content's natural width (its `max-width: 76ch`, wider than any
     phone viewport) and pushed it straight off the right edge of the
     screen. */
}

.cui-docs-page__sidebar {
  width: 100%;
  height: auto;
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-lg);
}

.cui-docs-page__sidebar-title {
  font-weight: 700;
  font-size: 1.4rem;
}

.cui-docs-page__prose {
  min-width: 0;
  max-width: 76ch;
}

/* Typography for the raw markdown-rendered HTML: most of it (headings, p,
   a, ul/ol) already comes free from base.css's global element defaults;
   this only fills in what base.css doesn't style (code/pre, tables,
   blockquotes) plus doc-reader-specific spacing. :deep() is required
   throughout since v-html content isn't compiled by Vue, so it never
   carries this component's scoped-style attribute. */
.cui-docs-page__prose :deep(h2) {
  margin-top: var(--cui-space-7);
  padding-top: var(--cui-space-5);
  border-top: 1px solid var(--cui-border);
}
.cui-docs-page__prose :deep(h1 + h2),
.cui-docs-page__prose :deep(h1 + p + h2) {
  border-top: none;
  padding-top: 0;
}
.cui-docs-page__prose :deep(h3) {
  margin-top: var(--cui-space-5);
}
.cui-docs-page__prose :deep(p),
.cui-docs-page__prose :deep(li) {
  color: var(--cui-text);
  font-size: 1.5rem;
  line-height: 1.65;
}
.cui-docs-page__prose :deep(li) {
  margin-bottom: var(--cui-space-2);
}
.cui-docs-page__prose :deep(strong) {
  color: var(--cui-heading);
}

.cui-docs-page__prose :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
}
.cui-docs-page__prose :deep(:not(pre) > code) {
  background: var(--cui-bg-subtle);
  border-radius: var(--cui-radius-sm);
  padding: 0.15em 0.4em;
}
/* An unbroken CSP header value, path, function signature, or other long
   identifier doesn't get the line-breaking opportunities plain text does
   without this it pushes the whole page wider than the viewport instead
   of wrapping. Table cells are deliberately excluded: they already scroll
   safely inside .cui-docs-table-wrap below, and overflow-wrap:anywhere
   there only shrinks table-layout:auto's column width estimate, forcing
   every cell to wrap mid-word instead. */
.cui-docs-page__prose :deep(:not(pre):not(td):not(th) > code) {
  overflow-wrap: anywhere;
}
.cui-docs-page__prose :deep(pre) {
  background: var(--cui-color-navy);
  color: #e8edf3;
  padding: var(--cui-space-4);
  border-radius: var(--cui-radius-md);
  overflow-x: auto;
  margin: 0 0 var(--cui-space-4);
}
.cui-docs-page__prose :deep(pre code) {
  background: none;
  padding: 0;
  font-size: 1.3rem;
  line-height: 1.6;
}

.cui-docs-page__prose :deep(blockquote) {
  margin: 0 0 var(--cui-space-4);
  padding: var(--cui-space-3) var(--cui-space-4);
  border-left: 3px solid var(--cui-color-teal);
  background: var(--cui-bg-subtle);
  color: var(--cui-text-muted);
  border-radius: 0 var(--cui-radius-sm) var(--cui-radius-sm) 0;
}
.cui-docs-page__prose :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

.cui-docs-page__prose :deep(.cui-docs-table-wrap) {
  overflow-x: auto;
  margin: 0 0 var(--cui-space-5);
}
.cui-docs-page__prose :deep(table) {
  /* No width here, deliberately: table-layout:auto treats a width (even
     min-width) as a target to compress cells into, wrapping every word
     instead of growing past it. Letting the table size to its own content
     and scrolling the wrapper above when that's wider than the column is
     the only combination that doesn't mangle wide tables. */
  border-collapse: collapse;
  font-size: 1.4rem;
}
.cui-docs-page__prose :deep(th),
.cui-docs-page__prose :deep(td) {
  border: 1px solid var(--cui-border);
  padding: var(--cui-space-2) var(--cui-space-3);
  text-align: left;
  vertical-align: top;
}
.cui-docs-page__prose :deep(th) {
  background: var(--cui-bg-subtle);
  font-weight: 700;
}

.cui-docs-page__prose :deep(hr) {
  border: none;
  border-top: 1px solid var(--cui-border);
  margin: var(--cui-space-6) 0;
}

@media (min-width: 900px) {
  .cui-docs-page__inner {
    flex-direction: row;
    align-items: flex-start;
  }

  .cui-docs-page__sidebar {
    width: 26rem;
    flex-shrink: 0;
    /* Sticks just below the playground's own sticky Navbar (which
       publishes its height as --cui-navbar-height) while the prose column
       scrolls. */
    position: sticky;
    top: calc(var(--cui-navbar-height, 0px) + var(--cui-space-4));
  }
}
</style>
