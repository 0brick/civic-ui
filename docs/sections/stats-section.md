# StatsSection

A full-width row of key figures ("X residents, Y online services…") for establishing scale on an about-us or annual-report style page without a wall of text. By default on the dark primary band; `background` takes any section theme. For a single figure beside running text (a donation goal, a fee) use [StatCard](../components/content/stat-card.md) `appearance="highlight"` instead.

## Import

```js
import { StatsSection } from 'civic-ui'
```

## Basic usage

`stats` is the only prop you need; `title` is optional:

```vue
<script setup>
import { StatsSection } from 'civic-ui'
</script>

<template>
  <StatsSection
    :stats="[
      { value: '24', label: 'Online services' },
      { value: '18', label: 'District offices' },
      { value: '92%', label: 'Requests resolved within 5 days' }
    ]"
  />
</template>
```

## With a title

Add `title` for a heading above the figures, and any number of `stats`. With the default `columns="auto"` the row has as many columns as figures, up to four:

```vue
<script setup>
import { StatsSection } from 'civic-ui'
</script>

<template>
  <StatsSection
    title="Nordholm by the numbers"
    :stats="[
      { value: '128,000', label: 'Residents' },
      { value: '3,400', label: 'Childcare spots' },
      { value: '45,000', label: 'Online applications per year' },
      { value: '12,000', label: 'Trees newly planted' }
    ]"
  />
</template>
```

## Background and columns

`background` takes a [section theme](../theming.md#section-color-themes) key / palette role (`'light'`, `'secondary'`, `'highlight'`, …) or a color; title, figures and labels take the theme's matching colors. `columns` fixes 2, 3 or 4 columns from 900px up instead of following the number of figures:

```vue
<StatsSection
  background="light"
  :columns="3"
  :stats="[
    { value: '€15,000', label: 'Building costs' },
    { value: '120', label: 'Pupils' },
    { value: '2027', label: 'Opening' }
  ]"
/>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `''` | |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alignment of the title. |
| `stats` | `{ value, label }[]` | | Required. |
| `background` | theme key \| CSS color | dark primary band | Section theme / palette role, or a color. |
| `columns` | `'auto' \| 2 \| 3 \| 4` | `'auto'` | `auto`: as many columns as figures, up to 4. |
