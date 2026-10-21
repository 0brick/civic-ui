# Dropdown

The one trigger-and-menu primitive in Civic UI. By default the trigger is whatever you put in the `#trigger` slot and the menu is the default slot; `triggerVariant` swaps in a built-in trigger for two common cases: a labeled nav item (mega menu) and an account menu.

## Import

```js
import { Dropdown } from 'civic-ui'
```

## Basic usage (custom trigger)

Put any element in the `#trigger` slot and menu items in the default slot:

```vue
<script setup>
import { AppButton, Dropdown } from 'civic-ui'
</script>

<template>
  <Dropdown>
    <template #trigger><AppButton variant="outline">Options ▾</AppButton></template>
    <a href="#">Edit</a>
    <a href="#">Duplicate</a>
    <button type="button">Delete</button>
  </Dropdown>
</template>
```

## Chevron-label trigger (mega menu)

`trigger-variant="chevron-label"` renders a built-in labeled nav item with a chevron, the trigger for a mega menu. Drop it inside `Navbar`'s `links` slot alongside plain `<a>` items. `highlight` renders it as a filled pill instead, for an emphasized nav item like "Careers":

```vue
<script setup>
import { Dropdown } from 'civic-ui'
</script>

<template>
  <Dropdown trigger-variant="chevron-label" label="Solutions">
    <a href="#">For Teams</a>
    <a href="#">For Agencies</a>
    <a href="#">For Enterprises</a>
  </Dropdown>
</template>
```

## User account trigger

`trigger-variant="user"` renders a built-in avatar-and-name account trigger:

```vue
<script setup>
import { Dropdown } from 'civic-ui'
</script>

<template>
  <Dropdown trigger-variant="user" name="Anna Berger" role="Administrator">
    <a href="#">Profile</a>
    <a href="#">Settings</a>
    <button type="button">Sign out</button>
  </Dropdown>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `align` | `'start' \| 'end'` | `'start'` | Which side of the trigger the menu is anchored to. |
| `triggerVariant` | `'custom' \| 'chevron-label' \| 'user'` | `'custom'` | `'custom'` renders whatever is in the `#trigger` slot; a `#trigger` slot always overrides the built-in trigger even when `triggerVariant` is set. |
| `label` | `string` | | `triggerVariant="chevron-label"`: the nav item's text. |
| `highlight` | `boolean` | `false` | `triggerVariant="chevron-label"`: renders as a filled pill instead of a plain nav link, for an emphasized item. |
| `name` | `string` | | `triggerVariant="user"`: the account name shown next to the avatar. |
| `role` | `string` | | `triggerVariant="user"`: shown under the name, e.g. a job title or permission level. |
| `avatar` | `string` | | `triggerVariant="user"`: image src passed to the internal `Avatar`. |

## Slots

| Slot | Notes |
|---|---|
| `trigger` | Scoped with `{ open, toggle, menuId }`. Overrides whichever built-in trigger `triggerVariant` would otherwise render: wire `open`/`toggle`/`menuId` onto your own trigger element for correct `aria-expanded`/`aria-controls`. |
| `default` | The menu content, typically `<a>`/`<button>` rows. Scoped with `{ close }` so an item can close the menu itself after acting. |

## Inside a Navbar

A `triggerVariant="chevron-label"` Dropdown in [Navbar](navbar.md)'s `links` slot (or generated from its `items`) adapts to where it renders:

- **Desktop link row:** the trigger takes the row's typography, the `--cui-nav-*` tokens, so it looks exactly like the links beside it, including the hover/active color. `highlight` stays the deliberate exception.
- **Mobile drawer:** it renders as an expanded group, a small label with the links indented below it, instead of a flyout, and following one of its links closes the drawer.

## Styling the menu

The menu panel reads `--cui-dropdown-bg` (default `--cui-surface-raised`), `--cui-dropdown-text` (default `--cui-text`) and `--cui-dropdown-hover-bg` (default `--cui-bg-subtle`); the defaults follow the surface tokens, so the [dark color mode](../../theming.md#dark-and-light-mode) needs no overrides. A menu link with `aria-current="page"` is shown in the link color.

## Accessibility notes

The menu panel intentionally does not use `role="menu"`: it can hold arbitrary slotted content (nav links, action buttons, a whole mega-menu), not a strict action list, so `Dropdown` doesn't claim a role whose required arrow-key/roving-tabindex behavior it doesn't implement: an incomplete `role="menu"` would be worse for screen-reader users than no special role at all. The built-in triggers (`chevron-label`/`user`) wire `aria-expanded`/`aria-controls` automatically; a custom `#trigger` slot needs to wire the same attributes itself using the scoped slot props. `Escape` closes the menu and returns focus to the trigger. A click outside, or keyboard focus leaving the menu (Tab past the last item), closes it too, so an open menu never keeps covering the content the user tabbed on to (WCAG 2.4.11).

The `user` trigger's accessible name is the account name and role ("Anna Berger Administrator"). The avatar is `decorative`, so the name isn't read twice; below 640px, where only the avatar shows, name and role stay in the button as visually hidden text instead of disappearing with `display: none`.
