# FileUpload

A drag-and-drop file picker with a click-to-browse fallback and a file list with per-item remove. `v-model` is a plain array of `File` objects: this component only collects files, you wire the actual upload yourself.

## Import

```js
import { FileUpload } from 'civic-ui'
```

## Basic usage

```vue
<script setup>
import { ref } from 'vue'
import { FileUpload } from 'civic-ui'

const files = ref([])
</script>

<template>
  <div style="max-width: 480px;">
    <FileUpload v-model="files" label="Upload attachment" hint="PDF, max 10 MB" accept="application/pdf" />
  </div>
</template>
```

## Single required document

Set `multiple` to `false` to limit the picker to one file: selecting a new file replaces the current one instead of adding to a list:

```vue
<script setup>
import { ref } from 'vue'
import { FileUpload } from 'civic-ui'

const file = ref([])
</script>

<template>
  <div style="max-width: 480px;">
    <FileUpload
      v-model="file"
      label="Proof of residence"
      hint="One file, PDF or image, max 10 MB"
      accept="application/pdf,image/*"
      :multiple="false"
    />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `File[]` | `[]` | |
| `label` | `string` | `'Upload files'` | |
| `hint` | `string` | `''` | |
| `accept` | `string` | `''` | Native `accept` syntax (`.pdf,image/*,application/zip`). Passed to the file dialog **and** enforced for dropped files, which the browser doesn't filter. |
| `multiple` | `boolean` | `true` | When `false`, a new selection replaces the current file instead of appending. |
| `disabled` | `boolean` | `false` | |
| `browseLabel` | `string` | `'Choose a file'` | |
| `dropLabel` | `string` | `'or drag it here'` | |
| `maxSize` | `number` | `0` | Maximum size per file in bytes; `0` means no limit. |
| `maxFiles` | `number` | `0` | Maximum number of files in the list (`multiple` only); `0` means no limit. |
| `error` | `string` | `''` | Error text under the drop zone; sets `aria-invalid` and `aria-errormessage` on the file input. |
| `required` | `boolean` | `false` | Shows `*` after the label and sets `required` on the input. |
| `showRejections` | `boolean` | `true` | Names every refused file and the reason under the drop zone. Set `false` to show your own message from the `reject` event. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `update:modelValue` | `File[]` | Fires when files are added (via picker or drop) or removed. |
| `reject` | `{ file, reason }[]` | Files that were left out, `reason` is `'type'` (doesn't match `accept`), `'size'` (over `maxSize`) or `'count'` (over `maxFiles`). Shown on screen by default (`showRejections`). Client-side checks never replace server-side validation. |

## Accessibility notes

- Refused files are listed with their reason in a `role="status"` region that is always in the DOM, so screen readers announce it (WCAG 3.3.1, 4.1.3); the messages are also part of the input's description.
- `hint`, `error` and the refusal messages are tied to the file input via `aria-describedby`.
- After a file is removed, focus moves to the next file's remove button, or back to the file input when it was the last one (WCAG 2.4.3).
