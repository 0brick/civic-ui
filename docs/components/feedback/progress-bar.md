# ProgressBar

A horizontal progress indicator for a multi-step process, upload, or any measurable completion: a file upload, a multi-page form, a long-running task.

## Import

```js
import { ProgressBar } from 'civic-ui'
```

## Basic usage

Pass a `value` between `0` and `max` (default `100`):

```vue
<script setup>
import { ProgressBar } from 'civic-ui'
</script>

<template>
  <ProgressBar :value="60" />
</template>
```

## With label and variants

Add a `label` and `show-value` for a visible percentage, or `striped` for a moving-stripe texture on a different color `variant`:

```vue
<script setup>
import { ProgressBar } from 'civic-ui'
</script>

<template>
  <div class="cui-stack" style="width: 100%; max-width: 420px;">
    <ProgressBar :value="72" label="Upload progress" show-value />
    <ProgressBar :value="40" variant="accent" striped />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | `0` | Current progress. |
| `max` | `number` | `100` | Value that represents 100%. |
| `variant` | `'primary' \| 'accent' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Status fills use the `--cui-text-*` tones, which stay at 3:1 against the track in dark mode too; `accent` gets an ink edge, since yellow on the light track is ~1:1. |
| `label` | `string` | | Shown above the bar and used as its `aria-label`. |
| `showValue` | `boolean` | `false` | Shows the rounded percentage next to the label. |
| `striped` | `boolean` | `false` | Adds a diagonal-stripe texture to the filled bar. |

## Accessibility notes

The track has an outline in `--cui-border-control`, so where 100 % lies is visible (the muted track alone is ~1.2:1 against the page), and every fill reads at 3:1 or more against the track (WCAG 1.4.11). Always pass a `label`: it becomes the bar's accessible name.
