# SvgImage

Uses an SVG file the way you'd use `<img src>` (a logo, a crest, a pictogram) with an optional `contrast` mode that recolors it so it stays legible on whatever it sits on, following the WCAG contrast rules instead of a fixed color.

## Import

```js
import { SvgImage } from 'civic-ui'
```

## Following the theme text color

`contrast="theme"` paints the graphic in the surrounding text color (`currentColor`). Every civic-ui theme already pairs its text color with its background at WCAG-safe contrast, so the graphic follows it, on a navy hero it turns white, on a light card it turns navy. Without `width`/`height` it's a `1em` square, so it scales with the text next to it:

```vue
<script setup>
import { SvgImage } from 'civic-ui'
import crest from '../../assets/icons/city-crest.svg'
</script>

<template>
  <p style="display: flex; align-items: center; gap: 0.8rem; font-size: 2rem; font-weight: 700; margin: 0">
    <SvgImage :src="crest" contrast="theme" />
    City of Nordholm
  </p>
</template>
```

## Automatic contrast on any background

`contrast="auto"` measures the background color of the nearest ancestor that has one and derives a navy- or white-based color that clears **4.5:1** against it: above the 3:1 WCAG 1.4.11 (Non-text Contrast) requires for graphics:

```vue
<script setup>
import { SvgImage } from 'civic-ui'
import crest from '../../assets/icons/city-crest.svg'

const backgrounds = [
  { label: 'White', bg: '#ffffff' },
  { label: 'Navy', bg: '#001d35' },
  { label: 'Gold', bg: '#ffed3e' },
  { label: 'Teal', bg: '#00606e' }
]
</script>

<template>
  <div class="cui-cluster">
    <div
      v-for="b in backgrounds"
      :key="b.label"
      :style="{ background: b.bg, padding: '2.4rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,.08)' }"
    >
      <SvgImage :src="crest" contrast="auto" height="56" :alt="`City crest on ${b.label.toLowerCase()}`" />
    </div>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `src` | `string` | | Required. URL of the SVG (or any image with transparency). Passed through `sanitizeMediaUrl` like every other media URL. |
| `alt` | `string` | `''` | What the graphic conveys. Empty marks it decorative (`aria-hidden`); otherwise it's exposed as `role="img"` with this label. |
| `contrast` | `'none' \| 'theme' \| 'auto'` | `'none'` | `none` keeps the file's own colors (plain `<img>`); `theme` uses the text color; `auto` measures the background. |
| `width` | `string \| number` | | CSS length; numbers are px. Give only one of `width`/`height` and the other follows the file's aspect ratio. |
| `height` | `string \| number` | | Recolored modes default to a `1em` square when neither is set; `none` uses the file's own size. |

## Exposed methods

| Method | Notes |
|---|---|
| `refreshContrast()` | Re-measures the background for `contrast="auto"`: call it after changing the background behind the graphic at runtime (e.g. after `applyPalette()`). |

## How recoloring works

The `theme`/`auto` modes don't fetch the file and inline its markup. They render a `<span>` that uses the SVG as a CSS `mask-image`, painted with the chosen color. So no third-party SVG markup ever reaches the DOM: there are no `<script>`s or event handlers to sanitize, and it works with any file. Keep in mind:

- **Recoloring is monochrome.** Every visible part of the graphic gets the one color. Use `contrast="none"` for multi-color artwork.
- **Cross-origin files need CORS.** Browsers load mask images in CORS mode, so an SVG from another origin only shows if that server sends `Access-Control-Allow-Origin`. Same-origin and bundled assets (`import logo from './logo.svg'`) just work.
- **`auto` needs a solid background color.** If it reaches a background image or gradient first, it can't read a color and falls back to `currentColor` (same as `theme`). Over photos, use `theme` inside a section that sets a contrast-safe text color.
- **Forced colors (Windows High Contrast):** the graphic is painted in the system `CanvasText` color, so it doesn't vanish.
