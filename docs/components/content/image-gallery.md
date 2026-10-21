# ImageGallery

A grid of thumbnails that open in a [Lightbox](../overlay/lightbox.md): a photo gallery for a news article, an event, a building project. Each thumbnail is a button named after its image ("Enlarge image: Town hall"); closing the lightbox returns focus to the thumbnail it was opened from.

## Import

```js
import { ImageGallery } from 'civic-ui'
```

## Basic usage

```vue
<ImageGallery
  :images="[
    { src: '/photos/school.jpg', thumb: '/photos/school-480.webp', alt: 'The new school building', caption: 'Opened in May' },
    { src: '/photos/park.jpg', alt: 'The park next to the school' },
    { src: '/photos/townhall.jpg', alt: 'Town hall' }
  ]"
/>
```

`thumb` is the small file the grid loads (lazily); `src` is the large one the lightbox shows. Without `thumb` the grid uses `src`.

## Columns and ratio

`columns="auto"` (default) fills each row with tiles at least `minWidth` wide. A number fixes the count on wide screens and still wraps to fewer columns once a tile would get narrower than `minWidth`. `ratio` crops all thumbnails to one shape:

```vue
<ImageGallery :images="images" :columns="3" ratio="1/1" min-width="12rem" />
```

## A single zoomable image

`ratio="auto"` keeps each image's own shape (no cropping). With one image and `columns="1"` that is a picture inside running text that enlarges on click:

```vue
<ImageGallery :images="[{ src: '/plans/site-plan.png', alt: 'Site plan of the new district' }]" :columns="1" ratio="auto" />
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `images` | `{ src, alt, thumb?, caption? }[]` | `[]` | `caption` is shown under the thumbnail and in the lightbox. |
| `ratio` | `string` | `'4/3'` | Thumbnail aspect ratio, e.g. `'1/1'`, `'16/9'`; `'auto'` = uncropped. |
| `columns` | `'auto' \| 1-6` | `'auto'` | |
| `minWidth` | `string` | `'16rem'` | Smallest tile width (`rem`, `px`, `em`, `ch` or `%`). |
| `lightbox` | `boolean` | `true` | `false`: plain images (with their `alt`), no buttons. |

## Localization

The thumbnail labels come from the [i18n catalog](../../accessibility.md#language-and-labels-wcag-312): `lightbox.open` (`'Enlarge image: {alt}'`) and, for an image without `alt`, `lightbox.openNumber` (`'Enlarge image {n}'`). The lightbox's own texts are listed on its [page](../overlay/lightbox.md#localization).

## Accessibility notes

The grid is a list (`<ul>`), each image a `<figure>`. With the lightbox on, the thumbnail `<img>` has an empty `alt` because the button around it already carries the name: a screen reader hears it once. The hover zoom is switched off under `prefers-reduced-motion`.
