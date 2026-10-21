# Pagination

A numeric pager with ellipsis collapsing for large page counts. It's fully controlled: `Pagination` holds no internal page state, so you own the current page and react to `update:modelValue`.

## Import

```js
import { Pagination } from 'civic-ui'
```

## Basic usage

`modelValue` and `total` are the only required props:

```vue
<script setup>
import { ref } from 'vue'
import { Pagination } from 'civic-ui'

const page = ref(3)
</script>

<template>
  <Pagination v-model="page" :total="12" />
</template>
```

## Large result sets

With more pages than fit on screen, `Pagination` collapses the middle into an ellipsis and keeps the first and last page visible. `siblingCount` controls how many pages show on each side of the current one:

```vue
<script setup>
import { ref } from 'vue'
import { Pagination } from 'civic-ui'

const page = ref(58)
</script>

<template>
  <Pagination v-model="page" :total="124" :sibling-count="2" />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `number` |, (required) | The current page, 1-indexed. |
| `total` | `number` |, (required) | Total number of pages. |
| `siblingCount` | `number` | `1` | How many page numbers to show on each side of the current page before collapsing the rest into `…`. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `number` | Fires when a page number or the previous/next arrow is clicked. Pair with `v-model`. |

## Accessibility notes

When the page buttons don't fit the width (a long `total` on a phone), the list scrolls sideways between the fixed previous/next arrows. Its scrollbar stays visible (thin), it is the only sign that more pages are hidden, and the list has room around the buttons so their focus ring isn't clipped by the scroll container.
