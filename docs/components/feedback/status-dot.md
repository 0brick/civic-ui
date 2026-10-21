# StatusDot

A compact presence/state indicator: a colored dot plus an optional label. Lighter-weight than [Badge](./badge.md) for table cells, status lists, and dashboard rows where a pill shape would be too heavy.

## Import

```js
import { StatusDot } from 'civic-ui'
```

## Basic usage

Pass a `status` and a `label`:

```vue
<script setup>
import { StatusDot } from 'civic-ui'
</script>

<template>
  <StatusDot status="online" label="Online" />
</template>
```

## All statuses

Presence states (`online`/`offline`/`busy`/`away`) alias onto the same color tokens as the generic severities (`success`/`warning`/`danger`), so pick whichever name reads more naturally at the call site. `pulse` adds an animated ping for "live" states:

```vue
<script setup>
import { StatusDot } from 'civic-ui'
</script>

<template>
  <div class="cui-cluster">
    <StatusDot status="online" label="Online" />
    <StatusDot status="busy" label="Busy" pulse />
    <StatusDot status="away" label="Away" />
    <StatusDot status="offline" label="Offline" />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `status` | `'neutral' \| 'online' \| 'offline' \| 'busy' \| 'away' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | `online`/`success` and `busy`/`danger` and `away`/`warning` share color tokens in pairs. |
| `label` | `string` | | Text next to the dot. Omit it to render just the dot on its own. |
| `pulse` | `boolean` | `false` | Animated ping, for "live" states. |
