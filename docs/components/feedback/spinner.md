# Spinner

A small animated loading indicator for a button, panel, or inline loading state. For a full block of skeleton content instead, use [Placeholder](./placeholder.md).

## Import

```js
import { Spinner } from 'civic-ui'
```

## Basic usage

`Spinner` renders on its own, in one of three sizes:

```vue
<script setup>
import { Spinner } from 'civic-ui'
</script>

<template>
  <div class="cui-cluster" style="align-items: center;">
    <Spinner size="sm" />
    <Spinner />
    <Spinner size="lg" />
  </div>
</template>
```

## Inside a loading button

Compose `Spinner` into custom button content when you need a spinner with its own screen-reader label, `AppButton`'s own `loading` prop covers the common case, but a hand-built button can still use `Spinner` directly:

```vue
<script setup>
import { AppButton, Spinner } from 'civic-ui'
</script>

<template>
  <AppButton variant="primary" disabled>
    <Spinner size="sm" label="Submitting application" />
    Submitting…
  </AppButton>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `label` | `string` | `'Loading…'` | Screen-reader-only text; the spinner itself has no visible label. |
