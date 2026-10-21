# TestimonialSection

A quote or grid of quotes, built on one `layout` prop: `layout="feature"` renders one large serif pull-quote, `layout="grid"` (the default) a star-rated card grid. Both share the same item shape.

## Import

```js
import { TestimonialSection } from 'civic-ui'
```

## Basic usage

`layout="feature"` needs only a single-entry `items` array with a `quote` and a `name`:

```vue
<script setup>
import { TestimonialSection } from 'civic-ui'
</script>

<template>
  <TestimonialSection
    layout="feature"
    :items="[
      { quote: 'A government that works online creates time for what truly needs a personal touch.', name: 'Petra Lindgren', role: 'Mayor of Nordholm' }
    ]"
  />
</template>
```

## Grid layout

The default `layout="grid"` renders a card per item, with a star rating for items that have a `rating` (0-5; items without one show no stars, never an invented five), and can take a `title`/`eyebrow`/`intro` heading above the grid:

```vue
<script setup>
import { TestimonialSection } from 'civic-ui'
</script>

<template>
  <TestimonialSection
    eyebrow="Resident Feedback"
    title="What residents are saying"
    :items="[
      { quote: 'Booked a permit appointment online in two minutes: no more waiting number.', name: 'J. Albrecht', role: 'Nordholm resident', rating: 5 },
      { quote: 'The status tracker meant I never had to call to check on my application.', name: 'S. Yilmaz', role: 'Small business owner', rating: 5 },
      { quote: 'Straightforward, and the confirmation email had everything I needed to bring.', name: 'M. Berger', role: 'Nordholm resident', rating: 4 }
    ]"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `eyebrow` | `string` | `''` | `layout="grid"` only, not rendered in `feature` layout. |
| `title` | `string` | `''` | `layout="grid"` only. |
| `intro` | `string` | `''` | `layout="grid"` only. |
| `items` | `{ quote, name, role?, avatar?, rating? }[]` | | Required. `feature` layout uses only the first entry. `rating` (0-5, rounded) shows that many stars plus the rating as screen-reader text ("4 out of 5 stars"); without it the card shows no stars. The avatar is `decorative`, since the name stands next to it. |
| `layout` | `'grid' \| 'feature'` | `'grid'` | |
| `align` | `'left' \| 'center' \| 'right'` | `null` (auto) | Alignment of the `grid` head or the `feature` pull-quote. Unset defaults to `'center'` for `feature`, `'left'` for `grid`. |
| `narrow` | `boolean` | `false` | Opt-in 860px column. Off by default, so the section spans the same container width as every other section: see [Theming → Section width](../theming.md#section-width). |
| `appearance` | `'mark' \| 'border' \| 'card'` | `'mark'` | `layout="feature"` only: passed to the [Quote](../components/content/quote.md) it renders. For a quote inside running text, use `Quote` on its own instead of a whole section. |
