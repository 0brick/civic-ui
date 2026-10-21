# Modal

The one overlay-panel primitive: a centered dialog by default, or, via the `placement` prop, a slide-in drawer from any edge or a mobile drag-to-dismiss sheet. All placements share the same `v-model`, teleport, backdrop, scroll lock and focus trap; only the panel's position and header chrome differ.

## Import

```js
import { Modal } from 'civic-ui'
```

## Basic usage

A modal needs a trigger and a `v-model` to control it. The `footer` slot is scoped with `close`, so its buttons can dismiss the dialog without you wiring up a second handler:

```vue
<script setup>
import { ref } from 'vue'
import { AppButton, Modal } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <AppButton variant="outline" @click="open = true">Open modal</AppButton>
  <Modal v-model="open" title="Confirm action">
    <p>Are you sure you want to continue? This action cannot be undone.</p>
    <template #footer="{ close }">
      <AppButton variant="ghost" @click="close">Cancel</AppButton>
      <AppButton variant="primary" @click="close">Confirm</AppButton>
    </template>
  </Modal>
</template>
```

## Slide-in drawer (offcanvas)

Set `placement` to `start`, `end`, or `top` to slide the panel in from an edge instead of centering it: useful for filter panels, carts, or secondary navigation:

```vue
<script setup>
import { ref } from 'vue'
import { AppButton, Modal } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <AppButton variant="outline" @click="open = true">Open filters</AppButton>
  <Modal v-model="open" placement="end" title="Filters">
    <p>Offcanvas-style content: filters, a shopping cart, or a secondary menu.</p>
  </Modal>
</template>
```

## Mobile bottom sheet

`placement="bottom"` combined with `handle` swaps the header close button for a drag handle, matching the mobile drag-to-dismiss pattern: drag the handle down at least 80px and let go to close the sheet; a shorter drag springs back. A tap on the handle (or Enter/Space when it has focus) closes it too, so the gesture is never the only way (WCAG 2.5.1, 2.5.7):

```vue
<script setup>
import { ref } from 'vue'
import { AppButton, Modal } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <AppButton variant="outline" @click="open = true">Open bottom sheet</AppButton>
  <Modal v-model="open" placement="bottom" handle title="Quick actions">
    <p>A typical mobile pattern for a short list of actions.</p>
  </Modal>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `boolean` | `false` | Controls visibility; use with `v-model`. |
| `placement` | `'center' \| 'start' \| 'end' \| 'top' \| 'bottom'` | `'center'` | `center` is a dialog; `start`/`end`/`top`/`bottom` slide in a drawer from that edge; `bottom` combined with `handle` is a mobile bottom sheet. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | `placement="center"` only. |
| `handle` | `boolean` | `false` | `placement="bottom"` only: shows a handle (a close button, 48×24 px target, pill in `--cui-border-control`) instead of a header close button. |
| `title` | `string` | `''` | Rendered as the dialog's heading when set. |
| `ariaLabel` | `string` | `''` | Fallback accessible name for a dialog with no visible `title` (e.g. a handle-only sheet). Provide one or the other. |
| `closeLabel` | `string` | `'Close dialog'` | Screen-reader name of the header close button (or the sheet's drag handle). |
| `closeOnBackdrop` | `boolean` | `true` | Whether clicking the backdrop closes the dialog. |
| `id` | `string` | `''` | `id` of the dialog element, so the button that opens it can point at it with `aria-controls` (as `Navbar` and `AppShell` do). The component's root is a teleport, so a plain `id` attribute would be dropped. |
| `footerAlign` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'end'` | Alignment of the `footer` slot's buttons; `stretch` makes them share the row equally (full-width buttons on a mobile sheet). On a handle sheet the footer drops its top rule and lines up with the inset body. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `boolean` | Fires with `false` when the dialog is dismissed: backdrop click, Escape, the header close button, or the sheet's drag handle. |

## Slots

| Slot | Notes |
|---|---|
| `default` | The dialog body. |
| `footer` | Scoped with `{ close }`. Renders a footer bar below the body, for any `placement`. |

## Accessibility notes

Every dialog needs an accessible name: pass `title` for a visible heading, or `ariaLabel` when the panel has no heading (a handle-only bottom sheet, for example). Without a `title` no heading element is rendered at all: no empty `<h2>` (WCAG 1.3.1). Escape closes the dialog, focus is trapped inside the panel while it's open, and focus returns to whatever triggered it on close.
