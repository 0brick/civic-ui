# Switch

A boolean toggle styled as a pill switch, following the same plain-boolean `v-model` contract as `Checkbox`. Use it alongside checkboxes and radios for settings-style on/off controls rather than list selections.

## Import

```js
import { Switch } from 'civic-ui'
```

## Basic usage

A single switch with a boolean `v-model`:

```vue
<script setup>
import { ref } from 'vue'
import { Switch } from 'civic-ui'

const notifications = ref(true)
</script>

<template>
  <Switch v-model="notifications" label="Email notifications" />
</template>
```

## Multiple settings, with a disabled option

Stack several switches for a settings panel. Set `disabled` on any that shouldn't be changeable right now:

```vue
<script setup>
import { ref } from 'vue'
import { Switch } from 'civic-ui'

const email = ref(true)
const sms = ref(false)
const push = ref(false)
</script>

<template>
  <div class="cui-stack" style="max-width: 360px;">
    <Switch v-model="email" label="Email notifications" />
    <Switch v-model="sms" label="SMS notifications" />
    <Switch v-model="push" label="Push notifications (no device registered)" disabled />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `boolean` | `false` | |
| `label` | `string` |, (required) | |
| `disabled` | `boolean` | `false` | |
| `hint` | `string` | `''` | Help text under the label, tied to the switch via `aria-describedby`. |
| `error` | `string` | `''` | Error text; replaces the hint, sets `aria-invalid` and `aria-errormessage`. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `boolean` | |

## Accessibility notes

A native checkbox with `role="switch"`. The off-track is filled with `--cui-border-control` and the thumb has an outline in the same color, so the switch is visible at 3:1 against the page and the thumb against the track (WCAG 1.4.11).

In Windows contrast themes (`forced-colors: active`) the track gets a system-colored outline, the thumb is painted in `CanvasText` and the on-state fills the track with `Highlight`, so on and off stay distinguishable. `hint`/`error` work as on `Checkbox`.
