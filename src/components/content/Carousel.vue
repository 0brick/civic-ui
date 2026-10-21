<script setup>
// Simple slide-based carousel (one slide visible at a time, scroll-snap
// under the hood so touch swiping works for free). Each slide is whatever
// markup you put in the default slot's <template #slide>: see docs.
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { t } from '../../utils/i18n'

const props = defineProps({
  slideCount: { type: Number, required: true },
  autoplay: { type: Boolean, default: false },
  interval: { type: Number, default: 6000 },
  // a11y (WCAG 1.3.1): optional accessible name for the carousel region,
  // only added to the DOM when set, so we never emit an empty aria-label.
  ariaLabel: { type: String, default: '' }
})

const active = ref(0)
const track = ref(null)
const root = ref(null)

// SSR safety: `window` doesn't exist on the server, and an autoplay
// interval started there would never be cleared. Both wait for onMounted.
const prefersReducedMotion = ref(false)

function goTo(index) {
  active.value = (index + props.slideCount) % props.slideCount
  // a11y (WCAG 2.3.3): don't force a smooth-scroll animation on users who
  // have asked the OS for reduced motion.
  track.value?.children[active.value]?.scrollIntoView({ behavior: prefersReducedMotion.value ? 'auto' : 'smooth', inline: 'start' })
}

// a11y (WCAG 2.2.2 Pause, Stop, Hide): autoplay must be user-pausable.
// `playing` only ever starts true when autoplay is actually running (never
// for prefers-reduced-motion visitors, who don't get the toggle either,
// there's nothing running for them to pause, and offering a manual "play"
// would just invite motion they've already opted out of).
const playing = ref(props.autoplay)
let timer = null

function stopAutoplay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
function startAutoplay() {
  if (timer || !props.autoplay || prefersReducedMotion.value) return
  // a11y (WCAG 2.2.2): no advancing while keyboard focus is inside; the
  // slide under the user's focus must not move away.
  timer = setInterval(() => {
    if (!focusWithin.value) goTo(active.value + 1)
  }, props.interval)
}
function toggleAutoplay() {
  playing.value = !playing.value
  if (playing.value) startAutoplay()
  else stopAutoplay()
}

// Focus inside pauses autoplay (above) and, with it, turns announcements back on.
const focusWithin = ref(false)
function onFocusout(e) {
  if (!root.value?.contains(e.relatedTarget)) focusWithin.value = false
}
// a11y (ARIA APG carousel): while it rotates on its own, the position
// isn't announced every few seconds: only when the user moves it.
const liveMode = computed(() => (playing.value && !focusWithin.value && !prefersReducedMotion.value ? 'off' : 'polite'))

// a11y (WCAG 4.1.2/4.1.3): swiping or scrolling the track (touch, trackpad,
// Shift+wheel) changes the slide too: keep `active`, the dots'
// aria-current and the status text in step with it. Read the position once
// scrolling settles, so a smooth scroll from goTo() doesn't count every
// slide it passes on the way.
let settleTimer = null
function onTrackScroll() {
  clearTimeout(settleTimer)
  settleTimer = setTimeout(() => {
    const el = track.value
    if (!el || !el.clientWidth || !props.slideCount) return
    const index = Math.round(Math.abs(el.scrollLeft) / el.clientWidth)
    active.value = Math.min(Math.max(index, 0), props.slideCount - 1)
  }, 100)
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (props.autoplay && prefersReducedMotion.value) playing.value = false
  if (props.autoplay && !prefersReducedMotion.value) startAutoplay()
})
onUnmounted(() => {
  stopAutoplay()
  clearTimeout(settleTimer)
})

const dots = computed(() => Array.from({ length: props.slideCount }, (_, i) => i))
</script>

<template>
  <div
    ref="root"
    class="cui-carousel"
    :role="ariaLabel ? 'region' : undefined"
    :aria-roledescription="ariaLabel ? 'carousel' : undefined"
    :aria-label="ariaLabel || undefined"
    @focusin="focusWithin = true"
    @focusout="onFocusout"
  >
    <div class="cui-carousel__viewport">
      <!-- a11y (WCAG 2.1.1): the track is a scroll container, so keyboard
           users must be able to focus it and scroll with the arrow keys,
           slides without links or buttons offer no other tab stop inside.
           Focus here also pauses autoplay (focusWithin). -->
      <div
        ref="track"
        class="cui-carousel__track"
        tabindex="0"
        role="group"
        :aria-label="t('carousel.slides')"
        @scroll.passive="onTrackScroll"
      >
        <slot />
      </div>
    </div>

    <button type="button" class="cui-carousel__nav cui-carousel__nav--prev" :aria-label="t('carousel.previous')" @click="goTo(active - 1)">‹</button>
    <button type="button" class="cui-carousel__nav cui-carousel__nav--next" :aria-label="t('carousel.next')" @click="goTo(active + 1)">›</button>

    <!-- a11y (WCAG 2.2.2): pause/resume control for autoplay; only rendered
         when autoplay is actually running for this visitor (see `playing`
         above). -->
    <button
      v-if="autoplay && !prefersReducedMotion"
      type="button"
      class="cui-carousel__play-toggle"
      :aria-label="playing ? t('carousel.pause') : t('carousel.play')"
      @click="toggleAutoplay"
    >
      <svg v-if="playing" viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
        <rect x="5" y="4" width="3.2" height="12" rx="1" fill="currentColor" />
        <rect x="11.8" y="4" width="3.2" height="12" rx="1" fill="currentColor" />
      </svg>
      <svg v-else viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
        <path d="M6 4l10 6-10 6V4z" fill="currentColor" />
      </svg>
    </button>

    <!-- a11y (WCAG 4.1.2): a plain labeled group of buttons, not role="tab",
         these dots don't implement the tablist arrow-key pattern, so
         role="tab" without it would announce keyboard behavior that isn't
         there. aria-current communicates "this is the active slide" instead. -->
    <div class="cui-carousel__dots" role="group" :aria-label="t('carousel.dots')">
      <button
        v-for="d in dots"
        :key="d"
        type="button"
        class="cui-carousel__dot"
        :class="{ 'cui-carousel__dot--active': d === active }"
        :aria-label="t('carousel.goTo', { n: d + 1 })"
        :aria-current="d === active ? 'true' : undefined"
        @click="goTo(d)"
      />
    </div>

    <!-- a11y (WCAG 4.1.3): announce the current position to screen-reader
         users when prev/next/dots change it: sighted users already see it. -->
    <p class="cui-visually-hidden" :aria-live="liveMode">{{ t('carousel.status', { current: active + 1, total: slideCount }) }}</p>
  </div>
</template>

<style scoped>
.cui-carousel {
  position: relative;
}

.cui-carousel__viewport {
  overflow: hidden;
}

.cui-carousel__track {
  display: flex;
  gap: var(--cui-space-4);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.cui-carousel__track::-webkit-scrollbar {
  display: none;
}
/* The viewport clips anything outside the track, so the focus ring goes
   inside its edge. */
.cui-carousel__track:focus-visible {
  outline-offset: -2px;
}

.cui-carousel__track :deep(> *) {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

.cui-carousel__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 50%;
  border: none;
  background: var(--cui-surface-raised);
  box-shadow: var(--cui-shadow-md);
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--cui-duration-fast) var(--cui-ease), box-shadow var(--cui-duration) var(--cui-ease);
}
.cui-carousel__nav:hover {
  transform: translateY(-50%) scale(1.06);
  box-shadow: var(--cui-shadow-lg);
}
.cui-carousel__nav:active {
  transform: translateY(-50%) scale(0.96);
}
.cui-carousel__nav--prev {
  left: -1.4rem;
}
.cui-carousel__nav--next {
  right: -1.4rem;
}

.cui-carousel__play-toggle {
  position: absolute;
  top: var(--cui-space-3);
  right: var(--cui-space-3);
  z-index: 1;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  border: none;
  background: var(--cui-surface-raised);
  box-shadow: var(--cui-shadow-md);
  color: var(--cui-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--cui-duration-fast) var(--cui-ease), box-shadow var(--cui-duration) var(--cui-ease);
}
.cui-carousel__play-toggle:hover {
  transform: scale(1.06);
  box-shadow: var(--cui-shadow-lg);
}

.cui-carousel__dots {
  display: flex;
  justify-content: center;
  margin-top: var(--cui-space-4);
}

/* a11y (WCAG 2.5.8): the button itself is a transparent 24×24 target; the
   visible dot is drawn by ::before. WCAG 1.4.11: inactive dots use the
   control-border token (3:1+ against the page), and the active one is a
   wider pill as well as darker, so it doesn't rely on color alone. */
.cui-carousel__dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: var(--cui-radius-pill);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.cui-carousel__dot::before {
  content: '';
  width: 1rem;
  height: 1rem;
  border-radius: var(--cui-radius-pill);
  background: var(--cui-border-control);
  transition: background-color var(--cui-duration) var(--cui-ease), width var(--cui-duration) var(--cui-ease),
    transform var(--cui-duration-fast) var(--cui-ease);
}
.cui-carousel__dot:hover::before {
  transform: scale(1.2);
}
.cui-carousel__dot--active::before {
  width: 2rem;
  background: var(--cui-primary);
}
.cui-carousel__dot--active:hover::before {
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .cui-carousel__dot::before {
    transition: none;
  }
  .cui-carousel__dot:hover::before {
    transform: none;
  }
}
</style>
