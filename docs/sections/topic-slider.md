# TopicSlider

A full-bleed, image-per-slide topic carousel: one large photo per slide on a navy field, a headline sized for impact, and an optional "learn more" link. It's built on top of the plain `Carousel` primitive, so slides swipe on touch and step through with the carousel's own prev/next controls.

## Import

```js
import { TopicSlider } from 'civic-ui'
```

## Basic usage

Each item needs a `title` and an `image`. Without `text` or `href`, the slide shows just the headline over the photo:

```vue
<script setup>
import { TopicSlider } from 'civic-ui'
import housingDevelopment from '../../assets/photos/housing-development.jpg'
import cultureEvents from '../../assets/photos/culture-events.jpg'
</script>

<template>
  <TopicSlider
    :items="[
      { title: 'Housing & Development', image: housingDevelopment },
      { title: 'Culture & Events', image: cultureEvents }
    ]"
  />
</template>
```

## With links and lead text

Add `text` for a short supporting line and `href` to turn the title and a "learn more" link into clickable links. `linkLabel` overrides the link text per item; `moreLabel` sets the default for every item that doesn't:

```vue
<script setup>
import { TopicSlider } from 'civic-ui'
import mobility from '../../assets/photos/mobility.jpg'
import park from '../../assets/photos/park.jpg'
import school from '../../assets/photos/school.jpg'
</script>

<template>
  <TopicSlider
    more-label="Learn more"
    :items="[
      { title: 'Mobility', text: 'New bike lanes, more bus routes, and a city map that keeps up with you.', image: mobility, href: '#' },
      { title: 'Environment & Green Spaces', text: 'Parks, city trees, and the 2030 climate action program.', image: park, href: '#' },
      { title: 'Education', text: 'New childcare spots and renovated schools for the next generation.', image: school, href: '#' }
    ]"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ title, text?, image, href?, newTab?, linkLabel? }[]` | | Required. `linkLabel` overrides `moreLabel` for a single item. |
| `moreLabel` | `string` | `'Learn more'` | Default link label for items with an `href` but no `linkLabel`. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Horizontal position of the text block within each full-bleed slide. |
| `title` | `string` | `''` | A visually hidden `h2` that names the section and gives the slide titles a parent heading. |
| `headingLevel` | `number` | `3` | Heading level (2-6) of the slide titles. Without a `title`, set it to fit the page outline (WCAG 1.3.1). |
| `adaptiveText` | `boolean` | `false` | Opt-in only. Samples each slide's image and switches that slide's text to a dark-on-light treatment when the photo reads as visually light, instead of always assuming a dark photo. |
