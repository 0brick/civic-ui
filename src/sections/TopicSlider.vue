<script setup>
// Full-bleed, image-per-slide topic carousel: a navy field, one full-height
// photo per slide, a large headline with a text shadow (not a scrim) and a
// "Learn more" link. Built on Carousel.
import { reactive, onMounted, watch, computed } from 'vue'
import Carousel from '../components/content/Carousel.vue'
import { sanitizeCssUrl } from '../utils/security'
import { loadImageTone } from '../utils/imageTone'
import NewTabHint from '../components/internal/NewTabHint.vue'
import CuiLink from '../components/internal/CuiLink.vue'
import { t } from '../utils/i18n'
import { useId } from '../composables/useId'

const props = defineProps({
  items: { type: Array, required: true }, // [{ title, text, image, href, newTab?, linkLabel? }]
  moreLabel: { type: String },
  // Opt-in only: default styling assumes a dark/navy-ish photo (white text +
  // shadow). Set this when slide images can't be guaranteed dark: each
  // slide's image is sampled and its text switches to a dark-on-light
  // treatment when the photo reads as visually light.
  adaptiveText: { type: Boolean, default: false },
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) },
  // a11y (WCAG 1.3.1/2.4.6): the slide titles are headings, so they need a
  // parent in the page outline. `title` renders a visually hidden h2 that
  // also names the section; without one, set `headingLevel` to fit the page.
  title: { type: String, default: '' },
  headingLevel: { type: Number, default: 3, validator: (v) => v >= 2 && v <= 6 }
})
const titleId = useId('cui-topic-slider-title')
const headingTag = computed(() => `h${props.headingLevel}`)
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  moreLabel: props.moreLabel ?? t('topicSlider.more')
}))


// Keyed by item index rather than a parallel array so a still-loading sample
// simply leaves that slide on the default (safe) light-on-dark styling.
const tones = reactive({})

function sampleTones() {
  if (!props.adaptiveText) return
  props.items.forEach((item, i) => {
    loadImageTone(item.image).then((tone) => {
      if (tone) tones[i] = tone
    })
  })
}

onMounted(sampleTones)
watch(() => [props.adaptiveText, props.items], sampleTones)
</script>

<template>
  <section class="cui-topic-slider" :aria-labelledby="title ? titleId : undefined">
    <h2 v-if="title" :id="titleId" class="cui-visually-hidden">{{ title }}</h2>
    <Carousel :slide-count="items.length" class="cui-topic-slider__carousel">
      <div
        v-for="(item, i) in items"
        :key="item.title"
        class="cui-topic-slider__slide"
        :class="{ 'cui-topic-slider__slide--light-bg': adaptiveText && tones[i] === 'light' }"
      >
        <div class="cui-topic-slider__media" :style="{ backgroundImage: sanitizeCssUrl(item.image) }" aria-hidden="true" />
        <div class="cui-container cui-topic-slider__content" :class="`cui-align-${align}`">
          <component :is="headingTag" class="cui-topic-slider__title">
            <CuiLink v-if="item.href" :href="item.href" :new-tab="item.newTab">{{ item.title }}<NewTabHint v-if="item.newTab" /></CuiLink>
            <template v-else>{{ item.title }}</template>
          </component>
          <p v-if="item.text" class="cui-topic-slider__text">{{ item.text }}</p>
          <CuiLink v-if="item.href" :href="item.href" :new-tab="item.newTab" class="cui-topic-slider__more">{{ item.linkLabel || L.moreLabel }} →<NewTabHint v-if="item.newTab" /></CuiLink>
        </div>
      </div>
    </Carousel>
  </section>
</template>

<style scoped>
.cui-topic-slider {
  background: var(--cui-color-navy);
}

.cui-topic-slider__carousel :deep(.cui-carousel__track) {
  gap: 0;
}

.cui-topic-slider__slide {
  position: relative;
  min-height: 64vh;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.cui-topic-slider__media {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  filter: var(--cui-media-filter);
}

.cui-topic-slider__content {
  position: relative;
  z-index: 1;
  padding-block: var(--cui-space-7);
  color: #ffffff;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.cui-topic-slider__title {
  font-size: clamp(2.8rem, 4vw + 1rem, 5.5rem);
  font-weight: 800;
  line-height: var(--cui-lh-display);
  letter-spacing: -0.02em;
  margin: 0 0 var(--cui-space-3);
  /* base.css's `h1,h2,h3{color:var(--cui-heading)}` matches this element
     directly, which beats inheriting .cui-topic-slider__content's color no
     matter how much less specific it is: a directly-matched rule always
     wins over an inherited one. Same story one level down for the <a> case
     against base.css's plain `a{color:var(--cui-link)}`. Both need an
     explicit `inherit` so this always follows .content's color (including
     the --light-bg swap below), never the global heading/link color. */
  color: inherit;
}
.cui-topic-slider__title a {
  color: inherit;
  text-decoration: none;
}

.cui-topic-slider__text {
  font-size: 1.7rem;
  margin: 0 0 var(--cui-space-3);
}

/* The content box is a full-width container, so its left edge lines up with
   every other section; only the copy itself is capped for readability. */
.cui-topic-slider__title,
.cui-topic-slider__text {
  max-width: 720px;
}
.cui-align-center > .cui-topic-slider__title,
.cui-align-center > .cui-topic-slider__text {
  margin-inline: auto;
}
.cui-align-right > .cui-topic-slider__title,
.cui-align-right > .cui-topic-slider__text {
  margin-inline: auto 0;
}

.cui-topic-slider__more {
  display: inline-block;
  color: var(--cui-color-yellow);
  font-weight: 700;
  text-decoration: none;
}
.cui-topic-slider__more:hover {
  text-decoration: underline;
}

/* adaptiveText: this slide's image sampled as visually light, so flip to a
   dark-on-light treatment instead of the default white-on-dark. */
.cui-topic-slider__slide--light-bg .cui-topic-slider__content {
  color: var(--cui-text);
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.65);
}

/* Carousel's default nav position (-1.4rem outside its own edge) assumes a
   gutter around it. TopicSlider is full-bleed, so that would push the
   buttons half off-screen: pull them back inside the viewport instead. */
.cui-topic-slider__carousel :deep(.cui-carousel__nav) {
  background: var(--cui-surface-glass);
}
.cui-topic-slider__carousel :deep(.cui-carousel__nav--prev) {
  left: var(--cui-space-4);
}
.cui-topic-slider__carousel :deep(.cui-carousel__nav--next) {
  right: var(--cui-space-4);
}
</style>
