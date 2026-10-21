# Quote

A pull-quote: a `<figure>` with the quote in a `<blockquote>` and its source in a `<figcaption>` (name, role, optional avatar). Use it inside running text (a `.cui-prose` column, an article) or as a large opening quote; `TestimonialSection`'s `layout="feature"` renders exactly this component.

## Import

```js
import { Quote } from 'civic-ui'
```

## Basic usage

```vue
<Quote quote="Since the new school opened, my daughter walks there in ten minutes." name="Maria K." role="Parent" />
```

## Inside running text

`appearance="border"` is the quieter inline variant: an accent rule on the leading side, a subtle field, and the source in small capitals after an em dash. Longer quotes go in the default slot:

```vue
<div class="cui-prose">
  <p>Paragraph before the quote …</p>
  <Quote appearance="border" name="Mayor Weber" color="secondary">
    <p>We are not building for ourselves, but for the next generation.</p>
  </Quote>
  <p>Paragraph after the quote …</p>
</div>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `quote` | `string` | `''` | The quote text; the default slot takes precedence (for several paragraphs or markup). |
| `name` | `string` | `''` | The source, in the `figcaption`. |
| `role` | `string` | `''` | Shown under (or, with `border`, after) the name. |
| `avatar` | `string` | `''` | Image URL shown beside the source (not in `border`). |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | |
| `size` | `'md' \| 'lg'` | `'md'` | `lg` is the large serif pull-quote of `TestimonialSection`'s feature layout. |
| `appearance` | `'mark' \| 'border' \| 'card'` | `'mark'` | `mark`: a large quotation mark above the text. `border`: an accent rule on the leading side, for quotes inside text. `card`: a raised box. |
| `color` | theme key \| CSS color | accent role | Color of the quotation mark and the rule: a [section theme](../../theming.md#section-color-themes) / palette role (`'secondary'`, `'tertiary'`, …) or a color. |

## Slots

| Slot | Notes |
|---|---|
| `default` | The quote text, in place of the `quote` prop. |

## Accessibility notes

The quote is a real `<blockquote>` inside a `<figure>` with the attribution in `<figcaption>`: the source is associated with the quote, not part of it (a `<footer>` inside the `<blockquote>` would make the attribution part of the quoted text). The decorative quotation mark is `aria-hidden`, and the `avatar` image has `alt=""`: the name is the text right beside it, so it's read once, not twice.
