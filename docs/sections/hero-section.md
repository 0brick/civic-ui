# HeroSection

The full-bleed marketing hero. It covers two distinct visual patterns behind one component: a two-tone "text panel beside a photo" split layout (the default), and a full-bleed `stage` variant: one large photo or looping video behind centered or left-aligned copy. A `compact` size shrinks the split layout down to an interior-page header.

## Import

```js
import { HeroSection } from 'civic-ui'
```

## Basic hero

Every prop is optional: a `title` is all a basic hero needs:

```vue
<script setup>
import { HeroSection } from 'civic-ui'
</script>

<template>
  <HeroSection title="Your city government. Digital, open, for everyone." />
</template>
```

## Split hero with photo

Combine a [section theme](../theming.md#section-color-themes) with an `image` for the two-tone "text panel beside a photo" composition. On mobile the image fills the section with the text overlaid on a bottom gradient; from 900px up, text and image sit side by side instead:

```vue
<script setup>
import { HeroSection } from 'civic-ui'
import skyline from '../../assets/photos/skyline.jpg'
</script>

<template>
  <HeroSection
    eyebrow="Resident Portal"
    title="Your city government. Digital, open, for everyone."
    text="File permits online, track active building projects, and stay connected with your city, around the clock, without a waiting number."
    background="tertiary"
    :image="skyline"
    image-alt="City skyline at dusk"
    :primary-action="{ label: 'Explore online services', href: '#' }"
    :secondary-action="{ label: 'About the city', href: '#' }"
  />
</template>
```

## Sparse hero and vertical alignment

Leave out whatever a hero doesn't need, `title`, the actions, … An empty `title` renders no `<h1>` at all instead of an empty heading (make sure the page still has one elsewhere). Next to the photo, the remaining copy is vertically centered by default; `verticalAlign="start"` or `"end"` pins it to the top or bottom instead. The same prop positions the copy on a `stage` hero. On narrow screens the split layout always keeps its copy on the bottom gradient over the photo:

```vue
<script setup>
import { HeroSection } from 'civic-ui'
import skyline from '../../assets/photos/skyline.jpg'
</script>

<template>
  <HeroSection
    eyebrow="Welcome to Nordholm,"
    text="File permits online, track active building projects, and stay connected with your city, around the clock, without a waiting number."
    background="tertiary"
    :image="skyline"
    image-alt="City skyline at dusk"
    vertical-align="center"
  />
</template>
```

## Rich text: lists, paragraphs, links

The `text` prop is always rendered as plain text: HTML in it is escaped, never interpreted (which keeps it safe for CMS or user-supplied strings). For anything richer, fill the `text` slot instead; it replaces the `text` prop and is styled to match it:

```vue
<script setup>
import { HeroSection } from 'civic-ui'
import townhall from '../../assets/photos/townhall.jpg'
</script>

<template>
  <HeroSection
    eyebrow="Citizens' Office"
    title="What you can do online"
    background="secondary"
    :image="townhall"
    image-alt="City hall building"
  >
    <template #text>
      <ul>
        <li>Apply for a new ID card or passport</li>
        <li>Register a change of address</li>
        <li>Book an appointment at the <a href="#">citizens' office</a></li>
      </ul>
    </template>
  </HeroSection>
</template>
```

## Full-bleed stage

Set `stage` for a single strong photo (or video, via the `video` prop) filling the whole section, with a bottom-anchored veil for legibility instead of a CSS filter on the photo itself. `tone="grayscale"` desaturates the photo; `scrollTarget` renders a bouncing scroll-cue arrow pointing at an anchor further down the page:

```vue
<script setup>
import { HeroSection } from 'civic-ui'
import skyline from '../../assets/photos/skyline.jpg'
</script>

<template>
  <HeroSection
    stage
    align="center"
    tone="grayscale"
    title="City services, close to home"
    text="Permits, appointments and public records: everything Nordholm residents need, in one place."
    :image="skyline"
    image-alt="City skyline at dusk"
    scroll-target="#services"
    :primary-action="{ label: 'Book an appointment', href: '#' }"
    :secondary-action="{ label: 'Browse services', href: '#' }"
  />
</template>
```

`align="left"` keeps `stage` copy left-aligned while staying vertically centered: a plain full-bleed page header rather than a centered opening statement.

## Compact header

`size="compact"` shrinks the split (non-`stage`) layout to a 44vh interior-page header: the same `background`/`image`/`align` contract, just smaller. `Breadcrumb` sits below the hero, not layered over it: render it as a separate element right after:

```vue
<script setup>
import { Breadcrumb, HeroSection } from 'civic-ui'
import townhall from '../../assets/photos/townhall.jpg'
</script>

<template>
  <HeroSection
    size="compact"
    align="center"
    title="Careers at the City"
    text="Meaningful work, a dependable employer: help shape Nordholm's future."
    background="tertiary"
    :image="townhall"
    image-alt="City hall building"
  />
  <div class="cui-container" style="padding-block: var(--cui-space-4);">
    <Breadcrumb :items="[{ label: 'Home', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Application Process' }]" />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | `''` | Rendered as the page's `<h1>`; omitted entirely when empty. |
| `eyebrow` | `string` | | |
| `text` | `string` | | Plain text (HTML is escaped). Use the `text` slot for lists, paragraphs or links. |
| `background` | theme key \| color \| image URL | `'navy'` | See [Theming → Section color themes](../theming.md#section-color-themes). |
| `image` | `string` | | |
| `imageAlt` | `string` | | Text alternative for the image. With it, the photo is content (also on a `stage`); without it, the photo is treated as decoration and hidden from screen readers. |
| `imagePosition` | `'start' \| 'end'` | `'end'` | Split (non-`stage`) layout only. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | |
| `verticalAlign` | `'start' \| 'center' \| 'end'` | `'center'` | Vertical position of the copy beside the photo (split layout, from 900px up) or on the `stage` media. Narrow-screen split heroes always anchor it to the bottom. |
| `size` | `'default' \| 'compact'` | `'default'` | `compact` is a smaller interior-page header. |
| `stage` | `boolean` | `false` | Full-bleed variant with a bottom veil overlay; ignores `imagePosition`. |
| `fullHeight` | `boolean` | `false` | `stage` only (ignored on `size="compact"`): fills the rest of the viewport instead of the default 78vh. Whatever renders above the section (header, banners) is measured automatically, so header + hero are exactly one screen tall; set `--cui-header-offset` to override with a fixed value: see [Theming → `--cui-header-offset`](../theming.md#--cui-header-offset). |
| `caption` | `string` | `''` | `stage` only: a short photo credit / caption pinned to the bottom-right corner. |
| `video` | `string` (video or GIF URL) | | `stage` only: a looping, muted background video instead of a photo. Skips autoplay for `prefers-reduced-motion` visitors and shows a pause/play toggle for everyone else (WCAG 2.2.2). |
| `videoPoster` | `string` | | `stage` + `video` only: poster frame shown before the video can play (falls back to `image`). |
| `tone` | `'color' \| 'grayscale'` | `'color'` | `stage` only. |
| `scrollTarget` | `string` (anchor href) | | Renders a scroll-cue arrow when set, `stage` only. |
| `primaryAction` | `{ label, href, newTab? }` | | |
| `secondaryAction` | `{ label, href, newTab? }` | | |
| `imageFocus` | `string` | | Which part of the photo/video stays in frame: a CSS `object-position` like `'center 30%'` or `'70% top'`. Applies to every layout (split, stage, compact). |
| `imageFocusMobile` | `string` | | The same below 900px, where the crop is usually much narrower. Falls back to `imageFocus`. |
| `veil` | `'none' \| 'light' \| 'default' \| 'strong'` | `'default'` | Strength of the legibility veil over a photo/video (`stage`, `compact`). It's tinted with the palette's primary color, so a configured brand keeps its own ink. |
| `veilFrom` | `'bottom' \| 'start'` | `'bottom'` | `'start'` darkens from the text's side (follows `align`; centered copy keeps the bottom veil). |
| `titleSize` | `'default' \| 'display'` | `'default'` | `'display'` is a larger, tighter headline for a home-page opening statement. The title's measure is `--cui-hero-title-max` (`20ch`, `14ch` for display). |

## Tokens

| Token | Default | Notes |
|---|---|---|
| `--cui-hero-title-max` | `20ch` / `14ch` (`titleSize="display"`) | Line length of the title. `none` for the full width. |
| `--cui-hero-text-font` / `--cui-hero-text-style` | `inherit` / `normal` | Font family and style of the text below the title, e.g. `var(--cui-font-serif)` + `italic` for an editorial lead. |

The eyebrow's color comes from the `background` theme (see [Section color themes](../theming.md#section-color-themes)), contrast-checked for small text.

## Slots

| Slot | Notes |
|---|---|
| `text` | Rich body copy (lists, several paragraphs, links) in place of the `text` prop (takes precedence over it). |
| `default` | Extra action markup, rendered after `primaryAction`/`secondaryAction`. |

## Accessibility notes

`video` autoplay is skipped entirely for visitors with `prefers-reduced-motion` set, and a visible pause/play toggle is shown to everyone else: satisfying WCAG 2.2.2 (Pause, Stop, Hide). The same rule applies to `Carousel` autoplay elsewhere in the library.
