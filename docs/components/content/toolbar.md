# Toolbar

A layout primitive, not a styled widget: a row that keeps a search/filter cluster on one side and actions on the other, and stacks cleanly on narrow screens. Drop `TextInput`, `Select`, `SearchField`, or `AppButton` into its `start` and `end` slots.

## Import

```js
import { Toolbar } from 'civic-ui'
```

## Basic usage

A search field on the left, a primary action on the right:

```vue
<script setup>
import { AppButton, SearchField, Toolbar } from 'civic-ui'
</script>

<template>
  <Toolbar>
    <template #start>
      <SearchField size="sm" placeholder="Filter items…" />
    </template>
    <template #end>
      <AppButton variant="primary" size="sm">New item</AppButton>
    </template>
  </Toolbar>
</template>
```

## With multiple filters & actions

Both slots hold as many controls as needed: they wrap onto their own line on narrow screens by default:

```vue
<script setup>
import { AppButton, Select, SearchField, Toolbar } from 'civic-ui'
</script>

<template>
  <Toolbar>
    <template #start>
      <SearchField size="sm" placeholder="Search applications…" />
      <Select
        :options="[{ value: '', label: 'All statuses' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }]"
      />
    </template>
    <template #end>
      <AppButton variant="outline" size="sm">Export CSV</AppButton>
      <AppButton variant="primary" size="sm">New application</AppButton>
    </template>
  </Toolbar>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `wrap` | `boolean` | `true` | Allow the `start`/`end` clusters to wrap onto multiple lines on narrow screens. Set `false` to force a single row (with horizontal scroll if it overflows). |

## Slots

| Slot | Notes |
|---|---|
| `start` | The search/filter cluster, left-aligned. |
| `end` | The actions cluster, right-aligned. |
