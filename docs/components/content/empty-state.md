# EmptyState

A zero-data placeholder for a table, search result, or dashboard panel: an icon, a short explanation, and a way out; an `action` link button and/or the default slot, such as a button to clear filters or create the first item. With `size="page"` it also fills a whole page, e.g. a 404 or "no upcoming events".

## Import

```js
import { EmptyState } from 'civic-ui'
```

## Basic usage

`title` is the only required prop:

```vue
<script setup>
import { EmptyState } from 'civic-ui'
</script>

<template>
  <EmptyState title="No appointments booked yet" />
</template>
```

## With description & action

Add `text` for a short explanation, and use the default slot for a way forward:

```vue
<script setup>
import { AppButton, EmptyState } from 'civic-ui'
</script>

<template>
  <EmptyState title="No results" text="Adjust your filters or reset the search.">
    <AppButton variant="outline" size="sm">Reset filters</AppButton>
  </EmptyState>
</template>
```

## Built-in icons

`icon` picks one of a small set drawn in the same stroke weight as the Card meta icons (`'default'` (an inbox tray), `'calendar'`, `'search'`, `'inbox'`, `'document'`, `'error'`) or `'none'`. The `icon` slot still takes any custom illustration.

```vue
<EmptyState icon="calendar" title="No upcoming events" text="New dates are announced here." />
```

## Action

`action` (`{ label, href, newTab? }`) renders a link button, like the `action` objects of the sections. The default slot is still there for anything else (a filter reset button, several actions); both can be combined, the `action` comes first.

```vue
<EmptyState icon="search" title="No results" text="Try a different search term." :action="{ label: 'All news', href: '/news' }" />
```

## As a 404 page

`size="page"` brings its own section spacing and container, plus a larger icon and title; `headingLevel` sets the heading element so the page gets its `h1`:

```vue
<EmptyState
  size="page"
  :heading-level="1"
  icon="error"
  title="Page not found"
  text="The page may have moved or no longer exists."
  :action="{ label: 'Back to the home page', href: '/' }"
/>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` |, (required) | |
| `text` | `string` | | Optional short explanation below the title. |
| `icon` | `'default' \| 'calendar' \| 'search' \| 'inbox' \| 'document' \| 'error' \| 'none'` | `'default'` | Built-in icon; `default` is the inbox tray. The `icon` slot overrides it. |
| `headingLevel` | `1 \| 2 \| 3 \| 4` | `3` | Heading element of the title, `1` for a full page. |
| `action` | `{ label, href, newTab? }` | `null` | A link button before the default slot's content. |
| `size` | `'panel' \| 'page'` | `'panel'` | `page`: a `<section>` with section spacing, container, larger icon and title. |

## Slots

| Slot | Notes |
|---|---|
| `icon` | Overrides the built-in icon (also when `icon="none"`). |
| `default` | Further actions shown below the text (after `action`): rendered only when this slot has content. |
