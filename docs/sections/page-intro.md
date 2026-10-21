# PageIntro

A centered intro block that sits directly under a hero, framing the content that follows: a small kicker line, a heading, a lead paragraph, and an optional single action. It's quieter than `HeroSection`: meant to introduce a section of the page, not open the whole page.

## Import

```js
import { PageIntro } from 'civic-ui'
```

## Basic usage

`kicker`, `title`, and `text` are all optional and independently controlled: use whichever combination fits:

```vue
<script setup>
import { PageIntro } from 'civic-ui'
</script>

<template>
  <PageIntro
    kicker="Digital Government"
    title="Everything in one place"
    text="From resident parking permits to business registration: handle the most common city errands online, no appointment required."
  />
</template>
```

## With an action and extra content

Add `action` for a single centered call-to-action button, and put anything else (a secondary link, a small note) in the default slot below it:

```vue
<script setup>
import { PageIntro } from 'civic-ui'
</script>

<template>
  <PageIntro
    kicker="Careers"
    title="Join the City of Nordholm"
    text="We're hiring across public works, IT, and administration. Browse open roles and find out what it's like to work for the city."
    :action="{ label: 'View open positions', href: '#' }"
  >
    <p>New postings are added every Monday: check back regularly or sign up for job alerts.</p>
  </PageIntro>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `kicker` | `string` | `''` | Small label line above the title. |
| `title` | `string` | `''` | Rendered as an `<h2>`. |
| `text` | `string` | `''` | Lead paragraph. |
| `align` | `'left' \| 'center' \| 'right'` | `'center'` | Alignment of the kicker/title/text/action block. |
| `action` | `{ label, href, newTab? }` | | Single call-to-action button, positioned to match `align`. |
| `narrow` | `boolean` | `false` | Opt-in 860px column. Off by default, so the section spans the same container width as every other section: see [Theming → Section width](../theming.md#section-width). |

## Slots

| Slot | Notes |
|---|---|
| `default` | Extra content rendered below the action, e.g. a secondary link or note. |
