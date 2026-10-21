# Timeline

A vertical event timeline: an agency's history, a case's process log, an activity feed. Pass `items` for the common case, or use the default slot for fully custom row markup.

## Import

```js
import { Timeline } from 'civic-ui'
```

## Basic usage

Each item can have a `date`, `title`, and `text`: all optional, so a row can be as sparse as a single date:

```vue
<script setup>
import { Timeline } from 'civic-ui'
</script>

<template>
  <Timeline
    :items="[
      { date: '2022', title: 'Project started', text: 'First version of the component library.' },
      { date: '2024', title: 'Webapp kit', text: 'Added dashboard components.' },
      { date: '2026', title: 'Current release', text: 'Refreshed design system.' }
    ]"
  />
</template>
```

## As a case process log

The same `items` shape works well for tracking the status of a single case or application over time:

```vue
<script setup>
import { Timeline } from 'civic-ui'
</script>

<template>
  <Timeline
    :items="[
      { date: 'Sep 12, 2026', title: 'Application received', text: 'Case #48213 was received and assigned to the planning office.' },
      { date: 'Sep 15, 2026', title: 'Under review', text: 'Documents are being checked against local zoning rules.' },
      { date: 'Sep 22, 2026', title: 'Site inspection scheduled', text: 'An inspector will visit the property on Sep 29.' },
      { date: 'Oct 3, 2026', title: 'Decision issued', text: 'The building permit was approved with two conditions.' }
    ]"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ date?, title?, text? }[]` | `[]` | Ignored when the default slot is used instead. |
| `headingLevel` | `number` | `3` | Heading level (2-6) of the entry titles: match the page outline (WCAG 1.3.1). |

## Slots

| Slot | Notes |
|---|---|
| `default` | Replaces the generated entries entirely, for fully custom row markup. |
