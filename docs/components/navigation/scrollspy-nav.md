# ScrollspyNav

A vertical "on this page" navigation that highlights whichever section is currently in view as the reader scrolls: useful alongside long-form policy documents, reports, or article pages.

## Import

```js
import { ScrollspyNav } from 'civic-ui'
```

## Basic usage

Each item's `id` must match the `id` of a real element further down the page:

```vue
<script setup>
import { ScrollspyNav } from 'civic-ui'
</script>

<template>
  <div class="cui-cluster" style="align-items: flex-start; gap: 2.4rem;">
    <ScrollspyNav
      :items="[
        { id: 'spy-overview', label: 'Overview' },
        { id: 'spy-pricing', label: 'Pricing' },
        { id: 'spy-faq', label: 'FAQ' }
      ]"
      sticky
    />
    <div>
      <section id="spy-overview">
        <h3>Overview</h3>
        <p>A short introduction to the product lives here.</p>
      </section>
      <section id="spy-pricing">
        <h3>Pricing</h3>
        <p>Plan details and pricing tiers live here.</p>
      </section>
      <section id="spy-faq">
        <h3>FAQ</h3>
        <p>Common questions live here.</p>
      </section>
    </div>
  </div>
</template>
```

`sticky` keeps the nav in view below a sticky `Navbar` (it adds the [`.cui-sticky`](../../utilities.md#sticky-elements-and-in-page-anchors) utility): no inline `position: sticky` needed.

## Table of contents box

For a longer document (for example, the sections of an ordinance) `title` adds a visible heading that also names the nav landmark, and `appearance="card"` frames it as a box. Beside the text in a `.cui-grid--aside` it needs no CSS of its own:

```vue
<script setup>
import { ScrollspyNav } from 'civic-ui'
</script>

<template>
  <div class="cui-grid cui-grid--aside cui-grid--aside-start">
    <ScrollspyNav
      title="Contents"
      appearance="card"
      sticky
      :items="[
        { id: 'policy-purpose', label: 'Purpose' },
        { id: 'policy-scope', label: 'Scope' },
        { id: 'policy-definitions', label: 'Definitions' },
        { id: 'policy-obligations', label: 'Obligations' },
        { id: 'policy-enforcement', label: 'Enforcement' }
      ]"
    />
    <div>
      <section id="policy-purpose">
        <h3>Purpose</h3>
        <p>Why this ordinance exists and the problem it addresses.</p>
      </section>
      <!-- ...one <section> per item, each with a matching id -->
    </div>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ id, label }[]` | (required) | `id` must match a real element's `id` attribute elsewhere on the page; that element is what gets tracked for the active/in-view state. |
| `title` | `string` | `''` | Visible heading above the links; also the nav's accessible name (via `aria-labelledby`). Without it the nav is labelled "On this page" (`scrollspy.label` in the i18n catalog). |
| `appearance` | `'plain' \| 'card'` | `'plain'` | `card`: a framed box with padding, border and radius. |
| `sticky` | `boolean` | `false` | Sticks below a sticky `Navbar` (`.cui-sticky`). |
| `scrollOffset` | `string` (CSS length) | `''` | Extra room above each target when a link jumps to it, set as `scroll-margin-top` on the target elements (restored on unmount). |

## Jump offset

Jumping to a section already lands below a sticky `Navbar`: the root `scroll-padding-top` follows its height (see [Sticky elements and in-page anchors](../../utilities.md#sticky-elements-and-in-page-anchors)). `scrollOffset` adds room on top of that for every target listed in `items`, so their headings need no `scroll-margin-top` of their own. With a header that isn't a civic-ui `Navbar`, set `--cui-navbar-height` to its height instead.
