# SiteHeader

The full institutional header pattern: an optional `TopBar` utility strip stacked above the main `Navbar`, plus a built-in skip link. The navy `TopBar` strip is off by default: set `top-bar` to show it.

## Import

```js
import { SiteHeader } from 'civic-ui'
```

## Basic usage

At minimum, fill the `brand` and `links` slots. Everything else (the utility strip, actions) is optional. Without `top-bar`, no navy strip renders above the navbar:

```vue
<script setup>
import { SiteHeader } from 'civic-ui'
</script>

<template>
  <SiteHeader>
    <template #brand><a href="#">City&nbsp;of&nbsp;Nordholm</a></template>
    <template #links>
      <a href="#">Services</a>
      <a href="#">City Hall</a>
      <a href="#">Contact</a>
    </template>
  </SiteHeader>
</template>
```

## Full header with utility strip and dropdown menus

Set `top-bar` and add `utilityLinks` (and the `utility` slot) for the navy meta row, `Dropdown` with `triggerVariant="chevron-label"` for flyout nav items, and the `actions` slot for a call-to-action button:

```vue
<script setup>
import { AppButton, Dropdown, LanguageSwitcher, SiteHeader } from 'civic-ui'
</script>

<template>
  <SiteHeader top-bar :utility-links="[{ label: 'Accessibility', href: '#' }, { label: 'Press', href: '#' }]">
    <template #utility>
      <LanguageSwitcher :languages="[{ code: 'en', label: 'EN' }, { code: 'de', label: 'DE', href: '#' }]" current="en" />
    </template>
    <template #brand><a href="#">City&nbsp;of&nbsp;Nordholm</a></template>
    <template #links>
      <Dropdown trigger-variant="chevron-label" label="Services">
        <a href="#">Resident Services</a>
        <a href="#">Forms &amp; Permits</a>
      </Dropdown>
      <a href="#">City Hall</a>
      <Dropdown trigger-variant="chevron-label" label="Careers" highlight>
        <a href="#">Open Positions</a>
      </Dropdown>
    </template>
    <template #actions>
      <AppButton variant="accent" size="sm" href="#">Contact</AppButton>
    </template>
  </SiteHeader>
</template>
```

## Right-aligned links

By default the links sit between the brand and the actions. Set `links-align="end"` to push them to the right, next to the actions (or `"start"` to pack them right after the brand):

```vue
<script setup>
import { AppButton, SiteHeader } from 'civic-ui'
</script>

<template>
  <SiteHeader links-align="end">
    <template #brand><a href="#">City&nbsp;of&nbsp;Nordholm</a></template>
    <template #links>
      <a href="#">Services</a>
      <a href="#">City Hall</a>
      <a href="#">Contact</a>
    </template>
    <template #actions>
      <AppButton variant="accent" size="sm" href="#">Sign in</AppButton>
    </template>
  </SiteHeader>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `topBar` | `boolean` | `false` | Renders the navy `TopBar` utility strip above the `Navbar`. `utilityLinks` and the `utility` slot only show up when this is set. |
| `utilityLinks` | `{ label, href, newTab? }[]` | `[]` | Passed through to the internal `TopBar`. |
| `skipToId` | `string` | `'main-content'` | Must match the `id` on your page's `<main>` (or other main-content wrapper). |
| `skipLabel` | `string` | `'Skip to main content'` | |
| `linksAlign` | `'start' \| 'center' \| 'end'` | `'center'` | Desktop position of the `links` slot. Passed through to the internal `Navbar`. |
| `items` | `{ label, href?, newTab?, active?, children? }[]` | `[]` | Data-driven nav items, passed to the internal `Navbar` (see [Navbar → items](../components/navigation/navbar.md)); used when the `links` slot is empty. |
| `linkTag` | `string \| object` | | Passed to the internal `Navbar`. |
| `toggleLabel` | `string` | `'Toggle navigation menu'` | Accessible name of the hamburger button. All five label props are passed through to the internal `Navbar`: translate them for a non-English site. |
| `menuLabel` | `string` | `'Menu'` | Title of the mobile menu drawer. |
| `closeLabel` | `string` | `'Close dialog'` | Accessible name of the drawer's close button. |
| `navLabel` | `string` | `'Main'` | Accessible name of the desktop `<nav>` landmark. |
| `mobileNavLabel` | `string` | `'Main (mobile)'` | Accessible name of the `<nav>` inside the mobile drawer. |

## Slots

| Slot | Notes |
|---|---|
| `utility` | Right-aligned content inside the `TopBar` row (requires `top-bar`) (language switcher, accessibility toggles). |
| `brand` | Logo / site name, rendered in the `Navbar`. |
| `links` | Main navigation items. |
| `actions` | Right-aligned buttons in the `Navbar` (e.g. a "Contact" or "Sign in" button). |

## Accessibility notes

`SiteHeader` renders a "Skip to main content" link as its very first element, since it's the repeated navigation block WCAG 2.4.1 (Bypass Blocks) expects one before. `skipToId` must match the `id` you give your page's `<main>` element:

```vue
<SiteHeader />
<!-- … -->
<main id="main-content"><!-- page content --></main>
```

`AppShell` doesn't need this wiring: it owns its own `<main>` and generates a matching skip-link target automatically.
