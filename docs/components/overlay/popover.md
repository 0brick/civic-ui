# Popover

A click-triggered overlay for richer content than `Tooltip` handles: a heading plus a body. Use it for contextual help, inline explanations, or small pieces of secondary information attached to a control.

## Import

```js
import { Popover } from 'civic-ui'
```

## Basic usage

The `trigger` slot is scoped with `open`, `toggle`, and `panelId`: bind `aria-expanded` and `aria-controls` on your trigger element so assistive tech knows what it controls:

```vue
<script setup>
import { AppButton, Popover } from 'civic-ui'
</script>

<template>
  <Popover title="More information">
    <template #trigger="{ open, panelId }">
      <AppButton variant="outline" :aria-expanded="String(open)" aria-haspopup="dialog" :aria-controls="panelId">Click me</AppButton>
    </template>
    <p>Rich popover content can go here, including links and buttons.</p>
  </Popover>
</template>
```

## Contextual help on a form field

A common pattern: a small "?" trigger next to a field label, with `placement="right"` so it doesn't cover the field itself:

```vue
<script setup>
import { Popover } from 'civic-ui'
</script>

<template>
  <p style="display: flex; align-items: center; gap: 8px; margin: 0;">
    <span style="font-weight: 600;">Tax identification number</span>
    <Popover title="Where do I find this?" placement="right">
      <template #trigger="{ open, panelId }">
        <button
          type="button"
          class="cui-popover-help-trigger"
          :aria-expanded="String(open)"
          aria-haspopup="dialog"
          :aria-controls="panelId"
          aria-label="Help: where to find your tax identification number"
        >?</button>
      </template>
      <p>Your 11-digit tax ID is printed on your income tax assessment notice and on any letter from your local tax office.</p>
    </Popover>
  </p>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `''` | Optional heading shown above the body. |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Which side of the trigger the panel appears on. |

## Slots

| Slot | Notes |
|---|---|
| `trigger` | Scoped with `{ open, toggle, panelId }`. Bind `:aria-expanded="String(open)"` and `:aria-controls="panelId"` on your trigger element. |
| `default` | The popover body. |

## Accessibility notes

The panel carries `role="dialog"` and is labelled by `title` when set (falling back to a "More information" label otherwise). Escape closes the popover and returns focus to whatever opened it; clicking outside the panel does the same. When keyboard focus moves out of the popover (Tab past its last element), it closes as well but leaves focus where the user put it (WCAG 2.4.11, 2.4.3).
