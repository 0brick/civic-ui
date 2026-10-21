# Placeholder

A skeleton-loading block: a shimmering rectangle that stands in for content while it loads. Compose several together to sketch the shape of the content underneath: a heading, a paragraph, an avatar.

## Import

```js
import { Placeholder } from 'civic-ui'
```

## Basic usage

Stack a few placeholders to sketch a block of text while it loads:

```vue
<script setup>
import { Placeholder } from 'civic-ui'
</script>

<template>
  <div class="cui-stack" style="max-width: 420px;">
    <Placeholder height="2.4rem" width="60%" />
    <Placeholder height="1.4rem" />
    <Placeholder height="1.4rem" width="80%" />
  </div>
</template>
```

## Avatar and text skeleton

Use `rounded="pill"` for a circular placeholder to sketch an avatar next to a name and role:

```vue
<script setup>
import { Placeholder } from 'civic-ui'
</script>

<template>
  <div class="cui-cluster" style="align-items: center;">
    <Placeholder width="4.8rem" height="4.8rem" rounded="pill" />
    <div class="cui-stack" style="gap: 0.6rem;">
      <Placeholder width="12rem" height="1.6rem" />
      <Placeholder width="8rem" height="1.2rem" />
    </div>
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `width` | `string` | `'100%'` | Any CSS width value. |
| `height` | `string` | `'1.6rem'` | Any CSS height value. |
| `rounded` | `'sm' \| 'md' \| 'lg' \| 'pill'` | `'md'` | Use `pill` for circular avatars. |
| `animated` | `boolean` | `true` | Set `false` for a static block, e.g. when respecting a user's motion preference at a higher level. |
