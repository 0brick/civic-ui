# AppButton

The base action element for every call to action in Civic UI. Renders a native `<button>` by default, or an `<a>` automatically when `href` is set, so a "button" that navigates is still a real link, not a `<button>` with a click handler pretending to be one.

## Import

```js
import { AppButton } from 'civic-ui'
```

## Basic usage

A button needs nothing but its label:

```vue
<script setup>
import { AppButton } from 'civic-ui'
</script>

<template>
  <AppButton>Save changes</AppButton>
</template>
```

## Variants, sizes & states

Every visual variant, plus the loading and disabled states:

```vue
<script setup>
import { AppButton } from 'civic-ui'
</script>

<template>
  <div class="cui-cluster">
    <AppButton variant="primary">Primary</AppButton>
    <AppButton variant="accent">Accent</AppButton>
    <AppButton variant="quaternary">Quaternary</AppButton>
    <AppButton variant="outline">Outline</AppButton>
    <AppButton variant="ghost">Ghost</AppButton>
    <AppButton variant="link">Link</AppButton>
    <AppButton variant="danger">Danger</AppButton>
    <AppButton variant="primary" loading>Loading</AppButton>
    <AppButton variant="primary" disabled>Disabled</AppButton>
  </div>
</template>
```

`size` takes `sm | md | lg` (default `md`). Combine with `block` for a full-width button, or `href` to render a link styled the same way:

```vue
<AppButton variant="accent" size="lg" href="/contact">Request an appointment</AppButton>
```

## With icons

`icon` takes an icon component (from any icon library, or your own SVG component) or an image URL, which renders as a decorative `<img>`. The icon is sized in `em`, so it scales with `size` automatically; component icons that draw with `currentColor` follow each variant's text color. `icon-position="end"` puts it after the label.

`icon-only` makes a square icon button. The slot text is still rendered, visually hidden, as the button's accessible name (WCAG 4.1.2), so always pass one:

```vue
<script setup>
import { h } from 'vue'
import { AppButton } from 'civic-ui'

// Any component works as an icon: an icon library's component, or a
// small inline one like these. Drawing with currentColor lets the icon
// follow each variant's text color.
const SearchIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }, [
    h('circle', { cx: 11, cy: 11, r: 7 }),
    h('path', { d: 'm20 20-4-4' })
  ])
const ArrowIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M5 12h14M13 6l6 6-6 6' })
  ])
</script>

<template>
  <div class="cui-stack">
    <div class="cui-cluster">
      <AppButton :icon="SearchIcon">Search</AppButton>
      <AppButton variant="accent" :icon="ArrowIcon" icon-position="end">Continue</AppButton>
      <AppButton variant="outline" icon="/favicon.svg">Image icon</AppButton>
    </div>
    <div class="cui-cluster">
      <AppButton size="sm" :icon="SearchIcon" icon-only>Search</AppButton>
      <AppButton :icon="SearchIcon" icon-only>Search</AppButton>
      <AppButton size="lg" :icon="SearchIcon" icon-only>Search</AppButton>
      <AppButton variant="ghost" :icon="ArrowIcon" icon-only>Next page</AppButton>
    </div>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'primary' \| 'accent' \| 'quaternary' \| 'outline' \| 'ghost' \| 'link' \| 'danger'` | `'primary'` | `primary` is white text on navy; `accent` is `--cui-accent-contrast` on the accent color (navy on gold by default, white on a dark brand accent such as red); `quaternary` is white text on the quaternary palette color (violet by default; `violet` still works as an alias); `ghost` has a soft ink-tinted border, unlike the borderless `link` variant. Inside `[data-cui-theme="dark"]` (set automatically by dark `HeroSection`/`CtaBanner` bands) `outline` and `ghost` switch to light ink. Corner radius and label weight come from `--cui-btn-radius` / `--cui-btn-font-weight` (see [Theming](../../theming.md#design-tokens-reference)). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `href` | `string` | | Renders an `<a>` instead of a `<button>` when set. |
| `newTab` | `boolean` | `false` | Link buttons only: opens `href` in a new tab (`target="_blank"`, `rel="noopener noreferrer"`) and adds a visually hidden "(opens in a new tab)" hint. A native `target="_blank"` attribute gets the same `rel` and hint. See [Links in new tabs](../../accessibility.md#links-in-new-tabs-wcag-325). |
| `tag` | `string \| object` | | Override the rendered element, e.g. `RouterLink` (it receives `href` as `to`). Usually unnecessary: with [`configureLinks({ linkComponent })`](../../getting-started.md#router-integration) internal hrefs render the router link automatically. |
| `type` | `string` | `'button'` | Native `type` attribute; only applied when rendered as `<button>`. |
| `disabled` | `boolean` | `false` | A `<button>` gets the native `disabled` attribute. A link button drops its `href` and renders `<a role="link" aria-disabled="true">`, so it doesn't navigate. |
| `loading` | `boolean` | `false` | Shows a spinner and blocks the button. The button stays focusable (`aria-disabled="true"`, clicks and form submits are blocked), so a submit button that turns busy keeps focus. The spinner takes the icon's place, so with `iconPosition="end"` the label doesn't shift. |
| `focusableWhenDisabled` | `boolean` | `false` | With `disabled`: use `aria-disabled` instead of the native attribute, so focus isn't lost when the button gets disabled while focused (e.g. during a submit cooldown). Clicks are blocked. |
| `block` | `boolean` | `false` | Full width. |
| `icon` | component \| `string` | | An icon component, or an image URL rendered as a decorative `<img>`. Sized to `1.25em`, so it scales with `size`. Hidden while `loading` (the spinner takes its place). |
| `iconPosition` | `'start' \| 'end'` | `'start'` | Which side of the label the icon sits on. |
| `iconOnly` | `boolean` | `false` | Square icon button; the slot text becomes a visually hidden accessible name. Sized with the `lh` unit, with an `em`-based fallback for browsers without it (Safari < 17). |

## Slots

| Slot | Notes |
|---|---|
| `default` | The button's label/content. With `iconOnly`, still required: it's the visually hidden accessible name. |

## Accessibility notes

- A natively `disabled` button leaves the tab order: if it had focus, focus falls back to `<body>` (WCAG 2.4.3). `loading` and `focusableWhenDisabled` therefore use `aria-disabled="true"`: the button stays focusable and is announced as unavailable, while clicks are blocked.
- A link can't be natively disabled. A disabled or loading link button renders without `href`, with `role="link"` and `aria-disabled="true"`, and doesn't navigate (WCAG 4.1.2).
