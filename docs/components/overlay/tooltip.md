# Tooltip

A short hover/focus hint anchored to a single trigger element. It's CSS-positioned with no external positioning library, so it's meant for brief text, not rich content: use `Popover` when you need a heading and a body.

## Import

```js
import { Tooltip } from 'civic-ui'
```

## Basic usage

Wrap the trigger element in the default slot and pass the hint text:

```vue
<script setup>
import { AppButton, Tooltip } from 'civic-ui'
</script>

<template>
  <Tooltip text="Extra context shown on hover">
    <AppButton variant="outline">Hover me</AppButton>
  </Tooltip>
</template>
```

## Placements

`placement` picks which side of the trigger the tooltip appears on:

```vue
<script setup>
import { AppButton, Tooltip } from 'civic-ui'
</script>

<template>
  <div class="cui-cluster">
    <Tooltip text="Shown above the button" placement="top">
      <AppButton variant="outline" size="sm">Top</AppButton>
    </Tooltip>
    <Tooltip text="Shown below the button" placement="bottom">
      <AppButton variant="outline" size="sm">Bottom</AppButton>
    </Tooltip>
    <Tooltip text="Shown left of the button" placement="left">
      <AppButton variant="outline" size="sm">Left</AppButton>
    </Tooltip>
    <Tooltip text="Shown right of the button" placement="right">
      <AppButton variant="outline" size="sm">Right</AppButton>
    </Tooltip>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | `string` |, (required) | The hint text. |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Which side of the trigger the tooltip appears on. |

## Slots

| Slot | Notes |
|---|---|
| `default` | The trigger element the tooltip is anchored to. Scoped with `{ describedby }`: the tooltip's id, for triggers that want to set `aria-describedby` themselves. |

## Accessibility notes

The tooltip appears on `focus` as well as `hover` (and hides on `blur`), so keyboard users reach the same hint as mouse users when tabbing to the trigger. The tooltip text itself carries `role="tooltip"`.

- **Announced as a description (WCAG 1.3.1 / 4.1.2).** The tooltip is always in the DOM (hidden while closed), and the first focusable element in the slot gets `aria-describedby` pointing at it: added to any ids it already has. A screen reader reads the button's name, then the hint. To wire it yourself (e.g. on an inner element of a component), use the slot's `describedby`: `<Tooltip text="…" v-slot="{ describedby }"><MyInput :aria-describedby="describedby" /></Tooltip>`: the automatic wiring then leaves that element alone.
- **Hoverable and dismissible (WCAG 1.4.13).** The pointer can move from the trigger onto the tooltip without it closing (an invisible bridge covers the gap), and Escape closes it, whether it opened on hover or focus, without moving focus. Inside a `Modal`, the first Escape closes only the tooltip.
- **Wraps on narrow screens (WCAG 1.4.10).** Long tooltip text wraps at `min(28rem, 100vw − 2rem)` instead of running off a 320px viewport.
- Use the trigger's own label for the essential information: a tooltip is a supplement, it never replaces an accessible name.
