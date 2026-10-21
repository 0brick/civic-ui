# Civic UI documentation

Full reference for every component and section, plus the theming, accessibility, security and composable APIs behind them. For a first-time overview of the project, start with the [root README](../README.md).

## Guides

- [Getting started](getting-started.md): installation, registering components, your first page.
- [Utilities](utilities.md): layout and text classes: container, section bands, grids (incl. main + aside), sticky, eyebrow, visually hidden.
- [Theming](theming.md): design tokens, the color palette configuration engine (presets, one brand color, individual roles, or every role: always WCAG-checked), section color themes, surface tokens, dark/light mode, swapping fonts.
- [Project audit](audit.md): `npm run test civic`: accessibility (WCAG 2.2 AA) and security report for your own project.
- [Composables](composables.md): `useToast`, `useCookieConsent`, `useColorMode`, `useFocusTrap` and the rest.
- [Accessibility & privacy conformance](accessibility.md): WCAG 2.2 AA / EN 301 549 / BITV 2.0 / GDPR, mapped to the implementation.
- [Security](security.md): the library's threat model, OWASP ASVS 5.0 / BSI IT-Grundschutz APP.3.1, and how to plug in your own sanitizer.
- [Component index](component-index.md): every component and section with props, emits, slots and dependencies, generated from the source.
- [Standards](../standards/README.md): the requirement lists every component is tested against.

The [playground](../playground) mirrors this reference as a live, in-browser catalog: every entry below has a matching page there with a props table and interactive, copy-pasteable examples. Run `npm run dev` at the repo root to open it locally.

## Components

### Buttons

- [AppButton](components/button/app-button.md): the base action element: a button or a link, seven variants.
- [ButtonGroup](components/button/button-group.md): joins a row of buttons into one segmented control.
- [ColorModeToggle](components/button/color-mode-toggle.md): light/dark switch for the page-wide dark mode.
- [CloseButton](components/button/close-button.md): the "×" dismiss control used by Alert, Modal and Toast.

### Feedback

- [Alert](components/feedback/alert.md): an inline, dismissible message banner.
- [Badge](components/feedback/badge.md): a small colored label for status or counts.
- [StatusDot](components/feedback/status-dot.md): a compact presence indicator.
- [Toast](components/feedback/toast.md): transient notifications via `useToast()`.
- [Spinner](components/feedback/spinner.md): a loading indicator.
- [Placeholder](components/feedback/placeholder.md): a skeleton-loading block.
- [ProgressBar](components/feedback/progress-bar.md): a horizontal progress indicator.

### Navigation

- [Navbar](components/navigation/navbar.md): a top nav bar with a built-in mobile drawer.
- [Breadcrumb](components/navigation/breadcrumb.md): a trail of links to the current page's ancestors.
- [Pagination](components/navigation/pagination.md): a controlled numeric pager.
- [Tabs](components/navigation/tabs.md): switches between named content panels.
- [Dropdown](components/navigation/dropdown.md): a trigger+menu primitive, including the mega-menu and user-menu variants.
- [ScrollspyNav](components/navigation/scrollspy-nav.md): highlights the in-view section in an "on this page" nav.
- [LanguageSwitcher](components/navigation/language-switcher.md): a plain-text language toggle.
- [BackToTop](components/navigation/back-to-top.md): a scroll-to-top button.
- [NotificationCenter](components/navigation/notification-center.md): a bell-icon dropdown with an unread badge.
- [Sidebar](components/navigation/sidebar.md): the vertical app-nav rail for `AppShell`.

### Overlays

- [Modal](components/overlay/modal.md): centered dialog, drawer, and mobile bottom-sheet placements.
- [Lightbox](components/overlay/lightbox.md): a full-screen image viewer with previous/next, arrow keys and swipe.
- [Tooltip](components/overlay/tooltip.md): a CSS-positioned hover/focus hint.
- [Popover](components/overlay/popover.md): a click-triggered overlay with a title and body.
- [CookieConsent](components/overlay/cookie-consent.md): a consent banner, paired with `useCookieConsent()`.

### Content

- [Card](components/content/card.md): the general-purpose teaser/list-row card, in five layouts.
- [Accordion](components/content/accordion.md): collapsible question/answer panels.
- [Collapse](components/content/collapse.md): a single standalone show/hide toggle.
- [ListGroup](components/content/list-group.md): a vertical list of linkable or stateful rows.
- [Carousel](components/content/carousel.md): a scroll-snap based slider.
- [Avatar](components/content/avatar.md): an image avatar with initials fallback.
- [SvgImage](components/content/svg-image.md): an SVG used like `<img>`, optionally recolored for WCAG-safe contrast.
- [EmptyState](components/content/empty-state.md): a zero-data placeholder.
- [Timeline](components/content/timeline.md): a vertical event timeline.
- [DescriptionList](components/content/description-list.md): term/value pairs (facts, bank details) as a semantic `<dl>`.
- [ConsentEmbed](components/content/consent-embed.md): a YouTube/Vimeo video, map or iframe that loads only after consent.
- [ImageGallery](components/content/image-gallery.md): a thumbnail grid that opens a lightbox.
- [Quote](components/content/quote.md): a pull-quote for running text or as an opening statement.
- [StatCard](components/content/stat-card.md): a key figure on a card: dashboard KPI tile, or a highlighted figure (fee, donation goal) in a content page.
- [Toolbar](components/content/toolbar.md): a filter/actions layout row.
- [DataTable](components/content/data-table.md): a dependency-free data table.

### Forms

- [TextInput](components/forms/text-input.md): single-line, multiline and floating-label text fields.
- [InputGroup](components/forms/input-group.md): prepend/append addons around a control.
- [Select](components/forms/select.md): a styled native `<select>`.
- [Checkbox](components/forms/checkbox.md): standalone or array-valued group checkboxes.
- [Radio](components/forms/radio.md): a radio button grouped by name.
- [RadioGroup](components/forms/radio-group.md): a fieldset/legend radio group with hint and error.
- [Switch](components/forms/switch.md): a boolean toggle styled as a pill switch.
- [RangeSlider](components/forms/range-slider.md): a numeric range input.
- [SearchField](components/forms/search-field.md): a pill-shaped site-search input.
- [TagInput](components/forms/tag-input.md): free-text tag/chip entry.
- [FileUpload](components/forms/file-upload.md): drag-and-drop file picking.

### Layout

- [AppShell](components/layout/app-shell.md): sidebar + top bar + content area for webapp screens.

## Sections

Pre-assembled, page-ready blocks built from the components above.

### Header & site chrome

- [TopBar](sections/top-bar.md): a thin utility strip above the main nav.
- [SiteHeader](sections/site-header.md): optional `TopBar` + `Navbar` combined.
- [AlertBanner](sections/alert-banner.md): a page-top announcement or identity strip.
- [SiteFooter](sections/site-footer.md): a multi-column footer.

### Hero & intro

- [HeroSection](sections/hero-section.md): the full-bleed marketing hero, split or full-bleed stage.
- [PageIntro](sections/page-intro.md): a centered kicker, heading and lead paragraph.

### Marketing & content

- [TeaserGrid](sections/teaser-grid.md): a topic-card or contact-card grid.
- [TopicSlider](sections/topic-slider.md): a full-bleed, image-per-slide carousel.
- [StatsSection](sections/stats-section.md): a full-width row of key figures on a themeable band.
- [MediaTextSection](sections/media-text-section.md): split image/text or feature-list layouts, with a slot for custom visuals.
- [StepsSection](sections/steps-section.md): a numbered list, a connected chain, or a checklist grid.
- [TestimonialSection](sections/testimonial-section.md): a rated review grid or a single pull-quote.
- [CtaBanner](sections/cta-banner.md): a full-width single call to action.

### Lists & listings

- [ListSection](sections/list-section.md): an article index, a searchable job list, or a downloads list.
- [RelatedLinks](sections/related-links.md): a short related-links box.
- [FaqSection](sections/faq-section.md): a heading and intro around an accordion of Q&A pairs.

### Location & booking

- [AppointmentSection](sections/appointment-section.md): a request/appointment form with a direct-contact panel.

### Engagement

- [NewsletterSection](sections/newsletter-section.md): an email subscribe block.
