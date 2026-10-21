<script setup>
// The full-bleed hero. The image is never tinted by a CSS filter: a solid
// theme-color field sits beside it, and on narrow screens a gradient scrim
// keeps the copy legible.
// `background`: a theme key (see utils/themes.js), a CSS color or an image
// URL, auto-detected. A theme plus `image` gives the two-tone split layout.
// `stage`: one full-bleed photo or `video` (muted, looped, inline;
// `videoPoster` or `image` as poster) behind the copy.
// `size="compact"`: a 44vh interior-page header with the same contract.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppButton from '../components/button/AppButton.vue'
import { resolveBackground, themeColors, deriveContrastText, isDarkBackground } from '../utils/themes'
import { sanitizeUrl, sanitizeMediaUrl, mediaReferrerPolicy } from '../utils/security'
import { t } from '../utils/i18n'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  // Optional: an empty title renders no <h1> at all (rather than an empty
  // heading): make sure the page still has one elsewhere in that case.
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  background: { type: String, default: 'navy' }, // theme key | color | image URL
  image: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  imagePosition: { type: String, default: 'end', validator: (v) => ['start', 'end'].includes(v) },
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) },
  // Vertical position of the copy next to (split layout, from 900px up) or
  // on top of (`stage`) the media. Matters most for sparse heroes, e.g.
  // just an eyebrow and a sentence: whose copy is much shorter than the
  // image. The narrow-screen split layout always anchors the copy to the
  // bottom, on its legibility scrim.
  verticalAlign: { type: String, default: 'center', validator: (v) => ['start', 'center', 'end'].includes(v) },
  // `stage`: one full-bleed photo behind the copy, a bottom-anchored veil
  // for legibility and an optional scroll cue, for a single opening statement.
  stage: { type: Boolean, default: false },
  // `stage`-only: fills the rest of the viewport instead of the default 78vh
  // for a genuine full-screen opening statement rather than a tall banner.
  // Whatever sits above the hero in normal flow (a SiteHeader/Navbar, an
  // AlertBanner, …) is measured automatically, so header + hero together
  // are exactly one viewport tall. Setting --cui-header-offset (on an
  // ancestor, or via :style) overrides the measurement with a fixed value.
  // Ignored on `size="compact"`.
  fullHeight: { type: Boolean, default: false },
  // `stage`-only: a short photo credit / caption pinned to the hero's
  // bottom-right corner, e.g. where the background photo was taken.
  caption: { type: String, default: '' },
  // `stage`-only: a video URL (or animated GIF) to loop as the background
  // instead of `image`/`background`. Plays muted, looped and inline.
  video: { type: String, default: '' },
  videoPoster: { type: String, default: '' },
  tone: { type: String, default: 'color', validator: (v) => ['color', 'grayscale'].includes(v) },
  scrollTarget: { type: String, default: '' },
  primaryAction: { type: Object, default: null }, // { label, href, newTab? }
  secondaryAction: { type: Object, default: null },
  // non-stage only: 'compact' is a smaller interior-page image band
  size: { type: String, default: 'default', validator: (v) => ['default', 'compact'].includes(v) },
  // Which part of the photo stays in frame (CSS object-position, e.g.
  // 'center 30%' or '70% top'), on every layout; `imageFocusMobile` below
  // 900px. Distinct from `imagePosition`, which picks the side of the split.
  imageFocus: { type: String, default: '' },
  imageFocusMobile: { type: String, default: '' },
  // Legibility veil over a photo/video (stage and compact): its strength,
  // and whether it darkens from the bottom or from the text's side.
  veil: { type: String, default: 'default', validator: (v) => ['none', 'light', 'default', 'strong'].includes(v) },
  veilFrom: { type: String, default: 'bottom', validator: (v) => ['bottom', 'start'].includes(v) },
  // 'display': a larger, tighter headline for a home-page opening statement.
  // The measure is --cui-hero-title-max either way (20ch / 14ch).
  titleSize: { type: String, default: 'default', validator: (v) => ['default', 'display'].includes(v) }
})

const resolved = computed(() => resolveBackground(props.background))

// a11y (WCAG 2.2.2): no autoplay for prefers-reduced-motion; the poster
// stays. Read in onMounted, so SSR output and hydration match.
const prefersReducedMotion = ref(false)

// a11y (WCAG 2.2.2 Pause, Stop, Hide): a visible control to stop the looping
// background video, on top of the reduced-motion mitigation above.
const videoEl = ref(null)
const videoPlaying = ref(true)

// fullHeight: the hero's distance from the top of the document, i.e. the
// combined height of everything rendered above it (header, banners). Fed
// into the min-height calc as a fallback for --cui-header-offset, so an
// explicitly set offset still wins. Re-measured whenever the layout
// resizes, since headers wrap / change height across breakpoints. Stays
// null during SSR and until mounted (CSS then falls back to 0px).
const rootEl = ref(null)
const autoOffset = ref(null)
let resizeObserver = null
let frame = 0

function measureOffset() {
  frame = 0
  const el = rootEl.value
  if (!el) return
  autoOffset.value = Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY))
}
function scheduleMeasure() {
  if (!frame) frame = requestAnimationFrame(measureOffset)
}
function startMeasuring() {
  if (resizeObserver || typeof window === 'undefined') return
  measureOffset()
  window.addEventListener('resize', scheduleMeasure)
  if (typeof ResizeObserver !== 'undefined') {
    // body's size changes whenever anything above the hero does (fonts
    // loading, a dismissed AlertBanner, a wrapping nav).
    resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(document.body)
  }
}
function stopMeasuring() {
  window.removeEventListener('resize', scheduleMeasure)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  autoOffset.value = null
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (prefersReducedMotion.value) videoPlaying.value = false
  if (props.fullHeight) startMeasuring()
})
watch(
  () => props.fullHeight,
  (on) => (on ? startMeasuring() : stopMeasuring())
)
onBeforeUnmount(stopMeasuring)
function toggleVideo() {
  const el = videoEl.value
  if (!el) return
  if (videoPlaying.value) {
    el.pause()
    videoPlaying.value = false
  } else {
    el.play()
    videoPlaying.value = true
  }
}

const heroImage = computed(() => props.image || (resolved.value?.type === 'image' ? resolved.value.image : ''))
const hasStageMedia = computed(() => (props.stage || props.size === 'compact') && (!!heroImage.value || !!props.video))

const themeVars = computed(() => {
  const vars = { ...baseThemeVars.value, ...focusVars.value }
  return autoOffset.value === null ? vars : { ...vars, '--cui-hero-auto-offset': `${autoOffset.value}px` }
})

const baseThemeVars = computed(() => {
  const r = resolved.value
  // Text over a photo sits on the primary-tinted veil, so it uses the
  // primary (navy) theme's eyebrow whatever the band's own theme is.
  const onMedia = themeColors('navy').eyebrow
  if (!r || r.type === 'image') {
    const navy = themeColors('navy')
    return {
      '--cui-hero-bg': navy.bg,
      '--cui-hero-text': navy.text,
      '--cui-hero-heading': navy.heading,
      '--cui-hero-eyebrow': navy.eyebrow,
      '--cui-hero-eyebrow-on-media': onMedia
    }
  }
  if (r.type === 'color') {
    const { text, heading, eyebrow } = deriveContrastText(r.bg)
    return { '--cui-hero-bg': r.bg, '--cui-hero-text': text, '--cui-hero-heading': heading, '--cui-hero-eyebrow': eyebrow, '--cui-hero-eyebrow-on-media': onMedia }
  }
  return { '--cui-hero-bg': r.bg, '--cui-hero-text': r.text, '--cui-hero-heading': r.heading, '--cui-hero-eyebrow': r.eyebrow, '--cui-hero-eyebrow-on-media': onMedia }
})

// object-position values are set through the CSSOM (one property, no
// string splicing), but are still limited to plain position syntax.
const FOCUS_RE = /^[\w\s%.-]{1,40}$/
const focusVars = computed(() => {
  const vars = {}
  if (props.imageFocus && FOCUS_RE.test(props.imageFocus)) vars['--cui-hero-focus'] = props.imageFocus
  if (props.imageFocusMobile && FOCUS_RE.test(props.imageFocusMobile)) vars['--cui-hero-focus-mobile'] = props.imageFocusMobile
  return vars
})

// A dark hero band sets data-cui-theme="dark" on itself, so components in the
// default slot (outline/ghost buttons, links, focus rings) pick their on-dark
// treatment without a consumer-side override. Image backgrounds sit under the
// navy veil, so they count as dark too.
const isDark = computed(() => isDarkBackground(baseThemeVars.value['--cui-hero-bg']))
</script>

<template>
  <section
    ref="rootEl"
    class="cui-hero"
    :class="{
      'cui-hero--has-image': !!heroImage && !stage && size === 'default',
      'cui-hero--stage': hasStageMedia,
      'cui-hero--compact': size === 'compact',
      'cui-hero--full': fullHeight && size !== 'compact',
      [`cui-hero--veil-${veil}`]: veil !== 'default',
      'cui-hero--veil-start': veilFrom === 'start',
      [`cui-hero--veil-start-${align}`]: veilFrom === 'start',
      'cui-hero--title-display': titleSize === 'display',
      [`cui-hero--valign-${verticalAlign}`]: true
    }"
    :data-cui-theme="isDark ? 'dark' : undefined"
    :style="themeVars"
  >
    <template v-if="hasStageMedia">
      <div class="cui-hero__media cui-hero__media--stage" :class="{ 'cui-hero__media--grayscale': tone === 'grayscale' }">
        <video
          v-if="video"
          ref="videoEl"
          class="cui-hero__media-video"
          :src="sanitizeMediaUrl(video)"
          :poster="sanitizeMediaUrl(videoPoster || heroImage) || undefined"
          :autoplay="!prefersReducedMotion"
          loop
          muted
          playsinline
          aria-hidden="true"
        />
        <!-- a11y (WCAG 1.1.1): a stage photo with `imageAlt` is content and
             keeps its text alternative; without one it is decoration. -->
        <img
          v-else
          :src="sanitizeMediaUrl(heroImage)"
          :alt="imageAlt"
          :aria-hidden="imageAlt ? undefined : 'true'"
          :referrerpolicy="mediaReferrerPolicy()"
        />
      </div>
      <div class="cui-hero__veil" aria-hidden="true" />
      <div class="cui-container">
        <div class="cui-hero__text cui-hero__text--stage" :class="`cui-hero__text--stage-align-${align}`">
          <span v-if="eyebrow" class="cui-hero__eyebrow">{{ eyebrow }}</span>
          <h1 v-if="title" class="cui-hero__title">{{ title }}</h1>
          <div v-if="$slots.text" class="cui-hero__text-copy cui-hero__text-copy--rich"><slot name="text" /></div>
          <p v-else-if="text" class="cui-hero__text-copy">{{ text }}</p>
          <div v-if="primaryAction || secondaryAction || $slots.default" class="cui-hero__actions">
            <AppButton v-if="primaryAction" variant="accent" size="lg" :href="primaryAction.href" :new-tab="primaryAction.newTab">
              {{ primaryAction.label }}
            </AppButton>
            <AppButton v-if="secondaryAction" variant="outline" size="lg" :href="secondaryAction.href" :new-tab="secondaryAction.newTab" class="cui-hero__ghost">
              {{ secondaryAction.label }}
            </AppButton>
            <slot />
          </div>
        </div>
      </div>
      <a v-if="scrollTarget" :href="sanitizeUrl(scrollTarget)" class="cui-hero__scroll-cue" :aria-label="t('hero.scrollDown')">
        <span />
      </a>

      <p v-if="caption" class="cui-hero__caption" :class="{ 'cui-hero__caption--beside-toggle': video }">{{ caption }}</p>

      <!-- a11y (WCAG 2.2.2): pause/resume control for the looping background
           video, on top of the prefers-reduced-motion mitigation above. -->
      <button
        v-if="video"
        type="button"
        class="cui-hero__video-toggle"
        :aria-label="videoPlaying ? t('hero.pauseVideo') : t('hero.playVideo')"
        @click="toggleVideo"
      >
        <svg v-if="videoPlaying" viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
          <rect x="5" y="4" width="3.2" height="12" rx="1" fill="currentColor" />
          <rect x="11.8" y="4" width="3.2" height="12" rx="1" fill="currentColor" />
        </svg>
        <svg v-else viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
          <path d="M6 4l10 6-10 6V4z" fill="currentColor" />
        </svg>
      </button>
    </template>

    <div v-else class="cui-container">
      <div
        class="cui-hero__stage"
        :class="[`cui-hero__stage--align-${align}`, heroImage ? `cui-hero__stage--image-${imagePosition}` : '']"
      >
        <div v-if="heroImage" class="cui-hero__media">
          <img :src="sanitizeMediaUrl(heroImage)" :alt="imageAlt" :referrerpolicy="mediaReferrerPolicy()" />
        </div>
        <div class="cui-hero__text">
          <span v-if="eyebrow" class="cui-hero__eyebrow">{{ eyebrow }}</span>
          <h1 v-if="title" class="cui-hero__title">{{ title }}</h1>
          <div v-if="$slots.text" class="cui-hero__text-copy cui-hero__text-copy--rich"><slot name="text" /></div>
          <p v-else-if="text" class="cui-hero__text-copy">{{ text }}</p>
          <div v-if="primaryAction || secondaryAction || $slots.default" class="cui-hero__actions">
            <AppButton v-if="primaryAction" variant="accent" size="lg" :href="primaryAction.href" :new-tab="primaryAction.newTab">
              {{ primaryAction.label }}
            </AppButton>
            <AppButton v-if="secondaryAction" variant="outline" size="lg" :href="secondaryAction.href" :new-tab="secondaryAction.newTab" class="cui-hero__ghost">
              {{ secondaryAction.label }}
            </AppButton>
            <slot />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cui-hero {
  background: var(--cui-hero-bg);
  color: var(--cui-hero-text);
}

.cui-hero__stage {
  display: flex;
  flex-direction: column;
  gap: var(--cui-space-6);
  padding-block: var(--cui-space-7);
}

.cui-hero__stage--align-center {
  text-align: center;
  align-items: center;
}

.cui-hero__stage--align-right {
  text-align: right;
  align-items: flex-end;
}

.cui-hero__eyebrow {
  display: inline-block;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: var(--cui-eyebrow-letter-spacing, 0.08em);
  text-transform: uppercase;
  color: var(--cui-hero-eyebrow, var(--cui-accent-on-primary));
  margin-bottom: var(--cui-space-3);
}
.cui-hero--stage .cui-hero__eyebrow {
  color: var(--cui-hero-eyebrow-on-media, var(--cui-accent-on-primary));
}
/* split layout with a photo: below 900px the copy overlays the photo's dark
   scrim, from 900px up it sits on the theme's own field again */
.cui-hero--has-image .cui-hero__eyebrow {
  color: var(--cui-hero-eyebrow-on-media, var(--cui-accent-on-primary));
}
@media (min-width: 900px) {
  .cui-hero--has-image .cui-hero__eyebrow {
    color: var(--cui-hero-eyebrow, var(--cui-accent-on-primary));
  }
}

.cui-hero__title {
  color: var(--cui-hero-heading);
  font-family: var(--cui-font-heading);
  font-size: var(--cui-fz-h1);
  font-weight: var(--cui-heading-display-weight);
  line-height: var(--cui-lh-display);
  letter-spacing: -0.025em;
  max-width: var(--cui-hero-title-max, 20ch);
  margin: 0 0 var(--cui-space-4);
}
.cui-hero--title-display .cui-hero__title {
  font-size: clamp(4.4rem, 6vw + 1rem, 8.8rem);
  line-height: 1;
  max-width: var(--cui-hero-title-max, 14ch);
}

.cui-hero__stage--align-center .cui-hero__title {
  margin-inline: auto;
}

.cui-hero__stage--align-right .cui-hero__title {
  margin-inline: auto 0;
}

.cui-hero__text-copy {
  font-family: var(--cui-hero-text-font, inherit);
  font-style: var(--cui-hero-text-style, normal);
  font-size: 1.8rem;
  line-height: 1.6;
  max-width: 52ch;
  color: var(--cui-hero-text);
  margin: 0;
}

/* `#text` slot: arbitrary markup (lists, several paragraphs, links) in
   place of the plain `text` string, styled to read like it. */
.cui-hero__text-copy--rich :slotted(p),
.cui-hero__text-copy--rich :slotted(ul),
.cui-hero__text-copy--rich :slotted(ol) {
  margin: 0 0 var(--cui-space-3);
}
.cui-hero__text-copy--rich :slotted(:last-child) {
  margin-bottom: 0;
}
.cui-hero__text-copy--rich :slotted(ul),
.cui-hero__text-copy--rich :slotted(ol) {
  padding-inline-start: 1.2em;
}
.cui-hero__text-copy--rich :slotted(li + li) {
  margin-top: var(--cui-space-2);
}
.cui-hero__text-copy--rich :slotted(a) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.cui-hero__stage--align-center .cui-hero__text-copy {
  margin-inline: auto;
}

.cui-hero__stage--align-right .cui-hero__text-copy {
  margin-inline: auto 0;
}

.cui-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cui-space-3);
  margin-top: var(--cui-space-6);
}

.cui-hero__stage--align-center .cui-hero__actions {
  justify-content: center;
}

.cui-hero__stage--align-right .cui-hero__actions {
  justify-content: flex-end;
}

.cui-hero .cui-hero__ghost {
  color: var(--cui-hero-heading);
  border-color: var(--cui-hero-heading);
}
.cui-hero .cui-hero__ghost:hover:not(:disabled) {
  background: var(--cui-hero-heading);
  color: var(--cui-hero-bg);
}

.cui-hero__media img,
.cui-hero__media-video {
  object-position: var(--cui-hero-focus-mobile, var(--cui-hero-focus, center));
}
@media (min-width: 900px) {
  .cui-hero__media img,
  .cui-hero__media-video {
    object-position: var(--cui-hero-focus, center);
  }
}
.cui-hero__media img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  filter: var(--cui-media-filter);
}

/* Mobile: image fills the stage, text overlays the bottom on a gradient
   scrim so it stays legible over any photo. */
.cui-hero--has-image .cui-hero__stage {
  position: relative;
  min-height: 56vh;
  padding-block: 0;
  overflow: hidden;
  border-radius: var(--cui-radius-lg);
}

.cui-hero--has-image .cui-hero__media {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.cui-hero--has-image .cui-hero__text {
  position: relative;
  z-index: 1;
  margin-top: auto;
  padding: var(--cui-space-7) var(--cui-space-5) var(--cui-space-6);
  background: linear-gradient(-180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.88) 42%);
  color: #ffffff;
}
.cui-hero--has-image .cui-hero__title,
.cui-hero--has-image .cui-hero__text-copy {
  color: #ffffff;
}

/* ---- Stage variant: full-bleed photo, centered copy, scroll cue ---- */
.cui-hero--stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 78vh;
  overflow: hidden;
}

.cui-hero--stage.cui-hero--full {
  /* Viewport minus everything above the hero in normal flow (header,
     banners), so the two together are exactly one screen tall.
     --cui-hero-auto-offset is measured in script (see measureOffset);
     an explicit --cui-header-offset from the consuming page overrides it,
     and before mount / during SSR both are unset, falling back to 0px. */
  min-height: calc(100vh - var(--cui-header-offset, var(--cui-hero-auto-offset, 0px)));
  min-height: calc(100dvh - var(--cui-header-offset, var(--cui-hero-auto-offset, 0px))); /* accounts for mobile browser chrome; falls back to the line above where unsupported */
}

.cui-hero__media--stage {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.cui-hero__media--stage img,
.cui-hero__media--stage .cui-hero__media-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: var(--cui-media-filter);
}
.cui-hero__media--stage.cui-hero__media--grayscale img,
.cui-hero__media--stage.cui-hero__media--grayscale .cui-hero__media-video {
  filter: grayscale(1) contrast(1.08) brightness(0.92);
}

/* The veil is tinted with the palette's brand ink (--cui-color-navy, which
   generatePalette() sets to the primary role), not a fixed navy, so a
   configured brand keeps its own ink over the photo. It deliberately avoids
   --cui-primary: dark color mode flips that to a light fill, which would turn
   the veil pale and wash out the white copy on top. --cui-hero-veil-a/b/c
   are the stops' strengths (veil prop), --cui-hero-veil-dir the direction
   (veilFrom). The rgba() line is the fallback where color-mix() is missing. */
.cui-hero__veil {
  --cui-hero-veil-a: 62%;
  --cui-hero-veil-b: 58%;
  --cui-hero-veil-c: 84%;
  --cui-hero-veil-dir: 180deg;
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, rgba(0, 29, 53, 0.62) 0%, rgba(0, 29, 53, 0.58) 38%, rgba(0, 29, 53, 0.84) 100%);
  background: linear-gradient(
    var(--cui-hero-veil-dir),
    color-mix(in srgb, var(--cui-color-navy) var(--cui-hero-veil-a), transparent) 0%,
    color-mix(in srgb, var(--cui-color-navy) var(--cui-hero-veil-b), transparent) 38%,
    color-mix(in srgb, var(--cui-color-navy) var(--cui-hero-veil-c), transparent) 100%
  );
}
.cui-hero--veil-light .cui-hero__veil {
  --cui-hero-veil-a: 30%;
  --cui-hero-veil-b: 26%;
  --cui-hero-veil-c: 60%;
}
.cui-hero--veil-strong .cui-hero__veil {
  --cui-hero-veil-a: 80%;
  --cui-hero-veil-b: 76%;
  --cui-hero-veil-c: 92%;
}
.cui-hero--veil-none .cui-hero__veil {
  display: none;
}
/* veilFrom="start": darkest on the text's side, fading across the photo
   (centered copy has no side, so it keeps the bottom-up veil). */
.cui-hero--veil-start-left .cui-hero__veil {
  --cui-hero-veil-dir: 270deg;
}
.cui-hero--veil-start-right .cui-hero__veil {
  --cui-hero-veil-dir: 90deg;
}

/* ---- size="compact": a smaller interior-page stage ---- */
.cui-hero--compact.cui-hero--stage {
  min-height: 44vh;
}
/* compact keeps its neutral dark veil unless a veil option asks otherwise */
.cui-hero--compact:not(.cui-hero--veil-light):not(.cui-hero--veil-strong):not(.cui-hero--veil-start) .cui-hero__veil {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.4) 100%);
}
.cui-hero--compact .cui-hero__title {
  font-size: clamp(2.8rem, 3.6vw + 1rem, 4.8rem);
}

.cui-hero__text--stage {
  position: relative;
  z-index: 2;
  padding-block: var(--cui-space-8);
}
.cui-hero__text--stage .cui-hero__title,
.cui-hero__text--stage .cui-hero__text-copy {
  color: #ffffff;
}

/* Vertical position comes from `.cui-hero--stage`'s flex layout
   (`verticalAlign`), `align` only ever controls the horizontal text-align
   here. */
.cui-hero--stage.cui-hero--valign-start {
  align-items: flex-start;
}
.cui-hero--stage.cui-hero--valign-end {
  align-items: flex-end;
}

.cui-hero__text--stage-align-center {
  text-align: center;
}
.cui-hero__text--stage-align-center .cui-hero__title,
.cui-hero__text--stage-align-center .cui-hero__text-copy {
  margin-inline: auto;
}
.cui-hero__text--stage-align-center .cui-hero__actions {
  justify-content: center;
}

.cui-hero__text--stage-align-left {
  text-align: left;
  width: 100%;
}
.cui-hero__text--stage-align-left .cui-hero__actions {
  justify-content: flex-start;
}

.cui-hero__text--stage-align-right {
  text-align: right;
  width: 100%;
}
.cui-hero__text--stage-align-right .cui-hero__title,
.cui-hero__text--stage-align-right .cui-hero__text-copy {
  margin-inline: auto 0;
}
.cui-hero__text--stage-align-right .cui-hero__actions {
  justify-content: flex-end;
}

.cui-hero__scroll-cue {
  position: absolute;
  left: 50%;
  bottom: var(--cui-space-5);
  transform: translateX(-50%);
  z-index: 2;
  width: 2.6rem;
  height: 4.2rem;
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  border-radius: 20px;
}
.cui-hero__scroll-cue span {
  position: absolute;
  left: 50%;
  top: 0.8rem;
  width: 3px;
  height: 8px;
  background: #ffffff;
  border-radius: 2px;
  transform: translateX(-50%);
  animation: cui-scroll-cue 1.8s ease-in-out infinite;
}
.cui-hero__caption {
  position: absolute;
  right: var(--cui-space-5);
  bottom: var(--cui-space-5);
  z-index: 2;
  margin: 0;
  max-width: min(32ch, calc(50% - 5rem)); /* clear of the centered scroll cue */
  text-align: right;
  font-size: 1.2rem;
  line-height: 1.4;
  /* White over the dark bottom of the veil (rgba(0,29,53,.84)) keeps this
     well above 4.5:1; the shadow only helps over unusually bright photos. */
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}
/* Keep clear of the round video pause button in the same corner. */
.cui-hero__caption--beside-toggle {
  right: calc(var(--cui-space-5) + 4rem + var(--cui-space-3));
}

.cui-hero__video-toggle {
  position: absolute;
  right: var(--cui-space-5);
  bottom: var(--cui-space-5);
  z-index: 2;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  background: rgba(0, 29, 53, 0.35);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--cui-duration) var(--cui-ease);
}
.cui-hero__video-toggle:hover {
  background: rgba(0, 29, 53, 0.55);
}

@keyframes cui-scroll-cue {
  0% {
    opacity: 1;
    top: 0.8rem;
  }
  70% {
    opacity: 0;
    top: 2rem;
  }
  100% {
    opacity: 0;
    top: 0.8rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .cui-hero__scroll-cue span {
    animation: none;
  }
}

@media (min-width: 900px) {
  .cui-hero__stage {
    padding-block: var(--cui-space-8);
  }

  .cui-hero--compact.cui-hero--stage {
    min-height: min(44vh, 460px);
  }

  /* Desktop: the scrim disappears, image and text sit side by side. */
  .cui-hero--has-image .cui-hero__stage {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: var(--cui-space-8);
    min-height: 0;
    padding-block: var(--cui-space-8);
    border-radius: 0;
    overflow: visible;
  }

  .cui-hero--has-image .cui-hero__stage--image-start {
    grid-template-areas: 'media text';
  }
  .cui-hero--has-image .cui-hero__stage--image-end {
    grid-template-areas: 'text media';
  }
  .cui-hero--has-image .cui-hero__stage--image-start .cui-hero__media {
    grid-area: media;
  }
  .cui-hero--has-image .cui-hero__stage--image-start .cui-hero__text {
    grid-area: text;
  }
  .cui-hero--has-image .cui-hero__stage--image-end .cui-hero__media {
    grid-area: media;
  }
  .cui-hero--has-image .cui-hero__stage--image-end .cui-hero__text {
    grid-area: text;
  }

  .cui-hero--has-image .cui-hero__media {
    position: static;
    aspect-ratio: 4 / 3;
    border-radius: var(--cui-radius-lg);
    overflow: hidden;
  }

  .cui-hero--valign-start.cui-hero--has-image .cui-hero__stage {
    align-items: start;
  }
  .cui-hero--valign-end.cui-hero--has-image .cui-hero__stage {
    align-items: end;
  }

  .cui-hero--has-image .cui-hero__text {
    /* reset the mobile bottom-anchoring: an auto margin would otherwise
       override the grid's align-items and pin short copy to the bottom */
    margin-top: 0;
    padding: 0;
    background: none;
    color: var(--cui-hero-text);
  }
  .cui-hero--has-image .cui-hero__title,
  .cui-hero--has-image .cui-hero__text-copy {
    color: var(--cui-hero-heading);
  }
  .cui-hero--has-image .cui-hero__text-copy {
    color: var(--cui-hero-text);
  }
}
</style>
