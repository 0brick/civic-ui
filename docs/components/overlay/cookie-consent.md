# CookieConsent

A bottom-fixed consent banner with accept / reject-non-essential / customize actions, controlled with `v-model` like the other overlays. The component is presentation-only: it renders the banner and emits the visitor's choice, but doesn't persist anything or block any script by itself. Pair it with the `useCookieConsent` composable to actually gate analytics or marketing scripts on the visitor's decision.

## Import

```js
import { CookieConsent, useCookieConsent } from 'civic-ui'
```

## Basic usage

The banner needs a `v-model` to control its visibility; everything else has sensible defaults:

```vue
<script setup>
import { ref } from 'vue'
import { AppButton, CookieConsent } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <p style="margin: 0 0 12px; color: var(--cui-text-muted); font-size: 1.3rem;">
    The banner is fixed to the bottom of the browser viewport, not to this preview box. It is modal: focus stays in it until you choose.
  </p>
  <AppButton variant="outline" @click="open = true">Show cookie banner</AppButton>
  <CookieConsent v-model="open" />
</template>
```

## Non-modal

`:modal="false"` keeps the page usable behind the banner: see [Accessibility notes](#accessibility-notes) for what it then does to keep focused elements visible:

```vue
<script setup>
import { ref } from 'vue'
import { AppButton, CookieConsent } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <p style="margin: 0 0 12px; color: var(--cui-text-muted); font-size: 1.3rem;">
    Non-modal: the page stays usable behind the banner. Focused elements
    scroll above it, and Escape collapses it to one line.
  </p>
  <AppButton variant="outline" @click="open = true">Show cookie banner</AppButton>
  <CookieConsent v-model="open" :modal="false" />
</template>
```

## Persisting the visitor's choice

In a real app, wire the banner up to `useCookieConsent` so the decision survives a page reload and a "Show cookie banner again" control can reopen it:

```vue
<script setup>
import { computed } from 'vue'
import { AppButton, CookieConsent, useCookieConsent } from 'civic-ui'

// useCookieConsent persists the visitor's choice and is what a real page
// checks before loading analytics/marketing scripts: CookieConsent itself
// only renders the banner and emits the choice.
const { consent, accept, reject, reset } = useCookieConsent()
const open = computed(() => consent.value === null)
</script>

<template>
  <p style="margin: 0 0 12px; color: var(--cui-text-muted); font-size: 1.3rem;">
    This banner is fixed to the bottom of the browser viewport, not to this preview box: scroll down if you don't see it.
  </p>
  <AppButton v-if="consent" variant="outline" @click="reset">Show cookie banner again</AppButton>
  <CookieConsent :model-value="open" @accept="accept" @reject="reject" />
</template>
```

## The `useCookieConsent` composable

```js
const { consent, accept, reject, reset, hasConsent } = useCookieConsent({ version: '2026-10' })
// consent.value is null (undecided) | 'accepted' | 'rejected', persisted to localStorage
```

`consent` is a ref holding `null` until the visitor decides, then `'accepted'` or `'rejected'`, persisted to `localStorage` (falling back to in-memory state if `localStorage` throws, e.g. in a locked-down or private-browsing environment). Call `accept()` / `reject()` from `CookieConsent`'s `@accept` / `@reject` listeners, and `reset()` to clear the decision and show the banner again.

Drive the banner's visibility from `consent.value === null`, and check `consent.value === 'accepted'` before loading any analytics or marketing script anywhere in your app: that check is what actually turns the banner from a cosmetic UI element into a real consent gate:

```js
if (hasConsent('analytics')) loadAnalytics()
```

For the *Settings* action, collect the visitor's choices in your own panel and call `accept({ analytics: true, marketing: false })`, `hasConsent(category)` then only returns `true` for the granted categories. Bump `version` whenever your privacy policy changes, and decisions expire after `maxAgeDays` (default 365); both make the banner ask again. If several apps share one origin (e.g. `amt.example/a` and `/b`), give each its own `storageKey`, `localStorage` is shared origin-wide. See [Composables](../../composables.md#usecookieconsentoptions) for every option.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `modelValue` | `boolean` | `false` | Controls visibility; use with `v-model`. |
| `title` | `string` | `'Cookie settings'` | |
| `text` | `string` | `'We use cookies to run this site reliably and securely. Optional cookies help us improve the experience.'` | |
| `acceptLabel` | `string` | `'Accept all'` | |
| `rejectLabel` | `string` | `'Necessary only'` | |
| `customizeLabel` | `string` | `'Settings'` | |
| `lockScroll` | `boolean` | `false` | Locks page scroll while the banner is open. Implies `modal`. |
| `equalWeight` | `boolean` | `true` | *Accept all* and *Necessary only* share one button variant, so rejecting is offered as prominently as accepting: see [Privacy notes](#privacy-notes). `false` highlights the accept button; use it only where rejecting is offered equally prominently elsewhere. |
| `modal` | `boolean` | `true` | Modal dialog (`aria-modal="true"`): Tab stays inside the banner until a choice is made, and focus returns to where it was afterwards. `false` keeps the page usable behind the banner: see [Accessibility notes](#accessibility-notes). |

## Events

| Event | Payload | Notes |
|---|---|---|
| `accept` | | Fires when the visitor accepts all cookies. |
| `reject` | | Fires when the visitor accepts necessary cookies only. |
| `customize` | | Fires when the visitor clicks the settings action: wire this up to your own preferences panel. |
| `update:modelValue` | `boolean` | Fires with `false` after `accept` or `reject` closes the banner. |

## Privacy notes

Consent only counts if refusing is as easy as agreeing (GDPR Art. 4 No. 11 and Art. 7; the German DSK guidance and the EDPB cookie banner taskforce name a highlighted "accept" next to a pale "reject" as nudging). That is why *Accept all* and *Necessary only* are both `primary` buttons of the same size by default; *Settings* stays a quieter third option. Only set `:equal-weight="false"` if your banner offers rejecting equally prominently some other way.

Withdrawing consent must be as easy as giving it (Art. 7(3)): keep a "Cookie settings" link in your footer or on the privacy page that calls `reset()` from `useCookieConsent`, so the banner asks again.

## Accessibility notes

A bottom-fixed banner can cover whatever has keyboard focus (WCAG 2.4.11 Focus Not Obscured). That is why the banner is **modal by default**: focus moves into it and stays there until the visitor decides, so nothing focused can end up underneath it, and nothing on the page is used before a decision, which is what a consent gate is for anyway. Escape doesn't close a modal banner; a choice is required.

With `:modal="false"` the page stays usable behind the banner. Then:

- The banner still takes focus when it opens, so keyboard and screen-reader users meet the choice first.
- It publishes its height as `--cui-cookie-consent-height` on `<html>`, and `base.css` turns that into `scroll-padding-bottom` on `<html>` and `padding-bottom` on `<body>`: the browser scrolls a focused element above the banner instead of leaving it hidden, and even the page's last links can scroll clear of it. If you don't use `base.css`, add `html { scroll-padding-bottom: var(--cui-cookie-consent-height, 0px) } body { padding-bottom: var(--cui-cookie-consent-height, 0px) }` yourself.
- Escape (anywhere on the page, except inside another modal dialog) collapses it to a one-line bar with a "Show cookie settings" button. Focus inside the banner moves to that button.

The banner never grows past the viewport and scrolls itself at large zoom levels or on a short landscape screen: the modal one takes at most the full height (`max-height: 100dvh`), the non-modal one at most half of it (`50dvh`), so there is always room above it to scroll a focused element into, on a 320×256 viewport the full banner plus a sticky header would otherwise cover the whole page.
