# Radio

A single radio button. Give every radio in the same group an identical `name` and bind the same `v-model` to each: the one whose `value` matches the model is checked.

For a labeled group with a hint or an error message, wrap the radios in [`RadioGroup`](radio-group.md): it renders the `<fieldset>`/`<legend>`, and the radios inside take `name`, the checked state and the error state from it.

## Import

```js
import { Radio } from 'civic-ui'
```

## Basic usage

A group of three radios sharing one `name` and `v-model`:

```vue
<script setup>
import { ref } from 'vue'
import { Radio } from 'civic-ui'

const plan = ref('standard')
</script>

<template>
  <div class="cui-cluster">
    <Radio v-model="plan" value="basic" name="plan" label="Basic" />
    <Radio v-model="plan" value="standard" name="plan" label="Standard" />
    <Radio v-model="plan" value="pro" name="plan" label="Pro" />
  </div>
</template>
```

## Disabled option

Set `disabled` on individual radios to take a single option out of a group, for example an appointment slot that's already booked:

```vue
<script setup>
import { ref } from 'vue'
import { Radio } from 'civic-ui'

const slot = ref('10:00')
</script>

<template>
  <div class="cui-cluster">
    <Radio v-model="slot" value="09:00" name="appointment-slot" label="09:00 (booked)" disabled />
    <Radio v-model="slot" value="10:00" name="appointment-slot" label="10:00" />
    <Radio v-model="slot" value="11:00" name="appointment-slot" label="11:00" />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `string \| number \| boolean` | | |
| `value` | same |, (required) | The value this radio represents. |
| `name` | `string` | `''` | Radios sharing a `name` form one group. Required outside a `RadioGroup`; inside one, the group's name is used. |
| `label` | `string` |, (required) | |
| `disabled` | `boolean` | `false` | |
| `hint` | `string` | `''` | For a lone radio; in a group put it on `RadioGroup`. |
| `error` | `string` | `''` | For a lone radio; in a group put it on `RadioGroup`. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | the radio's `value` | Fires when this radio is selected. |

## Accessibility notes

In Windows contrast themes (`forced-colors: active`) the checked dot is painted in `CanvasText`, so the selected option stays visible.
