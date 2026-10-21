<script setup>
// A vertical "on this page" nav that highlights the section currently in
// view: used for long-form policy/report pages
// plenty of. Pass the same ids you put on your <section id="..."> elements.
//   title       a visible heading (a small kicker) that also names the nav
//   appearance  'plain' a rule on the leading side; 'card' a framed box
//   sticky      sticks below a sticky Navbar (the .cui-sticky utility)
//   scrollOffset extra room above each target when a link jumps to it, set
//               as scroll-margin-top on the target elements, on top of the
//               root scroll-padding that already clears a sticky Navbar
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useScrollspy } from '../../composables/useScrollspy'
import { useId } from '../../composables/useId'
import { t } from '../../utils/i18n'

const props = defineProps({
  items: { type: Array, required: true }, // [{ id, label }]
  title: { type: String, default: '' },
  appearance: { type: String, default: 'plain', validator: (v) => ['plain', 'card'].includes(v) },
  sticky: { type: Boolean, default: false },
  scrollOffset: { type: String, default: '' } // a CSS length, e.g. '2rem'
})

// A missing/non-array `items` (e.g. CMS data still loading) renders an empty
// nav instead of crashing the page.
const list = computed(() => (Array.isArray(props.items) ? props.items.filter(Boolean) : []))
const ids = computed(() => list.value.map((i) => i.id))
const { activeId } = useScrollspy(() => ids.value)
const titleId = useId('cui-scrollspy-title')

// scroll-margin-top on the targets; each element's own value is restored
// when it leaves the list or the nav unmounts.
const touched = new Map() // element -> its previous inline scroll-margin-top
function restoreMargins(keep = []) {
  for (const [el, previous] of touched) {
    if (keep.includes(el)) continue
    el.style.scrollMarginTop = previous
    touched.delete(el)
  }
}
function applyMargins() {
  const targets = props.scrollOffset ? ids.value.map((id) => document.getElementById(id)).filter(Boolean) : []
  restoreMargins(targets)
  for (const el of targets) {
    if (!touched.has(el)) touched.set(el, el.style.scrollMarginTop)
    el.style.scrollMarginTop = props.scrollOffset
  }
}
onMounted(applyMargins)
watch([ids, () => props.scrollOffset], applyMargins)
onBeforeUnmount(() => restoreMargins())
</script>

<template>
  <nav
    class="cui-scrollspy"
    :class="[`cui-scrollspy--${appearance}`, { 'cui-sticky': sticky }]"
    :aria-label="title ? undefined : t('scrollspy.label')"
    :aria-labelledby="title ? titleId : undefined"
  >
    <p v-if="title" :id="titleId" class="cui-scrollspy__title">{{ title }}</p>
    <div class="cui-scrollspy__links">
      <a
        v-for="item in list"
        :key="item.id"
        :href="`#${item.id}`"
        class="cui-scrollspy__link"
        :class="{ 'cui-scrollspy__link--active': activeId === item.id }"
        :aria-current="activeId === item.id ? 'true' : undefined"
      >
        {{ item.label }}
      </a>
    </div>
  </nav>
</template>

<style scoped>
.cui-scrollspy__links {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-left: 2px solid var(--cui-border);
}

.cui-scrollspy__title {
  margin: 0 0 var(--cui-space-3);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cui-text-muted);
}

.cui-scrollspy__link {
  padding: 0.6rem 0 0.6rem 1.6rem;
  margin-left: -2px;
  border-left: 2px solid transparent;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--cui-text-muted);
  text-decoration: none;
  transition: color var(--cui-duration) var(--cui-ease), border-color var(--cui-duration) var(--cui-ease);
}

.cui-scrollspy__link:hover {
  color: var(--cui-text);
}

.cui-scrollspy__link--active {
  color: var(--cui-heading);
  border-color: var(--cui-color-teal);
}

/* card: a framed box, e.g. a table of contents beside a long text */
.cui-scrollspy--card {
  padding: var(--cui-space-5);
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-lg);
  background: var(--cui-surface);
}
.cui-scrollspy--card .cui-scrollspy__link {
  font-size: 1.4rem;
}
</style>
