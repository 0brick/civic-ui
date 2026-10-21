# NewsletterSection

A subscribe block for a newsletter callout: typically placed near the footer. It manages its own email input locally and emits `submit` with the entered address; hook that up to whatever backend the consuming project uses.

## Import

```js
import { NewsletterSection } from 'civic-ui'
```

## Basic usage

Every prop is optional, `title` defaults to "Newsletter":

```vue
<script setup>
import { NewsletterSection } from 'civic-ui'
</script>

<template>
  <NewsletterSection title="Newsletter" />
</template>
```

## With description and submit handling

Add `text` for a short lead-in, and listen for `submit` to send the address to your own backend:

```vue
<script setup>
import { NewsletterSection, ToastContainer, useToast } from 'civic-ui'

const toast = useToast()
</script>

<template>
  <ToastContainer />
  <NewsletterSection
    title="Nordholm Newsletter"
    text="The most important city news, once a month: no spam."
    @submit="(addr) => toast.success(`Subscribed: ${addr}`)"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `'Newsletter'` | |
| `text` | `string` | `''` | |
| `label` | `string` | `'Email address'` | Field label. |
| `placeholder` | `string` | `'you@example.com'` | |
| `submitLabel` | `string` | `'Subscribe'` | |

## Events

| Event | Payload | Notes |
|---|---|---|
| `submit` | `string` | Fires on form submit with the entered email address; the component does not send it anywhere itself. Fires at most once per 3 seconds, so a double click can't sign up twice: attach your CSRF token in the handler, as with [AppointmentSection](appointment-section.md#csrf-and-server-side-validation). |

## Accessibility notes

During the 3-second submit cooldown the button is blocked with `aria-disabled` rather than the native `disabled` attribute, so it keeps keyboard focus (WCAG 2.4.3).
