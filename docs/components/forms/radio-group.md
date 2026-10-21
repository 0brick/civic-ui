# RadioGroup

A labeled set of radio buttons: a `<fieldset>` whose `<legend>` names the group, with an optional hint and error message under the options. Put [`Radio`](radio.md)s in the default slot or pass `options`; `v-model` is the selected value.

## Import

```js
import { RadioGroup, Radio } from 'civic-ui'
```

## Basic usage

```vue
<script setup>
import { ref } from 'vue'
import { RadioGroup } from 'civic-ui'

const contact = ref('mail')
</script>

<template>
  <RadioGroup
    v-model="contact"
    legend="How should we contact you?"
    :options="[
      { value: 'mail', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'post', label: 'Letter', disabled: true }
    ]"
    hint="We only use this for your request."
  />
</template>
```

## Slotted radios and validation

The radios inside take `name`, the checked state, `required` and the error state from the group, so they need only `value` and `label`:

```vue
<script setup>
import { computed, ref } from 'vue'
import { RadioGroup, Radio } from 'civic-ui'

const slot = ref(null)
const submitted = ref(false)
const error = computed(() => (submitted.value && !slot.value ? 'Choose a time slot.' : ''))
</script>

<template>
  <RadioGroup v-model="slot" legend="Time slot" required inline :error="error">
    <Radio value="09:00" label="09:00" />
    <Radio value="10:00" label="10:00" />
    <Radio value="11:00" label="11:00" />
  </RadioGroup>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `string \| number \| boolean` | `null` | The selected value. |
| `legend` | `string` |, (required) | The group's visible name. |
| `name` | `string` | `''` | Shared `name` of the radios; a unique one is generated when empty. |
| `options` | `{ value, label, disabled? }[] \| string[]` | `[]` | Renders the radios; ignored when the default slot is used. |
| `hint` | `string` | `''` | Help text under the options. |
| `error` | `string` | `''` | Error text; replaces the hint and marks the group invalid. |
| `required` | `boolean` | `false` | Shows `*` in the legend and sets `required` on the radios. |
| `disabled` | `boolean` | `false` | Disables the whole fieldset. |
| `inline` | `boolean` | `false` | Options in a wrapping row instead of a column. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | the selected radio's `value` | |

## Slots

| Slot | Notes |
|---|---|
| `default` | `Radio` components; overrides `options`. |

## Accessibility notes

The `<fieldset>` carries `role="radiogroup"`, so the group itself can expose `aria-required`, `aria-invalid` and `aria-errormessage`; it is named by its legend (`aria-labelledby`) and described by the hint or error (`aria-describedby`): WCAG 1.3.1, 3.3.1, 3.3.2. Each radio in an invalid group also gets `aria-invalid="true"`.
