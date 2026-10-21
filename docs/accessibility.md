# Accessibility & privacy conformance

Civic UI's entire component set is built and tested against **WCAG 2.2 Level AA**, **EN 301 549** and **BITV 2.0**, with the GDPR expectation of zero third-party requests applied on top. This page documents *what* is accessible and *why*, so an audit of a project built on Civic UI can point straight at the implementation. The exact requirement lists the library is tested against live in [`standards/`](../standards/README.md).

This is a conformance target the library is built and tested against, not a third-party certification. See [How to verify this yourself](#how-to-verify-this-yourself) for the free tools an auditor would use.

## How the standards relate

The three names are not independent rule sets; they build on each other:

- **EN 301 549** is the harmonised European standard for ICT. **V3.2.1** (2021) is the version currently cited in the Official Journal of the EU and therefore the legal reference. Its clause 9 requires **WCAG 2.1 Level A and AA, including 4.1.1 Parsing**.
- **EN 301 549 V4.1.1** was published by ETSI in September 2026. It moves clauses 9 to 11 to **WCAG 2.2 Level AA** and drops 4.1.1 Parsing. It becomes the legal reference once it is cited in the Official Journal.
- **BITV 2.0** (German federal level; state ordinances work the same way) requires conformance with the harmonised standard and adds duties for the site operator (see [What stays the consuming project's responsibility](#what-stays-the-consuming-projects-responsibility)).

Civic UI targets the union of both versions: **WCAG 2.2 AA plus 4.1.1 Parsing**. That means no duplicate `id`s (every generated id is unique per instance via `useId()`), no `aria-controls`/`aria-labelledby` pointing at missing elements, and no interactive elements nested inside each other (e.g. no `<a>` inside a linked `Card`). The criteria new in WCAG 2.2, such as 2.4.11 Focus Not Obscured and 2.5.8 Target Size, are met already, so a site built on Civic UI is ready for V4.1.1.

Conformance is always a property of the finished page, not of a component library: Civic UI provides the building blocks, the site operator remains responsible for content and for the duties listed at the end of this page.

## Keyboard operability (WCAG 2.1.1 / 2.1.2)

- **No custom `<div>`/`<span>` standing in for a control.** Every clickable surface in the library (buttons, `NotificationCenter` list rows, `Modal`'s bottom-sheet drag handle, form controls) is a real `<button>`, `<a>`, or native form element, so Enter/Space activation, focus, and screen-reader "button"/"link" announcements come from the browser for free instead of being hand-rolled.
- **`FileUpload`'s drag-and-drop zone** is a styled wrapper around a real (visually hidden but focusable) `<input type="file">`: keyboard users tab straight to it and press Enter/Space to open the OS file picker, same as clicking the zone.
- **No keyboard trap outside dialogs.** Only `Modal` and the modal (default) `CookieConsent` banner keep Tab inside themselves while open, and both can always be left by keyboard: Escape or a close button for `Modal`, one of the consent buttons for the banner. `Dropdown`, `Popover` and `Select` (native `<select>`) never capture Tab; Escape closes them and returns focus to whatever opened them.
- **`Tabs`** implements the full WAI-ARIA APG "Tabs" pattern: a roving `tabindex` (only the active tab is in the normal Tab sequence), Left/Right/Up/Down arrow keys to move between tabs, Home/End to jump to the first/last, and the tab panel itself is focusable (`tabindex="0"`) so its content is reachable even when it starts with no focusable element.
- **`Carousel`** autoplay is skipped entirely when the visitor's OS is set to `prefers-reduced-motion`, and otherwise shows a visible pause/play toggle (WCAG 2.2.2, Pause/Stop/Hide): manual prev/next/dot navigation always works regardless. The same pattern (skip autoplay for `prefers-reduced-motion`, visible pause/play toggle for everyone else) gates `HeroSection`'s looping background `video`.

## Focus management (WCAG 2.4.3 / 2.4.7)

- **`useFocusTrap`** (used by every `Modal` placement) moves focus into the dialog when it opens, cycles Tab/Shift+Tab between its focusable descendants while open, and restores focus to whatever triggered it once it closes: implemented natively, no dependency.
- **`Dropdown` and `Popover`** apply the same "remember what had focus, restore it on close" discipline on Escape/outside-click, even for menu items deep inside the panel: closing never silently drops focus onto `<body>`.
- **Every focusable element has a visible `:focus-visible` indicator** (`--cui-focus-ring`, a 2-3px high-contrast outline, with `outline-offset` so it never gets clipped by `overflow:hidden`) defined once in `base.css` and applied automatically. `FileUpload`'s dropzone draws its ring via `:focus-within` since the real focusable element (the file input) is visually hidden.
- **`AppShell` and `SiteHeader`** both render a skip link as their first element (WCAG 2.4.1, Bypass Blocks), `AppShell` wires it to its own `<main>` automatically; `SiteHeader` exposes a `skipToId` prop to match whatever `id` your page's main-content landmark uses.

```vue
<a href="#main-content" class="cui-skip-link">Skip to main content</a>
```

## Semantics & WAI-ARIA (WCAG 4.1.2, EN 301 549 §9)

- **ARIA roles are only applied when the matching keyboard behavior is actually implemented.** `Dropdown`'s panel deliberately does not use `role="menu"`: it holds arbitrary content (plain nav links, a whole mega-menu), not a strict action-menu list with arrow-key navigation, and per WAI-ARIA APG guidance an incomplete `role="menu"` is worse for screen-reader users than no role at all. The same reasoning applies to `Carousel`'s slide-indicator dots: a labeled `role="group"` with `aria-current` on the active dot, not `role="tab"`.
- **Dynamic ARIA state** is bound to the same reactive state driving the visuals, never hand-maintained separately: `aria-expanded` on every disclosure trigger, `aria-selected`/`aria-current` on tabs/pagination/nav links, `aria-invalid`/`aria-required` on form fields, `aria-hidden`+`inert` on collapsed `Accordion`/`Collapse` panels.
- **Live regions match their urgency.** `Alert`/`AlertBanner`/`Toast` use an assertive `role="alert"` only for `warning`/`danger` variants; `info`/`success`/`neutral` use the polite `role="status"` so they don't interrupt whatever a screen reader is already reading (WCAG 4.1.3). `ToastContainer` and `AppointmentSection` keep their live regions in the DOM before any message arrives, so the message is announced when it appears. Toasts: `danger`/`warning` never close on their own, others last at least 10 s, `configureToast({ duration: 0 })` turns auto-closing off, and hover/focus pauses the timer (WCAG 2.2.1, Timing Adjustable).
- **Decorative vs. meaningful graphics are marked accordingly.** Icon SVGs are `aria-hidden="true"` throughout; where the icon stands in for real information (`TestimonialSection`'s star rating, `Avatar`'s presence dot) the information is additionally exposed as text.
- **Every dialog has an accessible name.** `Modal` uses `aria-labelledby` pointing at its visible `title` when there is one, and falls back to an explicit `ariaLabel` prop for title-less sheets, never an empty `aria-label`.

## Links in new tabs (WCAG 3.2.5)

Every component that renders a link can open it in a new tab: `AppButton` and `Card` take a `newTab` boolean prop, and every link object takes a `newTab: true` field (`action`, `primaryAction`/`secondaryAction`, `items[]`, `links[]`, `steps[]`, footer `columns[].links[]`/`legalLinks[]`/`socialLinks[]`, `meta[]`, …):

```vue
<CtaBanner title="Read the annual report" :action="{ label: 'Open PDF', href: '/report.pdf', newTab: true }" />
<AppButton href="https://example.org" new-tab>Partner site</AppButton>
```

Such links get `target="_blank"` together with `rel="noopener noreferrer"` (so the new page can't reach back into yours via `window.opener`), plus a visually hidden "(opens in a new tab)" suffix: an unannounced change of context is otherwise invisible to screen-reader users (technique G201). Links whose accessible name comes from an `aria-label` (the footer's icon-only social links) get the hint appended to that label instead. Use it sparingly, for external sites and documents, not for normal navigation. The hint is part of the [UI text catalog](#language-and-labels-wcag-312) (`links.newTab`), so `configureI18n(de)` translates it with everything else; `configureLinks({ newTabLabel: '(öffnet in neuem Tab)' })` still works as a shortcut for just this one text.

`AppointmentSection`'s contact methods and privacy link always open in a new tab (with the same hint), since leaving the booking form would lose its input.

## Language and labels (WCAG 3.1.2)

The library's own UI texts come from one catalog: visible ones ("Learn more", "Accept all", "Subscribe") as well as screen-reader-only ones (navigation landmark names, icon-button names like "Toggle navigation menu", live-region announcements like "Slide 2 of 5", the new-tab hint). English is built in; a German catalog ships alongside. Switch once at app startup:

```js
import { configureI18n } from 'civic-ui'
import { de } from 'civic-ui/locales'

configureI18n(de)
```

On a `lang="de"` page this matters beyond politeness: a screen reader reads an English "Menu" with German pronunciation rules, and WCAG 3.1.2 (Language of Parts) expects the texts to match the page language. `configureI18n()` also takes a partial object, to adjust single texts or to supply another language: the keys are those of `civic-ui/locales`' `en` catalog (`src/locales/en.js`):

```js
configureI18n({ navbar: { menu: 'Navigation' }, cookieConsent: { reject: 'Nur erforderliche' } })
```

The catalog is reactive, so switching language at runtime re-renders mounted components; `resetI18n()` restores English. A component's own label prop (`menuLabel`, `acceptLabel`, `labels` on `AppointmentSection`, …) still wins for that one instance: the prop defaults in this reference are the English catalog values.

## Forms (WCAG 1.3.1 / 3.3.1 / 3.3.2)

- Every field component (`TextInput` with its `multiline` and `floating` variants, `Select`, `Checkbox`, `Radio`, `Switch`, `FileUpload`, `TagInput`, `RangeSlider`, `SearchField`, `InputGroup`) programmatically associates its `<label>` with its control via `id`/`for`, generated per-instance by the `useId()` composable so multiple instances of the same field on one page never collide. `RadioGroup` groups radios in a `<fieldset>` named by its `<legend>`. A field without a visible label still gets an accessible name (`SearchField`'s visually hidden label, `TagInput`'s `ariaLabel` with a catalog fallback).
- `TextInput`, `Select`, `Checkbox`, `Radio`, `RadioGroup`, `Switch`, `FileUpload` and `TagInput` take `hint` and `error` props. Hint and error text are linked to their control via `aria-describedby` (and `aria-errormessage` once there's an actual error), and `aria-invalid`/`aria-required` are bound to the same `error`/`required` props driving the visible styling.
- Files `FileUpload` turns down (wrong type, too large, too many) and entries `TagInput` turns down are named on screen with the reason, in a live region that is in the DOM from the start, so the message is also announced (WCAG 3.3.1 / 4.1.3). `showRejections: false` leaves that to your page via the `reject` event.
- `DataTable` accepts an optional `caption` prop (visually hidden, screen-reader only) to name what a given table is, and its sortable-column headers use `aria-sort` synced to the real sort state.

## Motion & timing (WCAG 2.2.2 / 2.3.3)

Every animation in the library respects `prefers-reduced-motion`. `base.css` carries a global rule for it: with reduced motion set, every transition and animation (opening and closing of `Modal`, `Dropdown`, `Accordion`, hover transforms like `Card`'s lift, and your own CSS on the same page too) finishes at once (`0.01ms`, so `transitionend` still fires for Vue's `<transition>`), runs only once, and `scroll-behavior` falls back to jumping. JavaScript scrolling follows suit: `BackToTop` and `Carousel` scroll with `behavior: 'auto'` for those visitors. Two exceptions keep moving: `Spinner`, which slows down instead (its motion is the message), and any element you mark `data-cui-motion="essential"`. On top of that, `Carousel` autoplay and `HeroSection`'s background `video` skip autoplaying altogether for those visitors and expose a visible pause/play toggle for everyone else. `Toast`'s auto-dismiss timer is pausable, per the focus/live-region notes above.

## Color & contrast (WCAG 1.4.3 / 1.4.11)

The token palette in `tokens.css` is chosen so body text, headings and the focus ring all clear their respective WCAG AA contrast thresholds against every surface they're actually used on, including navy-background dark-theme text via `[data-cui-theme="dark"]` (which swaps the focus ring to `--cui-color-sky` since teal doesn't read against navy). Controls whose outline is the only thing that shows they are there (text fields, selects, the `Switch` track, inactive `Carousel` dots, the bottom-sheet handle) draw it in `--cui-border-control`, which clears the 3:1 of WCAG 1.4.11 in light and dark mode and is re-derived by `generatePalette()`; the lighter `--cui-border` is only used for decorative dividers and card frames. If you override tokens for a re-skin, re-check contrast for any pairing you change: the library can't verify a color you swap in yourself.

## Privacy and third-party requests (GDPR and BSI)

Civic UI makes **zero requests to third-party hosts** by default. `Fira Sans`/`Source Serif 4` are self-hosted (see [Theming → Font choice](theming.md#font-choice)): the `.woff2` files ship inside the package itself, so nothing about loading the library leaks a visitor's IP address to a font CDN. The only places the library touches an external origin at all are ones you explicitly opt into with your own data, asset URLs like `HeroSection`'s `video`/`image`, never anything the library reaches out to on its own. There is deliberately no third-party embed that loads on its own. For videos and maps use [ConsentEmbed](components/content/consent-embed.md), which requests nothing from the provider until the visitor clicked its load button (and can remember that choice per provider: revocable with one click under the embed, or via `revokeEmbedConsent()`). [CookieConsent](components/overlay/cookie-consent.md#privacy-notes) offers *Accept all* and *Necessary only* as equally prominent buttons by default.

## What stays the consuming project's responsibility

Civic UI can guarantee correct *structure* (semantics, keyboard behavior, focus management, ARIA wiring) but several things are inherently content decisions only you can make correctly:

- **Alt text** (`imageAlt`, `mediaAlt`, `Avatar`'s `name`): the library never invents copy, and an empty/missing value is treated as decorative. Always pass real alt text for any image that carries meaning.
- **Heading hierarchy**: sections render `<h2>`/`<h3>` at a level appropriate to being dropped directly onto a page; if you nest sections inside other sectioning content, check the resulting outline still makes sense. `Accordion`/`AccordionItem`, `Card`, `EmptyState`, `Timeline`, `SiteFooter` and `TopicSlider` take a `headingLevel` prop to fit their headings into your outline.
- **`RangeSlider`/`ProgressBar`'s `label`**: both are optional props; supply one so the control has an accessible name, or provide your own via a wrapping `<label>`/`aria-label`.
- **Content inside `v-html` props** (`SiteFooter`/`Sidebar`/`StatCard`/`Card`/`AppointmentSection`'s `icon`/`contactMethods` fields): intended as developer-authored SVG. Every one of these already routes through `sanitizeHtml()` (see [Security](security.md)), so if any of them ever come from CMS/API/user-supplied data, register `configureSecurity({ sanitizeHtml: DOMPurify.sanitize })` once instead of auditing each call site by hand.
- **Color contrast for any token you override**: see above.
- **Captions and audio description** for your own videos (WCAG 1.2.x, EN 301 549 clause 7), `HeroSection`'s `video` and anything you load through `ConsentEmbed` are your content.

On top of the WCAG/EN 301 549 requirements, BITV 2.0 obliges the **site operator** (not the software) to provide a few things no component can deliver. Plan them in from the start:

- **Accessibility statement** (*Erklärung zur Barrierefreiheit*, § 7 BITV 2.0 with § 12b BGG): which parts are not yet accessible, why, and what alternatives exist, a feedback mechanism through which visitors can report barriers, and a link to the conciliation body (*Schlichtungsstelle*). Make it easy to reach from every page, e.g. via `SiteFooter`'s `legalLinks`.
- **Explanations in Easy Language** (*Leichte Sprache*, § 4 with Anlage 2 Teil 2 BITV 2.0) on the start page: what the site is about, how to navigate it, and what the accessibility statement says.
- **Explanations in German Sign Language** (*Deutsche Gebärdensprache*, § 4 with Anlage 2 Teil 1 BITV 2.0): the same information as sign-language videos.

State-level ordinances (*Landesverordnungen*) impose similar duties; check the one that applies to your organization.

## How to verify this yourself

None of the claims above ask you to take the library's word for it: they're all checkable with free, standard tooling against a real deployed page:

- **Project audit**: `npm run test civic` (after `npx civic-ui audit --init`) statically checks your own templates, pages and scripts against WCAG 2.2 A/AA and security rules, with an optional axe-core pass over built pages. See [Project audit](audit.md). The library itself runs axe-core against every component in its test suite (`test/a11y/axe.spec.js`), and against every page and example of the built playground in a real browser, light and dark, together with a 320px reflow check, a third-party-request count and pointer/keyboard checks (`npm run test:a11y-e2e`, see [How civic-ui tests itself](audit.md#how-civic-ui-tests-itself)).
- **Automated scan**: run [axe DevTools](https://www.deque.com/axe/devtools/) or [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) (built into Chrome DevTools) against a page built with Civic UI.
- **Keyboard-only pass**: unplug the mouse and tab through the page; every interactive element should be reachable, show a visible focus ring, and behave as described above.
- **Screen reader pass**: NVDA (Windows, free) or VoiceOver (macOS, built in) reading a page should match the semantics described in this document.
- **Response headers**: [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory) or [securityheaders.com](https://securityheaders.com/) confirm the security-header recommendations in [Security](security.md) once deployed.

Automated scanners catch structural issues but cannot judge content quality (alt text accuracy, heading logic, color choices you override): pair them with a manual pass for a real conformance sign-off.
