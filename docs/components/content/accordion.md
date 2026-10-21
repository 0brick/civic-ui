# Accordion / AccordionItem

`Accordion` manages a group of collapsible `AccordionItem` panels, keeping only one open at a time by default: the standard FAQ pattern. Pass `multiple` to let several panels stay open at once. The toggle is a round +/− badge rather than a chevron, flipping from navy to gold when its panel opens.

## Import

```js
import { Accordion, AccordionItem } from 'civic-ui'
```

## Basic usage

Wrap a set of `AccordionItem`s in `Accordion`. Opening one closes any other that was open:

```vue
<script setup>
import { Accordion, AccordionItem } from 'civic-ui'
</script>

<template>
  <Accordion>
    <AccordionItem title="What does this library include?">
      Every component listed in the documentation, styled consistently.
    </AccordionItem>
    <AccordionItem title="Can I use my own colors?">
      Yes: override the CSS custom properties in tokens.css.
    </AccordionItem>
  </Accordion>
</template>
```

## Allowing multiple open panels

Set `multiple` on `Accordion` to let visitors open several panels at once instead of only one:

```vue
<script setup>
import { Accordion, AccordionItem } from 'civic-ui'
</script>

<template>
  <Accordion multiple>
    <AccordionItem title="Opening hours">
      The citizen's office is open Monday to Friday, 8:00-16:00, and Thursday until 18:00.
    </AccordionItem>
    <AccordionItem title="Do I need an appointment?">
      Walk-ins are welcome for simple requests. For passport renewals and registrations, book a slot online.
    </AccordionItem>
    <AccordionItem title="Which documents do I need to bring?">
      A valid photo ID and, for address changes, a signed confirmation from your landlord.
    </AccordionItem>
  </Accordion>
</template>
```

## Props

### Accordion

| Prop | Type | Default | Notes |
|---|---|---|---|
| `multiple` | `boolean` | `false` | Allow more than one panel open at the same time. |
| `headingLevel` | `number` | `3` | Heading level (2-6) of every item's title: match the page outline. |

### AccordionItem

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` |, (required) | The panel's heading, shown in the trigger button. |
| `headingLevel` | `number` | | Overrides the Accordion's `headingLevel` for this item (2-6; `3` outside an Accordion). |

## Slots

### AccordionItem

| Slot | Notes |
|---|---|
| `default` | The panel's content, shown when the item is open. |

## Accessibility notes

Each `AccordionItem` trigger is a real `<button>` with `aria-expanded` and `aria-controls` wired to its panel; the panel is a `role="region"` named by its trigger (`aria-labelledby`). Set `headingLevel` so the titles fit the page's heading outline (WCAG 1.3.1). Closed panels get `aria-hidden="true"` and `inert`, so their content is removed from both the accessibility tree and tab order until opened: screen reader and keyboard users never land on content that isn't visible.
