# Composables

The small set of framework-level helpers the components are built on. Each one is also usable directly in your own components.

## `useToast()`

Global toast queue. Mount `<ToastContainer />` once near your app root, then call `useToast()` from anywhere:

```js
const toast = useToast()
toast.push('Message', { variant: 'info', title: '', duration: 10000 })
toast.success('Saved.')
toast.danger('Failed.')
toast.warning('Careful.')
toast.info('FYI.')
```

`danger`/`warning` toasts don't close on their own unless you pass a `duration`; others last at least 10 s. `configureToast({ duration, minDuration })` sets app-wide timing, `configureToast({ duration: 0 })` turns auto-closing off (WCAG 2.2.1). See [Toast](components/feedback/toast.md) for the component side of this pairing.

## `useClickOutside(elRef, callback)`

Runs `callback(event)` when a click lands outside the element referenced by `elRef`, or when keyboard focus moves outside it (`focusin`). Check `event.type === 'focusin'` to tell the two apart, e.g. to not pull focus back when the user tabbed away on purpose. Used internally by `Dropdown` and `Popover`.

## `useId(prefix?)`

Returns a stable, unique string id (`${prefix}-${n}`) for wiring `aria-*` attributes between a control and its label/panel.

## `useScrollspy(ids, { rootMargin? })`

IntersectionObserver-based section tracker. Returns `{ activeId }`. Used internally by [ScrollspyNav](components/navigation/scrollspy-nav.md).

## `useScrollLock(openRef)`

Reference-counted `<body>` scroll lock (padding-compensated so the page doesn't jump when the scrollbar disappears). Used internally by `Modal` (all placements), and optionally `CookieConsent`.

## `useFocusTrap(openRef, containerRef)`

Moves focus into `containerRef`'s element when `openRef` becomes true, cycles Tab/Shift+Tab between its focusable descendants while open, and restores focus to whatever triggered it once `openRef` becomes false. Used internally by `Modal` (all placements); pair it with your own overlay the same way if you build one that isn't already a `Modal` variant.

## `useCookieConsent(options?)`

```js
const { consent, categories, decidedAt, accept, reject, reset, hasConsent } = useCookieConsent({
  storageKey: 'cui-cookie-consent', // per app if several apps share one origin
  version: '2026-10',               // bump when the privacy policy changes → visitors are asked again
  maxAgeDays: 365                   // decisions older than this count as undecided (0 = never expire)
})
// consent.value is null (undecided) | 'accepted' | 'rejected', persisted to localStorage
accept()                                      // accept everything
accept({ analytics: true, marketing: false }) // a "customize" choice
hasConsent('analytics')                       // true only if accepted and that category is granted
```

Every call with the same `storageKey`/`version`/`maxAgeDays` shares one state, so two components gating on it can't disagree; other tabs follow through the `storage` event. The decision is stored as versioned JSON with a timestamp: a record from another `version`, an expired or a malformed one is treated as undecided, so the banner asks again. Passing a plain string (`useCookieConsent('my-key')`) still works as the storage key.

[CookieConsent](components/overlay/cookie-consent.md) (the component) is presentation-only: it renders the banner and emits `accept`/`reject`/`customize` but doesn't persist a decision or block anything by itself. This composable is what actually gates trackers: check `consent.value === 'accepted'` before loading analytics/marketing scripts anywhere in your app, and drive the banner's visibility from `consent.value === null`.

`revokeEmbedConsent(provider)` deletes a remembered [ConsentEmbed](components/content/consent-embed.md#remembering-the-choice) consent (`'youtube'`, `'vimeo'`, `'osm'`, or an iframe's host): every remembered embed of that provider on the page unloads at once. Use it for a revoke control on your privacy page; the embeds offer one themselves too.

## `useColorMode()`

```js
import { useColorMode, initColorMode, setColorMode, toggleColorMode } from 'civic-ui'

initColorMode({ default: 'auto' }) // once at startup (or app.use(CivicUI, { colorMode: 'auto' }))

const { mode, resolved, isDark, setMode, toggle, reset } = useColorMode()
// mode.value:     'light' | 'dark' | 'auto': the visitor's choice (read-only ref)
// resolved.value: 'light' | 'dark': what is showing ('auto' resolved against the OS)
setColorMode('dark') // same as setMode: works outside components too
toggleColorMode()    // flips what is showing, even from 'auto'
```

Manages the page-wide [dark color mode](theming.md#dark-and-light-mode): writes `data-cui-mode` on `<html>`, remembers the choice in `localStorage` (`storageKey`, default `'cui-color-mode'`; `persist: false` to disable), and follows OS changes live while the mode is `'auto'`. Every caller shares one state, so a [ColorModeToggle](components/button/color-mode-toggle.md) in the header and your own settings page stay in sync. `initColorMode()` options: `default` (`'light'`, used when nothing is stored), `storageKey`, `persist`.

## `useReveal` (`vReveal` directive)

An IntersectionObserver-based scroll-reveal directive, not a composable function, but exported as `vReveal` so `<script setup>` resolves `v-reveal` automatically (Vue ≥3.3):

```vue
<script setup>
import { vReveal } from 'civic-ui'
</script>

<template>
  <div v-reveal>Fades and rises into view once scrolled into the viewport.</div>
  <li v-for="(item, i) in items" v-reveal="i * 70">{{ item }}</li>
</template>
```

Pass a number to stagger a list: it's used as a `transition-delay` in ms. Respects `prefers-reduced-motion` (shows content immediately, no transition). Used internally by `MediaTextSection`, `StepsSection` and `AppointmentSection`; opt in anywhere else the same way.
