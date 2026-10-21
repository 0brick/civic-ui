# SiteFooter

A multi-column footer: a brand blurb, sitemap link columns, an optional social-icon row, and a bottom legal row with copyright and legal links. Columns and links are entirely data-driven through props, so the footer content can come from a CMS or route config rather than hardcoded markup.

## Import

```js
import { SiteFooter } from 'civic-ui'
```

## Basic usage

A single sitemap column plus a copyright line is enough to render a working footer:

```vue
<script setup>
import { SiteFooter } from 'civic-ui'
</script>

<template>
  <SiteFooter
    :columns="[{ title: 'Services', links: [{ label: 'Resident Services', href: '#' }, { label: 'Forms & Permits', href: '#' }] }]"
    copyright="© 2026 City of Nordholm (sample data)."
  />
</template>
```

## Full footer with brand, legal row, and collapsible columns

Add more `columns`, a `brand` slot, `legalLinks` for the bottom row, and `collapsible` to turn each column into a native `<details>` accordion on narrow screens:

```vue
<script setup>
import { SiteFooter } from 'civic-ui'
</script>

<template>
  <SiteFooter
    collapsible
    :columns="[
      { title: 'Services', links: [{ label: 'Resident Services', href: '#' }, { label: 'Forms', href: '#' }] },
      { title: 'Living in Nordholm', links: [{ label: 'Mobility', href: '#' }, { label: 'Environment', href: '#' }] },
      { title: 'City Hall', links: [{ label: 'City Council', href: '#' }, { label: 'Press', href: '#' }] }
    ]"
    :legal-links="[{ label: 'Imprint', href: '#' }, { label: 'Privacy', href: '#' }, { label: 'Accessibility', href: '#' }]"
    copyright="© 2026 City of Nordholm (sample data)."
  >
    <template #brand>
      <p><strong>City of Nordholm</strong></p>
      <p>A fictional sample city used to demonstrate the Civic UI sections.</p>
    </template>
  </SiteFooter>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `{ title, links: { label, href, newTab? }[] }[]` | `[]` | Sitemap columns. |
| `legalLinks` | `{ label, href, newTab? }[]` | `[]` | Bottom-row legal links (imprint, privacy, accessibility). |
| `socialLinks` | `{ label, href, newTab?, icon }[]` | `[]` | `icon` is raw SVG markup, rendered via `v-html` and routed through `sanitizeHtml()`. Use developer-authored SVG literals only, never unsanitized user/CMS data (register a real sanitizer via `configureSecurity()` if this ever comes from an API). |
| `copyright` | `string` | `''` | |
| `collapsible` | `boolean` | `false` | Renders each column as a native `<details>`/`<summary>` accordion below 900px: the sitemap collapses on narrow screens instead of showing every column open at once. From 900px up the columns are plain blocks (no extra tab stops). |
| `background` | theme key \| CSS color | `'navy'` | The footer's color theme, like `HeroSection`/`CtaBanner` (see [Section color themes](../theming.md#section-color-themes)); text and heading colors come with it. A dark one sets `data-cui-theme="dark"` on the footer, so links and buttons in the `brand` slot get readable on-dark colors. |
| `address` | `string[]` | `[]` | Address lines, rendered in an `<address>` under the `brand` slot. |
| `email` | `string` | `''` | Rendered as a `mailto:` link: only a plain address becomes a link (no `?bcc=`/`&body=` smuggling). |
| `phone` | `string` | `''` | Rendered as a `tel:` link (digits and a leading `+` only). |
| `headingLevel` | `number` | `3` | Heading level (2-6) of the column titles: match the page outline. |

## Tokens

`--cui-footer-background`, `--cui-footer-text` and `--cui-footer-heading` override the theme's colors from a stylesheet, e.g. a darker footer in the dark color mode:

```css
:root[data-cui-mode='dark'] {
  --cui-footer-background: #0e0b09;
}
```

## Slots

| Slot | Notes |
|---|---|
| `brand` | Logo, brand blurb, or other content in the top-left of the footer. |

## Accessibility notes

Footer link hover is an opacity shift (0.7 → 1), not a color change: the underlying text and background colors stay identical, so the affordance still works for visitors with reduced color perception.

The column titles are headings at `headingLevel`, with `collapsible` too, where the heading sits inside the `<summary>` (WCAG 1.3.1). The legal `<nav>` landmark is only rendered when there are `legalLinks`, so the page never gets an empty landmark.
