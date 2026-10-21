# Utilities

A handful of layout and text classes ship with the stylesheet (`src/styles/utilities.css`, `src/styles/base.css`), so a page can be assembled from sections and components without writing new CSS for every project. Deliberately small: this is a component library, not a utility framework. Every value reads the design tokens, so the classes follow a configured palette and dark mode.

## Layout

| Class | What it does |
|---|---|
| `.cui-container` | The shared content width every section uses: at most `--cui-container-max` (1248px), `--cui-gutter` side padding, centered. |
| `.cui-container--narrow` | An 860px centered column, for long text or a form on its own. |
| `.cui-section` | Vertical section padding, `--cui-section-padding` (default `var(--cui-space-8)`). Set the token on `:root` or a wrapper for roomier or denser pages, e.g. `--cui-section-padding: clamp(5.6rem, 8vw, 9.6rem)`. |
| `.cui-section--subtle` | Sunken band (`--cui-bg-subtle`). |
| `.cui-section--paper` | White/paper band (`--cui-surface`): useful between subtle bands or on a tinted page background. |
| `.cui-section--dark` | Dark band (`--cui-color-navy`, the palette's primary). Carries the same tokens as `[data-cui-theme="dark"]`, so headings, links, focus rings and outline/ghost buttons inside switch to light ink automatically. |
| `.cui-grid` | Responsive auto-fit grid (cards at least 260px wide, or the full width on narrow screens). |
| `.cui-grid--2` / `--3` / `--4` | Fixed column counts from 900px up; with fewer items than columns, the row is still filled. |
| `.cui-grid--aside` | Main column + sidebar from 900px up (`1.7fr` / `1fr`), stacked below; items align to the top. `.cui-grid--aside-start` puts the narrow column first. |
| `.cui-stack` | Vertical flex column with `--cui-space-4` gaps. |
| `.cui-cluster` | Wrapping horizontal row with `--cui-space-3` gaps, e.g. a row of buttons. |
| `.cui-sticky` | `position: sticky`, offset below a sticky `Navbar` (see below). |

Every grid track is `minmax(0, 1fr)`, so one long word, URL or IBAN wraps inside its column instead of pushing the grid past the container edge.

```html
<section class="cui-section cui-section--paper">
  <div class="cui-container cui-grid cui-grid--aside">
    <div class="cui-prose">
      <span class="cui-eyebrow cui-eyebrow--lined">Bylaws</span>
      <h1>Bylaws of the association</h1>
      <p class="cui-lead">Adopted by the general meeting on 12 March.</p>
      …long text…
    </div>
    <aside class="cui-sticky">…facts box, donation card, table of contents…</aside>
  </div>
</section>
```

### Sticky elements and in-page anchors

A sticky `Navbar` (the default, also inside `SiteHeader`) publishes its height as `--cui-navbar-height` on `<html>`. `.cui-sticky` sticks that far down (plus `--cui-space-4`), and the root `scroll-padding-top` uses the same value, so jumping to `#section` (from a link, `ScrollspyNav` or the URL) lands below the bar instead of underneath it. Without a sticky Navbar the variable is `0px`. For a header of your own, set `--cui-navbar-height` yourself.

## Text

| Class | What it does |
|---|---|
| `.cui-prose` | Long running text: statutes, reports, articles, CMS rich text. Caps the measure at `--cui-prose-max` (`68ch`) and adds vertical rhythm: space above `h2`-`h4`, list indentation and spacing, responsive images, a simple quote style, full-width tables with tabular numbers, wrapping long links/code. |
| `.cui-lead` | The larger intro paragraph under a page or section title: `--cui-fz-lead` (`1.7rem`), color `--cui-lead-color` (default muted text). Section intros (`TeaserGrid`, `FaqSection`, `ListSection`, `TestimonialSection`, `AppointmentSection`) read the same tokens. |
| `.cui-eyebrow` | Small uppercase label above a heading. Color `--cui-eyebrow-color` (default the secondary text color), spacing `--cui-eyebrow-letter-spacing` (`0.08em`): every section and card eyebrow uses this class, so one token restyles all of them. |
| `.cui-eyebrow--lined` | The eyebrow with a short rule in front of it. |
| `.cui-label` | Small uppercase field label in muted text: above a value in a facts box, a contact block, a table-of-contents title. |
| `.cui-text-center` | Centers text. |
| `.cui-align-left` / `-center` / `-right` | Aligns a section intro block (title + lead): moves a block with its own `max-width` along with its text. |
| `.cui-visually-hidden` | Hides content visually but keeps it for screen readers, for labels, headings or hints that only assistive technology needs. Use it instead of a project-specific `.sr-only`. |

## See also

- [Theming](theming.md): the tokens these classes read.
- [Section width](theming.md#section-width): why every section shares one container.
