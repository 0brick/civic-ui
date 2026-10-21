# Alert

An inline banner for messages tied to a specific piece of content or a page's current state: form validation summaries, save confirmations, maintenance notices. For a global, self-dismissing notification queue, use [Toast](./toast.md) instead.

## Import

```js
import { Alert } from 'civic-ui'
```

## Basic usage

An alert needs nothing but its message:

```vue
<script setup>
import { Alert } from 'civic-ui'
</script>

<template>
  <Alert>The registry office will be closed on public holidays.</Alert>
</template>
```

## Variants & dismissible

Four severity variants, an optional `title`, and a `dismissible` close button:

```vue
<script setup>
import { Alert } from 'civic-ui'
</script>

<template>
  <div class="cui-stack">
    <Alert variant="info" title="Notice">This is an informational alert.</Alert>
    <Alert variant="success" dismissible>Your changes have been saved.</Alert>
    <Alert variant="warning">Please review the highlighted fields.</Alert>
    <Alert variant="danger">Something went wrong while submitting the form.</Alert>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | `'info'` | |
| `title` | `string` | | Optional bold heading above the body. |
| `dismissible` | `boolean` | `false` | Shows a close button that hides the alert. |
| `live` | `boolean` | `true` | Whether the alert is its own live region (`role="alert"`/`"status"`). Set `false` when you render it inside a live region of your own (see below). |
| `focusTarget` | `string \| HTMLElement` | `null` | Where focus goes when the close button had focus and the alert is dismissed: an element or a CSS selector. A non-focusable target gets `tabindex="-1"`. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `dismiss` | | Fires when the close button is clicked, after the alert hides itself. Without `focusTarget`, use it to move focus somewhere sensible: the close button is gone. |

## Slots

| Slot | Notes |
|---|---|
| `default` | The alert body. |

## Accessibility notes

`warning` and `danger` alerts render with `role="alert"` (assertive), so screen readers announce them immediately, interrupting whatever they're currently reading. `info`, `success`, and `neutral` alerts use `role="status"` (polite) instead, so they announce only once the screen reader is free. Reserve `warning`/`danger` for messages that genuinely need to interrupt.

The variant is otherwise only color and an `aria-hidden` icon, so it is also said in words: a visually hidden prefix ("Warning:", "Error:", "Success:", "Information:") starts the title, or the body when there is no title. `neutral` has none. The texts are the `alert.prefix.*` keys of the locale catalog (German: „Warnung:", „Fehler:", „Erfolg:", „Information:").

### Messages that appear after an action

An `Alert` inserted with `v-if` *together with* its role is often not announced: many screen readers only report changes inside a live region that was already in the page. For a success/error message after a submit, keep an always-rendered region and switch only its content:

```vue
<div role="status">
  <Alert v-if="status === 'success'" variant="success" :live="false">Request sent.</Alert>
  <Alert v-else-if="status === 'error'" variant="danger" :live="false">Something went wrong.</Alert>
</div>
```

`AppointmentSection` does exactly this.

### Focus after dismissing

A dismissed alert takes its close button with it. If that button had focus, keyboard focus would fall back to the start of the page (WCAG 2.4.3). Pass `focusTarget`, e.g. the heading or form the alert belongs to, or set focus yourself in the `dismiss` handler:

```vue
<Alert dismissible focus-target="#results-heading">Filters were reset.</Alert>
```
