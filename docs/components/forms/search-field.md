# SearchField

The pill-shaped site-search pattern: an icon, a text field, and a submit button in one control. Submitting the form emits a `search` event instead of navigating anywhere itself, so the host page decides what to do with the query.

## Import

```js
import { SearchField } from 'civic-ui'
```

## Basic usage

`SearchField` works with just a `v-model`:

```vue
<script setup>
import { ref } from 'vue'
import { SearchField } from 'civic-ui'

const query = ref('')
</script>

<template>
  <div style="max-width: 360px;">
    <SearchField v-model="query" placeholder="Search this site…" />
  </div>
</template>
```

## Handling the search event

Listen for `search` to route to a results page or filter data in place: it fires with the current query string when the form is submitted:

```vue
<script setup>
import { SearchField, useToast, ToastContainer } from 'civic-ui'

const toast = useToast()
</script>

<template>
  <ToastContainer />
  <div style="max-width: 360px;">
    <SearchField placeholder="Search this site…" @search="(q) => toast.info(`Search: ${q}`)" />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `string` | `''` | |
| `label` | `string` | `'Search'` | Visually hidden but read by screen readers; also names the `search` landmark. |
| `placeholder` | `string` | `'Enter search term…'` | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `maxlength` | `number` | `256` | Native `maxlength` of the query field; `0` = no limit. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `string` | Fires on every `input` event. |
| `search` | `string` | Fires on form submit, with the current query. |

## Accessibility

- The form is a `role="search"` landmark named by `label`, and the same text labels the field and the submit button.
- With more than one `SearchField` on a page (a site search in the header and a filter above a table, say) give each its own `label` (`"Search the site"`, `"Filter tickets"`). Two landmarks with the same name can't be told apart in a screen reader's landmark list.
