# CloseButton

The "×" dismiss control used internally by `Alert`, `Modal`, and `Toast`. It's exposed as its own component so any custom dismissible UI can reuse the same accessible close button instead of redrawing it.

## Import

```js
import { CloseButton } from 'civic-ui'
```

## Basic usage

`CloseButton` renders nothing on its own until you listen for `click`: always pass a `label` that describes what's being closed:

```vue
<script setup>
import { CloseButton } from 'civic-ui'
</script>

<template>
  <CloseButton label="Close dialog" />
</template>
```

## Dismissing content

A typical use: hide something when the button is clicked, with a way to bring it back:

```vue
<script setup>
import { ref } from 'vue'
import { AppButton, CloseButton } from 'civic-ui'

const visible = ref(true)
</script>

<template>
  <div class="cui-cluster" style="align-items: center;">
    <CloseButton v-if="visible" label="Dismiss this message" @click="visible = false" />
    <AppButton v-else variant="outline" size="sm" @click="visible = true">Show it again</AppButton>
  </div>
</template>
```

## Dark background variant

Set `dark` when the button sits on a dark or colored surface, so it stays visible against the background:

```vue
<script setup>
import { CloseButton } from 'civic-ui'
</script>

<template>
  <div style="background: var(--cui-color-navy); padding: var(--cui-space-4); border-radius: var(--cui-radius-md); display: flex; align-items: center; justify-content: space-between;">
    <span style="color: var(--cui-color-white); font-weight: 600;">Maintenance notice: online services unavailable Sunday 2-4am</span>
    <CloseButton label="Dismiss notice" dark />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `'Close'` | Accessible name, rendered as `aria-label`. Always pass one that describes what's being closed. |
| `dark` | `boolean` | `false` | Uses light-colored icon/hover styling for placement on dark or colored backgrounds. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `click` | | Fires on click. `CloseButton` doesn't hide anything itself: the listener decides what closing means. |
