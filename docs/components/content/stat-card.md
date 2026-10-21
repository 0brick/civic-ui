# StatCard

A single key figure on a card: a big number, a label, and an optional trend delta. As `appearance="dashboard"` (the default) it is a KPI tile for a webapp dashboard grid; as `appearance="highlight"` it is a figure inside a content page (building costs, a membership fee, a donation goal with its progress) optionally with a button.

## When StatCard, when StatsSection

- **StatCard**: one figure, *inside* a page: in a sidebar beside running text, in a dashboard grid. Use `highlight` on content pages, `dashboard` in apps.
- **[StatsSection](../../sections/stats-section.md)**: a full-width band with a row of figures ("128,000 residents, 18 offices, …") between other sections. Its `background` takes any section theme (also `light`), and `columns="auto"` lays out one to four figures evenly.

## Import

```js
import { StatCard } from 'civic-ui'
```

## Basic usage

`label` and `value` are the only required props:

```vue
<script setup>
import { StatCard } from 'civic-ui'
</script>

<template>
  <StatCard label="Open tickets" value="128" />
</template>
```

## With trend & dashboard grid

Add `trend` (a signed percentage) to show an up/down arrow with color. Set `invert` for metrics where a lower number is the good outcome, such as open tickets or resolution time, so the color reflects whether the change is favorable rather than just its direction:

```vue
<script setup>
import { StatCard } from 'civic-ui'
</script>

<template>
  <div class="cui-grid cui-grid--4">
    <StatCard label="Open tickets" value="128" :trend="4.2" trend-label="vs. last week" invert />
    <StatCard label="Avg. resolution time" value="3.4 days" :trend="-8.1" trend-label="vs. last week" invert />
    <StatCard label="Resolved" value="812" :trend="12.6" trend-label="this month" />
    <StatCard label="Overdue" value="6" :trend="0" trend-label="unchanged" invert />
  </div>
</template>
```

## Highlight in a content page

`appearance="highlight"` makes the figure larger and adds an accent edge (`color`: a [section theme](../../theming.md#section-color-themes) key / palette role or a color; default the accent role). `action` adds a full-width button. Inside `.cui-sticky` it stays in view beside a long text: no CSS of your own, and its surface tokens already follow dark mode:

```vue
<div class="cui-grid cui-grid--aside">
  <div class="cui-prose">…</div>
  <aside class="cui-sticky">
    <StatCard
      appearance="highlight"
      label="Membership fee"
      value="€20 / year"
      :action="{ label: 'Become a member', href: '/membership' }"
    />
  </aside>
</div>
```

## Donation goal

`goal` and `current` add a progress bar towards the goal, labelled "60% of 15,000 € reached" (`statCard.progress` in the i18n catalog; the goal is formatted for the page's `lang`, `unit` is appended). `progressLabel` replaces the text.

```vue
<StatCard
  appearance="highlight"
  label="Donations for the new school"
  value="€9,000"
  :goal="15000"
  :current="9000"
  unit="€"
  color="secondary"
  :action="{ label: 'Donate now', href: '/donate' }"
/>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` |, (required) | |
| `value` | `string \| number` |, (required) | The headline figure. |
| `trend` | `number` | `null` | Percent change. Sign determines the arrow direction and, combined with `invert`, its color. The figure is shown unsigned; screen readers hear the direction ("Down by 2.1%", `statCard.up`/`statCard.down` in the locale catalog). |
| `trendLabel` | `string` | | Short caption next to the trend, e.g. "vs. last week". |
| `invert` | `boolean` | `false` | Set for metrics where a decrease is the good outcome, so the trend color reflects favorability rather than raw direction. |
| `icon` | `string` | | Raw SVG markup, rendered via `v-html` (sanitized through `sanitizeHtml()`: see `SECURITY.md`). Developer-authored only; never pass unsanitized CMS or user data. |
| `appearance` | `'dashboard' \| 'highlight'` | `'dashboard'` | `highlight`: larger figure, accent edge, full-width action, for content pages. |
| `color` | theme key \| CSS color | accent role | The highlight edge. |
| `action` | `{ label, href, newTab? }` | `null` | A button under the figure (outline in `dashboard`, primary in `highlight`). |
| `goal` | `number` | `null` | With `current`: a progress bar towards this goal. |
| `current` | `number` | `null` | Amount reached so far; the bar caps at the goal. |
| `unit` | `string` | `''` | Appended to the formatted goal in the progress text, e.g. `'€'`. |
| `progressLabel` | `string` | `''` | Replaces the progress text. |
