# Civic UI

Vue 3 component library for public-sector and institutional websites. Plain JavaScript with `<script setup>`, scoped CSS, no runtime dependencies besides the `vue` peer. Every component must meet the requirements in `standards/` (WCAG 2.2 AA, EN 301 549, BITV 2.0, GDPR, OWASP ASVS 5.0, BSI APP.3.1). Read `CONTRIBUTING.md` for the rules.

## Start here

- `docs/component-index.md`: every component and section with file, props (type, allowed values, default), emits, slots, what it builds on and what uses it. Look components up here before opening their source.
- `docs/<topic>.md`: theming, accessibility, security, composables, utilities.
- `docs/components/<group>/<name>.md`, `docs/sections/<name>.md`: the public API of one component.

## Commands

```bash
npm run dev               # playground, http://localhost:5173
npm test                  # vitest: unit, axe, CSS contract tests
npx vitest run test/components/Tabs.spec.js   # one file
npm run lint              # eslint
npm run build:lib         # library + types into dist/
npm run docs:index        # regenerate docs/component-index.md (CI checks it)
npm run test:a11y-e2e     # built playground in headless Chromium; needs Node 22+ and Chrome
npm run release -- minor  # release PR: bump version, move CHANGELOG entries (see CONTRIBUTING.md)
npm run release -- tag    # after the merge: tag main, CI publishes to npm
```

## Repository map

| Path | Contents |
| --- | --- |
| `src/index.js` | All exports: named components, `Cui*` names for the plugin, composables, utils |
| `src/components/{button,content,feedback,forms,navigation,overlay}/` | Components |
| `src/components/internal/` | Not exported: `CuiLink`, `NewTabHint`, `NavItems`, `NavContext` |
| `src/sections/` | Page sections composed from components (hero, footer, FAQ, ...) |
| `src/layout/AppShell.vue` | Webapp shell: sidebar, top bar, content |
| `src/composables/` | `useToast`, `useCookieConsent`, `useColorMode`, `useFocusTrap`, `useScrollLock`, `useScrollspy`, `useId`, `useClickOutside`, `useReveal` |
| `src/utils/` | `security.js` and `sanitizeMarkup.js` (sanitizers), `themes.js` (section themes), `palette.js` (palette engine), `color.js` (contrast math), `links.js`, `i18n.js`, `focus.js`, `imageTone.js` |
| `src/locales/{en,de}.js` | Every visible and screen-reader-only library text |
| `src/styles/` | `tokens.css` (all `--cui-*` tokens and dark mode), `base.css`, `utilities.css` |
| `cli/` | `civic-ui audit`: WCAG and security audit for consumer projects |
| `docs/` | Public documentation. Folder names match `src/components/` |
| `standards/` | Requirement lists per standard, maintained by hand |
| `playground/` | Live catalog. Registry in `playground/src/registry/`, examples in `playground/src/examples/` |
| `test/` | Vitest + jsdom: `components/`, `composables/`, `utils/`, `styles/`, `a11y/axe.spec.js`, `audit/` |
| `scripts/` | `build.mjs`, `a11y-e2e.mjs`, `component-index.mjs`, `release.mjs` |

## Layering

```
tokens.css, base.css, utilities.css
utils: color <- themes <- palette | security | links <- i18n
internal: CuiLink, NewTabHint
primitives: AppButton, CloseButton, Avatar, Badge, ProgressBar, Placeholder
composites: Modal (focus trap, scroll lock) <- Lightbox, Navbar drawer, AppShell
            Card, DataTable, StatCard, ConsentEmbed, Dropdown, Carousel, Accordion
sections: built only from components and utils
```

## Core systems

- **Tokens:** colors only via `var(--cui-*)`. Raw palette `--cui-color-*`, semantic tokens `--cui-text`, `--cui-bg`, `--cui-surface*`, `--cui-primary`, `--cui-accent`, `--cui-link`, `--cui-focus-ring`, `--cui-border*`. Root font size is 10px based (`1.6rem` = 16px).
- **Dark mode:** `data-cui-mode="light|dark|auto"` on `<html>` redefines semantic tokens. `--cui-primary` becomes a light fill in dark mode; for things that must stay dark use `--cui-color-navy`. `data-cui-theme="dark"` on an element switches nested tokens to on-dark values.
- **Section themes:** `background` props take a theme key (`navy`, `teal`, `purple`, `violet`, `sky`, `gold`, `anthracite`, `light`), a role alias (`primary`, `secondary`, `accent`, ...) or a CSS color. Resolve with `resolveBackground()` from `utils/themes.js`. Never add separate text color and background color props.
- **i18n:** `t('group.key', { param })` from `utils/i18n.js`. New keys go into both `en.js` and `de.js`. A component's own label prop wins over the catalog.
- **Links:** data-driven links render through `CuiLink` (router-aware, sanitized, `newTab` handling) plus `<NewTabHint v-if="newTab" />`. Link objects are `{ label, href, newTab? }`.
- **Security:** `sanitizeUrl` for `href`, `sanitizeMediaUrl` + `mediaReferrerPolicy()` for `src`, `sanitizeCssUrl` for `background-image`, `sanitizeHtml` for every `v-html` (with an eslint-disable comment pointing at it).
- **Overlays:** always build on `Modal`; it brings focus trap, scroll lock, Escape, focus return and teleport.
- **Privacy:** never add a request to another host. Third-party content goes through `ConsentEmbed`.

## Component conventions

- A short header comment at the top of `<script setup>`: purpose and enum values. Its first sentence becomes the summary in `docs/component-index.md`.
- One prop per line. Enums use an inline validator: `validator: (v) => ['a', 'b'].includes(v)` (`defineProps` cannot reference a local constant).
- Common prop names: `align`, `size`, `appearance`, `background`, `color`, `headingLevel`, `action`/`secondaryAction`, `tag`, `items`.
- Root class `cui-<kebab-name>`, BEM-style `__element`/`--modifier`, scoped CSS, `:where()` for resets that should lose to layout spacing.
- Respect `prefers-reduced-motion` and `forced-colors`.
- Put template comments inside the root element. A comment before the root makes the component a fragment in development, and attributes stop falling through.

## Checklist for a new or changed component

1. Source in `src/components/<group>/` or `src/sections/`; export it in `src/index.js` (import, named export, `Cui*` entry).
2. Texts in `src/locales/en.js` and `de.js`.
3. Tests in `test/` and an axe fixture in `test/a11y/axe.spec.js` (required for every export).
4. Doc page and one line in `docs/README.md`.
5. Playground registry entry and examples.
6. `npm run docs:index`, `npm run lint`, `npm test`, `npm run build:lib`, `npm run test:a11y-e2e`.

## Writing style

English only. Short comments. No em or en dashes in code, comments or docs.
