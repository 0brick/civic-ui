<script setup>
// An SVG (or any image with transparency) used like <img src>, with an
// optional contrast mode that recolors it to stay legible on whatever it
// sits on:
//
//   contrast="none"  (default) the file's own colors, as a plain <img>
//   contrast="theme" the surrounding text color (currentColor): every
//                    civic-ui theme already pairs its text color with its
//                    background at WCAG-safe contrast, so this follows it
//   contrast="auto"  measures the nearest ancestor's background color and
//                    derives a navy/white-based color that clears 4.5:1
//                    against it (well above the 3:1 WCAG 1.4.11 asks of
//                    graphics)
//
// Recoloring uses the SVG as a CSS mask instead of inlining its markup, so
// no external markup reaches the DOM. Trade-off: monochrome only.
import { computed, onMounted, ref, watch } from 'vue'
import { sanitizeMediaUrl, sanitizeCssUrl, mediaReferrerPolicy } from '../../utils/security'
import { parseColor } from '../../utils/color'
import { deriveContrastText } from '../../utils/themes'

const props = defineProps({
  src: { type: String, required: true },
  // Empty = decorative (hidden from assistive tech). Describe what the
  // graphic conveys otherwise, like any <img alt>.
  alt: { type: String, default: '' },
  contrast: { type: String, default: 'none', validator: (v) => ['none', 'theme', 'auto'].includes(v) },
  // CSS lengths (numbers are px). Give one and the other follows the SVG's
  // own aspect ratio. With neither, contrast modes render a 1em square that
  // scales with the surrounding text; contrast="none" uses the file's size.
  width: { type: [String, Number], default: null },
  height: { type: [String, Number], default: null }
})

const rootEl = ref(null)
const autoColor = ref(null)
const ratio = ref(null)

const safeSrc = computed(() => sanitizeMediaUrl(props.src))
// numbers and bare numeric strings (height="56", like <img height>) are px
const toLength = (v) => (v == null || v === '' ? null : /^\d*\.?\d+$/.test(String(v)) ? `${v}px` : v)

const sizeStyle = computed(() => {
  const w = toLength(props.width)
  const h = toLength(props.height)
  // a mask has no intrinsic size of its own; a plain <img> does
  if (!w && !h) return props.contrast === 'none' ? {} : { width: '1em', height: '1em' }
  return { width: w ?? 'auto', height: h ?? 'auto', aspectRatio: ratio.value ?? undefined }
})

const maskStyle = computed(() => {
  const url = sanitizeCssUrl(props.src)
  return {
    ...sizeStyle.value,
    maskImage: url,
    WebkitMaskImage: url,
    backgroundColor: props.contrast === 'auto' && autoColor.value ? autoColor.value : 'currentColor'
  }
})

// The first ancestor with an opaque-enough background color. Returns null
// when a background image/gradient is hit first (its color can't be read
// reliably): the caller then keeps currentColor.
function findBackground(el) {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node)
    if (style.backgroundImage && style.backgroundImage !== 'none') return null
    const m = /rgba?\(([^)]+)\)/.exec(style.backgroundColor)
    if (!m) continue
    const parts = m[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number)
    if (parts.length < 4 || parts[3] >= 0.5) return `rgb(${parts[0]}, ${parts[1]}, ${parts[2]})`
  }
  return null
}

function measureContrast() {
  if (props.contrast !== 'auto' || !rootEl.value) return
  const bg = findBackground(rootEl.value) ?? 'rgb(255, 255, 255)'
  autoColor.value = parseColor(bg) ? deriveContrastText(bg).text : null
}

// Intrinsic aspect ratio, so a single width or height keeps the graphic
// undistorted. Same URL as the mask/img, so the browser serves it from
// cache rather than fetching it twice.
function loadRatio() {
  ratio.value = null
  if (!safeSrc.value || typeof Image === 'undefined') return
  const img = new Image()
  img.onload = () => {
    if (img.naturalWidth && img.naturalHeight) ratio.value = `${img.naturalWidth} / ${img.naturalHeight}`
  }
  img.src = safeSrc.value
}

onMounted(() => {
  loadRatio()
  measureContrast()
})
watch(() => props.src, loadRatio)
watch(() => props.contrast, measureContrast)

defineExpose({ refreshContrast: measureContrast })
</script>

<template>
  <img v-if="contrast === 'none'" ref="rootEl" class="cui-svg-image" :src="safeSrc" :alt="alt" :style="sizeStyle" :referrerpolicy="mediaReferrerPolicy()" />
  <span
    v-else
    ref="rootEl"
    class="cui-svg-image cui-svg-image--masked"
    :role="alt ? 'img' : undefined"
    :aria-label="alt || undefined"
    :aria-hidden="alt ? undefined : 'true'"
    :style="maskStyle"
  />
</template>

<style scoped>
.cui-svg-image {
  display: inline-block;
  vertical-align: middle;
  max-width: 100%;
}

.cui-svg-image--masked {
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
}

/* a11y (Windows High Contrast / forced colors): the browser would force the
   background, i.e. the graphic's only paint, to the Canvas color and make
   it vanish. Use the system text color instead. */
@media (forced-colors: active) {
  .cui-svg-image--masked {
    forced-color-adjust: none;
    background-color: CanvasText !important;
  }
}
</style>
