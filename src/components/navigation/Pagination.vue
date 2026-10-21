<script setup>
// Numeric pager with ellipsis collapsing for large page counts. Purely
// controlled: pass `modelValue` and listen for `update:modelValue`.
import { computed } from 'vue'
import { t } from '../../utils/i18n'

const props = defineProps({
  modelValue: { type: Number, required: true },
  total: { type: Number, required: true },
  siblingCount: { type: Number, default: 1 }
})
const emit = defineEmits(['update:modelValue'])

const pages = computed(() => {
  const { modelValue: current, total, siblingCount } = props
  const totalVisible = siblingCount * 2 + 5
  if (total <= totalVisible) return Array.from({ length: total }, (_, i) => i + 1)

  const left = Math.max(current - siblingCount, 2)
  const right = Math.min(current + siblingCount, total - 1)
  const result = [1]

  if (left > 2) result.push('…')
  for (let p = left; p <= right; p++) result.push(p)
  if (right < total - 1) result.push('…')
  result.push(total)

  return result
})

function go(page) {
  if (typeof page !== 'number' || page === props.modelValue) return
  emit('update:modelValue', page)
}
</script>

<template>
  <nav class="cui-pagination" :aria-label="t('pagination.label')">
    <button type="button" class="cui-pagination__nav" :disabled="modelValue === 1" :aria-label="t('pagination.previous')" @click="go(modelValue - 1)">
      ‹
    </button>
    <ul>
      <li v-for="(page, i) in pages" :key="`${page}-${i}`">
        <span v-if="page === '…'" class="cui-pagination__ellipsis" aria-hidden="true">…</span>
        <button
          v-else
          type="button"
          class="cui-pagination__item"
          :class="{ 'cui-pagination__item--active': page === modelValue }"
          :aria-current="page === modelValue ? 'page' : undefined"
          :aria-label="t('pagination.page', { n: page })"
          @click="go(page)"
        >
          {{ page }}
        </button>
      </li>
    </ul>
    <button type="button" class="cui-pagination__nav" :disabled="modelValue === total" :aria-label="t('pagination.next')" @click="go(modelValue + 1)">
      ›
    </button>
  </nav>
</template>

<style scoped>
.cui-pagination {
  display: flex;
  align-items: center;
  gap: var(--cui-space-2);
}

.cui-pagination__nav {
  flex-shrink: 0;
}

.cui-pagination ul {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  list-style: none;
  /* room for the buttons' focus outline (2px + 2px offset), which the
     scroll container would otherwise clip; the negative margin keeps the
     row where it was */
  padding: 0.4rem;
  margin: -0.4rem 0;
  /* A large `total` with a generous siblingCount easily produces more page
     buttons than a phone screen is wide: min-width:0 lets this flex item
     actually shrink below the list's own content width (its default is
     min-width:auto, i.e. never), so overflow-x can scroll it instead of
     the whole nav pushing the page wider. Prev/next stay outside this list,
     so they're always reachable without scrolling. The scrollbar stays
     visible (thin): it is the only sign that more pages are hidden. */
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.cui-pagination__item,
.cui-pagination__nav {
  min-width: 3.4rem;
  height: 3.4rem;
  padding: 0 0.6rem;
  border: 1.5px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
  background: var(--cui-surface);
  font-weight: 600;
  font-size: 1.4rem;
  cursor: pointer;
  transition: border-color var(--cui-duration-fast) var(--cui-ease), background-color var(--cui-duration-fast) var(--cui-ease), color var(--cui-duration-fast) var(--cui-ease);
}

.cui-pagination__item:hover,
.cui-pagination__nav:hover:not(:disabled) {
  border-color: var(--cui-border-strong);
}

.cui-pagination__item--active {
  background: var(--cui-primary);
  border-color: var(--cui-primary);
  color: var(--cui-primary-contrast);
}

.cui-pagination__nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cui-pagination__ellipsis {
  display: inline-flex;
  min-width: 3.4rem;
  justify-content: center;
  /* grey-500 alone reads ~4:1 on a white page background: short of the
     4.5:1 AA text minimum. aria-hidden hides it from screen readers, but
     that doesn't exempt it from contrast requirements for sighted users,
     who still read it as "more pages here". text-muted is guaranteed >=4.5:1
     by the palette engine (see utils/palette.js), unlike a plain swatch. */
  color: var(--cui-text-muted);
}
</style>
