# ButtonGroup

Visually joins a row (or column) of `AppButton`s into one segmented control. It only wraps its children: it doesn't manage any selection state itself, so it works equally well with plain static buttons or a `v-for`'d list.

## Import

```js
import { ButtonGroup } from 'civic-ui'
```

## Basic usage

Wrap a row of buttons that share the same `variant` to join them into one control:

```vue
<script setup>
import { AppButton, ButtonGroup } from 'civic-ui'
</script>

<template>
  <ButtonGroup aria-label="Choose a time range">
    <AppButton variant="primary">Day</AppButton>
    <AppButton variant="primary">Week</AppButton>
    <AppButton variant="primary">Month</AppButton>
  </ButtonGroup>
</template>
```

## Vertical group with active state

Set `vertical` to stack the buttons instead, and toggle each button's `variant` to reflect which one is selected:

```vue
<script setup>
import { ref } from 'vue'
import { AppButton, ButtonGroup } from 'civic-ui'

const view = ref('list')
</script>

<template>
  <ButtonGroup vertical aria-label="Choose how to display nearby recycling points">
    <AppButton :variant="view === 'list' ? 'primary' : 'outline'" @click="view = 'list'">List view</AppButton>
    <AppButton :variant="view === 'map' ? 'primary' : 'outline'" @click="view = 'map'">Map view</AppButton>
  </ButtonGroup>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `vertical` | `boolean` | `false` | Stacks the buttons in a column instead of a row. |
| `ariaLabel` | `string` | `'Button group'` | Accessible name for the group (rendered as `aria-label`). |

## Slots

| Slot | Notes |
|---|---|
| `default` | The `AppButton`s (or other controls) to join together. |

## Accessibility notes

The group carries `role="group"` with `aria-label` set from the `ariaLabel` prop, so always pass a label describing what the buttons control (e.g. "Choose a time range") rather than leaving the generic default in place.
