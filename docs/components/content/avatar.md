# Avatar

An image avatar with an automatic initials fallback and an optional presence dot. Falls back to initials whenever `src` is empty or the image fails to load, so a broken photo URL never leaves a blank box.

## Import

```js
import { Avatar } from 'civic-ui'
```

## Basic usage

Pass a `name`, with no `src`, `Avatar` renders the initials automatically:

```vue
<script setup>
import { Avatar } from 'civic-ui'
</script>

<template>
  <Avatar name="Anna Berger" />
</template>
```

## Sizes, shapes & status

Combine `size`, `shape`, and `status` to fit different contexts: a comment list, a team grid, an online-presence indicator:

```vue
<script setup>
import { Avatar } from 'civic-ui'
</script>

<template>
  <div class="cui-cluster" style="align-items: center;">
    <Avatar name="Anna Berger" size="sm" status="online" />
    <Avatar name="Jonas Keller" size="md" status="busy" />
    <Avatar name="Marie Lindqvist" size="lg" status="away" />
    <Avatar name="Team" size="xl" shape="square" />
  </div>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `src` | `string` | | Image URL. Falls back to initials when empty or on load error. |
| `name` | `string` | | Used to compute initials and as the image's `alt` text. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | |
| `shape` | `'circle' \| 'square'` | `'circle'` | |
| `status` | `'' \| 'neutral' \| 'online' \| 'offline' \| 'busy' \| 'away' \| 'success' \| 'warning' \| 'danger'` | `''` | Shows a small presence dot (plus the status as screen-reader text) in the given color. Omit for no dot. |
| `decorative` | `boolean` | `false` | Set when the name is already visible text right next to the avatar (a byline, a person card): the image gets `alt=""` and no hidden name is rendered, so screen readers don't read the name twice. `name` still provides the initials. |

## Accessibility notes

- The image's `alt` is `name`; with the initials fallback (no `src`, an image that failed to load, or a `src` the URL sanitizer rejected), `name` is visually hidden text instead, so the person is named either way: exactly once.
- Next to a visible name, pass `decorative` so the name isn't announced twice. `Card` (`layout="person"`) and `TestimonialSection` do this.
- **Status (WCAG 4.1.2 / 1.4.1).** The dot itself is `aria-hidden`; the status is visually hidden text next to it ("Online", "Busy", …, `avatar.status.*` in the locale catalog), so screen readers read "Ada Lovelace Online". The statuses also differ in shape, not only in color: online/success a filled dot, neutral a filled grey dot, offline a ring, busy/danger a dot with a bar, away/warning a crescent.
