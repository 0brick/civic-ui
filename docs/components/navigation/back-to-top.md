# BackToTop

A fixed, circular button that fades in once the page has scrolled past a threshold and smooth-scrolls back to the top when clicked.

## Import

```js
import { BackToTop } from 'civic-ui'
```

## Basic usage

Drop it anywhere in your layout: it's positioned `fixed`, so placement in the DOM doesn't matter:

```vue
<script setup>
import { BackToTop } from 'civic-ui'
</script>

<template>
  <BackToTop :threshold="120" />
</template>
```

## Custom label

Override the accessible label (and tooltip) when the default English text doesn't fit your page's language:

```vue
<script setup>
import { BackToTop } from 'civic-ui'
</script>

<template>
  <BackToTop :threshold="120" label="Nach oben" />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `threshold` | `number` | `480` | Pixels scrolled before the button fades in. |
| `label` | `string` | `'Back to top'` | Used as the button's `aria-label`. |
| `focusTarget` | `string \| HTMLElement` | `'#main-content, main'` | Receives keyboard focus after the click (first match of the selector). A non-focusable target gets `tabindex="-1"`. |

## Accessibility notes

The button fades out once the page is back at the top, so after the click it moves keyboard focus to `focusTarget`, by default the main content (`#main-content`, else `<main>`). Otherwise focus would stay on a removed element and the next Tab would start over from the top of the document (WCAG 2.4.3).

With `prefers-reduced-motion: reduce`, the scroll to the top jumps instead of animating.
