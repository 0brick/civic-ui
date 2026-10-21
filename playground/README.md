# Civic UI playground

The interactive catalog behind [`docs/`](../docs/README.md): a Vue app that browses every component and section live, with a props/events/slots table and copy-pasteable examples for each. Nothing here ships in the published `civic-ui` package; it exists only to develop and document the library.

```bash
npm run dev
```

opens it at `http://localhost:5173`.

The public deployment at `civic.servergedoens.de` runs on GitHub Pages and is published by the `Pages` workflow (`.github/workflows/pages.yml`). `npm run build` builds the library into `dist/` and the playground into `playground-dist/`.

## Structure

- `src/registry/components.js`, `src/registry/sections.js`: one entry per component/section: its category, prop/event/slot tables, and an ordered `examples` array (simplest first).
- `src/examples/components/*.vue`, `src/examples/sections/*.vue`: the example files themselves. Each is a small, self-contained `<script setup>` component. A registry entry's `demo` loader renders the file live; its `source` loader (a `?raw` import of the same file) is what's shown as the copy-pasteable code block, so the two can never drift apart.
- `src/pages/HomePage.vue`: the **Home** tab: a landing page built entirely from civic-ui's own sections, so it doubles as a live example.
- `src/pages/ComponentsOverviewPage.vue`, `src/pages/SectionsOverviewPage.vue`: the category-grouped catalog pages.
- `src/pages/DetailPage.vue`: the per-component/section page: API reference tables (via `src/components/ApiTable.vue`) plus the example switcher.
- `src/pages/ThemePage.vue`: the **Theme** tab: a live configurator for `civic-ui`'s color-palette engine (`src/utils/palette.js`) against the real components, with a WCAG contrast report. Applies globally via `applyPalette()` and resets on unmount, so it never leaks into other doc pages.
- `src/router.js`: a minimal path-based router (`/`, `/components/:slug`, `/sections/:slug`), with a `public/404.html` fallback so static hosting can serve deep links. No `vue-router` dependency.

## Adding or editing an example

1. Add or edit a `.vue` file under `src/examples/components/` or `src/examples/sections/`. Keep it self-contained: import only from `'civic-ui'` (plus `vue` for local `ref` state), and reuse the existing photos in `src/assets/photos/` rather than adding new ones.
2. Reference it from the matching entry's `examples` array in `src/registry/components.js` / `src/registry/sections.js`, with a short `title` (and an optional one-sentence `description`).
3. Order `examples` from simplest to most configured: the first example should need the fewest props to make sense; later ones layer on configuration or show a distinct layout/variant.

If you're documenting a genuinely new component (not just adding an example), also add its prop/event/slot data to that registry entry and write the matching page under [`docs/`](../docs/README.md): the two are meant to describe the same API in two forms, live and static.
