<script setup>
// Shared doc page for a single component or section: an API reference
// (props/events/slots, when the registry entry has them) followed by one or
// more live examples. Each example loads its own demo component and, via a
// `?raw` import of the exact same file, the source shown underneath it, so
// the snippet on screen can never drift from what's actually rendering above
// it. Examples are ordered minimal-first: example 1 is the smallest useful
// case, later ones layer on configuration and alternate layouts/variants.
//
// Mounted with :key="slug" from App.vue, so each navigation is a fresh
// mount: no stale reactive state (including which example tab was active)
// carried over between two different demos.
import { ref, shallowRef, watch, onUnmounted } from 'vue'
import CodeBlock from '../components/CodeBlock.vue'
import ApiTable from '../components/ApiTable.vue'
import { findComponent, flatComponentList } from '../registry/components'
import { findSection, flatSectionList } from '../registry/sections'
import { navigate } from '../router'

const props = defineProps({
  kind: { type: String, required: true }, // 'components' | 'sections'
  slug: { type: String, required: true }
})

const isSections = props.kind === 'sections'
const entry = isSections ? findSection(props.slug) : findComponent(props.slug)
const flatList = isSections ? flatSectionList() : flatComponentList()
const index = flatList.findIndex((item) => item.slug === props.slug)
const prevItem = index > 0 ? flatList[index - 1] : null
const nextItem = index !== -1 && index < flatList.length - 1 ? flatList[index + 1] : null

const activeExample = ref(0)
const DemoComponent = shallowRef(null)
const sourceCode = shallowRef('')

function loadExample(i) {
  const example = entry.examples[i]
  DemoComponent.value = null
  sourceCode.value = ''
  // An isolated entry's demo runs in the iframe (EmbedPage), not here.
  if (!entry.isolated) example.demo().then((mod) => { DemoComponent.value = mod.default })
  example.source().then((mod) => { sourceCode.value = mod.default })
}

// The iframe takes its document's height, so the preview reads like an inline
// one, and follows it when the demo changes size (e.g. a collapsed sidebar).
const frameHeight = ref(null)
let frameObserver = null
function fitFrame(event) {
  frameObserver?.disconnect()
  const doc = event.target.contentDocument
  if (!doc) return
  // The body, not documentElement.scrollHeight: that never drops below the
  // iframe's current height, so the frame could grow but never shrink.
  const measure = () => { frameHeight.value = `${Math.ceil(doc.body.getBoundingClientRect().height)}px` }
  measure()
  frameObserver = new ResizeObserver(measure)
  frameObserver.observe(doc.body)
}
onUnmounted(() => frameObserver?.disconnect())

if (entry) {
  loadExample(0)
  watch(activeExample, (i) => loadExample(i))
}
</script>

<template>
  <template v-if="entry">
    <div class="docs-detail-intro">
      <div class="cui-container">
        <a :href="`/${kind}`" class="docs-back">
          <span aria-hidden="true">←</span> All {{ isSections ? 'Sections' : 'Components' }}
        </a>
        <span class="cui-eyebrow">{{ entry.category }}</span>
        <h1>{{ entry.name }}</h1>
        <p>{{ entry.summary }}</p>
      </div>
    </div>

    <section v-if="entry.props || entry.events || entry.slots" class="cui-container docs-detail-api">
      <h2>API reference</h2>
      <ApiTable v-if="entry.props" kind="props" :rows="entry.props" />
      <ApiTable v-if="entry.events" kind="events" :rows="entry.events" />
      <ApiTable v-if="entry.slots" kind="slots" :rows="entry.slots" />
    </section>

    <section class="docs-detail-examples">
      <div class="cui-container docs-detail-examples__head">
        <h2>Examples</h2>
        <!-- Toggle buttons, not a tablist: the example's description, preview
             and source below are separate regions, not one tabpanel. -->
        <div v-if="entry.examples.length > 1" class="docs-detail-examples__tabs" role="group" aria-label="Example">
          <button
            v-for="(example, i) in entry.examples"
            :key="example.title"
            type="button"
            :aria-pressed="activeExample === i"
            @click="activeExample = i"
          >
            {{ example.title }}
          </button>
        </div>
      </div>

      <div v-if="entry.examples[activeExample].description" class="cui-container">
        <p class="docs-detail-examples__description">
          {{ entry.examples[activeExample].description }}
        </p>
      </div>

      <div class="docs-detail-preview" :class="{ 'docs-detail-preview--bleed': isSections }">
        <div class="docs-detail-preview__stage">
          <iframe
            v-if="entry.isolated"
            :key="activeExample"
            class="docs-detail-preview__frame"
            :src="`/embed/${kind}/${slug}/${activeExample}`"
            :title="`${entry.name} example: ${entry.examples[activeExample].title}`"
            :style="{ height: frameHeight }"
            @load="fitFrame"
          />
          <component :is="DemoComponent" v-else-if="DemoComponent" />
        </div>
      </div>

      <div class="cui-container docs-detail-code">
        <CodeBlock :code="sourceCode" :label="`Source code: ${entry.examples[activeExample].title}`" />
      </div>
    </section>

    <nav class="cui-container docs-detail-pager">
      <a v-if="prevItem" :href="`/${kind}/${prevItem.slug}`" class="docs-detail-pager__link docs-detail-pager__link--prev" @click.prevent="navigate(kind, prevItem.slug)">
        <span class="docs-detail-pager__hint">Previous</span>
        <span>{{ prevItem.name }}</span>
      </a>
      <span v-else></span>
      <a v-if="nextItem" :href="`/${kind}/${nextItem.slug}`" class="docs-detail-pager__link docs-detail-pager__link--next" @click.prevent="navigate(kind, nextItem.slug)">
        <span class="docs-detail-pager__hint">Next</span>
        <span>{{ nextItem.name }}</span>
      </a>
    </nav>
  </template>

  <div v-else class="cui-container docs-not-found">
    <h1>Not found</h1>
    <p>There's no {{ isSections ? 'section' : 'component' }} named "{{ slug }}".</p>
    <a :href="`/${kind}`"><span aria-hidden="true">←</span> All {{ isSections ? 'Sections' : 'Components' }}</a>
  </div>
</template>

<style scoped>
.docs-detail-intro {
  padding-block: var(--cui-space-6) var(--cui-space-5);
  background: var(--cui-bg-subtle);
  border-bottom: 1px solid var(--cui-border);
}
.docs-detail-intro h1 {
  margin: var(--cui-space-2) 0 var(--cui-space-2);
  /* Component/section names are a single CamelCase word (no spaces),
     "AppointmentSection", "NotificationCenter", with nowhere to break by
     default. At the h1 font-size, several of them are wider than a phone
     viewport and pushed the whole page wider instead of wrapping. */
  overflow-wrap: anywhere;
}
.docs-detail-intro p {
  max-width: 60ch;
  color: var(--cui-text-muted);
  font-size: 1.6rem;
  margin: 0;
}

.docs-back {
  display: block;
  width: fit-content;
  margin-bottom: var(--cui-space-3);
  color: var(--cui-text-secondary);
  font-weight: 600;
  font-size: 1.3rem;
  text-decoration: none;
}
.docs-back:hover {
  text-decoration: underline;
}

.docs-detail-api {
  padding-block: var(--cui-space-6) 0;
}
.docs-detail-api h2 {
  font-size: 1.8rem;
  margin: 0 0 var(--cui-space-4);
}

.docs-detail-examples {
  padding-block: var(--cui-space-6);
}

.docs-detail-examples__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--cui-space-3);
}
.docs-detail-examples__head h2 {
  font-size: 1.8rem;
  margin: 0;
}

.docs-detail-examples__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.docs-detail-examples__tabs button {
  border: 1px solid var(--cui-border);
  background: var(--cui-bg);
  color: var(--cui-text-muted);
  font: inherit;
  font-weight: 600;
  font-size: 1.2rem;
  padding: 0.6rem 1.2rem;
  border-radius: var(--cui-radius-pill);
  cursor: pointer;
  transition: background-color var(--cui-duration) var(--cui-ease), border-color var(--cui-duration) var(--cui-ease), color var(--cui-duration) var(--cui-ease);
}
.docs-detail-examples__tabs button:hover {
  border-color: var(--cui-color-line-strong);
}
.docs-detail-examples__tabs button[aria-pressed='true'] {
  background: var(--cui-primary);
  border-color: var(--cui-primary);
  color: var(--cui-primary-contrast);
}

.docs-detail-examples__description {
  color: var(--cui-text-muted);
  font-size: 1.4rem;
  max-width: 70ch;
  margin: var(--cui-space-3) 0 0;
}

.docs-detail-preview {
  position: relative;
  margin-top: var(--cui-space-4);
  padding: var(--cui-space-7) var(--cui-gutter);
  background:
    linear-gradient(45deg, var(--cui-bg-muted) 25%, transparent 25%) -10px 0 / 20px 20px,
    linear-gradient(-45deg, var(--cui-bg-muted) 25%, transparent 25%) -10px 0 / 20px 20px,
    linear-gradient(45deg, transparent 75%, var(--cui-bg-muted) 75%) -10px 0 / 20px 20px,
    linear-gradient(-45deg, transparent 75%, var(--cui-bg-muted) 75%) -10px 0 / 20px 20px,
    var(--cui-bg);
  border-block: 1px solid var(--cui-border);
}

.docs-detail-preview__stage {
  max-width: var(--cui-container-max);
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* A flex item centered this way sizes to its own preferred content width by
   default, not the container's available width: most demos are narrow
   enough that this never shows, but one with wide-enough content (e.g.
   Carousel, whose slides want their natural content width) renders wider
   than the stage and overflows symmetrically past both edges instead of
   shrinking to fit. */
.docs-detail-preview:not(.docs-detail-preview--bleed) .docs-detail-preview__stage > * {
  max-width: 100%;
  min-width: 0;
}

.docs-detail-preview__frame {
  display: block;
  width: 100%;
  height: 48rem;
  border: 0;
  background: transparent;
}

/* Sections are page-width by nature: let them run edge to edge instead of
   sitting inside the centered preview stage used for standalone components. */
.docs-detail-preview--bleed {
  padding-inline: 0;
}
.docs-detail-preview--bleed .docs-detail-preview__stage {
  display: block;
  max-width: none;
  margin-inline: 0;
}

.docs-detail-code {
  padding-block: var(--cui-space-4) 0;
}

.docs-detail-pager {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: space-between;
  gap: var(--cui-space-4);
  padding-block: 0 var(--cui-space-7);
}

.docs-detail-pager__link {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: var(--cui-space-3) var(--cui-space-4);
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
  text-decoration: none;
  min-width: 160px;
  transition: border-color var(--cui-duration) var(--cui-ease);
}
.docs-detail-pager__link:hover {
  border-color: var(--cui-color-line-strong);
}
.docs-detail-pager__link--next {
  text-align: right;
  margin-left: auto;
}

.docs-detail-pager__hint {
  font-size: 1.1rem;
  color: var(--cui-text-muted);
}
.docs-detail-pager__link span:last-child {
  font-weight: 700;
  color: var(--cui-heading);
}

.docs-not-found {
  padding-block: var(--cui-space-8);
}
</style>
