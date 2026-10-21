# Card

The general-purpose teaser and list-row card that content grids are built from: an optional link wrapper, a leading visual, a text body and an optional trailing element. The `layout` prop picks the skeleton.

## Import

```js
import { Card } from 'civic-ui'
```

## Basic usage

The default `grid` layout needs just a `title`. Set `href` to render the whole card as a link:

```vue
<script setup>
import { Card } from 'civic-ui'
</script>

<template>
  <Card title="Quick start" href="#">
    Everything you need to get up and running in a few minutes.
  </Card>
</template>
```

## Grid layout & appearances

Add `eyebrow` for a small label above the title, and use `appearance` (`outlined` or `flat`) to fit different backgrounds in a grid of cards:

```vue
<script setup>
import { Card } from 'civic-ui'
</script>

<template>
  <div class="cui-grid cui-grid--3">
    <Card eyebrow="Get started" title="Quick start" href="#">
      Everything you need to get up and running in a few minutes.
    </Card>
    <Card eyebrow="Reference" title="Documentation" href="#" appearance="outlined">
      The complete reference for every component and prop.
    </Card>
    <Card eyebrow="People" title="Team" href="#" appearance="flat">
      Manage roles and permissions for your whole team.
    </Card>
  </div>
</template>
```

## Article / news row

`layout="row"` renders a press/news list row with a date and excerpt instead of the grid card's block layout:

```vue
<script setup>
import { Card } from 'civic-ui'
</script>

<template>
  <div style="max-width: 640px;">
    <Card
      layout="row"
      date="Sep 12, 2026"
      eyebrow="Product Update"
      title="New version of the component library released"
      text="Over 30 new components and a refreshed color system."
      href="#"
    />
  </div>
</template>
```

## Person / contact card

`layout="person"` renders a contact card: `subtitle` becomes the role, and `meta` entries with an `href` (such as a `mailto:` link) render as clickable contact details:

```vue
<script setup>
import { Card } from 'civic-ui'
</script>

<template>
  <div style="max-width: 320px;">
    <Card
      layout="person"
      appearance="outlined"
      title="Anna Berger"
      subtitle="Customer Support"
      :meta="[{ label: 'anna.berger@example.com', href: 'mailto:anna.berger@example.com' }]"
    />
  </div>
</template>
```

## Job listing row

`layout="job"` renders an open-position row for a careers page. `meta` entries can carry a built-in `icon` (`location` or `briefcase`):

```vue
<script setup>
import { Card } from 'civic-ui'
</script>

<template>
  <div style="max-width: 480px;">
    <Card
      layout="job"
      appearance="outlined"
      title="Frontend Developer (f/m/d)"
      eyebrow="Product"
      :meta="[{ icon: 'location', label: 'Remote' }, { icon: 'briefcase', label: 'Full-time' }]"
      href="#"
    />
  </div>
</template>
```

## Download row

`layout="download"` renders one row of a documents list, with a file-type badge and size:

```vue
<script setup>
import { Card } from 'civic-ui'
</script>

<template>
  <div style="max-width: 420px;">
    <Card layout="download" appearance="outlined" title="Terms of Service" file-type="PDF" file-size="180 KB" href="#" />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `layout` | `'grid' \| 'row' \| 'person' \| 'job' \| 'download'` | `'grid'` | Picks the skeleton, `row` is a press/news list row, `person` a contact card, `job` an open-position row, `download` a document list row. |
| `media` | `string` | | Image src (`grid`/`row`) or avatar src (`person`). |
| `mediaAlt` | `string` | | |
| `eyebrow` | `string` | | |
| `title` | `string` | | |
| `subtitle` | `string` | | A secondary line under the title, in every layout (the role in `person` layout, a place or date elsewhere). |
| `text` | `string` | | Body copy: the excerpt in `row` layout; in `grid` layout it fills the body when the default slot is empty (the slot wins). |
| `date` | `string` | | `row` layout only, renders a `<time>`. |
| `meta` | `{ label, href?, newTab?, icon?: 'location' \| 'briefcase' }[]` | `[]` | `person`/`job` layouts, `href` renders the item as a link (email/phone), `icon` renders one of two built-in glyphs. On a card with its own `href` the items render as text (links can't nest). |
| `fileType` | `string` | `'PDF'` | `download` layout. |
| `fileSize` | `string` | | `download` layout. |
| `trailing` | `'none' \| 'arrow' \| 'download'` | Defaults sensibly per layout (`arrow` for `job`, `download` for `download`, else `none`) | |
| `href` | `string` | | Renders the whole card as a link when set. |
| `newTab` | `boolean` | `false` | Opens `href` in a new tab, with a screen-reader hint. `meta` items take their own `newTab: true`. See [Links in new tabs](../../accessibility.md#links-in-new-tabs-wcag-325). |
| `tag` | `string \| object` | | Overrides the rendered tag, e.g. `RouterLink` (it receives `href` as `to`). Usually unnecessary: with [`configureLinks({ linkComponent })`](../../getting-started.md#router-integration) internal hrefs render the router link automatically (never for `layout="download"`). |
| `appearance` | `'default' \| 'outlined' \| 'flat'` | `'default'` | |
| `actionLabel` | `string` | | A visible call to action at the end of a linked card, e.g. `'Mehr erfahren'`, followed by → (↗ for `newTab` or another site). The whole card stays the link. |
| `accent` | `'none' \| 'top' \| 'start'` | `'none'` | A 4px colored edge across the top or along the leading side. |
| `accentColor` | theme key \| CSS color | accent role | The edge's color: a [section theme](../../theming.md#section-color-themes) / palette role (`'secondary'`, `'tertiary'`, …) or a color. |
| `background` | theme key \| CSS color | | Colors the whole card with a section theme, e.g. `'primary'` for a dark card; title, text and links follow, and a dark theme sets `data-cui-theme="dark"`. |
| `number` | `string` | | A number/kicker above the title, e.g. `'01'`. |
| `headingLevel` | `2`-`6` | `3` | The title's heading level, to fit the page's outline. |
| `email` | `string` | | `person` layout: rendered as a `mailto:` link (only a plain address becomes a link), before any `meta` items. |
| `phone` | `string` | | `person` layout: rendered as a `tel:` link: digits and a leading `+` only, `0049…` becomes `+49…`. |
| `phoneHref` | `string` | | Overrides the derived `tel:` target, e.g. with an extension the displayed number leaves out. |
| `avatar` | `'initials' \| 'auto' \| 'none'` | `'initials'` | `person` layout: `initials` shows the photo or initials without one; `auto` the photo only; `none` no avatar at all. |
| `showLabels` | `boolean` | `false` | `person` layout: visible "Email"/"Phone" labels (a `<dl>`); the texts come from the [i18n catalog](../../accessibility.md#language-and-labels-wcag-312) (`card.email`, `card.phone`). |

## Slots

| Slot | Notes |
|---|---|
| `default` | `grid` layout's body text. |
| `footer` | `grid` layout only. |

### A single contact card

```vue
<Card layout="person" eyebrow="Chair" title="Anna Example" email="anna@association.example" phone="0049 351 123 45" avatar="none" show-labels />
```

`eyebrow` puts the role above the name, `subtitle` below it. Long email addresses wrap instead of overflowing the card.

## Linked cards and inner links

With `href` the whole card is one link, and links can't contain links (nested `<a>` is invalid HTML that browsers split apart; WCAG 4.1.1/4.1.2). So on a linked card, `email`, `phone` and `meta[].href` render as plain text, and a development-mode warning names the conflict. To keep the contact details clickable, leave the card unlinked and put the link in `meta` or the `footer` slot instead.
