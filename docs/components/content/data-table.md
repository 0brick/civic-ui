# DataTable

A dependency-free data table for webapp screens: sortable columns, optional row selection, per-column cell overrides via scoped slots, and a built-in loading/empty state. It is not virtualized, for very large datasets, paginate server-side and pass one page of `rows` at a time (see `Pagination`).

## Import

```js
import { DataTable } from 'civic-ui'
```

## Basic usage

`columns` and `rows` are all a table needs. `DataTable` is display-only: it renders whatever rows you pass in and doesn't sort or filter them itself.

```vue
<script setup>
import { DataTable } from 'civic-ui'

const columns = [
  { key: 'name', label: 'Ticket' },
  { key: 'owner', label: 'Owner' }
]
const rows = [
  { id: 1, name: 'Ticket #4471', owner: 'A. Berger' },
  { id: 2, name: 'Ticket #4472', owner: 'C. Nowak' }
]
</script>

<template>
  <DataTable :columns="columns" :rows="rows" />
</template>
```

## Sorting, selection & custom cells

Mark columns `sortable` and handle `update:sortBy`/`update:sortDir` yourself, `DataTable` emits sort requests but leaves re-ordering to you, the same convention as its selection and pagination props. Add `selectable` with `v-model:selected` for row checkboxes, and override any column's cell with a `#cell-<key>` scoped slot:

```vue
<script setup>
import { ref, computed } from 'vue'
import { DataTable, StatusDot } from 'civic-ui'

const columns = [
  { key: 'name', label: 'Ticket', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'updated', label: 'Updated', sortable: true, align: 'right' }
]
const rows = ref([
  { id: 1, name: 'Ticket #4471', status: 'open', owner: 'A. Berger', updated: '2026-09-10' },
  { id: 2, name: 'Ticket #4472', status: 'in review', owner: 'C. Nowak', updated: '2026-09-11' },
  { id: 3, name: 'Ticket #4473', status: 'closed', owner: 'A. Berger', updated: '2026-09-08' },
  { id: 4, name: 'Ticket #4474', status: 'open', owner: 'M. Lindqvist', updated: '2026-09-12' }
])
const selected = ref([])
const sortBy = ref('updated')
const sortDir = ref('desc')

const sortedRows = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...rows.value].sort((a, b) => (a[sortBy.value] < b[sortBy.value] ? -1 : a[sortBy.value] > b[sortBy.value] ? 1 : 0) * dir)
})
</script>

<template>
  <DataTable
    :columns="columns"
    :rows="sortedRows"
    selectable
    v-model:selected="selected"
    v-model:sort-by="sortBy"
    v-model:sort-dir="sortDir"
    striped
  >
    <template #cell-status="{ value }">
      <StatusDot :status="value === 'open' ? 'warning' : value === 'closed' ? 'success' : 'neutral'" :label="value" />
    </template>
  </DataTable>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `{ key, label, sortable?, align?, width? }[]` |, (required) | |
| `rows` | `object[]` | `[]` | |
| `rowKey` | `string` | `'id'` | The field used as each row's unique key. |
| `selectable` | `boolean` | `false` | Adds a checkbox column. |
| `selected` | `array` | `[]` | Selected row keys. Use with `v-model:selected`. |
| `sortBy` | `string` | `''` | Active sort column's key. Use with `v-model:sortBy`. |
| `sortDir` | `'asc' \| 'desc'` | `'asc'` | Use with `v-model:sortDir`. |
| `striped` | `boolean` | `false` | Alternating row background. |
| `dense` | `boolean` | `false` | Tighter row padding. |
| `loading` | `boolean` | `false` | Shows placeholder skeleton rows instead of `rows`, marks the table `aria-busy` and announces "Loading…". |
| `emptyTitle` | `string` | `'No data'` | Title shown when `rows` is empty. |
| `emptyText` | `string` | | Text shown under `emptyTitle`. |
| `rowLink` | `(row) => string \| { href, newTab?, to? } \| null` | `null` | Makes each row lead somewhere: the first column's content becomes a real link (reachable with Tab, opened with Enter), stretched over the whole row so a click anywhere on the row follows it. Return `null` for rows without a link. See [Row actions](#row-actions). |
| `caption` | `string` | | Visually-hidden `<caption>` describing the table's purpose for screen readers: recommended whenever the surrounding page doesn't already make it obvious, e.g. "Open support tickets, sorted by date". Also names the scroll region (see below). |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:selected` | `array` | Fires when a row checkbox or the select-all checkbox is toggled. |
| `update:sortBy` | `string` | Fires when a sortable column header is clicked. |
| `update:sortDir` | `'asc' \| 'desc'` | Fires alongside `update:sortBy`, or alone when re-clicking the active column. |
| `row-click` | `object` (the row) | Prefer `rowLink` for navigation. With a listener attached, the first column's content becomes a `<button>` stretched over the row; clicking anywhere on the row, or the button by keyboard, fires the event. Clicks on other controls in the row (checkbox, links in cell slots) don't. |

## Slots

| Slot | Notes |
|---|---|
| `cell-<key>` | Scoped slot per column (`{ row, value }`) to override that column's cell content. |

## Row actions

A row that only reacts to mouse clicks on the `<tr>` is unreachable by keyboard (WCAG 2.1.1). Both row actions therefore put one real control into the first cell and stretch it over the row with a `::after` overlay:

```vue
<DataTable :columns="columns" :rows="rows" :row-link="(row) => `/tickets/${row.id}`" />
```

- `rowLink` renders a link: use it whenever the row opens a page. Router paths (`to`) and `newTab` work as for every other link.
- `@row-click` renders a button: for in-page actions (open a detail panel). Its content is the first column's content, so keep that column non-interactive (no links or buttons inside its cell slot); put other controls in later columns, they stay clickable above the overlay.
- The focus ring of the row control outlines the whole row.

## Accessibility notes

- **Row actions** are real links or buttons, see [Row actions](#row-actions).
- **Loading.** While `loading` is set, the `<table>` carries `aria-busy="true"` and a visually hidden live region (always rendered, so it already exists when the text arrives) says "Loading…" (`dataTable.loading`). The skeleton rows themselves are hidden from screen readers.
- **Horizontal scrolling (WCAG 2.1.1).** A table wider than its container scrolls sideways inside its wrapper. While it overflows, the wrapper is a focusable `role="region"` (`tabindex="0"`), so keyboard users can tab to it and scroll with the arrow keys. It's named by `caption`, or "Table" (`dataTable.label`) without one: pass a `caption` when several tables share a page. A table that fits gets no extra tab stop (measured with `ResizeObserver`; without it the wrapper stays focusable).
