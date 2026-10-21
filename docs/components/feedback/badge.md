# Badge

A small inline label for tagging status, category, or count: next to a heading, inside a table cell, or in a card's metadata row.

## Import

```js
import { Badge } from 'civic-ui'
```

## Basic usage

A badge needs nothing but its label text:

```vue
<script setup>
import { Badge } from 'civic-ui'
</script>

<template>
  <Badge>Draft</Badge>
</template>
```

## All variants

Eight color variants, plus a `pill` shape for a fully rounded badge:

```vue
<script setup>
import { Badge } from 'civic-ui'
</script>

<template>
  <div class="cui-cluster">
    <Badge variant="neutral">Neutral</Badge>
    <Badge variant="primary">Primary</Badge>
    <Badge variant="accent">Accent</Badge>
    <Badge variant="success" pill>Active</Badge>
    <Badge variant="danger" pill>Closed</Badge>
    <Badge variant="outline">Outline</Badge>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'neutral' \| 'primary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'outline'` | `'neutral'` | |
| `pill` | `boolean` | `false` | Fully rounded shape instead of the default small radius. |

## Slots

| Slot | Notes |
|---|---|
| `default` | The badge's label text. |
