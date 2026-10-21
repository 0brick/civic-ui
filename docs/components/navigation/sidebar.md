# Sidebar

The vertical app-navigation rail for `AppShell`: icon-and-label items, an active state, and a `collapsed` icon-only mode for dense layouts. It's distinct from `Navbar`, which is for marketing-site headers rather than logged-in app navigation.

## Import

```js
import { Sidebar } from 'civic-ui'
```

## Basic usage

Pass a flat list of items, `Sidebar` needs a height (from its parent layout, `AppShell` normally provides it) to know how tall to render:

```vue
<script setup>
import { Sidebar } from 'civic-ui'

const items = [
  { label: 'Overview', active: true, href: '#' },
  { label: 'Tickets', href: '#' },
  { label: 'Reports', href: '#' },
  { label: 'Settings', href: '#' }
]
</script>

<template>
  <div style="height: 340px;">
    <Sidebar :items="items" />
  </div>
</template>
```

## With header, footer & collapse toggle

Use the `header`/`footer` slots for a logo or a collapse button, and toggle `collapsed` to switch to icon-only mode:

```vue
<script setup>
import { ref } from 'vue'
import { AppButton, Sidebar } from 'civic-ui'

const icon =
  '<svg viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M3 8h14" stroke="currentColor" stroke-width="1.6"/></svg>'

const items = [
  { label: 'Overview', icon, active: true, href: '#' },
  { label: 'Tickets', icon, href: '#' },
  { label: 'Reports', icon, href: '#' },
  { label: 'Settings', icon, href: '#' }
]

const collapsed = ref(false)
</script>

<template>
  <div style="height: 340px;">
    <Sidebar :items="items" :collapsed="collapsed">
      <template #header><strong>Example App</strong></template>
      <template #footer>
        <AppButton variant="ghost" size="sm" block @click="collapsed = !collapsed">
          {{ collapsed ? 'Expand' : 'Collapse' }}
        </AppButton>
      </template>
    </Sidebar>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ label, href?, newTab?, to?, icon?, active? }[]` | `[]` | `icon` is raw SVG markup, rendered via `v-html`, routed through the library's internal HTML sanitizer: pass developer-authored SVG only, or configure a stronger sanitizer (e.g. DOMPurify) for content sourced from elsewhere. Ignored when the default slot is used instead. |
| `collapsed` | `boolean` | `false` | Icon-only mode; labels are visually hidden but stay in the accessibility tree. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `select` | the clicked item | Fires on every item click. Items without `href`/`to` render as buttons: handle `select` to switch the view. Link items emit it before navigating (e.g. to close a mobile nav). |

## Slots

| Slot | Notes |
|---|---|
| `header` | Above the nav items, e.g. a logo or app name. |
| `default` | Overrides the `items`-driven nav entirely: put your own items/markup here. |
| `footer` | Below the nav items, e.g. a collapse toggle or account link. |

## Accessibility notes

The `active` item carries `aria-current="page"` (a link) or `aria-current="true"` (a button item), so screen readers announce it as the current entry, not only through its highlight (WCAG 1.3.1 / 4.1.2). For a router link without `active`, the router's own `aria-current` is left untouched.
