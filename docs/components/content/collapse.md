# Collapse

A single standalone show/hide toggle: the primitive `AccordionItem` is built on. Reach for `Collapse` directly when you need one independent expand/collapse control (a "show more details" link, an optional fee breakdown) and don't need `Accordion`'s single-open-panel group behavior.

## Import

```js
import { Collapse } from 'civic-ui'
```

## Basic usage

`Collapse` is controlled with `v-model`. `label` sets the trigger button's text:

```vue
<script setup>
import { ref } from 'vue'
import { Collapse } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <Collapse v-model="open" label="Show more details">
    <p>Additional details, revealed by the Collapse component.</p>
  </Collapse>
</template>
```

## Multiple independent toggles

Each `Collapse` owns its own `v-model`, so several can sit next to each other and open independently: useful for grouping optional details under a form step or service description. Start one open by initializing its ref to `true`:

```vue
<script setup>
import { ref } from 'vue'
import { Collapse } from 'civic-ui'

const openFees = ref(true)
const openDocuments = ref(false)
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.6rem;">
    <Collapse v-model="openFees" label="Fees for this service">
      <p>Issuing a new ID card costs €37.00 (€22.80 for applicants under 24).</p>
    </Collapse>
    <Collapse v-model="openDocuments" label="Required documents">
      <p>Bring your expired ID or passport and one biometric photo, no older than six months.</p>
    </Collapse>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `boolean` | `false` | Whether the panel is open. Use with `v-model`. |
| `label` | `string` |, (required) | The trigger button's text. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `boolean` | Fired when the trigger is clicked, for `v-model`. |

## Slots

| Slot | Notes |
|---|---|
| `default` | The panel's content, shown when `modelValue` is `true`. |
