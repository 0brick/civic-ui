# MediaTextSection

The split image/text content section: the workhorse for long-form content pages. It covers two content shapes behind one skeleton, picked automatically by which props are set: plain body copy (`text`) or a divided feature list (`items`). The `visual` slot swaps the image for any custom visual.

## Import

```js
import { MediaTextSection } from 'civic-ui'
```

## Basic usage

The default text mode needs `title`, `text` and an `image`. Add `action` for a button underneath the copy:

```vue
<script setup>
import { MediaTextSection } from 'civic-ui'
import park from '../../assets/photos/park.jpg'
</script>

<template>
  <MediaTextSection
    eyebrow="Closer Look"
    title="More green space for Nordholm"
    text="The 2030 climate action program is bringing three new parks, additional street trees, and greener courtyards: planned together with the residents of each neighborhood."
    :image="park"
    image-alt="A tree-lined path in a city park"
    :action="{ label: 'More about the climate program', href: '#' }"
  />
</template>
```

## Feature list mode

Pass `items` instead of relying on `text` alone to switch to a divided list of named points next to the image, `text` still renders as a short lead paragraph above the list:

```vue
<script setup>
import { MediaTextSection } from 'civic-ui'
import digitalServices from '../../assets/photos/digital-services.jpg'
</script>

<template>
  <MediaTextSection
    eyebrow="Resident Services"
    title="Services at a glance"
    text="The most-used counters, now available online as well as in person."
    :image="digitalServices"
    image-alt="A blank laptop screen on a desk"
    :items="[
      { title: 'Permits & applications', text: 'Building permits, business licenses and residency registration in one queue.' },
      { title: 'Appointments', text: 'Book a single visit or a recurring slot, whichever your request needs.' }
    ]"
  />
</template>
```

## Custom visual (e.g. a map)

The `visual` slot replaces the image with anything else. There is deliberately **no built-in map embed**: an `<iframe>` to OpenStreetMap or another tile server contacts a third-party host, and hands it the visitor's IP address, as soon as the page loads, without consent. For a map, put a [ConsentEmbed](../components/content/consent-embed.md) in the slot: it shows a note and a load button and only requests the map after the visitor clicked it.

```vue
<script setup>
import { ConsentEmbed, MediaTextSection } from 'civic-ui'
</script>

<template>
  <MediaTextSection subtle eyebrow="Coverage" title="Serving all of Nordholm" text="District offices across every ward.">
    <template #visual>
      <ConsentEmbed
        provider="osm"
        src="https://www.openstreetmap.org/export/embed.html?bbox=13.30%2C52.45%2C13.50%2C52.55"
        title="Nordholm service area"
        ratio="1/1"
      />
    </template>
  </MediaTextSection>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `eyebrow` | `string` | `''` | |
| `title` | `string` | `''` | |
| `text` | `string` | `''` | Plain body copy in text mode; the lead paragraph above the list in feature mode. |
| `items` | `{ title, text }[]` | `[]` | Passing a non-empty array enables feature mode. |
| `image` | `string` | `''` | |
| `imageAlt` | `string` | `''` | |
| `reverse` | `boolean` | `false` | Flips which side the visual sits on. |
| `subtle` | `boolean` | `false` | Sunken section background. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alignment of the `eyebrow`/`title`/`text` head in the text column. |
| `action` | `{ label, href, newTab? }` | | Text mode only. |

## Slots

| Slot | Notes |
|---|---|
| `visual` | Replaces the image with any custom visual, in both modes, e.g. a consent-gated map (see above). |
| `default` | Extra body content rendered below the text/feature list. |
