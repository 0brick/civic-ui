# LanguageSwitcher

The plain-text "DE | EN" language toggle for a header's utility strip. It deliberately renders text codes rather than flag icons: flags are a poor proxy for language (a flag represents a country, not a language) and are often licensed artwork besides.

## Import

```js
import { LanguageSwitcher } from 'civic-ui'
```

## Basic usage

```vue
<script setup>
import { LanguageSwitcher } from 'civic-ui'
</script>

<template>
  <LanguageSwitcher :languages="[{ code: 'en', label: 'EN', href: '#' }, { code: 'de', label: 'DE', href: '#' }]" current="en" />
</template>
```

## More languages & default labels

`label` is optional: when it's omitted, the uppercased `code` is used instead:

```vue
<script setup>
import { LanguageSwitcher } from 'civic-ui'
</script>

<template>
  <LanguageSwitcher
    :languages="[
      { code: 'de', label: 'DE', href: '#' },
      { code: 'en', label: 'EN', href: '#' },
      { code: 'fr', href: '#' },
      { code: 'pl', href: '#' }
    ]"
    current="de"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `languages` | `{ code, label?, href, newTab?, lang? }[]` | (required) | `label` falls back to `code.toUpperCase()` when omitted. `href` is passed through the library's internal URL sanitizer before being rendered. `lang` overrides the item's `lang`/`hreflang` attributes (default: `code`); set it for entries that aren't a language code, e.g. `{ code: 'ls', lang: 'de', label: 'Leichte Sprache' }`. |
| `current` | `string` |, (required) | Matches a `code` in `languages`; that item gets `aria-current` and the active visual state. |
| `ariaLabel` | `string` | `'Language selection'` | Accessible name of the `<nav>` landmark. |

## Slots

| Slot | Notes |
|---|---|
| `default` | Scoped with `{ lang, active }`. Replaces each item's text, e.g. to add the standard icons for *Leichte Sprache* and *Gebärdensprache* links, which German public-sector sites must offer (BITV 2.0 § 4). |

## Accessibility notes

All items use the full text color of their surroundings: no dimming, which would drop below 4.5:1 on muted or mid-tone bars. The current language is marked by a heavier (2px) underline and `aria-current`, not by color; the others underline on hover.
