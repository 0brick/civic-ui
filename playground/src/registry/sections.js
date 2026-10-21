// Registry of every published Section, grouped by the role it plays on a
// real page. Each entry carries its API reference (props/events/slots) and
// an ordered `examples` list: example 1 is always the smallest useful case,
// later ones layer on configuration or show a distinct layout/variant. See
// ../examples/sections for the self-contained example behind each entry
// (also the source of the code sample shown on its doc page, via a `?raw`
// import).
export const sectionCategories = [
  {
    name: 'Header & Site Chrome',
    items: [
      {
        slug: 'top-bar',
        name: 'TopBar',
        summary: 'The thin utility strip above the main navbar: accessibility toggles, language switcher, secondary links.',
        props: [
          { name: 'links', type: '{ label, href, newTab? }[]', default: '[]', notes: 'Rendered left-aligned.' }
        ],
        slots: [{ name: 'default', notes: 'Right-aligned meta content: language switcher, accessibility toggles, etc.' }],
        examples: [
          {
            title: 'Basic utility strip',
            demo: () => import('../examples/sections/TopBarBasic.vue'),
            source: () => import('../examples/sections/TopBarBasic.vue?raw')
          },
          {
            title: 'With a language switcher',
            demo: () => import('../examples/sections/TopBar.vue'),
            source: () => import('../examples/sections/TopBar.vue?raw')
          }
        ]
      },
      {
        slug: 'site-header',
        name: 'SiteHeader',
        summary: 'Combines an optional TopBar and Navbar into the full institutional header pattern, with a built-in skip link.',
        props: [
          { name: 'topBar', type: 'boolean', default: 'false', notes: 'Renders the navy TopBar utility strip above the Navbar. Required for utilityLinks and the utility slot to show.' },
          { name: 'utilityLinks', type: '{ label, href, newTab? }[]', default: '[]', notes: 'Passed through to the internal TopBar (only rendered with topBar).' },
          { name: 'skipToId', type: 'string', default: "'main-content'", notes: "Must match the id on your page's <main>." },
          { name: 'skipLabel', type: 'string', default: "'Skip to main content'", notes: '' },
          { name: 'linksAlign', type: "'start' | 'center' | 'end'", default: "'center'", notes: 'Desktop position of the links slot. Passed through to the internal Navbar.' },
          { name: 'items', type: '{ label, href?, newTab?, active?, children? }[]', default: '[]', notes: 'Passed to Navbar; used when the links slot is empty.' },
          { name: 'linkTag', type: 'string | object', notes: 'Passed to Navbar.' },
          { name: 'toggleLabel', type: "string", default: "'Toggle navigation menu'", notes: 'Passed to Navbar: accessible name of the hamburger button.' },
          { name: 'menuLabel', type: "string", default: "'Menu'", notes: 'Passed to Navbar: mobile drawer title.' },
          { name: 'closeLabel', type: "string", default: "'Close dialog'", notes: 'Passed to Navbar: the drawer\'s close button.' },
          { name: 'navLabel', type: "string", default: "'Main'", notes: 'Passed to Navbar: desktop <nav> name.' },
          { name: 'mobileNavLabel', type: "string", default: "'Main (mobile)'", notes: 'Passed to Navbar: drawer <nav> name.' }
        ],
        slots: [
          { name: 'utility', notes: 'Right-aligned content inside the TopBar row (only rendered with topBar).' },
          { name: 'brand', notes: 'Logo / site name, rendered in the Navbar.' },
          { name: 'links', notes: 'Main navigation items.' },
          { name: 'actions', notes: 'Right-aligned buttons in the Navbar.' }
        ],
        examples: [
          {
            title: 'Basic header',
            demo: () => import('../examples/sections/SiteHeaderBasic.vue'),
            source: () => import('../examples/sections/SiteHeaderBasic.vue?raw')
          },
          {
            title: 'Full header with utility strip and dropdown menus',
            demo: () => import('../examples/sections/SiteHeader.vue'),
            source: () => import('../examples/sections/SiteHeader.vue?raw')
          },
          {
            title: 'Right-aligned links',
            demo: () => import('../examples/sections/SiteHeaderLinksEnd.vue'),
            source: () => import('../examples/sections/SiteHeaderLinksEnd.vue?raw')
          }
        ]
      },
      {
        slug: 'alert-banner',
        name: 'AlertBanner',
        summary: 'A full-width, page-top announcement strip: sits above SiteHeader.',
        props: [
          { name: 'text', type: 'string', notes: 'Required.' },
          { name: 'variant', type: "'info' | 'success' | 'warning' | 'danger' | 'neutral'", default: "'warning'", notes: 'info/success/danger use white text on a saturated background; warning/neutral keep dark text.' },
          { name: 'action', type: '{ label, href, newTab? }', notes: 'Inline link-styled button after the text.' },
          { name: 'dismissible', type: 'boolean', default: 'true', notes: 'Shows the close button.' },
          { name: 'dismissLabel', type: 'string', default: "'Dismiss notice'", notes: 'Accessible label for the close button.' },
          { name: 'fixed', type: 'boolean', default: 'false', notes: 'Sticky above a sticky header.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: '' }
        ],
        events: [{ name: 'dismiss', notes: 'Fires when the visitor closes the banner.' }],
        slots: [
          { name: 'icon', notes: 'Replaces the default warning-triangle icon.' },
          { name: 'default', notes: 'Extra inline content after the text, before the action button.' }
        ],
        examples: [
          {
            title: 'Dismissible notice',
            demo: () => import('../examples/sections/AlertBanner.vue'),
            source: () => import('../examples/sections/AlertBanner.vue?raw')
          },
          {
            title: 'Quiet identity strip',
            description: 'variant="neutral" with fixed and a custom icon: a quiet official identity strip.',
            demo: () => import('../examples/sections/AlertBannerNeutral.vue'),
            source: () => import('../examples/sections/AlertBannerNeutral.vue?raw')
          }
        ]
      },
      {
        slug: 'site-footer',
        name: 'SiteFooter',
        summary: 'Multi-column footer: brand blurb, sitemap columns, social icons, and a legal row.',
        props: [
          { name: 'columns', type: '{ title, links: { label, href, newTab? }[] }[]', default: '[]', notes: 'Sitemap columns.' },
          { name: 'legalLinks', type: '{ label, href, newTab? }[]', default: '[]', notes: 'Bottom-row legal links.' },
          { name: 'socialLinks', type: '{ label, href, newTab?, icon }[]', default: '[]', notes: 'icon is raw SVG rendered via v-html, routed through sanitizeHtml(): developer-authored only.' },
          { name: 'copyright', type: 'string', default: "''", notes: '' },
          { name: 'collapsible', type: 'boolean', default: 'false', notes: 'Renders columns as native <details>/<summary> accordions below 900px; plain blocks (no extra tab stops) above.' },
          { name: 'background', type: 'theme key | color', default: "'navy'", notes: 'Color theme; a dark one marks the footer data-cui-theme="dark" so slot links stay readable.' },
          { name: 'address', type: 'string[]', default: '[]', notes: 'Address lines under the brand slot.' },
          { name: 'email', type: 'string', default: "''", notes: 'Rendered as a safe mailto: link.' },
          { name: 'phone', type: 'string', default: "''", notes: 'Rendered as a tel: link.' },
          { name: 'headingLevel', type: 'number', default: '3', notes: 'Heading level (2-6) of the column titles.' }
        ],
        slots: [{ name: 'brand', notes: 'Logo / brand blurb in the top-left of the footer.' }],
        examples: [
          {
            title: 'Basic footer',
            demo: () => import('../examples/sections/SiteFooterBasic.vue'),
            source: () => import('../examples/sections/SiteFooterBasic.vue?raw')
          },
          {
            title: 'Full footer with brand, legal row, and collapsible columns',
            demo: () => import('../examples/sections/SiteFooter.vue'),
            source: () => import('../examples/sections/SiteFooter.vue?raw')
          },
          { title: 'Light theme with contact block', description: '`background="light"` with `address`, `email` and `phone`.', demo: () => import('../examples/sections/SiteFooterContact.vue'), source: () => import('../examples/sections/SiteFooterContact.vue?raw') }
        ]
      }
    ]
  },
  {
    name: 'Hero & Intro',
    items: [
      {
        slug: 'hero-section',
        name: 'HeroSection',
        summary: 'The full-bleed marketing hero, with a two-tone text-and-photo layout or a full-bleed stage.',
        props: [
          { name: 'title', type: 'string', default: "''", notes: 'Rendered as the <h1>; omitted entirely when empty.' },
          { name: 'eyebrow', type: 'string', notes: '' },
          { name: 'text', type: 'string', notes: 'Plain text. For lists, several paragraphs or links, use the `text` slot instead.' },
          { name: 'background', type: 'theme key | color | image URL', default: "'navy'", notes: 'See Theming → Section color themes.' },
          { name: 'image', type: 'string', notes: '' },
          { name: 'imageAlt', type: 'string', notes: '' },
          { name: 'imagePosition', type: "'start' | 'end'", default: "'end'", notes: 'Split (non-`stage`) layout only.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: '' },
          { name: 'verticalAlign', type: "'start' | 'center' | 'end'", default: "'center'", notes: 'Vertical position of the copy beside the photo (split layout, ≥900px) or on the `stage` media.' },
          { name: 'size', type: "'default' | 'compact'", default: "'default'", notes: '`compact` shrinks it to a 44vh interior-page header.' },
          { name: 'stage', type: 'boolean', default: 'false', notes: 'Full-bleed variant with a bottom veil overlay; ignores `imagePosition`.' },
          { name: 'fullHeight', type: 'boolean', default: 'false', notes: '`stage` only (ignored on `size="compact"`): fills the rest of the viewport (minus the auto-measured header above it) instead of the default 78vh.' },
          { name: 'caption', type: 'string', default: "''", notes: '`stage` only: a short photo credit / caption pinned to the bottom-right corner.' },
          { name: 'video', type: 'string', notes: '`stage` only: looping muted background video instead of a photo.' },
          { name: 'videoPoster', type: 'string', notes: '`stage` + `video` only.' },
          { name: 'tone', type: "'color' | 'grayscale'", default: "'color'", notes: '`stage` only.' },
          { name: 'scrollTarget', type: 'string (anchor href)', notes: 'Renders a scroll-cue arrow when set, `stage` only.' },
          { name: 'primaryAction', type: '{ label, href, newTab? }', notes: '' },
          { name: 'secondaryAction', type: '{ label, href, newTab? }', notes: '' },
          { name: 'imageFocus', type: 'string', notes: "CSS object-position of the photo/video, e.g. 'center 30%'." },
          { name: 'imageFocusMobile', type: 'string', notes: 'The same below 900px; falls back to imageFocus.' },
          { name: 'veil', type: "'none' | 'light' | 'default' | 'strong'", default: "'default'", notes: 'Strength of the primary-tinted legibility veil (stage/compact).' },
          { name: 'veilFrom', type: "'bottom' | 'start'", default: "'bottom'", notes: "'start' darkens from the text's side." },
          { name: 'titleSize', type: "'default' | 'display'", default: "'default'", notes: 'Display = larger home-page headline; measure via --cui-hero-title-max.' }
        ],
        slots: [
          { name: 'text', notes: 'Rich body copy (lists, paragraphs, links) in place of the `text` prop; takes precedence over it.' },
          { name: 'default', notes: 'Extra action markup, rendered after the primary/secondary action.' }
        ],
        examples: [
          {
            title: 'Basic hero',
            demo: () => import('../examples/sections/HeroSectionBasic.vue'),
            source: () => import('../examples/sections/HeroSectionBasic.vue?raw')
          },
          {
            title: 'Split hero with photo',
            description: 'A theme background combined with an image for the two-tone text-and-photo composition.',
            demo: () => import('../examples/sections/HeroSection.vue'),
            source: () => import('../examples/sections/HeroSection.vue?raw')
          },
          {
            title: 'Sparse hero',
            description: 'No title or actions: the remaining copy stays vertically centered beside the photo (`verticalAlign`).',
            demo: () => import('../examples/sections/HeroSparse.vue'),
            source: () => import('../examples/sections/HeroSparse.vue?raw')
          },
          {
            title: 'Rich text slot',
            description: 'The `text` slot takes markup, here a list with a link, instead of a plain string.',
            demo: () => import('../examples/sections/HeroRichText.vue'),
            source: () => import('../examples/sections/HeroRichText.vue?raw')
          },
          {
            title: 'Full-bleed stage',
            description: '`stage`: a full-bleed photo with centered copy and a scroll cue.',
            demo: () => import('../examples/sections/HeroStage.vue'),
            source: () => import('../examples/sections/HeroStage.vue?raw')
          },
          {
            title: 'Stage with video background',
            description: '`video`: a looping, muted background video (a local file) instead of a photo, with a pause/play toggle; `videoPoster` shows until it plays.',
            demo: () => import('../examples/sections/HeroStageVideo.vue'),
            source: () => import('../examples/sections/HeroStageVideo.vue?raw')
          },
          {
            title: 'Compact header',
            description: '`size="compact"`: a smaller interior-page header instead of a homepage hero.',
            demo: () => import('../examples/sections/HeroCompact.vue'),
            source: () => import('../examples/sections/HeroCompact.vue?raw')
          },
          {
            title: 'Display headline, side veil, image focus',
            description: '`titleSize="display"`, `veilFrom="start"` and `imageFocus`/`imageFocusMobile` for a home-page opening statement.',
            demo: () => import('../examples/sections/HeroStageDisplay.vue'),
            source: () => import('../examples/sections/HeroStageDisplay.vue?raw')
          }
        ]
      },
      {
        slug: 'page-intro',
        name: 'PageIntro',
        summary: 'The centered intro block that sits under a hero: kicker, heading, lead paragraph, and an optional action.',
        props: [
          { name: 'kicker', type: 'string', default: "''", notes: 'Small label line above the title.' },
          { name: 'title', type: 'string', default: "''", notes: 'Rendered as an <h2>.' },
          { name: 'text', type: 'string', default: "''", notes: 'Lead paragraph.' },
          { name: 'action', type: '{ label, href, newTab? }', notes: 'Single centered call-to-action button.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'center'", notes: '' },
          { name: 'narrow', type: 'boolean', default: 'false', notes: 'Opt-in 860px column; by default every section shares the same container width.' }
        ],
        slots: [{ name: 'default', notes: 'Extra content below the action, e.g. a secondary link or note.' }],
        examples: [
          {
            title: 'Basic intro',
            demo: () => import('../examples/sections/PageIntro.vue'),
            source: () => import('../examples/sections/PageIntro.vue?raw')
          },
          {
            title: 'With an action and extra content',
            demo: () => import('../examples/sections/PageIntroWithAction.vue'),
            source: () => import('../examples/sections/PageIntroWithAction.vue?raw')
          }
        ]
      }
    ]
  },
  {
    name: 'Marketing & Content',
    items: [
      {
        slug: 'teaser-grid',
        name: 'TeaserGrid',
        summary: 'A three-column intro-and-card grid for related services or a press/team contact directory.',
        props: [
          { name: 'eyebrow', type: 'string', default: "''", notes: '' },
          { name: 'title', type: 'string', default: "''", notes: 'Optional.' },
          { name: 'titleHidden', type: 'boolean', default: 'false', notes: 'Title for screen readers only; the section stays named via aria-labelledby.' },
          { name: 'intro', type: 'string', default: "''", notes: '' },
          { name: 'items', type: '{ title, text, image?, href?, newTab? }[] | { name, role?, image?, email?, phone?, href?, newTab? }[]', notes: 'Required. Shape depends on `itemVariant`.' },
          { name: 'itemVariant', type: "'teaser' | 'person'", default: "'teaser'", notes: 'Picks the Card layout each item renders as.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: 'Aligns the intro header only: the card grid stays left-aligned.' },
          { name: 'tag', type: 'string | object', notes: 'Element/component for the card links; an item tag wins.' },
          { name: 'columns', type: "2 | 3 | 4 | 'auto'", default: '3', notes: "Fixed columns from 900px up, or 'auto' (min. --cui-teaser-min, 24rem)." },
          { name: 'subtle', type: 'boolean', default: 'false', notes: 'Sunken section background.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/sections/TeaserGridBasic.vue'), source: () => import('../examples/sections/TeaserGridBasic.vue?raw') },
          { title: 'Photo teaser grid', description: 'The default `itemVariant="teaser"` mode with images and links.', demo: () => import('../examples/sections/TeaserGrid.vue'), source: () => import('../examples/sections/TeaserGrid.vue?raw') },
          { title: 'Person / contact grid', description: '`itemVariant="person"`: a press office or team directory.', demo: () => import('../examples/sections/TeaserGridPerson.vue'), source: () => import('../examples/sections/TeaserGridPerson.vue?raw') },
          { title: 'Auto columns, hidden title', description: '`columns="auto"` for four teasers, `titleHidden` and the `subtle` background.', demo: () => import('../examples/sections/TeaserGridAuto.vue'), source: () => import('../examples/sections/TeaserGridAuto.vue?raw') }
        ]
      },
      {
        slug: 'topic-slider',
        name: 'TopicSlider',
        summary: 'A full-bleed, image-per-slide topic carousel with a giant headline over each photo.',
        props: [
          { name: 'items', type: '{ title, text?, image, href?, newTab?, linkLabel? }[]', notes: 'Required.' },
          { name: 'moreLabel', type: 'string', default: "'Learn more'", notes: '' },
          { name: 'adaptiveText', type: 'boolean', default: 'false', notes: "Opt-in: samples each slide's image and switches to dark-on-light text when it reads as visually light, instead of always assuming a dark photo." },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: '' },
          { name: 'title', type: 'string', default: "''", notes: 'Visually hidden h2 naming the section.' },
          { name: 'headingLevel', type: 'number', default: '3', notes: 'Heading level (2-6) of the slide titles.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/sections/TopicSliderBasic.vue'), source: () => import('../examples/sections/TopicSliderBasic.vue?raw') },
          { title: 'With links and lead text', demo: () => import('../examples/sections/TopicSlider.vue'), source: () => import('../examples/sections/TopicSlider.vue?raw') }
        ]
      },
      {
        slug: 'stats-section',
        name: 'StatsSection',
        summary: 'A full-width row of key figures, for establishing scale at a glance.',
        props: [
          { name: 'title', type: 'string', default: "''", notes: '' },
          { name: 'stats', type: '{ value, label }[]', notes: 'Required.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: '' },
          { name: 'background', type: 'theme key | color', notes: 'Default: the dark primary band.' },
          { name: 'columns', type: "'auto' | 2 | 3 | 4", default: "'auto'", notes: 'auto = as many columns as figures, up to 4.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/sections/StatsSectionBasic.vue'), source: () => import('../examples/sections/StatsSectionBasic.vue?raw') },
          { title: 'With a title', demo: () => import('../examples/sections/StatsSection.vue'), source: () => import('../examples/sections/StatsSection.vue?raw') },
          { title: 'Light background, three figures', demo: () => import('../examples/sections/StatsSectionLight.vue'), source: () => import('../examples/sections/StatsSectionLight.vue?raw') }
        ]
      },
      {
        slug: 'media-text-section',
        name: 'MediaTextSection',
        summary: 'The split image/text content section: plain copy or a feature list, picked by which props are set.',
        props: [
          { name: 'eyebrow', type: 'string', default: "''", notes: '' },
          { name: 'title', type: 'string', default: "''", notes: '' },
          { name: 'text', type: 'string', default: "''", notes: 'Body copy in text mode; lead paragraph in feature mode.' },
          { name: 'items', type: '{ title, text }[]', default: '[]', notes: 'Non-empty enables feature mode.' },
          { name: 'image', type: 'string', default: "''", notes: '' },
          { name: 'imageAlt', type: 'string', default: "''", notes: '' },
          { name: 'reverse', type: 'boolean', default: 'false', notes: '' },
          { name: 'subtle', type: 'boolean', default: 'false', notes: 'Sunken section background.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: 'Aligns the text column only.' },
          { name: 'action', type: '{ label, href, newTab? }', notes: 'Text mode only.' }
        ],
        slots: [
          { name: 'visual', notes: 'Replaces the image with any custom visual, in both modes, e.g. a consent-gated map.' },
          { name: 'default', notes: 'Extra body content below the text/feature list.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/sections/MediaTextSection.vue'), source: () => import('../examples/sections/MediaTextSection.vue?raw') },
          { title: 'Feature list mode', description: '`items` switches to a divided list of named points.', demo: () => import('../examples/sections/MediaTextFeature.vue'), source: () => import('../examples/sections/MediaTextFeature.vue?raw') }
        ]
      },
      {
        slug: 'steps-section',
        name: 'StepsSection',
        summary: 'A header plus a sequence of labeled steps, as a list, a connected chain, or a checkmark grid.',
        props: [
          { name: 'eyebrow', type: 'string', default: "''", notes: '' },
          { name: 'title', type: 'string', default: "''", notes: '' },
          { name: 'intro', type: 'string', default: "''", notes: '' },
          { name: 'steps', type: '{ title, text?, image?, href?, newTab?, theme? }[]', notes: 'Required. `image`/`href`/`newTab`/`theme` apply to `layout="chain"` only.' },
          { name: 'layout', type: "'list' | 'chain' | 'grid'", default: "'list'", notes: '' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: 'Aligns the header (eyebrow/title/intro) only.' },
          { name: 'marker', type: "'number' | 'check' | 'none'", default: "'number' (list/chain) or 'check' (grid)", notes: '' },
          { name: 'columns', type: 'number', default: '3', notes: '`layout="grid"` only.' },
          { name: 'action', type: '{ label, href, newTab? }', notes: '`layout="list"` only.' },
          { name: 'narrow', type: 'boolean', default: 'false', notes: 'Opt-in 860px column; by default every section shares the same container width.' }
        ],
        examples: [
          { title: 'Basic usage', description: '`layout="list"`: the default and lightest-weight option.', demo: () => import('../examples/sections/StepsSection.vue'), source: () => import('../examples/sections/StepsSection.vue?raw') },
          { title: 'Grid layout', description: 'A checkmark grid of benefits.', demo: () => import('../examples/sections/StepsSectionGrid.vue'), source: () => import('../examples/sections/StepsSectionGrid.vue?raw') },
          { title: 'Chain layout', description: 'Per-step theme, image and href.', demo: () => import('../examples/sections/StepsSectionChain.vue'), source: () => import('../examples/sections/StepsSectionChain.vue?raw') }
        ]
      },
      {
        slug: 'testimonial-section',
        name: 'TestimonialSection',
        summary: 'A single pull-quote or a star-rated grid of testimonials, picked by the `layout` prop.',
        props: [
          { name: 'eyebrow', type: 'string', default: "''", notes: '`layout="grid"` only.' },
          { name: 'title', type: 'string', default: "''", notes: '`layout="grid"` only.' },
          { name: 'intro', type: 'string', default: "''", notes: '`layout="grid"` only.' },
          { name: 'items', type: '{ quote, name, role?, avatar?, rating? }[]', notes: 'Required. `feature` layout uses only the first entry; `rating` is 0-5, items without one show no stars.' },
          { name: 'layout', type: "'grid' | 'feature'", default: "'grid'", notes: '' },
          { name: 'align', type: "'left' | 'center' | 'right' | null", default: 'null', notes: "null = auto, `feature`'s pull-quote centers itself, `grid`'s header left-aligns." },
          { name: 'narrow', type: 'boolean', default: 'false', notes: 'Opt-in 860px column; by default every section shares the same container width.' },
          { name: 'appearance', type: "'mark' | 'border' | 'card'", default: "'mark'", notes: 'layout="feature": passed to the Quote it renders.' }
        ],
        examples: [
          { title: 'Basic usage', description: '`layout="feature"`: a single pull-quote.', demo: () => import('../examples/sections/TestimonialSectionFeature.vue'), source: () => import('../examples/sections/TestimonialSectionFeature.vue?raw') },
          { title: 'Grid layout', description: 'The default: a star-rated card grid.', demo: () => import('../examples/sections/TestimonialSection.vue'), source: () => import('../examples/sections/TestimonialSection.vue?raw') }
        ]
      },
      {
        slug: 'cta-banner',
        name: 'CtaBanner',
        summary: 'A full-width, solid-color banner built around one strong call to action.',
        props: [
          { name: 'title', type: 'string', notes: 'Required.' },
          { name: 'text', type: 'string', default: "''", notes: '' },
          { name: 'background', type: 'theme key | color', default: "'gold'", notes: 'See Theming → Section color themes. Unlike HeroSection, does not accept an image URL.' },
          { name: 'action', type: '{ label, href, newTab? }', notes: 'Required.' },
          { name: 'secondaryAction', type: '{ label, href, newTab? }', notes: 'Second action as an outline button, light on dark bands.' },
          { name: 'layout', type: "'split' | 'stacked'", default: "'split'", notes: 'Text left + buttons right, or buttons under the text.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: 'Text alignment; stacked buttons follow it.' }
        ],
        slots: [{ name: 'text', notes: 'Rich body copy in place of the text prop.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/sections/CtaBannerBasic.vue'), source: () => import('../examples/sections/CtaBannerBasic.vue?raw') },
          { title: 'Custom theme with supporting text', demo: () => import('../examples/sections/CtaBanner.vue'), source: () => import('../examples/sections/CtaBanner.vue?raw') },
          { title: 'Two actions on a dark band', description: '`secondaryAction` with the split layout: the outline button turns light on the primary theme.', demo: () => import('../examples/sections/CtaBannerSplit.vue'), source: () => import('../examples/sections/CtaBannerSplit.vue?raw') }
        ]
      }
    ]
  },
  {
    name: 'Lists & Listings',
    items: [
      {
        slug: 'list-section',
        name: 'ListSection',
        summary: 'A header plus a vertical stack of items: press index, job list or downloads, picked by `itemType`.',
        props: [
          { name: 'title', type: 'string', notes: 'Required.' },
          { name: 'eyebrow', type: 'string', default: "''", notes: '' },
          { name: 'intro', type: 'string', default: "''", notes: '' },
          { name: 'items', type: 'array', default: '[]', notes: 'Shape depends on `itemType`.' },
          { name: 'itemType', type: "'article' | 'job' | 'download'", default: "'article'", notes: 'Picks the Card layout and the matching auxiliary widget.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: 'Aligns the header (eyebrow/title/intro) only.' },
          { name: 'narrow', type: 'boolean', default: 'false', notes: 'Opt-in 860px column; by default every section shares the same container width.' },
          { name: 'subtle', type: 'boolean', notes: 'Auto: subtle only for `download`.' },
          { name: 'searchable', type: 'boolean', default: 'true', notes: '`itemType="job"` only.' },
          { name: 'searchLabel', type: 'string', default: "'Search jobs'", notes: '`itemType="job"` only.' },
          { name: 'searchPlaceholder', type: 'string', default: "'Search open positions…'", notes: '`itemType="job"` only.' },
          { name: 'emptyTitle', type: 'string', default: "'No open positions found'", notes: '`itemType="job"` only.' },
          { name: 'emptyText', type: 'string', default: "'Try adjusting your search, or check back later.'", notes: '`itemType="job"` only.' },
          { name: 'page', type: 'number', default: '1', notes: '`itemType="article"` only, `v-model:page`.' },
          { name: 'totalPages', type: 'number', default: '0', notes: '`itemType="article"` only.' }
        ],
        events: [
          { name: 'search', payload: 'string', notes: '`itemType="job"` only.' },
          { name: 'update:page', payload: 'number', notes: '`itemType="article"` only.' }
        ],
        slots: [
          { name: 'filters', notes: '`itemType="job"` toolbar end.' },
          { name: 'item', notes: 'Scoped (`{ item }`): overrides the default Card for any item shape.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/sections/ListSectionBasic.vue'), source: () => import('../examples/sections/ListSectionBasic.vue?raw') },
          { title: 'News list with pagination', demo: () => import('../examples/sections/ListSection.vue'), source: () => import('../examples/sections/ListSection.vue?raw') },
          { title: 'Job listings with search', demo: () => import('../examples/sections/ListSectionJobs.vue'), source: () => import('../examples/sections/ListSectionJobs.vue?raw') },
          { title: 'Downloads list', demo: () => import('../examples/sections/ListSectionDownloads.vue'), source: () => import('../examples/sections/ListSectionDownloads.vue?raw') }
        ]
      },
      {
        slug: 'related-links',
        name: 'RelatedLinks',
        summary: 'A quiet, boxed related-links list for the end of a content page: smaller and lower-key than TeaserGrid.',
        props: [
          { name: 'title', type: 'string', default: "'More on this topic'", notes: '' },
          { name: 'links', type: '{ label, href, newTab?, text?, tag? }[]', notes: 'Required.' },
          { name: 'tag', type: 'string | object', notes: 'Element/component every link renders as; overridable per-link. Unset = configureLinks({ linkComponent }) for internal paths.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: '' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/sections/RelatedLinks.vue'), source: () => import('../examples/sections/RelatedLinks.vue?raw') },
          { title: 'Compact list without descriptions', demo: () => import('../examples/sections/RelatedLinksCompact.vue'), source: () => import('../examples/sections/RelatedLinksCompact.vue?raw') }
        ]
      },
      {
        slug: 'faq-section',
        name: 'FaqSection',
        summary: 'A heading and intro wrapped around an Accordion: the FAQ block pattern used on process and service pages.',
        props: [
          { name: 'title', type: 'string', notes: 'Required.' },
          { name: 'eyebrow', type: 'string', default: "''", notes: '' },
          { name: 'intro', type: 'string', default: "''", notes: '' },
          { name: 'items', type: '{ question, answer }[]', default: '[]', notes: 'Ignored if the default slot is used.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: 'Aligns the header (eyebrow/title/intro) only.' },
          { name: 'narrow', type: 'boolean', default: 'false', notes: 'Opt-in 860px column; by default every section shares the same container width.' }
        ],
        slots: [{ name: 'default', notes: 'Overrides `items` with custom `AccordionItem` children.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/sections/FaqSectionBasic.vue'), source: () => import('../examples/sections/FaqSectionBasic.vue?raw') },
          { title: 'With eyebrow and intro', demo: () => import('../examples/sections/FaqSection.vue'), source: () => import('../examples/sections/FaqSection.vue?raw') }
        ]
      }
    ]
  },
  {
    name: 'Location & Booking',
    items: [
      {
        slug: 'appointment-section',
        name: 'AppointmentSection',
        summary: 'A request/appointment form paired with a dark direct-contact panel: the two-track pattern for a service a citizen books or requests.',
        props: [
          { name: 'title', type: 'string', notes: 'Required.' },
          { name: 'eyebrow', type: 'string', default: "''", notes: '' },
          { name: 'intro', type: 'string', default: "''", notes: '' },
          { name: 'status', type: "'idle' | 'sending' | 'success' | 'error'", default: "'idle'", notes: 'Drives the submit button and result Alert.' },
          { name: 'submitLabel', type: 'string', default: "'Request appointment'", notes: '' },
          { name: 'sendingLabel', type: 'string', default: "'Sending…'", notes: '' },
          { name: 'successMessage', type: 'string', default: "\"Thanks: we'll be in touch shortly with a proposed time.\"", notes: '' },
          { name: 'errorMessage', type: 'string', default: "'Something went wrong sending your request. Please try again or contact us directly.'", notes: '' },
          { name: 'privacyText', type: 'string', default: "'I have read the'", notes: '' },
          { name: 'privacyLinkLabel', type: 'string', default: "'privacy policy'", notes: '' },
          { name: 'privacyHref', type: 'string', default: "'#'", notes: '' },
          { name: 'directTitle', type: 'string', default: "'Prefer to reach out directly?'", notes: '' },
          { name: 'contactMethods', type: '{ label, href, icon? }[]', default: '[]', notes: '`icon` is raw SVG via `v-html`, routed through `sanitizeHtml()`.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'center'", notes: 'Aligns the header (eyebrow/title/intro) only.' },
          { name: 'labels', type: '{ name?, phone?, email?, street?, houseNumber?, zip?, city?, message? }', default: '{}', notes: 'Per-field label overrides for translation.' },
          { name: 'messagePlaceholder', type: 'string', default: "'Property, request and preferred timing'", notes: '' },
          { name: 'zipPattern', type: "string", default: "''", notes: 'Native pattern for the postcode, e.g. \'[0-9]{5}\'.' },
          { name: 'messageMaxLength', type: "number", default: "2000", notes: 'maxlength of the message field; 0 = no limit.' }
        ],
        events: [{ name: 'submit', payload: '{ name, email, phone, street, houseNumber, zip, city, message, privacyAccepted }', notes: 'Fires on submit; the component does not send the request itself.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/sections/AppointmentSectionBasic.vue'), source: () => import('../examples/sections/AppointmentSectionBasic.vue?raw') },
          { title: 'With status handling and direct-contact panel', demo: () => import('../examples/sections/AppointmentSection.vue'), source: () => import('../examples/sections/AppointmentSection.vue?raw') }
        ]
      }
    ]
  },
  {
    name: 'Engagement',
    items: [
      {
        slug: 'newsletter-section',
        name: 'NewsletterSection',
        summary: 'A subscribe block for a newsletter callout that emits the entered address for you to send to your own backend.',
        props: [
          { name: 'title', type: 'string', default: "'Newsletter'", notes: '' },
          { name: 'text', type: 'string', default: "''", notes: '' },
          { name: 'label', type: "string", default: "'Email address'", notes: 'Field label.' },
          { name: 'placeholder', type: "string", default: "'you@example.com'", notes: '' },
          { name: 'submitLabel', type: "string", default: "'Subscribe'", notes: '' }
        ],
        events: [{ name: 'submit', payload: 'string', notes: 'Fires on submit with the entered email address.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/sections/NewsletterSectionBasic.vue'), source: () => import('../examples/sections/NewsletterSectionBasic.vue?raw') },
          { title: 'With description and submit handling', demo: () => import('../examples/sections/NewsletterSection.vue'), source: () => import('../examples/sections/NewsletterSection.vue?raw') }
        ]
      }
    ]
  }
]

export function flatSectionList() {
  return sectionCategories.flatMap((category) =>
    category.items.map((item) => ({ ...item, category: category.name }))
  )
}

export function findSection(slug) {
  return flatSectionList().find((item) => item.slug === slug) || null
}
