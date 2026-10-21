# Lightbox

A full-screen image viewer built on [Modal](modal.md) `size="full"`, so focus trap, scroll lock, Escape and focus return work as in every dialog. It adds previous/next buttons, the arrow keys, swipe on touch screens and a counter ("Image 2 of 5"). [ImageGallery](../content/image-gallery.md) uses it; on its own it opens via `v-model` or the exposed `open(index)`.

## Import

```js
import { Lightbox } from 'civic-ui'
```

## Usage

```vue
<script setup>
import { ref } from 'vue'
import { AppButton, Lightbox } from 'civic-ui'

const viewer = ref(null)
const plans = [
  { src: '/plans/ground-floor.png', alt: 'Ground floor plan' },
  { src: '/plans/first-floor.png', alt: 'First floor plan', caption: 'Classrooms and library' }
]
</script>

<template>
  <AppButton variant="outline" @click="viewer.open(0)">View floor plans</AppButton>
  <Lightbox ref="viewer" :images="plans" />
</template>
```

Controlled instead: `<Lightbox v-model="open" v-model:index="index" :images="plans" />`.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `images` | `{ src, alt, caption? }[]` | `[]` | |
| `modelValue` | `boolean` | `false` | Open state (`v-model`). |
| `index` | `number` | `0` | The shown image (`v-model:index`); stepping wraps around. |

## Exposed methods

| Method | Notes |
|---|---|
| `open(index = 0)` | Opens at that image. |
| `close()` | |

## Localization

The texts come from the [i18n catalog](../../accessibility.md#language-and-labels-wcag-312):

| Key | Default |
|---|---|
| `lightbox.label` | `'Image viewer'`: the dialog's name when it shows a single image |
| `lightbox.status` | `'Image {current} of {total}'`: the dialog title, also announced on every step |
| `lightbox.previous` / `lightbox.next` | `'Previous image'` / `'Next image'` |

## Accessibility notes

The counter is the dialog's heading and accessible name; each step is announced through a polite live region together with the image's `alt` ("Image 3 of 5: Classroom"), like the [Carousel](../content/carousel.md)'s slide status. The arrow keys work wherever focus is inside the open dialog. The stage uses the dark section theme (`data-cui-theme="dark"`), so its colors follow the palette.
