# RelatedLinks

The quiet "related links" box commonly placed at the end of a content page: a short, boxed list of links, deliberately smaller and lower-key than a `TeaserGrid`.

## Import

```js
import { RelatedLinks } from 'civic-ui'
```

## Basic usage

`links` is the only required prop. Each link can carry an optional `text` description below its label:

```vue
<script setup>
import { RelatedLinks } from 'civic-ui'
</script>

<template>
  <div class="cui-container" style="padding-block: var(--cui-space-6);">
    <RelatedLinks
      title="More on this topic"
      :links="[
        { label: 'Resident Participation', href: '#', text: 'How you can help shape city projects' },
        { label: 'Urban Development Plan', href: '#', text: 'The guidelines for Nordholm through 2035' }
      ]"
    />
  </div>
</template>
```

## Compact list without descriptions

Omit `text` on a link to render just its label, and omit `title` to fall back to the default "More on this topic" heading. Useful for a longer, denser list:

```vue
<script setup>
import { RelatedLinks } from 'civic-ui'
</script>

<template>
  <div class="cui-container" style="padding-block: var(--cui-space-6);">
    <RelatedLinks
      :links="[
        { label: 'Waste Collection Schedule', href: '#' },
        { label: 'Report a Pothole', href: '#' },
        { label: 'Apply for a Building Permit', href: '#' },
        { label: 'Public Transit Map', href: '#' }
      ]"
    />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `'More on this topic'` | |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alignment of the title. |
| `links` | `{ label, href, newTab?, text?, tag? }[]` | | Required. `text` is an optional description shown below the label; `tag` overrides the rendered element for that one link: a component object, or one of the strings `'a'`, `'router-link'`/`'RouterLink'`, `'nuxt-link'`/`'NuxtLink'`; any other string (e.g. `'base'` from CMS data) is ignored and the `tag` prop is used instead. |
| `tag` | `string \| object` | | The element or component every link renders as. Unset, links follow [`configureLinks({ linkComponent })`](../getting-started.md#router-integration): internal paths render the router link, everything else a plain `<a>`. A link's own `tag` field overrides this per-link. |
