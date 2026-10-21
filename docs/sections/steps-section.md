# StepsSection

A header plus a sequence of labeled steps. The `layout` prop picks the presentation: a plain divided numbered list (`'list'`, the default), a chain of theme-colored cards joined by connector arrows (`'chain'`), or a checkmark grid (`'grid'`). All three loop the same `steps` array.

## Import

```js
import { StepsSection } from 'civic-ui'
```

## Basic usage

The default `layout="list"` needs only `title` and `steps`. Add `action` for a button below the list:

```vue
<script setup>
import { StepsSection } from 'civic-ui'
</script>

<template>
  <StepsSection
    eyebrow="How it works"
    title="From request to confirmed appointment"
    intro="The same four steps for every counter service, online or in person."
    :steps="[
      { title: 'Submit your request', text: 'Tell us what you need and your preferred time window.' },
      { title: 'We check availability', text: 'A caseworker matches your request to the next open slot.' },
      { title: 'Confirmation', text: 'You receive a confirmed date, time and required documents by email.' },
      { title: 'Your visit', text: 'Arrive with your documents: most counters are done in 15 minutes.' }
    ]"
    :action="{ label: 'Start a request', href: '#' }"
  />
</template>
```

## Grid layout

Set `layout="grid"` for a multi-column checkmark grid: a compact way to list benefits or perks. `columns` controls how many columns it uses on larger screens:

```vue
<script setup>
import { StepsSection } from 'civic-ui'
</script>

<template>
  <StepsSection
    layout="grid"
    eyebrow="Benefits"
    title="Why work for the city"
    :steps="[
      { title: 'Flexible hours', text: 'Flextime and remote work by arrangement.' },
      { title: 'Retirement plan', text: 'Employer-funded pension, standard across public service.' },
      { title: 'Learning budget', text: 'A personal training allowance, renewed every year.' },
      { title: 'Transit pass', text: 'A subsidized public transit pass for every employee.' },
      { title: 'Family friendly', text: 'On-site childcare spots and flexible parental leave.' },
      { title: 'Wellness programs', text: 'Company sports, checkups, and an annual wellness day.' }
    ]"
  />
</template>
```

## Chain layout

Set `layout="chain"` for a connected sequence of colored cards: the typical pattern for a multi-stage process like a job application. Each step can carry its own `theme` (a [section theme](../theming.md#section-color-themes) key: steps without one cycle through purple, violet, sky, teal), `image`, and `href`:

```vue
<script setup>
import { StepsSection } from 'civic-ui'
</script>

<template>
  <StepsSection
    layout="chain"
    eyebrow="How to apply"
    title="Four steps to your new job"
    intro="From your online application to your offer letter: every stage explained in short."
    :steps="[
      { title: '1. Apply online', text: 'Fill out the form, upload your documents, done.', theme: 'tertiary', href: '#' },
      { title: '2. First conversation', text: 'A quick introduction by video or phone call.', theme: 'quaternary', href: '#' },
      { title: '3. Meet the team', text: 'Meet your future colleagues in person.', theme: 'highlight', href: '#' },
      { title: '4. Offer & onboarding', text: 'Receive your offer and plan your first weeks.', theme: 'secondary', href: '#' }
    ]"
  />
</template>
```

Each chain card takes both its heading and body text color from its theme, so every step stays at WCAG AA contrast (≥ 4.5:1 body text) against its own card color, including the dark ones (purple, violet, teal, navy, anthracite), where the text is light.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `eyebrow` | `string` | `''` | |
| `title` | `string` | `''` | |
| `intro` | `string` | `''` | |
| `steps` | `{ title, text?, image?, href?, newTab?, theme? }[]` | | Required. `image`, `href`, `newTab` and `theme` only apply to `layout="chain"`. |
| `layout` | `'list' \| 'chain' \| 'grid'` | `'list'` | |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alignment of the `eyebrow`/`title`/`intro` head. |
| `marker` | `'number' \| 'check' \| 'none'` | `'number'` for `list`/`chain`, `'check'` for `grid` | Per-item glyph. |
| `columns` | `number` | `3` | `layout="grid"` only. |
| `action` | `{ label, href, newTab? }` | | `layout="list"` only. |
| `narrow` | `boolean` | `false` | Any layout. Opt-in 860px column. Off by default, so the section spans the same container width as every other section: see [Theming → Section width](../theming.md#section-width). |
