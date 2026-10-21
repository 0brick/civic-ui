# RangeSlider

A single-value range input with a label and a live numeric readout above the track.

## Import

```js
import { RangeSlider } from 'civic-ui'
```

## Basic usage

A slider needs a `v-model`, and usually a `label` and a `min`/`max` range:

```vue
<script setup>
import { ref } from 'vue'
import { RangeSlider } from 'civic-ui'

const volume = ref(40)
</script>

<template>
  <div style="max-width: 360px;">
    <RangeSlider v-model="volume" label="Volume" :min="0" :max="100" />
  </div>
</template>
```

## Multiple sliders with a custom step

Set `step` to control the increment, and stack several sliders together, for example to let residents allocate shares of a participatory budget. `valueText` says what the number means: here a percentage:

```vue
<script setup>
import { ref } from 'vue'
import { RangeSlider } from 'civic-ui'

const parks = ref(35)
const roads = ref(60)
</script>

<template>
  <div class="cui-stack" style="max-width: 360px;">
    <RangeSlider v-model="parks" label="Parks & Recreation budget share" :min="0" :max="100" :step="5" :value-text="(v) => `${v} %`" />
    <RangeSlider v-model="roads" label="Road Maintenance budget share" :min="0" :max="100" :step="5" :value-text="(v) => `${v} %`" />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `number` |, (required) | |
| `min` | `number` | `0` | |
| `max` | `number` | `100` | |
| `step` | `number` | `1` | |
| `label` | `string` | `''` | |
| `showValue` | `boolean` | `true` | Shows the current numeric value next to the label. |
| `valueText` | `string \| (value) => string` | `''` | What the value means, with its unit ("40 %", "3 rooms"). Shown in the readout instead of the bare number and set as `aria-valuetext`, so screen readers say "40 %" rather than "40". |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `number` | Fires on every `input` event. |

## Accessibility notes

- A native `<input type="range">`: arrow keys, Page Up/Down, Home/End work as usual, and `label` is its `<label>`.
- Pass `valueText` whenever the number has a unit, without it, screen readers announce only the bare number.
- The track has a 1px outline in `--cui-border-control` (3:1+ against the page, WCAG 1.4.11), since its unfilled part alone barely differs from the background.
- `min === max` is allowed (the fill stays empty instead of dividing by zero), and a `modelValue` outside the range doesn't paint the fill past the track.
