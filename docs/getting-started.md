# Getting started

This page covers installing and consuming Civic UI **as a dependency in your own project**. If you want to work on Civic UI's own source instead, see [Contribute / develop locally](../README.md#contribute--develop-locally) in the root README.

## Install

```bash
npm install civic-ui vue
```

Civic UI requires Vue 3.4 or later.

## Register the components

There are two ways to consume the library: pick one per project, or mix them.

### A. Global plugin

Registers every component under a `Cui*` tag (kebab-case in templates: `<cui-button>`, `<cui-hero-section>`, …). The simplest option for a full site build:

```js
// main.js
import { createApp } from 'vue'
import CivicUI from 'civic-ui'
import App from './App.vue'

createApp(App).use(CivicUI).mount('#app')
```

### B. Named imports

Tree-shakeable and explicit: only the components you actually import end up in your bundle:

```vue
<script setup>
import { AppButton, Card, HeroSection } from 'civic-ui'
</script>
```

Both approaches load the same stylesheet, bundled into `dist/civic-ui.css` and pulled in automatically by `civic-ui`'s entry point: no separate CSS import needed.

To control when (or whether) the stylesheet loads, e.g. to place it at a specific point in your cascade or replace it with your own skin: import from `civic-ui/unstyled` instead. It has the same exports, just without the CSS side effect:

```js
import CivicUI from 'civic-ui/unstyled'
import 'civic-ui/style.css' // omit to style everything yourself
```

The CommonJS/UMD build (`require('civic-ui')`) never loads CSS; import `civic-ui/style.css` yourself there.

### UI language

The components' own texts (button labels, screen-reader labels, announcements) are English by default. For a German site, switch the whole catalog once, before mounting:

```js
import { configureI18n } from 'civic-ui'
import { de } from 'civic-ui/locales'

configureI18n(de)
```

See [Accessibility → Language and labels](accessibility.md#language-and-labels-wcag-312).

### Router integration

Register your router's link component once, and every data-driven link in the library navigates client-side for internal paths, without a `tag` on each component: section actions (`HeroSection`, `CtaBanner`, `PageIntro`, `MediaTextSection`), teaser cards, `StepsSection` steps, footer, top bar, breadcrumbs, list groups, sidebars and related links.

```js
import { configureLinks } from 'civic-ui'
import { RouterLink } from 'vue-router' // or NuxtLink

configureLinks({ linkComponent: RouterLink })
```

Internal means a root-relative path (`/contact`, `/news?page=2`, `/#team`) that isn't a file download (`/downloads/bylaws.pdf`). External links, `mailto:`/`tel:`, files and `newTab` links stay plain `<a>` elements. Pass your own rule as `isInternal`, e.g. `configureLinks({ linkComponent: RouterLink, isInternal: (href) => href.startsWith('/app/') })`. A component's `tag` prop still overrides the choice for that one element; `ListGroup`, `Sidebar` and `Breadcrumb` items also accept a router `to` instead of `href`. The library has no router dependency: it renders whatever component you register.

## Your first page

```vue
<template>
  <cui-hero-section title="Welcome" text="Built with Civic UI." />
</template>
```

Or, with named imports:

```vue
<script setup>
import { HeroSection } from 'civic-ui'
</script>

<template>
  <HeroSection title="Welcome" text="Built with Civic UI." />
</template>
```

## Where to go next

- [Theming](theming.md): design tokens, section color themes, swapping fonts.
- [Components](README.md#components) and [Sections](README.md#sections): the full reference, one page per building block.
- [Composables](composables.md): the small set of framework-level helpers (`useToast`, `useCookieConsent`, …) the components are built on.
- [Accessibility & privacy conformance](accessibility.md): what's implemented and why, mapped to WCAG 2.2 AA / EN 301 549 / BITV 2.0 and GDPR/BSI.
- [Security](security.md): the library's threat model and how to plug in your own sanitizer.
