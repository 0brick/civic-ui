# InputGroup

Wraps a control with prepend and/or append addons (a currency symbol, a URL prefix, a unit) that visually share one border with the control instead of sitting beside it as separate elements.

## Import

```js
import { InputGroup } from 'civic-ui'
```

## Basic usage

`InputGroup` doesn't render its own `<input>`: you supply one through the default slot. The slot is scoped with `{ id }` so you can bind it to your control's `id`, keeping the visible `label` programmatically associated with it:

```vue
<script setup>
import { InputGroup } from 'civic-ui'
</script>

<template>
  <div style="max-width: 360px;">
    <InputGroup label="Website">
      <template #prepend>https://</template>
      <template #default="{ id }">
        <input :id="id" type="text" placeholder="example.com" />
      </template>
    </InputGroup>
  </div>
</template>
```

## Prepend and append together

Use both the `prepend` and `append` slots at once, for example to frame a case reference number between a fixed prefix and a year suffix:

```vue
<script setup>
import { InputGroup } from 'civic-ui'
</script>

<template>
  <div style="max-width: 360px;">
    <InputGroup label="Case reference">
      <template #prepend>AZ-</template>
      <template #default="{ id }">
        <input :id="id" type="text" placeholder="4471" />
      </template>
      <template #append>/2026</template>
    </InputGroup>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | `''` | |

## Slots

| Slot | Notes |
|---|---|
| `prepend` | Addon rendered before the control. |
| `default` | Scoped with `{ id }`: the control itself, usually a plain `<input>` or `<select>`. Bind `:id="id"` so the `label` stays associated with it. |
| `append` | Addon rendered after the control. |
