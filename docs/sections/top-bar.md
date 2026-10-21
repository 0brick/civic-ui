# TopBar

The thin utility strip above the main navigation bar: accessibility toggles, a language switcher, secondary links. It's meta/utility content only; real page navigation belongs in `Navbar` or `SiteHeader` below it.

## Import

```js
import { TopBar } from 'civic-ui'
```

## Basic usage

`links` renders a row of plain text links on the left:

```vue
<script setup>
import { TopBar } from 'civic-ui'
</script>

<template>
  <TopBar :links="[{ label: 'Accessibility', href: '#' }, { label: 'Contact', href: '#' }]" />
</template>
```

## With a language switcher

The default slot renders right-aligned, alongside the `links`. Put a `LanguageSwitcher`, accessibility icon-links, or other meta controls here:

```vue
<script setup>
import { LanguageSwitcher, TopBar } from 'civic-ui'
</script>

<template>
  <TopBar :links="[{ label: 'Accessibility', href: '#' }, { label: 'Press', href: '#' }]">
    <LanguageSwitcher :languages="[{ code: 'en', label: 'EN' }, { code: 'de', label: 'DE', href: '#' }]" current="en" />
  </TopBar>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `links` | `{ label, href, newTab? }[]` | `[]` | Rendered left-aligned. |

## Slots

| Slot | Notes |
|---|---|
| `default` | Right-aligned meta content: language switcher, accessibility toggles, etc. |
