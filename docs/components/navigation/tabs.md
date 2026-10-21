# Tabs

Switches between panels of content behind a row of tab buttons. `Tabs` also doubles as a general-purpose "Nav" component: pass `pills` for a pill-nav look instead of the underlined tab look.

## Import

```js
import { Tabs } from 'civic-ui'
```

## Basic usage

Content for each tab goes in a named slot matching that tab's `id`:

```vue
<script setup>
import { Tabs } from 'civic-ui'
</script>

<template>
  <Tabs :tabs="[{ id: 'overview', label: 'Overview' }, { id: 'details', label: 'Details' }, { id: 'docs', label: 'Documents' }]">
    <template #overview>Overview content goes here.</template>
    <template #details>Detail content goes here.</template>
    <template #docs>Document content goes here.</template>
  </Tabs>
</template>
```

## Pills, fill & disabled tabs

`pills` swaps the underlined look for rounded pill buttons, `fill` stretches tabs to share the available width equally, and any tab can be individually disabled:

```vue
<script setup>
import { Tabs } from 'civic-ui'
</script>

<template>
  <Tabs
    :tabs="[
      { id: 'open', label: 'Open' },
      { id: 'closed', label: 'Closed' },
      { id: 'archived', label: 'Archived', disabled: true }
    ]"
    pills
    fill
  >
    <template #open>3 requests are currently open and awaiting review.</template>
    <template #closed>12 requests were closed this month.</template>
  </Tabs>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tabs` | `{ id, label, disabled? }[]` |, (required) | |
| `modelValue` | `string` | first tab's `id` | The active tab's `id`. Pair with `v-model` to control it from outside. |
| `pills` | `boolean` | `false` | Rounded pill-nav look instead of underlined tabs. |
| `fill` | `boolean` | `false` | Tabs stretch to share the row's full width equally. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `string` | Fires with the newly active tab's `id`. |

## Slots

| Slot | Notes |
|---|---|
| `<tab.id>` | One dynamic slot per entry in `tabs`, named after that tab's `id`: its content is mounted while that tab is active. |

## Accessibility notes

The tab list follows the WAI-ARIA APG "Tabs" keyboard pattern rather than plain `Tab` key navigation: with focus inside the tab list, Left/Right (or Up/Down) arrow keys move between tabs and activate them immediately, Home/End jump to the first/last enabled tab, and disabled tabs are skipped. `Tab` itself only moves focus into and out of the tab list once, landing on the active tab.

Every tab has its own `role="tabpanel"` element (inactive ones `hidden` and empty: slot content still only mounts while its tab is active), so each tab's `aria-controls` points at a panel that exists. Ids are prefixed per instance (`cui-tabs-<n>-tab-<id>` / `-panel-<id>`), so two `Tabs` with the same tab ids on one page never produce duplicate ids (WCAG 4.1.1 / 4.1.2).
