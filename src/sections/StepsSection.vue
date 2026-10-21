<script setup>
// A header + sequence of labeled steps. `layout` picks the presentation:
// 'list' (divided numbered list, default), 'chain' (theme-colored cards
// joined by arrows; each step may set `theme`/`image`/`href`) or 'grid'
// (3-column checkmark grid). All three loop the same
// `steps: [{ title, text? }]` shape; `marker` picks the per-item glyph and
// defaults sensibly per layout (numbered for list/chain, checkmark for grid).
import { computed } from 'vue'
import AppButton from '../components/button/AppButton.vue'
import { sectionThemes, themeColors } from '../utils/themes'
import { vReveal } from '../composables/useReveal'
import { hasOwn, sanitizeCssUrl } from '../utils/security'
import NewTabHint from '../components/internal/NewTabHint.vue'
import CuiLink from '../components/internal/CuiLink.vue'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  intro: { type: String, default: '' },
  steps: { type: Array, required: true }, // [{ title, text?, image?, href?, newTab?, theme? }]: image/href/newTab/theme are 'chain'-only
  layout: { type: String, default: 'list', validator: (v) => ['list', 'chain', 'grid'].includes(v) },
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) },
  marker: { type: String, default: '', validator: (v) => ['', 'number', 'check', 'none'].includes(v) },
  columns: { type: Number, default: 3 }, // 'grid' layout only
  action: { type: Object, default: null }, // 'list' layout only, { label, href, newTab? }
  // Opt-in 860px column. Off by default so every section shares the same
  // container width and their edges line up when stacked.
  narrow: { type: Boolean, default: false }
})

const effectiveMarker = computed(() => props.marker || (props.layout === 'grid' ? 'check' : 'number'))
const pad = (n) => String(n).padStart(2, '0')

const defaultThemeCycle = ['purple', 'violet', 'sky', 'teal']
const chainSteps = computed(() =>
  props.steps.map((step, i) => {
    const key = step.theme || defaultThemeCycle[i % defaultThemeCycle.length]
    // security (prototype-pollution-adjacent lookup, see utils/security.js):
    // hasOwn() keeps a `step.theme: "constructor"` from resolving to
    // Object.prototype's Function instead of falling back to purple.
    return { ...step, theme: themeColors(hasOwn(sectionThemes, key) ? key : 'purple') }
  })
)
</script>

<template>
  <section class="cui-section" :class="{ 'cui-section--subtle': layout === 'grid' }">
    <div class="cui-container" :class="{ 'cui-container--narrow': narrow }">
      <div v-if="title || eyebrow" v-reveal class="cui-steps__head" :class="[`cui-steps__head--${layout}`, `cui-align-${align}`]">
        <span v-if="eyebrow" class="cui-eyebrow">{{ eyebrow }}</span>
        <h2 v-if="title">{{ title }}</h2>
        <p v-if="intro">{{ intro }}</p>
      </div>

      <!-- list -->
      <template v-if="layout === 'list'">
        <ol class="cui-steps cui-steps--list">
          <li v-for="(step, i) in steps" :key="step.title" v-reveal="i * 70" class="cui-steps__item cui-steps__item--list">
            <span v-if="effectiveMarker !== 'none'" class="cui-steps__index" aria-hidden="true">
              <template v-if="effectiveMarker === 'check'">
                <svg viewBox="0 0 20 20" width="14" height="14"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </template>
              <template v-else>{{ pad(i + 1) }}</template>
            </span>
            <div class="cui-steps__body">
              <h3>{{ step.title }}</h3>
              <p v-if="step.text">{{ step.text }}</p>
            </div>
          </li>
        </ol>
        <AppButton v-if="action" variant="primary" :href="action.href" :new-tab="action.newTab" class="cui-steps__action">
          {{ action.label }}
        </AppButton>
      </template>

      <!-- chain -->
      <ol v-else-if="layout === 'chain'" class="cui-steps cui-steps--chain">
        <li v-for="(step, i) in chainSteps" :key="step.title" class="cui-steps__item cui-steps__item--chain">
          <component
            :is="step.href ? CuiLink : 'div'"
            v-bind="step.href ? { href: step.href, newTab: step.newTab } : {}"
            class="cui-steps__card"
            :class="{ 'cui-steps__card--photo': !!step.image }"
            :style="{
              '--cui-step-bg': step.theme.bg,
              '--cui-step-text': step.theme.text,
              '--cui-step-heading': step.theme.heading,
              backgroundImage: step.image ? sanitizeCssUrl(step.image) : 'none'
            }"
          >
            <span v-if="effectiveMarker !== 'none'" class="cui-steps__chain-index" aria-hidden="true">{{ i + 1 }}</span>
            <div class="cui-steps__body">
              <h3 class="cui-steps__chain-title">{{ step.title }}<NewTabHint v-if="step.href && step.newTab" /></h3>
              <p v-if="step.text" class="cui-steps__chain-text">{{ step.text }}</p>
            </div>
          </component>
          <span v-if="i < chainSteps.length - 1" class="cui-steps__connector" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="16" height="16"><path d="M4 10h12m0 0l-5-5m5 5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </span>
        </li>
      </ol>

      <!-- grid -->
      <ul v-else class="cui-steps cui-steps--grid cui-grid" :class="`cui-grid--${columns}`">
        <li v-for="(step, i) in steps" :key="i" class="cui-steps__item cui-steps__item--grid">
          <span v-if="effectiveMarker !== 'none'" class="cui-steps__index cui-steps__index--grid" aria-hidden="true">
            <svg v-if="effectiveMarker === 'check'" viewBox="0 0 20 20" width="14" height="14"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <template v-else>{{ pad(i + 1) }}</template>
          </span>
          <span>
            <strong>{{ typeof step === 'string' ? step : step.title }}</strong>
            <span v-if="step.text" class="cui-steps__grid-text">{{ step.text }}</span>
          </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.cui-steps__head {
  margin-bottom: var(--cui-space-6);
}
.cui-steps__head--chain,
.cui-steps__head--grid {
  max-width: 640px;
}
.cui-steps__head p {
  margin-top: var(--cui-space-2);
  font-size: 1.6rem;
  color: var(--cui-text-muted);
}

.cui-steps {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* ---- list ---- */
.cui-steps--list {
  display: flex;
  flex-direction: column;
}
.cui-steps__item--list {
  display: flex;
  gap: var(--cui-space-4);
  padding-block: var(--cui-space-5);
  border-top: 1px solid var(--cui-border);
}
.cui-steps__item--list:last-child {
  border-bottom: 1px solid var(--cui-border);
}
.cui-steps__item--list .cui-steps__index {
  flex-shrink: 0;
  display: inline-flex;
  font-family: var(--cui-font-sans);
  font-weight: 700;
  font-size: 1.6rem;
  color: var(--cui-text-secondary);
  padding-top: 0.2rem;
}
.cui-steps__body h3 {
  margin: 0;
  font-size: 1.9rem;
}
/* list layout only: scoped to --list so its muted body color can't
   out-specify .cui-steps__chain-text and put muted gray on a dark chain
   card (WCAG 1.4.3). */
.cui-steps--list .cui-steps__body p {
  margin: var(--cui-space-2) 0 0;
  font-size: 1.5rem;
  line-height: 1.55;
  color: var(--cui-text-muted);
  max-width: 60ch;
}
.cui-steps__action {
  margin-top: var(--cui-space-6);
}

/* ---- chain ---- */
.cui-steps--chain {
  display: flex;
  flex-direction: column;
  gap: var(--cui-space-7);
}
.cui-steps__item--chain {
  position: relative;
}
.cui-steps__card {
  position: relative;
  display: block;
  padding: var(--cui-space-6) var(--cui-space-5);
  border-radius: var(--cui-radius-lg);
  background-color: var(--cui-step-bg);
  background-size: cover;
  background-position: center;
  color: var(--cui-step-text);
  text-decoration: none;
  isolation: isolate;
}
.cui-steps__card--photo::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(-180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%);
  z-index: -1;
}
.cui-steps__chain-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: var(--cui-step-heading);
  font-weight: 700;
  font-size: 1.6rem;
  margin-bottom: var(--cui-space-4);
}
.cui-steps__chain-title {
  color: var(--cui-step-heading);
  margin: 0 0 var(--cui-space-2);
  font-size: 2.2rem;
}
.cui-steps__chain-text {
  margin: var(--cui-space-2) 0 0;
  max-width: 60ch;
  color: var(--cui-step-text);
  font-size: 1.5rem;
  line-height: 1.55;
}
a.cui-steps__card:hover .cui-steps__chain-title {
  text-decoration: underline;
}
.cui-steps__connector {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 50%);
  z-index: 2;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--cui-surface-raised);
  color: var(--cui-on-surface);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--cui-shadow-float);
  transition: width var(--cui-duration) var(--cui-ease), height var(--cui-duration) var(--cui-ease);
}
.cui-steps__connector svg {
  transform: rotate(90deg);
}

/* ---- grid ---- */
.cui-steps__item--grid {
  display: flex;
  align-items: flex-start;
  gap: var(--cui-space-3);
  font-size: 1.5rem;
}
.cui-steps__index--grid {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  margin-top: 0.1rem;
  border-radius: 50%;
  background: var(--cui-accent);
  color: var(--cui-accent-contrast);
  font-weight: 700;
  font-size: 1.2rem;
}
.cui-steps__grid-text {
  display: block;
  font-weight: 400;
  color: var(--cui-text-muted);
  font-size: 1.4rem;
  margin-top: 0.2rem;
}

@media (min-width: 900px) {
  .cui-steps--chain {
    flex-direction: row;
    align-items: stretch;
  }
  .cui-steps__item--chain {
    flex: 1;
    display: flex;
  }
  .cui-steps__card {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .cui-steps__connector {
    left: auto;
    right: 0;
    top: 50%;
    bottom: auto;
    transform: translate(50%, -50%);
  }
  .cui-steps__connector svg {
    transform: none;
  }
  .cui-steps__connector:hover {
    width: 5.2rem;
    height: 5.2rem;
  }
}
</style>
