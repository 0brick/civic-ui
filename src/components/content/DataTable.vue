<script setup>
// A plain, dependency-free data table for webapp screens: sortable columns,
// optional row selection, per-column cell overrides via scoped slots, and a
// built-in empty/loading state. Not virtualized, for very large datasets,
// paginate server-side and pass one page of `rows` at a time (see
// Pagination).
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Placeholder from '../feedback/Placeholder.vue'
import EmptyState from './EmptyState.vue'
import CuiLink from '../internal/CuiLink.vue'
import NewTabHint from '../internal/NewTabHint.vue'
import { hasOwn } from '../../utils/security'
import { useId } from '../../composables/useId'
import { t } from '../../utils/i18n'

const props = defineProps({
  columns: { type: Array, required: true }, // [{ key, label, sortable?, align?, width? }]
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  selectable: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] }, // v-model:selected
  sortBy: { type: String, default: '' }, // v-model:sortBy
  sortDir: { type: String, default: 'asc', validator: (v) => ['asc', 'desc'].includes(v) }, // v-model:sortDir
  striped: { type: Boolean, default: false },
  dense: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  emptyTitle: { type: String },
  emptyText: { type: String, default: '' },
  // a11y (WCAG 1.3.1): optional table purpose, read by screen readers even
  // though it's visually hidden, e.g. "Open support tickets, sorted by date".
  caption: { type: String, default: '' },
  // a11y (WCAG 2.1.1): rows that lead somewhere. `(row) => href` or
  // `(row) => ({ href, newTab?, to? })` (null/'' = no link for that row),
  // the first column's content becomes a real link (Tab + Enter), and the
  // whole row stays clickable through a stretched ::after.
  rowLink: { type: Function, default: null },
  // Declared only to know whether a `@row-click` listener is attached (Vue
  // still routes emit('row-click') to it). Prefer `rowLink`.
  // With a listener and no `rowLink`, the first column's content becomes a
  // <button> that emits `row-click`, so the row action works by keyboard.
  onRowClick: { type: [Function, Array], default: null }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  emptyTitle: props.emptyTitle ?? t('dataTable.empty')
}))


const emit = defineEmits(['update:selected', 'update:sortBy', 'update:sortDir', 'row-click'])

// A missing/non-array `columns`/`rows`/`selected` (e.g. data still loading)
// renders the empty state instead of crashing the page.
const cols = computed(() => (Array.isArray(props.columns) ? props.columns.filter(Boolean) : []))
const items = computed(() => (Array.isArray(props.rows) ? props.rows.filter((r) => r && typeof r === 'object') : []))
const picked = computed(() => (Array.isArray(props.selected) ? props.selected : []))

const allSelected = computed(() => items.value.length > 0 && picked.value.length === items.value.length)
const someSelected = computed(() => picked.value.length > 0 && !allSelected.value)

// security (prototype-chain lookup, see utils/security.js): own properties
// only, so a column `key: "constructor"` renders empty instead of
// `function Object() { [native code] }`.
function cell(row, key) {
  return hasOwn(row, key) ? row[key] : undefined
}

function keyOf(row) {
  return cell(row, props.rowKey)
}

function isSelected(row) {
  return picked.value.includes(keyOf(row))
}

// 'link' (rowLink), 'button' (row-click listener) or null (no row action).
const rowAction = computed(() => (props.rowLink ? 'link' : props.onRowClick ? 'button' : null))

// Only the known link fields, so a row's data can't smuggle in other attrs.
function linkOf(row) {
  const value = props.rowLink?.(row)
  if (!value) return null
  if (typeof value === 'string') return { href: value, newTab: false, to: null }
  if (typeof value !== 'object' || (!value.href && !value.to)) return null
  return { href: value.href ?? null, newTab: Boolean(value.newTab), to: value.to ?? null }
}

function toggleAll() {
  emit('update:selected', allSelected.value ? [] : items.value.map(keyOf))
}

function toggleRow(row) {
  const key = keyOf(row)
  const next = isSelected(row) ? picked.value.filter((k) => k !== key) : [...picked.value, key]
  emit('update:selected', next)
}

// a11y (WCAG 2.1.1): a table wider than its wrapper scrolls sideways, which
// a keyboard can only do once the wrapper itself takes focus, so while it
// overflows it's a named, focusable region (named by the caption if there
// is one). A table that fits gets no extra tab stop. Without ResizeObserver
// (old browsers, SSR, tests) it stays focusable to be safe.
const captionId = useId('cui-table-caption')
const wrapEl = ref(null)
const scrollable = ref(true)
let observer = null

function measure() {
  const el = wrapEl.value
  if (el) scrollable.value = el.scrollWidth > el.clientWidth
}

onMounted(() => {
  if (typeof ResizeObserver === 'undefined' || !wrapEl.value) return
  observer = new ResizeObserver(measure)
  observer.observe(wrapEl.value)
  if (wrapEl.value.firstElementChild) observer.observe(wrapEl.value.firstElementChild)
  measure()
})
onBeforeUnmount(() => observer?.disconnect())

function sort(col) {
  if (!col.sortable) return
  if (props.sortBy === col.key) {
    emit('update:sortDir', props.sortDir === 'asc' ? 'desc' : 'asc')
  } else {
    emit('update:sortBy', col.key)
    emit('update:sortDir', 'asc')
  }
}
</script>

<template>
  <div
    ref="wrapEl"
    class="cui-table-wrap"
    :tabindex="scrollable ? 0 : undefined"
    :role="scrollable ? 'region' : undefined"
    :aria-labelledby="scrollable && caption ? captionId : undefined"
    :aria-label="scrollable && !caption ? t('dataTable.label') : undefined"
  >
    <table
      class="cui-table"
      :class="{ 'cui-table--striped': striped, 'cui-table--dense': dense, 'cui-table--row-action': rowAction }"
      :aria-busy="loading ? 'true' : undefined"
    >
      <caption v-if="caption" :id="captionId" class="cui-visually-hidden">{{ caption }}</caption>
      <thead>
        <tr>
          <th v-if="selectable" class="cui-table__select-col">
            <input
              type="checkbox"
              :aria-label="t('dataTable.selectAll')"
              :checked="allSelected"
              :indeterminate.prop="someSelected"
              @change="toggleAll"
            />
          </th>
          <th
            v-for="col in cols"
            :key="col.key"
            :style="col.width ? { width: col.width } : undefined"
            :class="[`cui-table__col--${col.align || 'left'}`, { 'cui-table__col--sortable': col.sortable }]"
            :aria-sort="sortBy === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined"
          >
            <button v-if="col.sortable" type="button" class="cui-table__sort-btn" @click="sort(col)">
              {{ col.label }}
              <svg v-if="sortBy === col.key" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" :style="{ transform: sortDir === 'desc' ? 'rotate(180deg)' : 'none' }">
                <path d="M2 8l4-5 4 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" class="cui-table__sort-idle">
                <path d="M2 5l4-4 4 4M2 8l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <template v-else>{{ col.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody v-if="loading">
        <tr v-for="n in 4" :key="n">
          <td v-if="selectable" />
          <td v-for="col in cols" :key="col.key"><Placeholder height="1.4rem" /></td>
        </tr>
      </tbody>
      <tbody v-else-if="items.length === 0">
        <tr>
          <td :colspan="cols.length + (selectable ? 1 : 0)">
            <EmptyState :title="L.emptyTitle" :text="emptyText" />
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr
          v-for="row in items"
          :key="keyOf(row)"
          :class="{ 'cui-table__row--selected': selectable && isSelected(row) }"
        >
          <td v-if="selectable" class="cui-table__select-col">
            <input type="checkbox" :aria-label="t('dataTable.selectRow', { key: keyOf(row) })" :checked="isSelected(row)" @change="toggleRow(row)" />
          </td>
          <td v-for="(col, i) in cols" :key="col.key" :class="`cui-table__col--${col.align || 'left'}`">
            <CuiLink
              v-if="i === 0 && rowAction === 'link' && linkOf(row)"
              class="cui-table__row-action"
              v-bind="linkOf(row)"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="cell(row, col.key)">{{ cell(row, col.key) }}</slot>
              <NewTabHint v-if="linkOf(row).newTab" />
            </CuiLink>
            <button
              v-else-if="i === 0 && rowAction === 'button'"
              type="button"
              class="cui-table__row-action cui-table__row-action--button"
              @click="emit('row-click', row)"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="cell(row, col.key)">{{ cell(row, col.key) }}</slot>
            </button>
            <slot v-else :name="`cell-${col.key}`" :row="row" :value="cell(row, col.key)">{{ cell(row, col.key) }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Always rendered, so it is a live region before "Loading…" appears in
         it (the skeleton rows themselves are aria-hidden placeholders). -->
    <p class="cui-visually-hidden" role="status">{{ loading ? t('dataTable.loading') : '' }}</p>
  </div>
</template>

<style scoped>
.cui-table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-lg);
}

.cui-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.4rem;
}

.cui-table th,
.cui-table td {
  padding: 1.4rem 1.6rem;
  text-align: left;
  vertical-align: middle;
}

.cui-table--dense th,
.cui-table--dense td {
  padding: 0.8rem 1.2rem;
}

.cui-table thead th {
  background: var(--cui-bg-subtle);
  color: var(--cui-text-muted);
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--cui-border);
  white-space: nowrap;
}

.cui-table tbody tr {
  border-bottom: 1px solid var(--cui-border);
}
.cui-table tbody tr:last-child {
  border-bottom: none;
}

.cui-table--striped tbody tr:nth-child(even) {
  background: var(--cui-bg-subtle);
}

.cui-table tbody tr:hover {
  background: var(--cui-bg-muted);
}

.cui-table__row--selected {
  background: rgba(255, 237, 62, 0.18);
}

.cui-table__col--right {
  text-align: right;
}
.cui-table__col--center {
  text-align: center;
}

.cui-table__select-col {
  width: 4.4rem;
  text-align: center;
}

.cui-table__sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  font-weight: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  color: inherit;
  cursor: pointer;
  transition: color var(--cui-duration) var(--cui-ease);
}
.cui-table__sort-btn:hover {
  color: var(--cui-text);
}

.cui-table__sort-idle {
  opacity: 0.4;
  transition: opacity var(--cui-duration) var(--cui-ease);
}
.cui-table__sort-btn:hover .cui-table__sort-idle {
  opacity: 0.75;
}

/* Row action (rowLink / row-click): one real link or button in the first
   cell, stretched over the whole row by ::after; the row is clickable
   anywhere, but there's exactly one focusable, Enter-able control per row.
   Other controls in the row (checkbox, links in cell slots) sit above it. */
.cui-table--row-action tbody tr {
  position: relative;
}
.cui-table--row-action tbody tr:hover {
  cursor: pointer;
}
.cui-table--row-action .cui-table__select-col {
  position: relative;
  z-index: 1;
}
.cui-table__row-action {
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
}
.cui-table__row-action--button {
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  font: inherit;
  font-weight: 600;
  text-align: inherit;
  cursor: pointer;
}
.cui-table__row-action::after {
  content: '';
  position: absolute;
  inset: 0;
}
.cui-table__row-action:focus-visible {
  outline: none;
}
.cui-table__row-action:focus-visible::after {
  outline: 2px solid var(--cui-focus-ring);
  outline-offset: -2px;
}
.cui-table--row-action td :deep(:is(a, button, input, select, textarea, label):not(.cui-table__row-action)) {
  position: relative;
  z-index: 1;
}

.cui-table td :deep(input[type='checkbox']),
.cui-table th :deep(input[type='checkbox']) {
  width: 1.8rem;
  height: 1.8rem;
  accent-color: var(--cui-primary);
  cursor: pointer;
}
</style>
