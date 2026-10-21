<script setup>
// items: [{ label, to | href }]. The last item renders as plain text (the
// current page shouldn't be a link) regardless of what's passed for it.
// `newTab: true` on an `href` item opens it in a new tab.
import NewTabHint from '../internal/NewTabHint.vue'
import { t } from '../../utils/i18n'
import CuiLink from '../internal/CuiLink.vue'

defineProps({
  items: { type: Array, required: true }
})
</script>

<template>
  <nav class="cui-breadcrumb" :aria-label="t('breadcrumb.label')">
    <ol>
      <li v-for="(item, i) in items" :key="i">
        <component
          :is="i === items.length - 1 ? 'span' : CuiLink"
          v-bind="i === items.length - 1 ? { 'aria-current': 'page' } : { href: item.href, newTab: item.newTab, to: item.to }"
        >
          {{ item.label }}<NewTabHint v-if="i !== items.length - 1 && !item.to && item.newTab" />
        </component>
        <!-- a separator span, not CSS content: generated text is read aloud
             ("slash") by most screen readers; the list already says it's a trail -->
        <span v-if="i !== items.length - 1" class="cui-breadcrumb__sep" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.cui-breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 1.3rem;
}

.cui-breadcrumb li {
  display: flex;
  align-items: center;
}

.cui-breadcrumb__sep {
  margin: 0 0.8rem;
  /* grey-500 alone reads ~4:1 on white: short of the 4.5:1 AA text minimum
     text-muted is guaranteed to clear (see utils/palette.js). */
  color: var(--cui-text-muted);
}

.cui-breadcrumb a {
  color: var(--cui-text-secondary);
  text-decoration: none;
  font-weight: 600;
}
.cui-breadcrumb a:hover {
  text-decoration: underline;
}

.cui-breadcrumb span[aria-current] {
  color: var(--cui-text-muted);
  font-weight: 600;
}
</style>
