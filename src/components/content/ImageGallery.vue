<script setup>
// A grid of thumbnails that open in a Lightbox.
//   images   [{ src, alt, thumb?, caption? }], `thumb` is the small file for
//            the grid (e.g. a WebP), `src` the large one for the lightbox
//   ratio    thumbnail aspect ratio ('4/3', '1/1', …), or 'auto' for the
//            images' own shape (uncropped), with one image and columns=1
//            that is a single zoomable picture inside running text
//   columns  'auto' fills the row with tiles at least `minWidth` wide, or a
//            fixed number of columns (which still wraps to `minWidth`)
//   lightbox false renders plain images, no buttons
import { computed, ref } from 'vue'
import Lightbox from '../overlay/Lightbox.vue'
import { sanitizeMediaUrl, mediaReferrerPolicy } from '../../utils/security'
import { t } from '../../utils/i18n'

const props = defineProps({
  images: { type: Array, default: () => [] },
  ratio: { type: String, default: '4/3' },
  columns: { type: [String, Number], default: 'auto', validator: (v) => v === 'auto' || (Number(v) >= 1 && Number(v) <= 6) },
  minWidth: { type: String, default: '16rem' },
  lightbox: { type: Boolean, default: true }
})

const list = computed(() => (Array.isArray(props.images) ? props.images.filter((img) => img && img.src) : []))
const viewer = ref(null)

const gridStyle = computed(() => {
  const min = /^[\d.]+(rem|px|em|ch|%)$/.test(props.minWidth) ? props.minWidth : '16rem'
  const tracks =
    props.columns === 'auto'
      ? `repeat(auto-fill, minmax(min(${min}, 100%), 1fr))`
      : `repeat(auto-fill, minmax(max(min(${min}, 100%), calc((100% - ${Number(props.columns) - 1} * var(--cui-space-3)) / ${Number(props.columns)})), 1fr))`
  return { gridTemplateColumns: tracks }
})
const ratioStyle = computed(() =>
  props.ratio !== 'auto' && /^\s*\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?\s*$/.test(props.ratio) ? { aspectRatio: props.ratio } : null
)

function label(img, i) {
  return img.alt ? t('lightbox.open', { alt: img.alt }) : t('lightbox.openNumber', { n: i + 1 })
}
</script>

<template>
  <div class="cui-image-gallery">
    <ul class="cui-image-gallery__grid" :class="{ 'cui-image-gallery__grid--auto': ratio === 'auto' }" :style="gridStyle">
      <li v-for="(img, i) in list" :key="i" class="cui-image-gallery__item">
        <figure class="cui-image-gallery__figure">
          <component
            :is="lightbox ? 'button' : 'div'"
            :type="lightbox ? 'button' : undefined"
            class="cui-image-gallery__tile"
            :style="ratioStyle"
            :aria-label="lightbox ? label(img, i) : undefined"
            @click="lightbox && viewer.open(i)"
          >
            <img
              class="cui-image-gallery__img"
              :src="sanitizeMediaUrl(img.thumb || img.src)"
              :alt="lightbox ? '' : img.alt || ''"
              loading="lazy"
              :referrerpolicy="mediaReferrerPolicy()"
            />
            <span v-if="lightbox" class="cui-image-gallery__zoom" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="M16 16l5 5M11 8v6M8 11h6" /></svg>
            </span>
          </component>
          <figcaption v-if="img.caption" class="cui-image-gallery__caption">{{ img.caption }}</figcaption>
        </figure>
      </li>
    </ul>
    <Lightbox v-if="lightbox" ref="viewer" :images="list" />
  </div>
</template>

<style scoped>
.cui-image-gallery__grid {
  display: grid;
  gap: var(--cui-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.cui-image-gallery__grid--auto {
  align-items: start;
}
.cui-image-gallery__figure {
  margin: 0;
}
.cui-image-gallery__tile {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  border-radius: var(--cui-radius-md);
  overflow: hidden;
  background: var(--cui-bg-muted);
  color: inherit;
  font: inherit;
}
button.cui-image-gallery__tile {
  cursor: zoom-in;
}
.cui-image-gallery__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--cui-duration-slow, 0.3s) var(--cui-ease);
}
.cui-image-gallery__grid--auto .cui-image-gallery__img {
  height: auto;
}
.cui-image-gallery__zoom {
  position: absolute;
  inset-block-end: var(--cui-space-2);
  inset-inline-end: var(--cui-space-2);
  display: inline-flex;
  padding: 0.6rem;
  border-radius: 50%;
  background: var(--cui-surface-glass);
  color: var(--cui-text);
  opacity: 0;
  transition: opacity var(--cui-duration) var(--cui-ease);
}
button.cui-image-gallery__tile:hover .cui-image-gallery__img,
button.cui-image-gallery__tile:focus-visible .cui-image-gallery__img {
  transform: scale(1.04);
}
button.cui-image-gallery__tile:hover .cui-image-gallery__zoom,
button.cui-image-gallery__tile:focus-visible .cui-image-gallery__zoom {
  opacity: 1;
}
button.cui-image-gallery__tile:focus-visible {
  outline: 3px solid var(--cui-focus-ring);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .cui-image-gallery__img {
    transition: none;
  }
  button.cui-image-gallery__tile:hover .cui-image-gallery__img,
  button.cui-image-gallery__tile:focus-visible .cui-image-gallery__img {
    transform: none;
  }
}
.cui-image-gallery__caption {
  margin-top: var(--cui-space-2);
  font-size: 1.3rem;
  color: var(--cui-text-muted);
}
</style>
