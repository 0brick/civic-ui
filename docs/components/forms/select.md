# Select

A styled wrapper around the native `<select>`: it keeps full keyboard, screen-reader and mobile-picker behavior for free while matching the rest of the field styling. Follows the same `v-model` / `label` / `hint` / `error` contract as the other form fields.

## Import

```js
import { Select } from 'civic-ui'
```

## Basic usage

`options` can be a plain array of strings, where the string is used as both the value and the label:

```vue
<script setup>
import { ref } from 'vue'
import { Select } from 'civic-ui'

const country = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <Select v-model="country" label="Country" placeholder="Select a country" :options="['United States', 'Germany', 'Switzerland']" />
  </div>
</template>
```

## Object options, required & hint

`options` also accepts `{ value, label }` objects when the stored value should differ from the displayed text. Combine with `required` and `hint` for a fuller form field:

```vue
<script setup>
import { ref } from 'vue'
import { Select } from 'civic-ui'

const department = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <Select
      v-model="department"
      label="Department"
      placeholder="Choose a department"
      required
      hint="Your request will be routed to this office."
      :options="[
        { value: 'building', label: 'Building Permits' },
        { value: 'waste', label: 'Waste Management' },
        { value: 'parks', label: 'Parks & Recreation' }
      ]"
    />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `string \| number` | `''` | |
| `options` | `(string \| { value, label })[]` |, (required) | Plain strings, or objects when the value should differ from the label. |
| `label` | `string` | `''` | |
| `placeholder` | `string` | `''` | Rendered as a disabled, unselectable first option. |
| `hint` | `string` | `''` | Hidden while `error` is set. |
| `error` | `string` | `''` | Switches the field into its invalid state and replaces the hint. |
| `required` | `boolean` | `false` | Adds a visible asterisk and `aria-required`. |
| `ariaLabel` | `string` | `''` | Accessible name used when there's no visible `label`: a label-less select must have one or the other. |

Attributes that aren't props (`name`, `autocomplete`, `data-*`, listeners) are applied to the native `<select>`; `class`/`style` stay on the wrapper.

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `string` | Fires on the native `change` event. |
