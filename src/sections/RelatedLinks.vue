<script setup>
// The "related links" box common at the end of content pages: a short,
// quiet list of related links, deliberately smaller than a TeaserGrid.
import { useId } from '../composables/useId'
import NewTabHint from '../components/internal/NewTabHint.vue'
import { computed } from 'vue'
import { t } from '../utils/i18n'
import CuiLink from '../components/internal/CuiLink.vue'

const props = defineProps({
  title: { type: String },
  links: { type: Array, required: true }, // [{ label, href, newTab?, text?, tag? }]
  // Element/component for every link (per-link override: link.tag). Leave it
  // unset to follow configureLinks({ linkComponent }) for internal paths.
  tag: { type: [String, Object], default: null },
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  title: props.title ?? t('relatedLinks.title')
}))


const titleId = useId('cui-related-links-title')

// security: `link.tag` travels with the link data, which often
// comes from a CMS: a free-form string there could render any element
// (`<base href>`, `<form>`, `<iframe>`, a globally registered component).
// Per-link overrides are limited to link elements and component objects;
// anything else falls back to the `tag` prop, which only code sets.
const LINK_TAGS = ['a', 'router-link', 'RouterLink', 'nuxt-link', 'NuxtLink']
function tagFor(link) {
  const t = link.tag
  if (t && typeof t === 'object') return t
  if (typeof t === 'string' && LINK_TAGS.includes(t)) return t
  return props.tag
}
</script>

<template>
  <aside class="cui-related-links" :aria-labelledby="titleId">
    <h2 :id="titleId" class="cui-related-links__title" :class="`cui-align-${align}`">{{ L.title }}</h2>
    <ul class="cui-related-links__list">
      <li v-for="link in links" :key="link.label">
        <CuiLink :tag="tagFor(link)" :href="link.href" :new-tab="link.newTab" class="cui-related-links__link">
          <span>
            <strong>{{ link.label }}<NewTabHint v-if="link.newTab" /></strong>
            <span v-if="link.text" class="cui-related-links__desc">{{ link.text }}</span>
          </span>
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </CuiLink>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.cui-related-links {
  padding: var(--cui-space-5);
  background: var(--cui-bg-subtle);
  border-left: 4px solid var(--cui-color-teal);
  border-radius: var(--cui-radius-md);
}

.cui-related-links__title {
  font-size: 1.6rem;
  margin: 0 0 var(--cui-space-3);
}

.cui-related-links__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.cui-related-links__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cui-space-3);
  padding: var(--cui-space-3);
  border-radius: var(--cui-radius-sm);
  color: var(--cui-text);
  text-decoration: none;
  font-size: 1.4rem;
}
.cui-related-links__link:hover {
  background: var(--cui-bg-muted);
}
.cui-related-links__link:hover strong {
  color: var(--cui-link);
}

.cui-related-links__desc {
  display: block;
  font-weight: 400;
  color: var(--cui-text-muted);
  font-size: 1.3rem;
}

.cui-related-links__link svg {
  flex-shrink: 0;
  color: var(--cui-text-secondary);
}
</style>
