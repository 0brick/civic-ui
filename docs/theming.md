# Theming

Every visual value the components use is a CSS custom property defined in `src/styles/tokens.css`, scoped to `:root`. Components never hard-code a color or font, they all read `var(--cui-*)`, so a full re-skin needs no component edits.

## Overriding tokens

Override any subset of the tokens in your own global stylesheet, loaded **after** the library's:

```css
:root {
  --cui-color-navy: #0b2540;      /* swap the primary ink */
  --cui-color-yellow: #ffcc00;    /* swap the accent */
  --cui-font-sans: 'Inter', sans-serif;
}
```

A dark-surface variant is available via `[data-cui-theme="dark"]` on any ancestor element, which flips `--cui-text`, `--cui-bg` and related tokens for content sitting on a navy background. `HeroSection` and `CtaBanner` set it on themselves whenever their `background` is dark, so outline/ghost buttons, links and focus rings in their slots switch to light ink without an override. That's for a navy *band* inside a light page, for a whole page in dark colors, see [Dark and light mode](#dark-and-light-mode).

## Color palette configuration

Overriding individual CSS variables by hand (above) works, but picking a full, professional, *accessible* palette by hand (one where every text/background pairing the components actually render still clears WCAG AA) is real design work. `src/utils/palette.js` (exported from `civic-ui`) automates that: give it as much or as little of your brand color as you have, and it derives, checks and (if needed) corrects the rest.

```js
import { generatePalette, applyPalette } from 'civic-ui'

const palette = generatePalette({ primary: '#123456' }) // any of the four modes below
applyPalette(palette) // installs the result as CSS custom properties + updates sectionThemes
```

Call this once at startup, before mounting your app (`main.js`), or any time later to re-theme live, `applyPalette()` returns a function that reverts it, and `resetPalette()` does the same thing directly.

### The four configuration modes

`generatePalette()` takes one argument, `colors`, and there's really only one code path behind all four, "fill in whatever role you didn't give, from whatever you did give" is a no-op when you gave everything, and derives from a single color when you gave only one:

1. **A ready-made palette**: pass a preset name (`'default' | 'forest' | 'burgundy' | 'slate'`, see `presetPalettes`):
   ```js
   generatePalette('forest')
   ```
2. **One primary color**: give just your brand ink; accent, links, greys, everything is derived from it:
   ```js
   generatePalette({ primary: '#123456' })
   ```
3. **Individual colors**: give any subset of the roles below, the rest is derived to match:
   ```js
   generatePalette({ primary: '#123456', danger: '#a4231b' })
   ```
4. **Every color**: set every role explicitly for full manual control:
   ```js
   generatePalette({ primary: '#123456', accent: '#e8b84b', secondary: '#2f7fa6', /* ... */ })
   ```

The full role list (also exported as `paletteRoles`, with a label/hint for each: handy for building a settings UI): `primary`, `accent`, `secondary`, `tertiary`, `quaternary`, `highlight`, `neutralDark`, `success`, `warning`, `danger`, `info`, `bg`.

### The contrast guarantee

Every mode runs through the same two passes before `generatePalette()` returns:

- **Semantic pairs** (body text on the page background, links, focus rings, status banners, ...) are derived via `ensureContrast()`, which nudges a color's *lightness only*, hue and saturation are preserved, just far enough to clear WCAG AA (4.5:1 for text, 3:1 for large text and non-text UI like a focus ring), then stops.
- **Direct pairings** components actually hardcode (`AppButton`'s primary/quaternary/danger variants, `Badge`, `AlertBanner`'s info/success/warning/danger variants, `SiteFooter`, `Tooltip`, and others pair a swatch straight with a literal white or ink label, not a derived token) are checked and corrected the same way, even when you supplied that exact swatch yourself. So `generatePalette({ primary: '#ffcc00' })` (a primary too light to hold white button text) still produces a fully legible result; it just means the swatch you get back isn't always byte-identical to what you passed in.

`result.contrast.checks` reports every one of these pairings with its actual computed ratio (`{ ratio, aaText, aaLarge, aaaText, ui }`); `result.contrast.allPass` is `true` whenever every pairing clears at least the AA threshold for its own use (this is mathematically guaranteed: see the tests in `test/utils/color.spec.js`/`palette.spec.js`, but the report is there so you can see *why*, not just trust it blindly).

`generatePalette()` throws if `bg` is given a dark color: that's what `[data-cui-theme="dark"]` (above) is for; the page background specifically stays light so the many components that render a crisp white card/input surface on top of it keep working.

### Trying it live

The playground's **Theme** tab (`npm run dev`, then the "Theme" nav tab) is a full interactive configurator for all four modes against the real components, with a live contrast report: the fastest way to see what a given brand color actually produces before wiring it into your app.

### Applying it

```js
import { createApp } from 'vue'
import CivicUI, { generatePalette, applyPalette } from 'civic-ui'
import App from './App.vue'

applyPalette(generatePalette({ primary: '#123456', accent: '#e8b84b' }))
createApp(App).use(CivicUI).mount('#app')
```

`applyPalette()` needs a `document` (pass `{ document }` in an unusual environment, e.g. an iframe); in SSR, use `generatePalette(...).tokens` directly to render the `:root` block yourself instead.

## Dark and light mode

Every component ships a dark color mode. It's opt-in, so without configuration the light design stays as it is. It's driven by one attribute on `<html>`:

| `data-cui-mode` | Result |
|---|---|
| *(none)* or `light` | The light design. |
| `dark` | Dark, always. |
| `auto` | Follows the visitor's OS/browser setting (`prefers-color-scheme`) and switches live when it changes. |

You rarely set the attribute by hand. Pick what a first-time visitor sees when you install the plugin, then let them change it with a [ColorModeToggle](components/button/color-mode-toggle.md) (or your own control via [`useColorMode()`](composables.md#usecolormode)). Their choice is remembered in `localStorage`:

```js
import { createApp } from 'vue'
import CivicUI from 'civic-ui'

createApp(App).use(CivicUI, { colorMode: 'auto' }).mount('#app')
```

```vue
<SiteHeader>
  <template #actions><ColorModeToggle /></template>
</SiteHeader>
```

Or from plain JS, without the plugin: `initColorMode({ default: 'auto' })`, `setColorMode('dark')`, `toggleColorMode()`.

**What changes.** The page becomes a very dark, faintly primary-tinted field. [Surfaces](#surfaces) step up in lightness with elevation (`--cui-surface` < `--cui-surface-raised`). Text, headings, borders, links and the focus ring switch to light values. Emphasis fills (primary buttons, active tabs and pages, checked boxes, tooltips) invert to a light ink (`--cui-primary`), so they still stand out on the dark page. Colored swatches (`--cui-color-*`) and the section color themes (`background="primary"` and the rest) stay as they are: they carry their own curated text colors, so a navy footer or a gold CTA band looks the same in both modes. Brand colors used *as text* go through their own tokens (`--cui-text-secondary`, `--cui-text-danger`, `--cui-text-success`), which the dark mode lightens to keep AA contrast.

**With your own palette.** `generatePalette()` also derives a matching dark mode from the same roles (`result.darkMode`, contrast-checked, with the results in `result.contrast.checks` under "Dark mode: …"), and `applyPalette()` installs it for both `dark` and `auto`. There's nothing extra to configure.

**Avoiding a light flash.** The attribute is set when the app boots. For a static or server-rendered page that should open dark straight away, set it before first paint with a tiny inline script in `<head>`:

```html
<script>
  document.documentElement.setAttribute('data-cui-mode', localStorage.getItem('cui-color-mode') || 'auto')
</script>
```

**Only part of a page.** The dark tokens are fully restated under the attribute selector, so `data-cui-mode="dark"` also works on a single element, e.g. a dark preview panel.

## Design tokens reference

| Token | Value | Use |
|---|---|---|
| `--cui-color-navy` | `#001d35` | Primary ink, headings, dark surfaces |
| `--cui-color-teal` | `#02767f` | Links, secondary accents |
| `--cui-color-yellow` | `#ffed3e` | Primary CTA / highlight accent |
| `--cui-color-purple` / `--cui-color-violet` | `#3b2781` / `#6e57ce` | Deep accents, hover states |
| `--cui-color-sky` | `#80cdeb` | Light illustrative accent |
| `--cui-color-anthracite` | `#30353b` | Neutral dark accent |
| `--cui-color-grey-50/100/300/500/700` | greyscale ramp | Surfaces, illustrative greys |
| `--cui-color-line` / `--cui-color-line-strong` | `rgba(0,29,53,.14)` / `.26` | Borders/dividers: ink-tinted, not neutral grey; `--cui-border` defaults to `--cui-color-line` |
| `--cui-border-control` | `#758592` (dark mode `#797e83`, dark band `#8c99a4`) | Outline of controls whose edge is the only thing that shows them: text fields, select, search, tag input, file drop zone, Switch track, Carousel dots, ProgressBar track, bottom-sheet handle. 3:1 against every background (WCAG 1.4.11); `--cui-border` is for decorative dividers and card frames only. `generatePalette()` derives and checks it. |
| `--cui-primary` / `--cui-primary-contrast` / `--cui-primary-hover` | navy / white / navy-700 | Emphasis fills (primary button, active tab/page, checked box, tooltip) and their label |
| `--cui-text-secondary` / `--cui-text-danger` / `--cui-text-success` / `--cui-text-warning` | teal / danger / success / warning | Brand and status colors used as text (eyebrows, breadcrumbs, field errors, trends) |
| `--cui-surface` / `--cui-surface-raised` | white / white | Component surfaces: see [Surfaces](#surfaces) |
| `--cui-surface-glass` / `--cui-on-surface` | `rgba(255,255,255,.94)` / `--cui-text` | Sticky navbar backdrop / text on a surface |
| `--cui-font-sans` | Fira Sans stack | Body copy, UI text, headings |
| `--cui-font-serif` | Source Serif 4 stack | Optional editorial accent (pull-quotes) |
| `--cui-font-heading` | `var(--cui-font-sans)` | `h1`-`h3` and component titles: see [Font choice](#font-choice) |
| `--cui-heading-weight` / `--cui-heading-letter-spacing` / `--cui-heading-line-height` | `700` / `-0.02em` / `1.15` | Heading style for the same elements |
| `--cui-heading-display-weight` | `800` | Hero/stage headline weight |
| `--cui-fz-lead` | `1.7rem` | Lead/intro paragraphs (`.cui-lead`, section intros): see [Utilities](utilities.md#text) |
| `--cui-space-1`…`--cui-space-8` | 0.4rem, 6.4rem | Spacing scale |
| `--cui-container-max` | `1248px` | Max width of `.cui-container`: the shared width of every section |
| `--cui-gutter` | `calc(2.4 * var(--cui-fz-base))` (38.4px) | Side padding of `.cui-container` |
| `--cui-radius-sm/md/lg/pill` | 4px / 7px / 10px / 999px | Corner radii: soft, moderate, never a sharp or pill button |
| `--cui-btn-radius` | `var(--cui-radius-md)` | `AppButton` corner radius only, e.g. `var(--cui-radius-pill)` for pill buttons without rounding inputs too |
| `--cui-btn-font-weight` | `600` | `AppButton` label weight |
| `--cui-shadow-sm/md/lg/float` | very low alpha, large blur | Elevation: a gentle lift, not a hard drop shadow |
| `--cui-lh-display` | `1.05` | Line-height for hero/stage headlines |
| `--cui-ease` | `cubic-bezier(.16,1,.3,1)` | Shared transition easing |
| `--cui-z-*` | 1000-1080 | Stacking order for dropdown → tooltip → toast |

### Surfaces

Components never paint their boxes with a literal white: they read one of three surface tokens, split by elevation, so a brand with a paper-toned card or a [dark color mode](#dark-and-light-mode) re-colors every box in one place:

| Token | Used by |
|---|---|
| `--cui-surface` | In-flow boxes: `Card`, `StatCard`, `ListGroup`, `Sidebar`, `Pagination`, `AppShell` header, `Navbar`, `TestimonialSection` cards, every form control (`TextInput`, `Select`, `Checkbox`, `Radio`, `SearchField`, `TagInput`, `InputGroup`, `RangeSlider`) |
| `--cui-surface-raised` | Things floating above the page: `Modal`, `Dropdown` menu, `Popover`, `Toast`, `CookieConsent`, `Carousel` buttons, `StepsSection` chain connectors |
| `--cui-surface-glass` | The translucent, blurred backdrop of `Navbar sticky` |
| `--cui-on-surface` | Text color that belongs on those surfaces |

```css
:root {
  --cui-surface: #fffdf8;               /* warm paper cards on a white page */
  --cui-surface-glass: rgb(255 253 248 / 0.9);
}
```

### `--cui-header-offset`

Unlike the tokens above, this one ships with no default value in `tokens.css`, and you normally don't need it: [`HeroSection`](sections/hero-section.md)'s `fullHeight` measures everything rendered above it in normal flow (a `SiteHeader`, a bare `Navbar`, an `AlertBanner`, your own header markup) at runtime and subtracts that from `100dvh`, so header + hero together are exactly one viewport tall: re-measured on resize. Set `--cui-header-offset` on an ancestor of the hero (or inline via `:style`) only to override that measurement with a fixed value, e.g. when a header is `position: fixed` and so isn't in normal flow above the hero.

## Section width

Every section renders its content in the same `.cui-container` (at most `--cui-container-max` wide, with `--cui-gutter` side padding) so stacked sections (a `TeaserGrid` above a `ListSection`, a `PageIntro` above a `FaqSection`, …) always share the same left and right content edges. Long running text caps its own line length (roughly 60 characters) inside that width instead of narrowing the whole section. `PageIntro`, `FaqSection`, `ListSection`, `StepsSection` and `TestimonialSection` accept `narrow` to opt into a centered 860px column where you want one. `RelatedLinks` is a box, not a full section: place it inside a `.cui-container` or a content column.

The gutter is defined in `rem`, not `em`, so sections with smaller body text (`TopBar`, `SiteFooter`, `AlertBanner`) keep exactly the same content edges as the rest of the page.

## Section color themes

Hero-like sections don't take separate background/text-color props: they take one **theme**, so the two never clash. Pass `background` (on `HeroSection`, including its `size="compact"` mode, and `CtaBanner`, and per-step on `StepsSection`'s `layout="chain"`) one of:

Each theme is tied to a **palette role**, so with your own palette (`generatePalette()`) it follows your brand color, not the default navy/gold. Use the role name. The older color names still work and mean exactly the same theme:

| Role key | Same as | Palette role | Default field | Default heading | Default eyebrow |
|---|---|---|---|---|---|
| `primary` (default) | `navy` | `primary` | `#001d35` | white | accent (gold) |
| `secondary` | `teal` | `secondary` | `#02767f` | white | white |
| `tertiary` | `purple` | `tertiary` | `#3b2781` | accent (gold) | accent (gold) |
| `quaternary` | `violet` | `quaternary` | `#6e57ce` | accent (gold) | white |
| `accent` | `gold` | `accent` | `#ffed3e` | tertiary (purple) | tertiary (purple) |
| `highlight` | `sky` | `highlight` | `#80cdeb` | tertiary (purple) | tertiary (purple) |
| `neutral` | `anthracite` | `neutralDark` | `#30353b` | white | accent (gold) |
| `light` | | `bg` | white | primary (navy) | secondary (teal) |

The **eyebrow** (the small kicker above a `HeroSection` title) is checked for normal-text contrast, 4.5:1, since it's small. A generated palette uses the accent there only where the accent reads on that field as-is; otherwise white or the heading color. Over a photo or video, the hero uses the primary theme's eyebrow, since the text sits on the primary-tinted veil.

```vue
<!-- your palette's highlight color, with its curated, contrast-checked text colors -->
<CtaBanner background="highlight" title="Support us" :action="{ label: 'Donate', href: '/donate' }" />
```

Prefer a key over a raw hex value: `background="highlight"` gets the curated, WCAG-checked text/heading pair for that color, while `background="#f5a800"` has to derive one on the fly. The role → key mapping is exported as `themeRoles`.

`background` also accepts a raw CSS color (`#0b2540`, `rgb(...)`, `hsl(...)`) or an **image URL**: passing an image alone defaults to the navy theme's text colors; combine a theme *and* a separate `image` prop for the two-tone "solid field behind/beside the photo" composition (see [HeroSection](sections/hero-section.md)). A raw color has no curated field/heading pairing to fall back on, so `HeroSection` and `CtaBanner` derive one on the fly with `deriveContrastText()`: it reads the color's own luminance and guarantees WCAG AA (4.5:1 body text, 3:1 large headings) against it, rather than assuming a light-on-dark treatment that breaks silently on a light custom color. The map and both helpers live in `src/utils/themes.js` (`sectionThemes`, `resolveBackground()`, `deriveContrastText()`) if you need them directly, e.g. to build a custom section with the same "safe against any background" behavior.

## Font choice

Civic UI ships **Fira Sans** (SIL OFL, fully open source) as the one typeface for both body copy and headlines: weight does the work (400 body, 600 buttons/UI, 700-800 headings, 900 for the biggest hero titles) rather than mixing a sans+serif pair. **Source Serif 4** is available for the occasional editorial accent (`TestimonialSection`'s `layout="feature"` pull-quotes).

**Self-hosted, not a Google Fonts CDN import.** Both families are vendored as local `.woff2` files under `src/assets/fonts/` (with their `OFL-*.txt` license text alongside) and declared via plain `@font-face` rules in `src/styles/base.css`: no request ever leaves the visitor's browser for a third-party font host. This matters specifically for public-sector deployments: a `fonts.googleapis.com`/`fonts.gstatic.com` request hands the visitor's IP address to Google on every page view, which is why BSI/GDPR guidance for government sites generally rules out third-party font CDNs: this was a real, widely-cited finding against German public-sector sites that linked Google Fonts directly.

Swap either family via `--cui-font-sans` / `--cui-font-serif` at any time. For a serif/sans pair, set `--cui-font-heading` (default `var(--cui-font-sans)`): it reaches `h1`-`h3` and every title element that isn't a heading tag: card titles and names, the hero headline, footer column titles, testimonial/quote sources. `--cui-heading-weight` (`700`), `--cui-heading-letter-spacing` (`-0.02em`), `--cui-heading-line-height` (`1.15`) and `--cui-heading-display-weight` (`800`, hero/stage headline) tune the rest:

```css
:root {
  --cui-font-heading: 'Fraunces', Georgia, serif;
  --cui-heading-weight: 650;
  --cui-heading-letter-spacing: -0.01em;
}
```

All headings wrap long words (`overflow-wrap: break-word`), and on narrow screens `h1`/`h2` hyphenate inside `lang="de"` content, so long German compounds don't overflow. If you swap in a different typeface entirely, add your own `@font-face` rules (self-hosted, ideally) rather than reintroducing a CDN `@import`.
