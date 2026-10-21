# ColorModeToggle

A light/dark switch for the page-wide [dark color mode](../../theming.md#dark-and-light-mode). It flips the `data-cui-mode` attribute on `<html>`, remembers the visitor's choice in `localStorage`, and shares its state with every other toggle and `useColorMode()` caller on the page.

## Import

```js
import { ColorModeToggle } from 'civic-ui'
```

## Basic usage

Put it anywhere, typically in the `actions` slot of a `Navbar`/`SiteHeader`. It takes its icon color from its surroundings, so it reads correctly on a light navbar and on a `dark` one:

```vue
<script setup>
import { ColorModeToggle } from 'civic-ui'
</script>

<template>
  <ColorModeToggle />
</template>
```

Switch the mode on once at startup, choosing what a first-time visitor sees (`'auto'` follows their OS/browser setting):

```js
app.use(CivicUI, { colorMode: 'auto' })
// or, without the plugin:
import { initColorMode } from 'civic-ui'
initColorMode({ default: 'auto' })
```

## With label and "follow system"

`useColorMode()` exposes the same shared state, so your own controls stay in sync with the toggle:

```vue
<script setup>
import { AppButton, ColorModeToggle, useColorMode } from 'civic-ui'

const { mode, resolved, setMode } = useColorMode()
</script>

<template>
  <div class="cui-stack">
    <div class="cui-cluster">
      <ColorModeToggle show-label />
      <AppButton size="sm" :variant="mode === 'auto' ? 'primary' : 'ghost'" @click="setMode('auto')">Follow system</AppButton>
    </div>
    <p style="margin: 0;">Chosen: <strong>{{ mode }}</strong> · showing: <strong>{{ resolved }}</strong></p>
  </div>
</template>
```

## Accessibility

It's a WAI-ARIA toggle button: the accessible name stays the same ("Dark mode") and `aria-pressed` carries the state, so a screen reader announces "Dark mode, toggle button, pressed" instead of a label that changes meaning on every click. Pass a translated `label` (e.g. `label="Dunkelmodus"`) on non-English pages.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Dark mode'` | Accessible name. Rendered as `aria-label`, or as visible text with `showLabel`. |
| `showLabel` | `boolean` | `false` | Shows the label next to the icon. |
| `size` | `'sm' \| 'md'` | `'md'` | 32px or 40px square. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `change` | `'light' \| 'dark'` | Fires after toggling, with the mode now showing. |
