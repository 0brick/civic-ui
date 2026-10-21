# Breadcrumb

A trail of links showing where the current page sits in the site hierarchy. The last item always renders as plain text rather than a link, regardless of whether it's passed an `href` or `to`: the current page shouldn't link to itself.

## Import

```js
import { Breadcrumb } from 'civic-ui'
```

## Basic usage

Pass an ordered list of items from the site root down to the current page:

```vue
<script setup>
import { Breadcrumb } from 'civic-ui'
</script>

<template>
  <Breadcrumb
    :items="[
      { label: 'Home', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Application Process' }
    ]"
  />
</template>
```

## Deeper hierarchy

Any number of items works the same way: the trail wraps on narrow screens:

```vue
<script setup>
import { Breadcrumb } from 'civic-ui'
</script>

<template>
  <Breadcrumb
    :items="[
      { label: 'Home', href: '#' },
      { label: 'Citizen Services', href: '#' },
      { label: 'Permits & Licenses', href: '#' },
      { label: 'Building Permits', href: '#' },
      { label: 'Application Status' }
    ]"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ label, href?, newTab? \| to? }[]` |, (required) | Each item needs either `href` (plain link) or `to` (`router-link`); the last item is rendered as plain text and gets `aria-current="page"` regardless of what it's passed. |

## Accessibility notes

- The trail is a `<nav>` landmark ("Breadcrumb", `breadcrumb.label`) around an ordered list; the last item carries `aria-current="page"`.
- The "/" separators are `aria-hidden` spans, not CSS `content`: generated content is read aloud by most screen readers ("slash"), and the list structure already says these are steps of a trail.
