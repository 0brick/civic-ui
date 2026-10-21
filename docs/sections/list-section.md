# ListSection

A header plus a vertical stack of items. The `itemType` prop picks the `Card` shape and the widget that goes with it: a press index with pagination (`article`, the default), a search toolbar with an empty-state fallback (`job`), or a plain file list (`download`).

## Import

```js
import { ListSection } from 'civic-ui'
```

## Basic usage

`title` and `items` are all you need. With the default `itemType="article"`, each item renders as a row card:

```vue
<script setup>
import { ListSection } from 'civic-ui'
</script>

<template>
  <ListSection
    title="Latest news"
    :items="[
      { title: 'Council approves expansion of the bike lane network', excerpt: 'By 2028, 40 additional kilometers of bike lanes will reach every district.', href: '#' },
      { title: 'New childcare center opens in Ostpark', excerpt: 'The facility offers space for 90 children and opens with the new school year.', href: '#' }
    ]"
  />
</template>
```

## News list with pagination

Article items can also carry `date`, `category`, and `image`. Set `totalPages` and use `v-model:page` to show pagination controls:

```vue
<script setup>
import { ref } from 'vue'
import { ListSection } from 'civic-ui'
import mobility from '../../assets/photos/mobility.jpg'
import school from '../../assets/photos/school.jpg'

const page = ref(1)
</script>

<template>
  <ListSection
    eyebrow="City Hall"
    title="Latest news"
    v-model:page="page"
    :total-pages="4"
    :items="[
      { date: 'Sep 8, 2026', category: 'City Council', title: 'Council approves expansion of the bike lane network', excerpt: 'By 2028, 40 additional kilometers of bike lanes will reach every district.', image: mobility, href: '#' },
      { date: 'Aug 29, 2026', category: 'Education', title: 'New childcare center opens in Ostpark', excerpt: 'The facility offers space for 90 children and opens with the new school year.', image: school, href: '#' }
    ]"
  />
</template>
```

## Job listings with search

`itemType="job"` swaps the pagination for a search toolbar and renders an `EmptyState` when `items` is empty. It also switches to a full-width layout by default. Listen for `search` to filter the list yourself:

```vue
<script setup>
import { ListSection, ToastContainer, useToast } from 'civic-ui'

const toast = useToast()
</script>

<template>
  <ToastContainer />
  <ListSection
    item-type="job"
    eyebrow="Careers"
    title="Open positions"
    intro="Current openings across the city administration."
    @search="(q) => toast.info(`Searching: ${q}`)"
    :items="[
      { title: 'Resident Services Officer', department: 'Resident Services', location: 'Nordholm', type: 'Full-time', href: '#' },
      { title: 'IT Systems Administrator', department: 'Digital Services', location: 'Nordholm', type: 'Full-time', href: '#' },
      { title: 'Working Student, City Communications', department: 'Press & Communications', location: 'Nordholm', type: 'Part-time', href: '#' }
    ]"
  />
</template>
```

## Downloads list

`itemType="download"` renders a plain file list with a file-type chip and size, no toolbar or pagination:

```vue
<script setup>
import { ListSection } from 'civic-ui'
</script>

<template>
  <ListSection
    item-type="download"
    eyebrow="Service"
    title="Forms & fact sheets"
    :items="[
      { title: 'Resident Parking Permit Application', fileType: 'PDF', fileSize: '180 KB', href: '#' },
      { title: 'Business Registration', fileType: 'PDF', fileSize: '240 KB', href: '#' },
      { title: 'Privacy Notice: Online Applications', fileType: 'PDF', fileSize: '95 KB', href: '#' }
    ]"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | | Required. |
| `eyebrow` | `string` | `''` | |
| `intro` | `string` | `''` | |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alignment of the `eyebrow`/`title`/`intro` head. |
| `items` | `array` | `[]` | Shape depends on `itemType`: `{ date?, category?, title, excerpt?, image?, href, newTab? }` for `article`, `{ title, department?, location?, type?, href, newTab? }` for `job`, `{ title, fileType?, fileSize?, href, newTab? }` for `download`. |
| `itemType` | `'article' \| 'job' \| 'download'` | `'article'` | Picks the `Card` layout and the one auxiliary widget that goes with it. |
| `narrow` | `boolean` | `false` | Opt-in 860px column. Off by default, so the section spans the same container width as every other section: see [Theming → Section width](../theming.md#section-width). |
| `subtle` | `boolean` | `null` | `null` means auto: sunken section background only for `download`. Pass `true`/`false` to override. |
| `searchable` | `boolean` | `true` | `itemType="job"` only: shows the search toolbar. |
| `searchLabel` | `string` | `'Search jobs'` | `itemType="job"` only. |
| `searchPlaceholder` | `string` | `'Search open positions…'` | `itemType="job"` only. |
| `emptyTitle` | `string` | `'No open positions found'` | `itemType="job"` only: shown when `items` is empty. |
| `emptyText` | `string` | `'Try adjusting your search, or check back later.'` | `itemType="job"` only. |
| `page` | `number` | `1` | `itemType="article"` only: use with `v-model:page`. |
| `totalPages` | `number` | `0` | `itemType="article"` only: pagination renders only when this is greater than 1. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `search` | `string` | `itemType="job"` only: fires as the visitor types in the search field. |
| `update:page` | `number` | `itemType="article"` only: pairs with `v-model:page`. |

## Slots

| Slot | Notes |
|---|---|
| `filters` | `itemType="job"` only: rendered at the end of the search toolbar, next to the search field. |
| `item` | Scoped (`{ item }`). Overrides the default `Card` rendering for any item, for a shape that doesn't fit `itemType`'s three built-ins. |
