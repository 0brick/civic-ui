# TeaserGrid

A three-column intro-and-card grid section for pointing residents to related programs, services, or people: a topic-card grid by default, or a press-office or team directory with `itemVariant="person"`.

## Import

```js
import { TeaserGrid } from 'civic-ui'
```

## Basic usage

`title` and `items` are the only props you need. Without an `image` or `href`, each item renders as a plain text card:

```vue
<script setup>
import { TeaserGrid } from 'civic-ui'
</script>

<template>
  <TeaserGrid
    title="Popular services"
    :items="[
      { title: 'Renew a passport', text: 'Book a counter appointment or start the renewal online.' },
      { title: 'Register a new address', text: 'Update your registration within two weeks of moving.' }
    ]"
  />
</template>
```

## Photo teaser grid

Add an `eyebrow`, an `intro`, and `image`/`href` on each item for the full "explore our programs" layout: the default `itemVariant="teaser"` mode:

```vue
<script setup>
import { TeaserGrid } from 'civic-ui'
import digitalServices from '../../assets/photos/digital-services.jpg'
import cultureEvents from '../../assets/photos/culture-events.jpg'
import housingDevelopment from '../../assets/photos/housing-development.jpg'
</script>

<template>
  <TeaserGrid
    eyebrow="More from the City"
    title="Where else things are moving"
    intro="A handful of other programs currently underway across Nordholm."
    :items="[
      { title: 'Digital Services', text: 'New online accounts let residents track every application in one dashboard.', image: digitalServices, href: '#' },
      { title: 'Culture & Events', text: 'A packed calendar of markets, concerts and neighborhood festivals this season.', image: cultureEvents, href: '#' },
      { title: 'Housing & Development', text: 'Three new residential blocks breaking ground in the Ostpark district.', image: housingDevelopment, href: '#' }
    ]"
  />
</template>
```

## Person / contact grid

Set `itemVariant="person"` to render each item as a `Card layout="person"` instead: a press-office or team directory. Items use `name`/`role`/`email`/`phone` instead of `title`/`text`/`image`, and `email`/`phone` are turned into `mailto:`/`tel:` links automatically:

```vue
<script setup>
import { TeaserGrid } from 'civic-ui'
</script>

<template>
  <TeaserGrid
    item-variant="person"
    eyebrow="Get in Touch"
    title="Resident Services &amp; Press"
    intro="For general inquiries and media requests."
    :items="[
      { name: 'Julia Wagner', role: 'Head of Resident Services', email: 'residentservices@nordholm.example' },
      { name: 'Tom Brandt', role: 'Press Office', email: 'press@nordholm.example', phone: '+1 555 0142' },
      { name: 'Nora Fischer', role: 'Digital Services', email: 'digital@nordholm.example' }
    ]"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `eyebrow` | `string` | `''` | |
| `title` | `string` | `''` | Optional. |
| `titleHidden` | `boolean` | `false` | Keeps the title for screen readers only (visually hidden); the section stays named through `aria-labelledby`. For a page whose own `<h1>` already says what the grid is. |
| `intro` | `string` | `''` | |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alignment of the `eyebrow`/`title`/`intro` head. |
| `columns` | `2 \| 3 \| 4 \| 'auto'` | `3` | Fixed column count from 900px up (same as `StepsSection`), or `'auto'`: as many columns of at least `--cui-teaser-min` (`24rem`) as fit, 4 or 5 teasers never leave one alone on a row. |
| `subtle` | `boolean` | `false` | Sunken section background, like `MediaTextSection`. For a white band, add the `cui-section--paper` class instead (see [Utilities](../utilities.md)). |
| `tag` | `string \| object` | | Element/component for the card links; an item's own `tag` wins. Usually unnecessary with [`configureLinks({ linkComponent })`](../getting-started.md#router-integration). |
| `items` | `{ title, text, image?, href?, newTab?, tag? }[]` (`itemVariant="teaser"`) or `{ name, role?, image?, email?, phone?, href?, newTab?, tag? }[]` (`itemVariant="person"`) | | Required. |
| `itemVariant` | `'teaser' \| 'person'` | `'teaser'` | Picks the `Card` layout each item renders as. |
