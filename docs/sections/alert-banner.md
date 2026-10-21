# AlertBanner

A full-width, page-top announcement strip for a maintenance notice or a service disruption, placed above `SiteHeader`. It's distinct from the inline `Alert` component, which lives inside page content. `variant="neutral"` combined with `fixed` and a custom `#icon` slot gives a quiet, non-dismissible official identity strip instead of a notice.

## Import

```js
import { AlertBanner } from 'civic-ui'
```

## Basic usage

`text` is the only required prop. The default `warning` variant renders a warning-triangle icon and a dismiss button:

```vue
<script setup>
import { AlertBanner } from 'civic-ui'
</script>

<template>
  <AlertBanner
    variant="info"
    text="City offices will be closed on October 3 for a public holiday."
    :action="{ label: 'View opening hours', href: '#' }"
  />
</template>
```

## Quiet identity strip

Set `variant="neutral"`, turn off `dismissible`, and add `fixed` to keep the banner sticky above a sticky header. Swap in a custom icon via the `icon` slot for an official identity strip:

```vue
<script setup>
import { AlertBanner } from 'civic-ui'
</script>

<template>
  <AlertBanner variant="neutral" :dismissible="false" fixed text="Nordholm Resident Portal">
    <template #icon>
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <path
          d="M10 2.2l6.8 3v4.6c0 4.2-2.7 7.6-6.8 8.9-4.1-1.3-6.8-4.7-6.8-8.9V5.2l6.8-3z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linejoin="round"
        />
        <path d="M7 10l2.2 2.2L13.4 8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </template>
  </AlertBanner>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | `string` | | Required. |
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger' \| 'neutral'` | `'warning'` | `info`/`success`/`danger` use white text on a saturated background; `warning`/`neutral` keep dark text. |
| `action` | `{ label, href, newTab? }` | | Renders an inline link-styled button after the text. |
| `dismissible` | `boolean` | `true` | Shows the close button and lets visitors collapse the banner. |
| `dismissLabel` | `string` | `'Dismiss notice'` | Accessible label for the close button. |
| `fixed` | `boolean` | `false` | Sticky above a sticky header. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment of the banner message. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `dismiss` | | Fires when the visitor closes the banner via the close button. |

## Slots

| Slot | Notes |
|---|---|
| `icon` | Replaces the default warning-triangle icon. |
| `default` | Extra inline content rendered after the text and before the action button. |

## Accessibility notes

`warning` and `danger` render with `role="alert"` (assertive: interrupts screen reader output immediately); `info`, `success`, and `neutral` use the less intrusive `role="status"` (polite: announced at the next pause). This follows WCAG 4.1.3 (Status Messages): reserve the interrupting roles for content that genuinely needs immediate attention.
