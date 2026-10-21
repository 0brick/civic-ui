# Carousel

A scroll-snap based slide carousel: no JS drag library required, and native touch swipe works for free. Put each slide in the default slot; `slideCount` must match the number of slides you pass in.

## Import

```js
import { Carousel } from 'civic-ui'
```

## Basic usage

Give `Carousel` a matching `slide-count` and one child per slide: here, three `Card`s:

```vue
<script setup>
import { Card, Carousel } from 'civic-ui'
</script>

<template>
  <Carousel :slide-count="3">
    <Card title="Slide one">First slide content.</Card>
    <Card title="Slide two">Second slide content.</Card>
    <Card title="Slide three">Third slide content.</Card>
  </Carousel>
</template>
```

## Autoplay with a labeled region

Set `autoplay` to advance slides automatically, and `interval` to control the delay in milliseconds. Add `aria-label` to turn the carousel into a labeled landmark region: recommended whenever a page has more than one carousel:

```vue
<script setup>
import { Card, Carousel } from 'civic-ui'
</script>

<template>
  <Carousel :slide-count="3" autoplay :interval="5000" aria-label="Featured city news">
    <Card title="New recycling centre opens" text="The Elmstadt site starts taking appointments next Monday." />
    <Card title="Road works on Bahnhofstraße" text="Expect delays through the end of the month." />
    <Card title="Library extends evening hours" text="Open until 20:00 on weekdays starting in October." />
  </Carousel>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `slideCount` | `number` |, (required) | Must match the number of children passed to the default slot. |
| `autoplay` | `boolean` | `false` | Skipped entirely for visitors with `prefers-reduced-motion` set: no pause button is shown to them either, since nothing is running to pause. |
| `interval` | `number` | `6000` | Milliseconds between automatic slide changes. |
| `ariaLabel` | `string` | | Turns the carousel into a labeled `role="region"` with `aria-roledescription="carousel"`. Only added to the DOM when set. |

## Slots

| Slot | Notes |
|---|---|
| `default` | The slides, one child per slide. |

## Accessibility notes

When `autoplay` is on, a pause/play toggle appears in the top-right corner for any visitor who doesn't have `prefers-reduced-motion` set, satisfying WCAG 2.2.2 (Pause, Stop, Hide). Slide changes are announced to screen readers through a visually-hidden "Slide X of N" live region, but not while autoplay is running (the region is `aria-live="off"` then, following the ARIA APG carousel pattern), only when the user moves the carousel. Autoplay pauses while keyboard focus is inside the carousel. Swiping or scrolling the track updates the current slide, the dots' `aria-current` and the announcement, just like the buttons do; and the dot navigation is a labeled button group with `aria-current` rather than a `role="tab"` pattern, since it doesn't implement tablist arrow-key navigation.

The slide track is a scroll container, so it is focusable itself (`tabindex="0"`, a group named "Slides"): keyboard users can tab to it and scroll with the arrow keys, which snap from slide to slide, even when the slides contain no links or buttons of their own (WCAG 2.1.1). Focusing it pauses autoplay like any other focus inside.

Each dot is a 24×24 px button (WCAG 2.5.8) with the visible dot drawn inside it. Inactive dots use `--cui-border-control` (3:1 against the page, WCAG 1.4.11); the active one is a wider pill as well as darker, so it doesn't rely on color alone.
