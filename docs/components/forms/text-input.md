# TextInput

The one text-entry field in Civic UI: a plain text field, a textarea (`multiline`) or a floating-label field (`floating`). All variants share the same `v-model` / `label` / `hint` / `error` / `required` contract used across every form field.

## Import

```js
import { TextInput } from 'civic-ui'
```

## Basic usage

A text field needs a `v-model` and a `label`:

```vue
<script setup>
import { ref } from 'vue'
import { TextInput } from 'civic-ui'

const caseNumber = ref('')
</script>

<template>
  <TextInput v-model="caseNumber" label="Case number" />
</template>
```

## With a placeholder and hint

`placeholder` shows example input, `hint` shows persistent helper text below the field:

```vue
<script setup>
import { ref } from 'vue'
import { TextInput } from 'civic-ui'

const email = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <TextInput v-model="email" label="Email" type="email" placeholder="you@example.com" hint="We will never share this." />
  </div>
</template>
```

## Multiline

Set `multiline` to render a `<textarea>` instead of an `<input>`. `rows` controls its height (default `4`):

```vue
<script setup>
import { ref } from 'vue'
import { TextInput } from 'civic-ui'

const message = ref('')
</script>

<template>
  <div style="max-width: 420px;">
    <TextInput v-model="message" multiline label="Message" placeholder="Your message" />
  </div>
</template>
```

## Floating label

Set `floating` for a label that sits inside the control until the field is focused or filled, then floats up above the text:

```vue
<script setup>
import { ref } from 'vue'
import { TextInput } from 'civic-ui'

const email = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <TextInput v-model="email" floating label="Email address" type="email" />
  </div>
</template>
```

## Required field with an error

`required` marks the field and adds an asterisk next to the label. Set `error` to switch the field into its invalid state and show a validation message in place of the hint:

```vue
<script setup>
import { ref } from 'vue'
import { TextInput } from 'civic-ui'

const caseNumber = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <TextInput
      v-model="caseNumber"
      label="Case number"
      required
      error="Enter the case number shown on your notice."
    />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `string \| number` | `''` | |
| `label` | `string` | `''` | |
| `type` | `string` | `'text'` | Native input type, e.g. `email`, `tel`. Ignored when `multiline` is set. |
| `placeholder` | `string` | `''` | With `floating`, shown only once the label has floated up (focused and still empty): the label itself takes the placeholder's spot. |
| `hint` | `string` | `''` | Hidden while `error` is set. |
| `error` | `string` | `''` | Switches the field into its invalid state and replaces the hint. |
| `required` | `boolean` | `false` | Adds a visible asterisk and `aria-required`. |
| `disabled` | `boolean` | `false` | |
| `autocomplete` | `string` | | Passed through to the native `autocomplete` attribute. |
| `multiline` | `boolean` | `false` | Renders a `<textarea>`. |
| `rows` | `number` | `4` | `multiline` only. |
| `floating` | `boolean` | `false` | Floating label layout. Combines with `multiline` (floating-label textarea); `hint` and `autocomplete` work the same as in the default layout. |

## Attributes

Attributes that aren't props (`name`, `maxlength`, `minlength`, `pattern`, `inputmode`, `spellcheck`, `data-*`, listeners) are applied to the native `<input>`/`<textarea>`, so native constraint validation and form submits work. `class` and `style` stay on the outer wrapper.

```vue
<TextInput v-model="zip" label="Postcode" name="zip" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" />
```

## Floating label sizing

The floating layout reads optional custom properties, so a denser or larger field is a single override on a wrapper instead of re-positioning the label: `--cui-floating-height` (`5.6rem`), `--cui-floating-padding-top` (`2rem`), `--cui-floating-padding-x` (`1.4rem`), `--cui-floating-padding-bottom` (`0.6rem`), `--cui-floating-label-top` (`1.8rem`), `--cui-floating-label-shift` (`-1rem`) and `--cui-floating-font-size` (`1.5rem`).

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `string` | Fires on every `input` event. |
