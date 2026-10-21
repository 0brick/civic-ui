# Navbar

The top navigation bar for a marketing or institutional site header: a brand slot on the left, nav links in the middle, and an actions slot on the right for a call-to-action or sign-in link. Below the desktop breakpoint it collapses into a hamburger button that opens the same links in a full-height `Modal`.

## Import

```js
import { Navbar } from 'civic-ui'
```

## Basic usage

A brand and a handful of links are all `Navbar` needs:

```vue
<script setup>
import { Navbar } from 'civic-ui'
</script>

<template>
  <Navbar :sticky="false">
    <template #brand><a href="#">City of Elmshaven</a></template>
    <template #links>
      <a href="#">Services</a>
      <a href="#">Departments</a>
      <a href="#">Contact</a>
    </template>
  </Navbar>
</template>
```

## With actions

Add an `actions` slot for a button that should stay visible next to the nav links (a sign-up or sign-in call to action, for example):

```vue
<script setup>
import { AppButton, Navbar } from 'civic-ui'
</script>

<template>
  <Navbar :sticky="false">
    <template #brand><a href="#">Acme Inc.</a></template>
    <template #links>
      <a href="#">Product</a>
      <a href="#">Pricing</a>
      <a href="#">Docs</a>
    </template>
    <template #actions>
      <AppButton variant="accent" size="sm">Sign up</AppButton>
    </template>
  </Navbar>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `sticky` | `boolean` | `true` | Pins the bar to the top of the viewport with a translucent, blurred fill so page content is faintly visible sliding underneath, instead of a flat background. |
| `dark` | `boolean` | `false` | Navy fill with light text, for headers placed over a dark hero. |
| `items` | `{ label, href?, newTab?, active?, tag?, children? }[]` | `[]` | Data-driven alternative to the `links` slot (the slot wins when both are given). An item with `children` renders as a `chevron-label` [Dropdown](dropdown.md) on desktop and as an expanded group in the mobile drawer; `active: true` sets `aria-current="page"`. |
| `linkTag` | `string \| object` | | Renders the item links as e.g. `RouterLink`. Usually unnecessary with [`configureLinks({ linkComponent })`](../../getting-started.md#router-integration). |
| `linksAlign` | `'start' \| 'center' \| 'end'` | `'center'` | Where the `links` slot sits on desktop: spaced between brand and actions (`'center'`), packed right after the brand (`'start'`), or pushed right up against the actions (`'end'`). The mobile menu is unaffected. |
| `toggleLabel` | `string` | `'Toggle navigation menu'` | Accessible name of the hamburger button. |
| `menuLabel` | `string` | `'Menu'` | Title of the mobile menu drawer. |
| `closeLabel` | `string` | `'Close dialog'` | Accessible name of the drawer's close button. |
| `navLabel` | `string` | `'Main'` | Accessible name of the desktop `<nav>` landmark. |
| `mobileNavLabel` | `string` | `'Main (mobile)'` | Accessible name of the `<nav>` inside the mobile drawer. |

## Slots

| Slot | Notes |
|---|---|
| `brand` | The logo/site name, usually a link to the homepage. |
| `links` | The nav items: plain `<a>` (or `router-link`) elements, or a `trigger-variant="chevron-label"` [Dropdown](dropdown.md) for a sub-menu. Reused inside the mobile drawer, where such a Dropdown becomes an expanded link group instead of a flyout. The drawer closes when a link is followed, not on other clicks. Takes precedence over `items`. |
| `actions` | Buttons or links that stay outside the collapsing nav, e.g. a sign-in link. |

## Styling the links

The desktop link row reads custom properties, so a site's own nav style is a few token overrides instead of selectors into the bar (a `chevron-label` Dropdown trigger in the row follows them too):

| Token | Default |
|---|---|
| `--cui-nav-font-size` | `1.3rem` |
| `--cui-nav-font-weight` | `600` |
| `--cui-nav-letter-spacing` | `0.03em` |
| `--cui-nav-text-transform` | `uppercase` |
| `--cui-nav-gap` | `var(--cui-space-5)` |
| `--cui-nav-color` | `var(--cui-text-muted)` |
| `--cui-nav-active` | `var(--cui-text)`: hover, `router-link-active` and `aria-current="page"`; also the color of the 3px current-page bar |
| `--cui-nav-active-mobile` | `var(--cui-link)`: the current page in the drawer |

```css
.site-header {
  --cui-nav-font-size: 1.55rem;
  --cui-nav-font-weight: 500;
  --cui-nav-letter-spacing: 0;
  --cui-nav-text-transform: none;
}
```

## Accessibility notes

The current page (`aria-current="page"` or `router-link-active`) is marked by a 3px bar under the link in the text color, not by color alone: the active link's ink differs from the muted inactive links by only ~2.5:1 (WCAG 1.4.1 / 1.4.11). The yellow bar is kept for hover, and for the current page on a `dark` navbar, where it reads at 14:1. In the mobile drawer, the current page is underlined as well as colored.

The hamburger button carries `aria-expanded`, `aria-haspopup="dialog"` and `aria-controls` pointing at the drawer (a `Modal` with its own id), so screen readers know what it opens and whether it's open.
