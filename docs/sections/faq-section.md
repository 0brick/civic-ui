# FaqSection

A heading and intro wrapped around an `Accordion`: the frequently-asked-questions block used on process and service pages.

## Import

```js
import { FaqSection } from 'civic-ui'
```

## Basic usage

`title` and `items` are all you need. Each item becomes one collapsible question:

```vue
<script setup>
import { FaqSection } from 'civic-ui'
</script>

<template>
  <FaqSection
    title="Frequently asked questions"
    :items="[
      { question: 'How long does an online application take to process?', answer: 'Usually three to five business days, depending on the type of application.' },
      { question: 'Can I book appointments at the resident office online?', answer: 'Yes, through the appointment booking tool on this site.' }
    ]"
  />
</template>
```

## With eyebrow and intro

Add `eyebrow` and `intro` for a fuller header, and as many `items` as the topic needs:

```vue
<script setup>
import { FaqSection } from 'civic-ui'
</script>

<template>
  <FaqSection
    eyebrow="FAQ"
    title="Frequently asked questions"
    intro="The most common questions about online applications and appointments."
    :items="[
      { question: 'How long does an online application take to process?', answer: 'Usually three to five business days, depending on the type of application. You can check the current status any time in your resident account.' },
      { question: 'Can I book appointments at the resident office online?', answer: 'Yes, through the appointment booking tool on this site. Most requests need no queue at all.' },
      { question: 'Is support available in multiple languages?', answer: 'Yes, the resident services team supports English, German and Turkish, with interpreters available on request for other languages.' }
    ]"
  />
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | | Required. |
| `eyebrow` | `string` | `''` | |
| `intro` | `string` | `''` | |
| `items` | `{ question, answer }[]` | `[]` | Ignored if the default slot is used instead. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alignment of the `eyebrow`/`title`/`intro` head. |
| `narrow` | `boolean` | `false` | Opt-in 860px column. Off by default, so the section spans the same container width as every other section: see [Theming → Section width](../theming.md#section-width). |

## Slots

| Slot | Notes |
|---|---|
| `default` | Overrides `items` with your own `AccordionItem` children, for question content beyond plain text. |
