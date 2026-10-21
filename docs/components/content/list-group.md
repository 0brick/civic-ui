# ListGroup

A bordered, vertically-stacked list of link or content rows: a compact alternative to a bulleted list for navigation menus, related-service links, or step summaries. Pass `items` for the common case, or use the default slot when a row needs fully custom markup.

## Import

```js
import { ListGroup } from 'civic-ui'
```

## Basic usage

Pass an array of items. Each one renders as a link when it has an `href` (or `to`, for a router link), and as a plain row otherwise:

```vue
<script setup>
import { ListGroup } from 'civic-ui'
</script>

<template>
  <ListGroup
    :items="[
      { label: 'Register a new address', href: '#' },
      { label: 'Apply for a passport', href: '#' },
      { label: 'Request a birth certificate', href: '#' }
    ]"
  />
</template>
```

## With descriptions, badges & active state

Each item can also carry a `description`, a `badge`, and `active`/`disabled` flags:

```vue
<script setup>
import { ListGroup } from 'civic-ui'
</script>

<template>
  <ListGroup
    :items="[
      { label: 'Account created', description: 'Step 1 of 4', badge: '✓' },
      { label: 'Team invited', description: 'Step 2 of 4', active: true },
      { label: 'Payment on file', description: 'Step 3 of 4' }
    ]"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ label, description?, href?, newTab?, to?, active?, disabled?, badge? }[]` | `[]` | Ignored when the default slot is used instead. |
| `flush` | `boolean` | `false` | Removes the outer border and rounded corners, for embedding inside another bordered container. |

## Slots

| Slot | Notes |
|---|---|
| `default` | Replaces the generated rows entirely, for fully custom row markup: wrap each row in an `<li>`. |
