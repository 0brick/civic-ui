# Checkbox

A checkbox whose `v-model` accepts either a plain boolean, or, once you set a `value` prop, participates in an array-valued group `v-model` exactly like native checkboxes with the same `name`.

## Import

```js
import { Checkbox } from 'civic-ui'
```

## Basic usage

A single checkbox with a plain boolean `v-model`:

```vue
<script setup>
import { ref } from 'vue'
import { Checkbox } from 'civic-ui'

const subscribed = ref(false)
</script>

<template>
  <Checkbox v-model="subscribed" label="Email me about service updates" />
</template>
```

## Array-valued group

Give each checkbox a `value` and bind the same array to all of them: checking a box adds its `value` to the array, unchecking removes it:

```vue
<script setup>
import { ref } from 'vue'
import { Checkbox } from 'civic-ui'

const agree = ref(false)
const selected = ref([])
</script>

<template>
  <div class="cui-stack" style="max-width: 360px;">
    <Checkbox v-model="agree" label="I agree to the terms of service" />
    <Checkbox v-model="selected" value="a" label="Option A" />
    <Checkbox v-model="selected" value="b" label="Option B" />
  </div>
</template>
```

## Consent copy with an inline link

The default slot overrides `label` entirely, so you can mix in an inline link: useful for consent checkboxes that need to link out to a policy document:

```vue
<script setup>
import { ref } from 'vue'
import { Checkbox } from 'civic-ui'

const agreed = ref(false)
</script>

<template>
  <div style="max-width: 420px;">
    <Checkbox v-model="agreed" required>
      I have read the <a href="#">privacy policy</a> and agree to the processing of my data.
    </Checkbox>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `boolean \| array` | `false` | Plain boolean, or an array when `value` is set. |
| `value` | `string \| number \| boolean` | | Set this to opt into array-valued group mode. |
| `label` | `string` | `''` | Ignored if the default slot is used instead. |
| `required` | `boolean` | `false` | |
| `disabled` | `boolean` | `false` | |
| `hint` | `string` | `''` | Help text under the label, tied to the checkbox via `aria-describedby`. |
| `error` | `string` | `''` | Error text; replaces the hint, sets `aria-invalid` and `aria-errormessage`. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `boolean` or the updated array | Shape depends on whether `value` is set. |

## Slots

| Slot | Notes |
|---|---|
| `default` | Overrides `label`: use for consent copy that needs an inline link or other markup. |

## Accessibility notes

`hint` and `error` render under the label and are announced as the checkbox's description (WCAG 3.3.1, 3.3.2): the same contract as `TextInput`.
