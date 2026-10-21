# TagInput

Free-text tag/chip entry. Type a value and press Enter or comma to add it as a tag; Backspace on an empty field removes the last tag. `v-model` is a plain array of strings.

## Import

```js
import { TagInput } from 'civic-ui'
```

## Basic usage

```vue
<script setup>
import { ref } from 'vue'
import { TagInput } from 'civic-ui'

const tags = ref(['design-system', 'vue'])
</script>

<template>
  <div style="max-width: 420px;">
    <TagInput v-model="tags" label="Tags" />
  </div>
</template>
```

## Disabled / read-only

Set `disabled` to show existing tags without allowing new ones to be added or removed, for example, keywords already submitted with a request:

```vue
<script setup>
import { ref } from 'vue'
import { TagInput } from 'civic-ui'

const keywords = ref(['road-closure', 'district-4'])
</script>

<template>
  <div style="max-width: 420px;">
    <TagInput v-model="keywords" label="Submitted keywords" disabled />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `string[]` | `[]` | |
| `label` | `string` | `''` | |
| `placeholder` | `string` | `'Type and press Enter…'` | Hidden once at least one tag is present. |
| `disabled` | `boolean` | `false` | |
| `maxLength` | `number` | `100` | Longest allowed tag (also the field's `maxlength`); `0` = no limit. |
| `maxTags` | `number` | `0` | Most tags in the list; `0` = no limit. |
| `validate` | `(value: string) => boolean` | | Return `false` to refuse a tag (e.g. an email-address format check). |
| `ariaLabel` | `string` | `''` | Accessible name when there's no visible `label`. Without both, the catalog text `tagInput.label` ("Tags") is used. |
| `hint` | `string` | `''` | Help text under the field, tied via `aria-describedby`. |
| `error` | `string` | `''` | Error text; replaces the hint, sets `aria-invalid` and `aria-errormessage`. |
| `showRejections` | `boolean` | `true` | Names a refused tag and the reason under the field. Set `false` to show your own message from the `reject` event. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `string[]` | Fires whenever a tag is added or removed. |
| `reject` | `{ value, reason }` | A tag was refused, `reason` is `'length'`, `'count'` or `'invalid'`. The draft stays in the field so the visitor can fix it; the reason is shown on screen by default (`showRejections`). |

## Accessibility notes

- The field always has an accessible name: `label`, else `ariaLabel`, else "Tags" from the i18n catalog (WCAG 4.1.2). Prefer a visible `label`.
- The tags are a list (`<ul>`), so screen readers announce how many there are.
- A refused tag is named with its reason in an always-present `role="status"` region (WCAG 3.3.1, 4.1.3).
- After removing a tag with its × button, focus returns to the text field (WCAG 2.4.3).
