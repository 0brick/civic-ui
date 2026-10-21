# AppointmentSection

A request/appointment form paired with a dark "prefer to reach us directly" panel: the two-track pattern for a service a citizen books or requests, such as a counter appointment or a site visit. It's distinct from `TeaserGrid`'s `itemVariant="person"` press-office contact grid, which is for reaching people rather than booking a service. The form is local and uncontrolled: it collects name, contact details, address, and a message, then emits `submit` with the values: the actual request and its `status` (`idle | sending | success | error`) are owned by the consuming app.

## Import

```js
import { AppointmentSection } from 'civic-ui'
```

## Basic usage

`title` is the only required prop. Everything else (labels, the direct-contact panel, status handling) is optional and defaults sensibly:

```vue
<script setup>
import { AppointmentSection } from 'civic-ui'
</script>

<template>
  <AppointmentSection title="Book a counter appointment" />
</template>
```

## With status handling and direct-contact panel

Pass `status` to reflect the request's lifecycle (the form's submit button shows a loading state and, on success or error, an `Alert` appears) and `contactMethods` to fill the "prefer to reach out directly?" panel:

```vue
<script setup>
import { ref } from 'vue'
import { AppointmentSection } from 'civic-ui'

const status = ref('idle')

function handleSubmit() {
  status.value = 'sending'
  setTimeout(() => {
    status.value = 'success'
  }, 900)
}
</script>

<template>
  <AppointmentSection
    eyebrow="Resident Services"
    title="Book a counter appointment"
    intro="A few details about your request are enough: we'll confirm a time slot by email."
    :status="status"
    privacy-href="#"
    :contact-methods="[
      { label: 'residents@nordholm.example', href: 'mailto:residents@nordholm.example' },
      { label: '+49 30 000000', href: 'tel:+4930000000' }
    ]"
    @submit="handleSubmit"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | | Required. |
| `eyebrow` | `string` | `''` | |
| `intro` | `string` | `''` | |
| `align` | `'left' \| 'center' \| 'right'` | `'center'` | Alignment of the `eyebrow`/`title`/`intro` head above the form. |
| `status` | `'idle' \| 'sending' \| 'success' \| 'error'` | `'idle'` | Drives the submit button's loading state and which `Alert`, if any, appears below the form. |
| `submitLabel` | `string` | `'Request appointment'` | |
| `sendingLabel` | `string` | `'Sending…'` | Shown on the submit button while `status === 'sending'`. |
| `successMessage` | `string` | `"Thanks: we'll be in touch shortly with a proposed time."` | |
| `errorMessage` | `string` | `'Something went wrong sending your request. Please try again or contact us directly.'` | |
| `privacyText` | `string` | `'I have read the'` | Text before the privacy-policy link in the required consent checkbox. |
| `privacyLinkLabel` | `string` | `'privacy policy'` | |
| `privacyHref` | `string` | `'#'` | |
| `directTitle` | `string` | `'Prefer to reach out directly?'` | Heading of the dark contact panel. |
| `contactMethods` | `{ label, href, icon? }[]` | `[]` | Links in the direct-contact panel. `icon` is raw SVG markup rendered via `v-html`, routed through `sanitizeHtml()`: author it yourself, never pass unsanitized CMS/API data (see [Security](../security.md)). |
| `labels` | `{ name?, phone?, email?, street?, houseNumber?, zip?, city?, message? }` | `{}` | Overrides individual field labels, e.g. `:labels="{ name: 'Nom' }"`, without needing to translate the rest of the form. |
| `messagePlaceholder` | `string` | `'Property, request and preferred timing'` | |
| `zipPattern` | `string` | `''` | Native `pattern` for the postcode, e.g. `'[0-9]{5}'` for Germany. None by default, since formats differ by country. |
| `messageMaxLength` | `number` | `2000` | `maxlength` of the message field; `0` = no limit. The other fields carry fixed bounds (name/street/city 100, phone 30, email 254, house number/postcode 10) and a `name` attribute each. |

## Events

| Event | Payload | Notes |
|---|---|---|
| `submit` | `{ name, email, phone, street, houseNumber, zip, city, message, privacyAccepted }` | Fires on form submit with the collected field values; the component does not send the request itself. Fires once per request: the form stays locked until `status` changes, or for 3 seconds if you don't drive `status`. |

### CSRF and server-side validation

The form never posts by itself: your `submit` handler sends the request, so it is also where a CSRF token (synchronizer token, or a double-submit cookie header) goes, e.g. `fetch('/api/appointments', { method: 'POST', headers: { 'X-CSRF-Token': token }, body: JSON.stringify(values) })`. The field bounds above are client-side conveniences; validate every value again on the server.

## Accessibility notes

Address and contact fields carry standard `autocomplete` tokens (`name`, `tel`, `email`, `address-line1`, `postal-code`, `address-level2`), so browsers and password managers can autofill them correctly (WCAG 1.3.5). The house number has none on purpose: HTML has no token for it, and `address-line2` means the address supplement (c/o, floor), which autofill would put there instead. The `successMessage`/`errorMessage` alerts are rendered into a `role="status"` region that is always in the page, so screen readers announce the outcome when it appears (a live region inserted together with its message often isn't announced).

A visible hint above the first field explains the `*` marking of required fields (catalog key `appointment.requiredHint`, WCAG 3.3.2). While sending, the submit button stays focusable (`aria-disabled` instead of `disabled`), so keyboard focus isn't dropped to the top of the page (WCAG 2.4.3).
