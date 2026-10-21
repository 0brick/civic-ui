# CtaBanner

A full-width, solid-color banner built around one strong call to action: a careers push, a newsletter sign-up, an "apply now" block breaking up a long content page.

## Import

```js
import { CtaBanner } from 'civic-ui'
```

## Basic usage

`title` and `action` are the only required props. Without a `background`, the banner uses the default gold theme:

```vue
<script setup>
import { CtaBanner } from 'civic-ui'
</script>

<template>
  <CtaBanner
    title="Renew your resident parking permit"
    :action="{ label: 'Start renewal', href: '#' }"
  />
</template>
```

## Custom theme with supporting text

Add `text` for a supporting line, and set `background` to any [section theme](../theming.md#section-color-themes) key for a different color block. The button automatically switches to a contrasting variant on dark themes (`navy`, `purple`, `violet`, `teal`, `anthracite`):

```vue
<script setup>
import { CtaBanner } from 'civic-ui'
</script>

<template>
  <CtaBanner
    background="primary"
    title="Interested in a job with the city?"
    text="We're always looking for engaged colleagues in administration, IT and technical services."
    :action="{ label: 'View open positions', href: '#' }"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | | Required. |
| `text` | `string` | `''` | |
| `background` | theme key \| color | `'gold'` | See [Theming → Section color themes](../theming.md#section-color-themes). Unlike `HeroSection`, this does not accept an image URL: only a theme key or a raw CSS color. |
| `action` | `{ label, href, newTab? }` | | Required. |
| `secondaryAction` | `{ label, href, newTab? }` | | A second, quieter action: an outline button, automatically light on a dark band. |
| `layout` | `'split' \| 'stacked'` | `'split'` | `split`: text on the left, buttons at the end of the row (wrapping below on narrow screens). `stacked`: buttons under the text. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment; with `stacked` the buttons follow it too. |

## Slots

| Slot | Notes |
|---|---|
| `text` | Rich body copy (paragraphs, links) in place of the `text` prop. |
