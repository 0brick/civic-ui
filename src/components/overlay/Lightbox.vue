<script setup>
// Full-screen image viewer on Modal size="full": focus trap, scroll lock,
// Escape and focus return come from there. Adds previous/next buttons, the
// arrow keys, swipe, and a counter whose changes are announced like the
// Carousel's ("Image 2 of 5"). Used by ImageGallery; usable on its own via
// v-model (+ v-model:index) or the exposed open(index).
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Modal from './Modal.vue'
import { sanitizeMediaUrl, mediaReferrerPolicy } from '../../utils/security'
import { t } from '../../utils/i18n'

const props = defineProps({
  images: { type: Array, default: () => [] }, // [{ src, alt, caption? }]
  modelValue: { type: Boolean, default: false },
  index: { type: Number, default: 0 }
})
const emit = defineEmits(['update:modelValue', 'update:index'])

const list = computed(() => (Array.isArray(props.images) ? props.images.filter((img) => img && img.src) : []))
const total = computed(() => list.value.length)

// Works controlled (v-model / v-model:index) and uncontrolled (open()).
const isOpen = ref(props.modelValue)
const current = ref(props.index)
watch(() => props.modelValue, (v) => (isOpen.value = v))
watch(() => props.index, (v) => (current.value = v))

const safeIndex = computed(() => (total.value ? ((current.value % total.value) + total.value) % total.value : 0))
const image = computed(() => list.value[safeIndex.value] || null)

function setOpen(v) {
  isOpen.value = v
  emit('update:modelValue', v)
}
function go(i) {
  if (!total.value) return
  current.value = ((i % total.value) + total.value) % total.value
  emit('update:index', current.value)
}
function open(i = 0) {
  go(i)
  setOpen(true)
}
function close() {
  setOpen(false)
}
defineExpose({ open, close })

// Arrow keys anywhere in the open dialog, also while the close button has focus
function onKeydown(event) {
  if (event.key === 'ArrowLeft') go(safeIndex.value - 1)
  else if (event.key === 'ArrowRight') go(safeIndex.value + 1)
  else return
  event.preventDefault()
}
watch(
  isOpen,
  (v) => {
    if (typeof document === 'undefined') return
    if (v) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
  },
  { immediate: true }
)
onBeforeUnmount(() => typeof document !== 'undefined' && document.removeEventListener('keydown', onKeydown))

// Swipe: a mostly horizontal drag of 50px or more
let start = null
function onPointerDown(event) {
  start = { x: event.clientX, y: event.clientY }
}
function onPointerUp(event) {
  if (!start) return
  const dx = event.clientX - start.x
  const dy = event.clientY - start.y
  start = null
  if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) go(safeIndex.value + (dx < 0 ? 1 : -1))
}

const status = computed(() => t('lightbox.status', { current: safeIndex.value + 1, total: total.value }))
</script>

<template>
  <Modal :model-value="isOpen" size="full" :title="total > 1 ? status : ''" :aria-label="t('lightbox.label')" @update:model-value="setOpen">
    <div
      v-if="image"
      class="cui-lightbox"
      data-cui-theme="dark"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="start = null"
    >
      <button v-if="total > 1" type="button" class="cui-lightbox__nav cui-lightbox__nav--prev" :aria-label="t('lightbox.previous')" @click="go(safeIndex - 1)">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <figure class="cui-lightbox__figure">
        <img
          :key="safeIndex"
          class="cui-lightbox__img"
          :src="sanitizeMediaUrl(image.src)"
          :alt="image.alt || ''"
          :referrerpolicy="mediaReferrerPolicy()"
          draggable="false"
        />
        <figcaption v-if="image.caption" class="cui-lightbox__caption">{{ image.caption }}</figcaption>
      </figure>
      <button v-if="total > 1" type="button" class="cui-lightbox__nav cui-lightbox__nav--next" :aria-label="t('lightbox.next')" @click="go(safeIndex + 1)">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
      </button>
      <p class="cui-visually-hidden" aria-live="polite">{{ total > 1 ? `${status}${image.alt ? `: ${image.alt}` : ''}` : '' }}</p>
    </div>
  </Modal>
</template>

<style scoped>
.cui-lightbox {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--cui-space-3);
  height: 100%;
  min-height: 60vh;
  padding: var(--cui-space-3);
  border-radius: var(--cui-radius-md);
  background: var(--cui-bg);
  color: var(--cui-text);
  touch-action: pan-y;
}
.cui-lightbox__figure {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--cui-space-3);
  height: 100%;
  margin: 0;
  min-height: 0;
}
.cui-lightbox__img {
  display: block;
  max-width: 100%;
  max-height: calc(92vh - 18rem);
  object-fit: contain;
  user-select: none;
}
.cui-lightbox__caption {
  font-size: 1.4rem;
  text-align: center;
  max-width: 70ch;
}
.cui-lightbox__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4.4rem;
  height: 4.4rem;
  padding: 0;
  border: 1.5px solid var(--cui-border-strong);
  border-radius: 50%;
  background: transparent;
  color: var(--cui-text);
  cursor: pointer;
}
.cui-lightbox__nav--prev {
  grid-column: 1;
}
.cui-lightbox__nav--next {
  grid-column: 3;
}
.cui-lightbox__nav:hover {
  background: var(--cui-bg-subtle);
}
.cui-lightbox__nav:focus-visible {
  outline: 2px solid var(--cui-focus-ring);
  outline-offset: 2px;
}

/* Mobile: the image takes the full width, the buttons sit below it */
@media (max-width: 599px) {
  .cui-lightbox {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
  }
  .cui-lightbox__figure {
    grid-column: 1 / -1;
    grid-row: 1;
  }
  .cui-lightbox__nav {
    grid-row: 2;
  }
  .cui-lightbox__nav--prev {
    grid-column: 1;
    justify-self: start;
  }
  .cui-lightbox__nav--next {
    grid-column: 2;
    justify-self: end;
  }
}
</style>
