# Toast

A global toast notification system: a shared queue driven by the `useToast()` composable, rendered by a single `<ToastContainer />` mounted once near your app root. Call `useToast()` from anywhere (a form handler, a page, a store) to push a message onto the queue; `ToastContainer` renders each queued message using the `Toast` component internally, which is also exported directly for the rare case where you need to render one outside the queue.

## Import

```js
import { ToastContainer, useToast } from 'civic-ui'
```

## Basic usage

Mount `<ToastContainer />` once, then call `useToast()` to push a message from a click handler or anywhere else in the app:

```vue
<script setup>
import { AppButton, ToastContainer, useToast } from 'civic-ui'

const toast = useToast()
</script>

<template>
  <ToastContainer />
  <AppButton @click="toast.push('Your request has been submitted.')">Show notification</AppButton>
</template>
```

## Variants & titles

`push` accepts a `variant` and an optional `title`; the shorthand methods (`success`/`danger`/`warning`/`info`) set the variant for you:

```vue
<script setup>
import { AppButton, ToastContainer, useToast } from 'civic-ui'

const toast = useToast()
</script>

<template>
  <ToastContainer />
  <div class="cui-cluster">
    <AppButton variant="outline" @click="toast.info('This is an info toast.')">Show info toast</AppButton>
    <AppButton variant="outline" @click="toast.success('Saved successfully.', { title: 'Success' })">Show success toast</AppButton>
    <AppButton variant="outline" @click="toast.danger('Your changes could not be saved.', { title: 'Error' })">Show error toast</AppButton>
  </div>
</template>
```

## The `useToast()` composable

`useToast()` returns the same shared queue everywhere it's called: there is exactly one toast queue for the whole app, no matter how many times or where you call it:

```js
const toast = useToast()

toast.push('Message', { variant: 'info', title: '', duration: 10000 })
toast.success('Saved.')
toast.danger('Failed.')
toast.warning('Careful.')
toast.info('FYI.')

toast.dismiss(id) // remove a toast before its timer fires
```

| Method | Signature | Notes |
|---|---|---|
| `push` | `(message, { variant?, title?, duration? }) => id` | `variant` defaults to `'info'`. `duration` (ms) defaults to `0`, no auto-close, for `danger`/`warning`, and to the configured duration (10 s) for the others; any auto-closing duration is raised to the configured minimum (10 s). `duration: 0` always means "only dismissed manually". Returns the new toast's id. |
| `success` / `danger` / `warning` / `info` | `(message, options?) => id` | Shorthand for `push` with `variant` preset; `options` accepts `title`/`duration`. |
| `dismiss` | `(id) => void` | Removes a toast immediately and clears its timer. |
| `pause` / `resume` | `(id) => void` | Stops/restarts a toast's auto-dismiss timer. `ToastContainer` already wires these to hover and focus, so you rarely call them directly. |
| `toasts` | reactive array | The live queue, `{ id, message, variant, title }[]`, as rendered by `ToastContainer`. |

### `configureToast({ duration?, minDuration? })`

App-wide timing, e.g. from a user setting "keep notifications open":

```js
import { configureToast } from 'civic-ui'

configureToast({ duration: 0 }) // no toast closes on its own
configureToast({ duration: 15000, minDuration: 12000 })
configureToast() // back to the defaults: { duration: 10000, minDuration: 10000 }
```

`duration` applies to toasts that don't pass their own (urgent variants still default to `0`); `minDuration` is the floor every auto-closing toast is raised to. Both are milliseconds ≥ 0; returns the resulting settings.

Requires a `<ToastContainer />` mounted somewhere in the app, `useToast()` manages the queue, but nothing renders until a container is present.

## Props

**`ToastContainer`**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` | Corner the toast stack anchors to. |

**`Toast`**: rendered internally by `ToastContainer` for each queued message. Render it directly only if you're building your own queue outside `useToast()`.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | |
| `title` | `string` | | Optional bold heading above the message. |
| `live` | `boolean` | `true` | Whether the toast is its own live region (`role="alert"`/`"status"`). `ToastContainer` sets it to `false` and provides the live regions itself. |

## Events

**`Toast`**

| Event | Payload | Notes |
|---|---|---|
| `dismiss` | | Fires when its close button is clicked. `ToastContainer` handles this for you by calling `useToast().dismiss(id)`. |

## Slots

**`Toast`**

| Slot | Notes |
|---|---|
| `default` | The message body. `ToastContainer` fills this with the queued message text. |

## Accessibility notes

- **Announcements (WCAG 4.1.3).** Many screen readers only announce changes inside a live region that already existed. `ToastContainer` therefore always renders two live regions (`aria-live="assertive"` for `warning`/`danger`, `aria-live="polite"` for the rest) even while empty, and renders each toast into the matching one. Urgent toasts stack above the others. A standalone `Toast` (outside the container) keeps its own `role="alert"`/`"status"`.
- **Timing (WCAG 2.2.1).** A toast that vanishes on its own is a time limit on reading it, and pausing on hover/focus alone isn't enough (a screen-reader user never hovers it). So `danger` and `warning` toasts stay until dismissed, every other auto-closing toast lasts at least 10 s, and `configureToast({ duration: 0 })` lets an app offer its users "never close automatically". Hovering or focusing a toast still pauses its timer.
- **Variant in words.** Like `Alert`, each toast starts with a visually hidden prefix ("Error:", "Warning:", "Success:", "Information:"), because its variant is otherwise only a color. Same `alert.prefix.*` locale keys as `Alert`.
- **Never put important content only in a toast.** Errors that block the user, and anything they need to act on later, belong on the page as well (e.g. an `Alert` next to the form).
