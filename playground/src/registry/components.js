// Registry of every published component, grouped by category. Each entry
// carries its API reference (props/events/slots, rendered by ApiTable) and
// an ordered `examples` list: example 1 is always the smallest useful case,
// later ones layer on configuration or show a distinct layout/variant. Each
// example's `demo`/`source` loaders point at one file under
// ../examples/components: that file is both the live preview AND (via the
// `?raw` import) the exact code sample shown on the doc page, so the two can
// never drift apart.
export const componentCategories = [
  {
    name: 'Buttons',
    items: [
      {
        slug: 'app-button',
        name: 'AppButton',
        summary: 'The base action element: renders as a button or a link, with seven visual variants.',
        props: [
          { name: 'variant', type: "'primary' | 'accent' | 'quaternary' | 'outline' | 'ghost' | 'link' | 'danger'", default: "'primary'", notes: '`primary` is white text on navy; `accent` is `--cui-accent-contrast` on the accent color (navy on gold by default, white on a dark brand accent); `quaternary` is white text on the quaternary palette color (violet by default; `violet` still works as an alias); `ghost` has a soft ink-tinted border, unlike the borderless `link` variant.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", notes: '' },
          { name: 'href', type: 'string', notes: 'Renders an `<a>` instead of a `<button>` when set.' },
          { name: 'newTab', type: 'boolean', default: 'false', notes: 'Link buttons only: opens `href` in a new tab (rel="noopener noreferrer") with a visually hidden screen-reader hint.' },
          { name: 'tag', type: 'string | object', notes: 'Overrides the rendered element, e.g. `RouterLink`. Usually unnecessary with configureLinks({ linkComponent }).' },
          { name: 'type', type: 'string', default: "'button'", notes: "Native `type` attribute, only applied when rendered as `<button>`." },
          { name: 'disabled', type: 'boolean', default: 'false', notes: 'A link button drops its href and renders <a role="link" aria-disabled="true">.' },
          { name: 'loading', type: 'boolean', default: 'false', notes: 'Shows a spinner and blocks the button; it stays focusable (aria-disabled).' },
          { name: 'block', type: 'boolean', default: 'false', notes: 'Full width.' },
          { name: 'icon', type: 'component | string', notes: 'An icon component, or an image URL (rendered as a decorative `<img>`). Sized to 1.25em, so it scales with `size`.' },
          { name: 'iconPosition', type: "'start' | 'end'", default: "'start'", notes: 'Which side of the label the icon sits on.' },
          { name: 'iconOnly', type: 'boolean', default: 'false', notes: 'Square icon button. The slot text stays as a visually hidden accessible name: always pass one.' },
          { name: 'focusableWhenDisabled', type: 'boolean', default: 'false', notes: 'With `disabled`: aria-disabled instead of the native attribute, so focus is kept. Clicks are blocked.' }
        ],
        examples: [
          {
            title: 'Basic button',
            demo: () => import('../examples/components/AppButtonBasic.vue'),
            source: () => import('../examples/components/AppButtonBasic.vue?raw')
          },
          {
            title: 'Variants, sizes & states',
            description: 'Every visual variant, plus the loading and disabled states.',
            demo: () => import('../examples/components/AppButton.vue'),
            source: () => import('../examples/components/AppButton.vue?raw')
          },
          {
            title: 'With icons',
            description: 'A component or image icon beside the label, and icon-only buttons in each size.',
            demo: () => import('../examples/components/AppButtonIcon.vue'),
            source: () => import('../examples/components/AppButtonIcon.vue?raw')
          }
        ]
      },
      {
        slug: 'button-group',
        name: 'ButtonGroup',
        summary: 'Visually joins a row (or column) of AppButtons into one segmented control.',
        props: [
          { name: 'vertical', type: 'boolean', default: 'false', notes: 'Stacks the buttons in a column instead of a row.' },
          { name: 'ariaLabel', type: 'string', default: "'Button group'", notes: 'Accessible name for the group.' }
        ],
        slots: [{ name: 'default', notes: 'The AppButtons (or other controls) to join together.' }],
        examples: [
          {
            title: 'Basic usage',
            demo: () => import('../examples/components/ButtonGroup.vue'),
            source: () => import('../examples/components/ButtonGroup.vue?raw')
          },
          {
            title: 'Vertical group with active state',
            demo: () => import('../examples/components/ButtonGroupVertical.vue'),
            source: () => import('../examples/components/ButtonGroupVertical.vue?raw')
          }
        ]
      },
      {
        slug: 'color-mode-toggle',
        name: 'ColorModeToggle',
        summary: 'Light/dark switch for the page-wide dark mode: remembers the choice and can hand back to the system setting.',
        props: [
          { name: 'label', type: 'string', default: "'Dark mode'", notes: 'Constant accessible name; the state is carried by aria-pressed.' },
          { name: 'showLabel', type: 'boolean', default: 'false', notes: 'Shows the label next to the icon instead of only as aria-label.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", notes: '' }
        ],
        events: [{ name: 'change', notes: "Fires after toggling, with the new mode ('light' | 'dark')." }],
        examples: [
          {
            title: 'Basic usage',
            demo: () => import('../examples/components/ColorModeToggleBasic.vue'),
            source: () => import('../examples/components/ColorModeToggleBasic.vue?raw')
          },
          {
            title: 'With label and "follow system"',
            description: 'useColorMode() exposes the same shared state, so your own controls stay in sync with the toggle.',
            demo: () => import('../examples/components/ColorModeToggle.vue'),
            source: () => import('../examples/components/ColorModeToggle.vue?raw')
          }
        ]
      },
      {
        slug: 'close-button',
        name: 'CloseButton',
        summary: 'The "×" dismiss control used internally by Alert, Modal, and Toast.',
        props: [
          { name: 'label', type: 'string', default: "'Close'", notes: "Accessible name: always pass one describing what's being closed." },
          { name: 'dark', type: 'boolean', default: 'false', notes: 'Light-colored styling for placement on dark or colored backgrounds.' }
        ],
        events: [{ name: 'click', notes: "Fires on click. CloseButton doesn't hide anything itself." }],
        examples: [
          {
            title: 'Basic usage',
            demo: () => import('../examples/components/CloseButtonBasic.vue'),
            source: () => import('../examples/components/CloseButtonBasic.vue?raw')
          },
          {
            title: 'Dismissing content',
            demo: () => import('../examples/components/CloseButton.vue'),
            source: () => import('../examples/components/CloseButton.vue?raw')
          },
          {
            title: 'Dark background variant',
            demo: () => import('../examples/components/CloseButtonDark.vue'),
            source: () => import('../examples/components/CloseButtonDark.vue?raw')
          }
        ]
      }
    ]
  },
  {
    name: 'Feedback',
    items: [
      {
        slug: 'alert',
        name: 'Alert',
        summary: 'An inline banner for messages tied to a page or piece of content: validation summaries, save confirmations, maintenance notices.',
        props: [
          { name: 'variant', type: "'info' | 'success' | 'warning' | 'danger' | 'neutral'", default: "'info'", notes: '' },
          { name: 'title', type: 'string', notes: 'Optional bold heading above the body.' },
          { name: 'dismissible', type: 'boolean', default: 'false', notes: 'Shows a close button that hides the alert.' },
          { name: 'live', type: 'boolean', default: 'true', notes: 'Own live region (role alert/status). Set false inside an always-rendered live region of your own.' },
          { name: 'focusTarget', type: 'string | HTMLElement', default: 'null', notes: 'Gets focus when the focused close button dismisses the alert.' }
        ],
        events: [
          { name: 'dismiss', notes: 'Fires when the close button is clicked, after the alert hides itself.' }
        ],
        slots: [{ name: 'default', notes: 'The alert body.' }],
        examples: [
          {
            title: 'Basic alert',
            demo: () => import('../examples/components/AlertBasic.vue'),
            source: () => import('../examples/components/AlertBasic.vue?raw')
          },
          {
            title: 'Variants & dismissible',
            description: 'Every severity variant, plus a dismissible close button.',
            demo: () => import('../examples/components/Alert.vue'),
            source: () => import('../examples/components/Alert.vue?raw')
          }
        ]
      },
      {
        slug: 'badge',
        name: 'Badge',
        summary: 'A small inline label for tagging status, category, or count.',
        props: [
          { name: 'variant', type: "'neutral' | 'primary' | 'accent' | 'info' | 'success' | 'warning' | 'danger' | 'outline'", default: "'neutral'", notes: '' },
          { name: 'pill', type: 'boolean', default: 'false', notes: 'Fully rounded shape instead of the default small radius.' }
        ],
        slots: [{ name: 'default', notes: "The badge's label text." }],
        examples: [
          {
            title: 'Basic badge',
            demo: () => import('../examples/components/BadgeBasic.vue'),
            source: () => import('../examples/components/BadgeBasic.vue?raw')
          },
          {
            title: 'All variants',
            description: 'Every color variant, plus the pill shape.',
            demo: () => import('../examples/components/Badge.vue'),
            source: () => import('../examples/components/Badge.vue?raw')
          }
        ]
      },
      {
        slug: 'status-dot',
        name: 'StatusDot',
        summary: 'A compact presence/state indicator, a dot plus an optional label, lighter-weight than Badge for table cells and status lists.',
        props: [
          { name: 'status', type: "'neutral' | 'online' | 'offline' | 'busy' | 'away' | 'success' | 'warning' | 'danger'", default: "'neutral'", notes: '`online`/`success`, `busy`/`danger`, and `away`/`warning` share color tokens in pairs.' },
          { name: 'label', type: 'string', notes: 'Text next to the dot. Omit it to render just the dot.' },
          { name: 'pulse', type: 'boolean', default: 'false', notes: 'Animated ping, for "live" states.' }
        ],
        examples: [
          {
            title: 'Basic status dot',
            demo: () => import('../examples/components/StatusDotBasic.vue'),
            source: () => import('../examples/components/StatusDotBasic.vue?raw')
          },
          {
            title: 'All statuses',
            description: 'Every status, including the pulsing "live" state.',
            demo: () => import('../examples/components/StatusDot.vue'),
            source: () => import('../examples/components/StatusDot.vue?raw')
          }
        ]
      },
      {
        slug: 'toast',
        name: 'Toast',
        summary: 'A global, self-dismissing notification queue: mount ToastContainer once, then push messages from anywhere via useToast().',
        props: [
          { name: 'position', type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'", default: "'top-right'", notes: 'ToastContainer prop: corner the toast stack anchors to.' },
          { name: 'variant', type: "'info' | 'success' | 'warning' | 'danger'", default: "'info'", notes: 'Toast prop, and the variant set by useToast().push()/success()/danger()/warning()/info().' },
          { name: 'title', type: 'string', notes: 'Toast prop / push() option: optional bold heading above the message.' },
          { name: 'duration', type: 'number', default: '10000 (danger/warning: 0)', notes: 'push() option, ms. danger/warning stay until dismissed; auto-closing toasts last at least 10 s. configureToast({ duration, minDuration }) sets app-wide timing.' },
          { name: 'live', type: 'boolean', default: 'true', notes: 'Toast prop: own live region. ToastContainer turns it off and renders into its own always-present regions.' }
        ],
        events: [
          { name: 'dismiss', notes: 'Toast event on close-button click; ToastContainer already handles it via useToast().dismiss(id).' }
        ],
        slots: [{ name: 'default', notes: 'Toast body: ToastContainer fills this with the queued message text.' }],
        examples: [
          {
            title: 'Basic toast',
            demo: () => import('../examples/components/ToastBasic.vue'),
            source: () => import('../examples/components/ToastBasic.vue?raw')
          },
          {
            title: 'Variants & titles',
            description: 'Info, success, and danger toasts, each pushed via useToast().',
            demo: () => import('../examples/components/Toast.vue'),
            source: () => import('../examples/components/Toast.vue?raw')
          }
        ]
      },
      {
        slug: 'spinner',
        name: 'Spinner',
        summary: 'A small animated loading indicator for a button, panel, or inline loading state.',
        props: [
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", notes: '' },
          { name: 'label', type: 'string', default: "'Loading…'", notes: 'Screen-reader-only text; the spinner has no visible label.' }
        ],
        examples: [
          {
            title: 'Sizes',
            demo: () => import('../examples/components/Spinner.vue'),
            source: () => import('../examples/components/Spinner.vue?raw')
          },
          {
            title: 'Inside a loading button',
            description: "Compose Spinner into custom button content when you need its own screen-reader label: AppButton's built-in loading prop covers the common case.",
            demo: () => import('../examples/components/SpinnerButton.vue'),
            source: () => import('../examples/components/SpinnerButton.vue?raw')
          }
        ]
      },
      {
        slug: 'placeholder',
        name: 'Placeholder',
        summary: 'A shimmering skeleton-loading block that stands in for content while it loads.',
        props: [
          { name: 'width', type: 'string', default: "'100%'", notes: '' },
          { name: 'height', type: 'string', default: "'1.6rem'", notes: '' },
          { name: 'rounded', type: "'sm' | 'md' | 'lg' | 'pill'", default: "'md'", notes: 'Use `pill` for circular avatars.' },
          { name: 'animated', type: 'boolean', default: 'true', notes: '' }
        ],
        examples: [
          {
            title: 'Basic usage',
            demo: () => import('../examples/components/Placeholder.vue'),
            source: () => import('../examples/components/Placeholder.vue?raw')
          },
          {
            title: 'Avatar and text skeleton',
            description: 'A circular placeholder for an avatar next to name/role text lines.',
            demo: () => import('../examples/components/PlaceholderAvatar.vue'),
            source: () => import('../examples/components/PlaceholderAvatar.vue?raw')
          }
        ]
      },
      {
        slug: 'progress-bar',
        name: 'ProgressBar',
        summary: 'A horizontal progress indicator for uploads, multi-step forms, and other measurable completion.',
        props: [
          { name: 'value', type: 'number', default: '0', notes: '' },
          { name: 'max', type: 'number', default: '100', notes: '' },
          { name: 'variant', type: "'primary' | 'accent' | 'success' | 'warning' | 'danger'", default: "'primary'", notes: '' },
          { name: 'label', type: 'string', notes: 'Shown above the bar and used as its aria-label.' },
          { name: 'showValue', type: 'boolean', default: 'false', notes: 'Shows the rounded percentage next to the label.' },
          { name: 'striped', type: 'boolean', default: 'false', notes: 'Adds a diagonal-stripe texture to the filled bar.' }
        ],
        examples: [
          {
            title: 'Basic progress bar',
            demo: () => import('../examples/components/ProgressBarBasic.vue'),
            source: () => import('../examples/components/ProgressBarBasic.vue?raw')
          },
          {
            title: 'With label and variants',
            description: 'A labeled bar with percentage, and a striped accent variant.',
            demo: () => import('../examples/components/ProgressBar.vue'),
            source: () => import('../examples/components/ProgressBar.vue?raw')
          }
        ]
      }
    ]
  },
  {
    name: 'Navigation',
    items: [
      {
        slug: 'navbar',
        name: 'Navbar',
        summary: 'The top nav bar for a site header, with brand/links/actions slots and a built-in mobile hamburger menu.',
        props: [
          { name: 'sticky', type: 'boolean', default: 'true', notes: 'Pins the bar to the top with a translucent, blurred fill instead of a flat background.' },
          { name: 'dark', type: 'boolean', default: 'false', notes: 'Navy fill with light text, for headers over a dark hero.' },
          { name: 'items', type: '{ label, href?, newTab?, active?, children? }[]', default: '[]', notes: 'Data-driven alternative to the links slot (the slot wins). An item with children becomes a Dropdown: an expanded group in the mobile drawer.' },
          { name: 'linkTag', type: 'string | object', notes: 'Renders the item links as e.g. RouterLink; usually unnecessary with configureLinks({ linkComponent }).' },
          { name: 'linksAlign', type: "'start' | 'center' | 'end'", default: "'center'", notes: "Desktop position of the links slot: spaced between brand and actions, right after the brand, or right next to the actions." },
          { name: 'toggleLabel', type: "string", default: "'Toggle navigation menu'", notes: 'Accessible name of the hamburger button.' },
          { name: 'menuLabel', type: "string", default: "'Menu'", notes: 'Title of the mobile menu drawer.' },
          { name: 'closeLabel', type: "string", default: "'Close dialog'", notes: 'Accessible name of the drawer\'s close button.' },
          { name: 'navLabel', type: "string", default: "'Main'", notes: 'Accessible name of the desktop <nav>.' },
          { name: 'mobileNavLabel', type: "string", default: "'Main (mobile)'", notes: 'Accessible name of the <nav> in the drawer.' }
        ],
        slots: [
          { name: 'brand', notes: 'The logo/site name, usually a link to the homepage.' },
          { name: 'links', notes: 'The nav items; reused as-is inside the mobile menu, where a chevron-label Dropdown becomes an expanded group. The drawer closes when a link is followed.' },
          { name: 'actions', notes: 'Buttons/links that stay outside the collapsing nav, e.g. a sign-in link.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/NavbarBasic.vue'), source: () => import('../examples/components/NavbarBasic.vue?raw') },
          { title: 'With actions', demo: () => import('../examples/components/Navbar.vue'), source: () => import('../examples/components/Navbar.vue?raw') },
          { title: 'Data-driven items with a sub-menu', description: 'An item with children is a dropdown on desktop and an expanded group in the mobile drawer.', demo: () => import('../examples/components/NavbarItems.vue'), source: () => import('../examples/components/NavbarItems.vue?raw') }
        ]
      },
      {
        slug: 'breadcrumb',
        name: 'Breadcrumb',
        summary: 'A trail of links showing where the current page sits in the site hierarchy.',
        props: [
          { name: 'items', type: '{ label, href?, newTab? | to? }[]', notes: 'Last item renders as plain (non-link) current-page text, regardless of what is passed for it.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/Breadcrumb.vue'), source: () => import('../examples/components/Breadcrumb.vue?raw') },
          { title: 'Deeper hierarchy', demo: () => import('../examples/components/BreadcrumbDeep.vue'), source: () => import('../examples/components/BreadcrumbDeep.vue?raw') }
        ]
      },
      {
        slug: 'pagination',
        name: 'Pagination',
        summary: 'A controlled numeric pager with ellipsis collapsing for large page counts.',
        props: [
          { name: 'modelValue', type: 'number', notes: 'The current page, 1-indexed. Required.' },
          { name: 'total', type: 'number', notes: 'Total number of pages. Required.' },
          { name: 'siblingCount', type: 'number', default: '1', notes: 'How many page numbers to show on each side of the current page before collapsing into `…`.' }
        ],
        events: [{ name: 'update:modelValue', payload: 'number', notes: 'Fires when a page number or the previous/next arrow is clicked.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/Pagination.vue'), source: () => import('../examples/components/Pagination.vue?raw') },
          { title: 'Large result sets', demo: () => import('../examples/components/PaginationLarge.vue'), source: () => import('../examples/components/PaginationLarge.vue?raw') }
        ]
      },
      {
        slug: 'tabs',
        name: 'Tabs',
        summary: 'Switches between panels of content behind a row of tab buttons; doubles as a pill-nav when `pills` is set.',
        props: [
          { name: 'tabs', type: '{ id, label, disabled? }[]', notes: 'Required.' },
          { name: 'modelValue', type: 'string', default: "first tab's id", notes: "Pair with v-model to control the active tab from outside." },
          { name: 'pills', type: 'boolean', default: 'false', notes: 'Rounded pill-nav look instead of underlined tabs.' },
          { name: 'fill', type: 'boolean', default: 'false', notes: "Tabs stretch to share the row's full width equally." }
        ],
        events: [{ name: 'update:modelValue', payload: 'string', notes: "Fires with the newly active tab's id." }],
        slots: [{ name: '<tab.id>', notes: 'One dynamic slot per entry in `tabs`, named after that id: shown while that tab is active.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/Tabs.vue'), source: () => import('../examples/components/Tabs.vue?raw') },
          { title: 'Pills, fill & disabled tabs', demo: () => import('../examples/components/TabsPills.vue'), source: () => import('../examples/components/TabsPills.vue?raw') }
        ]
      },
      {
        slug: 'dropdown',
        name: 'Dropdown',
        summary: 'The one trigger-and-menu primitive: a plain action menu, a mega menu, or an account menu.',
        props: [
          { name: 'align', type: "'start' | 'end'", default: "'start'", notes: 'Which side of the trigger the menu is anchored to.' },
          { name: 'triggerVariant', type: "'custom' | 'chevron-label' | 'user'", default: "'custom'", notes: 'A `#trigger` slot always overrides the built-in trigger even when this is set.' },
          { name: 'label', type: 'string', notes: 'triggerVariant="chevron-label": the nav item\'s text.' },
          { name: 'highlight', type: 'boolean', default: 'false', notes: 'triggerVariant="chevron-label": renders as a filled pill for an emphasized item.' },
          { name: 'name', type: 'string', notes: 'triggerVariant="user": the account name.' },
          { name: 'role', type: 'string', notes: 'triggerVariant="user": shown under the name.' },
          { name: 'avatar', type: 'string', notes: 'triggerVariant="user": image src passed to the internal Avatar.' }
        ],
        slots: [
          { name: 'trigger', notes: 'Scoped with `{ open, toggle, menuId }`; overrides the built-in trigger.' },
          { name: 'default', notes: 'The menu content. Scoped with `{ close }`.' }
        ],
        examples: [
          { title: 'Basic usage (custom trigger)', demo: () => import('../examples/components/Dropdown.vue'), source: () => import('../examples/components/Dropdown.vue?raw') },
          { title: 'Chevron-label trigger (mega menu)', demo: () => import('../examples/components/DropdownMega.vue'), source: () => import('../examples/components/DropdownMega.vue?raw') },
          { title: 'User account trigger', demo: () => import('../examples/components/DropdownUser.vue'), source: () => import('../examples/components/DropdownUser.vue?raw') }
        ]
      },
      {
        slug: 'scrollspy-nav',
        name: 'ScrollspyNav',
        summary: 'A vertical "on this page" nav that highlights whichever section is currently in view.',
        props: [
          { name: 'items', type: '{ id, label }[]', notes: "Required. `id` must match a real element's id elsewhere on the page." },
          { name: 'title', type: 'string', default: "''", notes: 'Visible heading; also names the nav landmark.' },
          { name: 'appearance', type: "'plain' | 'card'", default: "'plain'", notes: 'card = framed box.' },
          { name: 'sticky', type: 'boolean', default: 'false', notes: 'Sticks below a sticky Navbar (.cui-sticky).' },
          { name: 'scrollOffset', type: 'string (CSS length)', default: "''", notes: 'scroll-margin-top set on the target elements.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/ScrollspyNav.vue'), source: () => import('../examples/components/ScrollspyNav.vue?raw') },
          { title: 'Table of contents box', demo: () => import('../examples/components/ScrollspyNavPolicy.vue'), source: () => import('../examples/components/ScrollspyNavPolicy.vue?raw') }
        ]
      },
      {
        slug: 'language-switcher',
        name: 'LanguageSwitcher',
        summary: 'The plain-text "DE | EN" language toggle for a header\'s utility strip: no flag icons.',
        props: [
          { name: 'languages', type: '{ code, label?, href, newTab? }[]', notes: 'Required. `label` falls back to `code.toUpperCase()` when omitted.' },
          { name: 'current', type: 'string', notes: 'Required. Matches a `code`; that item gets `aria-current`.' },
          { name: 'ariaLabel', type: "string", default: "'Language selection'", notes: 'Accessible name of the <nav> landmark.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/LanguageSwitcher.vue'), source: () => import('../examples/components/LanguageSwitcher.vue?raw') },
          { title: 'More languages & default labels', demo: () => import('../examples/components/LanguageSwitcherFull.vue'), source: () => import('../examples/components/LanguageSwitcherFull.vue?raw') }
        ]
      },
      {
        slug: 'back-to-top',
        name: 'BackToTop',
        summary: 'A fixed circular button that fades in past a scroll threshold and smooth-scrolls to the top.',
        props: [
          { name: 'threshold', type: 'number', default: '480', notes: 'Pixels scrolled before the button fades in.' },
          { name: 'label', type: 'string', default: "'Back to top'", notes: "Used as the button's aria-label." },
          { name: 'focusTarget', type: 'string | HTMLElement', default: "'#main-content, main'", notes: 'Gets keyboard focus after the click.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/BackToTop.vue'), source: () => import('../examples/components/BackToTop.vue?raw') },
          { title: 'Custom label', demo: () => import('../examples/components/BackToTopLabel.vue'), source: () => import('../examples/components/BackToTopLabel.vue?raw') }
        ]
      },
      {
        slug: 'notification-center',
        name: 'NotificationCenter',
        summary: 'A bell-icon dropdown with an unread-count badge and a scrollable notification list.',
        props: [{ name: 'items', type: '{ id, title, text?, time?, read? }[]', default: '[]', notes: 'text/time are optional secondary lines; read controls the unread dot and badge count.' }],
        events: [
          { name: 'mark-read', payload: 'id', notes: 'Fires when a single notification row is clicked.' },
          { name: 'mark-all-read', notes: 'Fires when "Mark all read" is clicked.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/NotificationCenterBasic.vue'), source: () => import('../examples/components/NotificationCenterBasic.vue?raw') },
          { title: 'Marking items read', demo: () => import('../examples/components/NotificationCenter.vue'), source: () => import('../examples/components/NotificationCenter.vue?raw') }
        ]
      },
      {
        slug: 'sidebar',
        name: 'Sidebar',
        summary: 'The vertical app-nav rail for AppShell: icon+label items, active state, and a collapsed icon-only mode.',
        props: [
          { name: 'items', type: '{ label, href?, newTab?, to?, icon?, active? }[]', default: '[]', notes: 'icon is raw SVG markup rendered via v-html, routed through the internal HTML sanitizer. Ignored when the default slot is used.' },
          { name: 'collapsed', type: 'boolean', default: 'false', notes: 'Icon-only mode; labels stay in the accessibility tree.' }
        ],
        events: [
          { name: 'select', payload: 'item', notes: 'Fires on every item click; button items (no href/to) rely on it.' }
        ],
        slots: [
          { name: 'header', notes: 'Above the nav items.' },
          { name: 'default', notes: 'Overrides the items-driven nav entirely.' },
          { name: 'footer', notes: 'Below the nav items.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/SidebarBasic.vue'), source: () => import('../examples/components/SidebarBasic.vue?raw') },
          { title: 'With header, footer & collapse toggle', demo: () => import('../examples/components/Sidebar.vue'), source: () => import('../examples/components/Sidebar.vue?raw') }
        ]
      }
    ]
  },
  {
    name: 'Overlays',
    items: [
      {
        slug: 'modal',
        name: 'Modal',
        summary: 'The one overlay-panel primitive: a centered dialog by default, or a slide-in drawer / mobile bottom sheet via `placement`.',
        props: [
          { name: 'modelValue', type: 'boolean', default: 'false', notes: 'Controls visibility; use with `v-model`.' },
          { name: 'placement', type: "'center' | 'start' | 'end' | 'top' | 'bottom'", default: "'center'", notes: "`center` is a dialog, `start`/`end`/`top`/`bottom` a drawer; `bottom` + `handle` a mobile bottom sheet." },
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'full'", default: "'md'", notes: '`placement="center"` only.' },
          { name: 'handle', type: 'boolean', default: 'false', notes: '`placement="bottom"` only: handle (close button, 48×24 target) instead of a header close button.' },
          { name: 'title', type: 'string', notes: '' },
          { name: 'ariaLabel', type: 'string', notes: 'Fallback accessible name for a dialog with no visible `title`.' },
          { name: 'closeOnBackdrop', type: 'boolean', default: 'true', notes: '' },
          { name: 'closeLabel', type: "string", default: "'Close dialog'", notes: 'Screen-reader name of the close button / sheet handle.' },
          { name: 'footerAlign', type: "'start' | 'center' | 'end' | 'stretch'", default: "'end'", notes: 'Alignment of the footer slot buttons; stretch = equal-width buttons.' },
          { name: 'id', type: 'string', default: "''", notes: 'id of the dialog element, for the opening button\'s aria-controls.' }
        ],
        events: [{ name: 'update:modelValue', payload: 'boolean', notes: 'Fires with `false` on backdrop click, Escape, close button, or drag handle.' }],
        slots: [
          { name: 'default', notes: 'The dialog body.' },
          { name: 'footer', notes: 'Scoped with `{ close }`. Works for any `placement`.' }
        ],
        examples: [
          {
            title: 'Centered dialog (default)',
            demo: () => import('../examples/components/Modal.vue'),
            source: () => import('../examples/components/Modal.vue?raw')
          },
          {
            title: 'Slide-in drawer (offcanvas)',
            demo: () => import('../examples/components/ModalOffcanvas.vue'),
            source: () => import('../examples/components/ModalOffcanvas.vue?raw')
          },
          {
            title: 'Mobile bottom sheet',
            demo: () => import('../examples/components/ModalBottomSheet.vue'),
            source: () => import('../examples/components/ModalBottomSheet.vue?raw')
          }
        ]
      },
      {
        slug: 'lightbox',
        name: 'Lightbox',
        summary: 'A full-screen image viewer on Modal size="full": previous/next, arrow keys, swipe, announced counter.',
        props: [
          { name: 'images', type: '{ src, alt, caption? }[]', default: '[]', notes: '' },
          { name: 'modelValue', type: 'boolean', default: 'false', notes: 'Open state (v-model).' },
          { name: 'index', type: 'number', default: '0', notes: 'Shown image (v-model:index); wraps around.' }
        ],
        events: [
          { name: 'update:modelValue', payload: 'boolean', notes: '' },
          { name: 'update:index', payload: 'number', notes: '' }
        ],
        examples: [
          { title: 'Opened from a button', description: 'Via the exposed `open(index)`.', demo: () => import('../examples/components/LightboxBasic.vue'), source: () => import('../examples/components/LightboxBasic.vue?raw') }
        ]
      },
      {
        slug: 'tooltip',
        name: 'Tooltip',
        summary: 'A short hover/focus hint anchored to a trigger element, CSS-positioned with no external library.',
        props: [
          { name: 'text', type: 'string', notes: 'Required.' },
          { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", notes: '' }
        ],
        slots: [{ name: 'default', notes: 'The trigger element the tooltip is anchored to.' }],
        examples: [
          {
            title: 'Basic usage',
            demo: () => import('../examples/components/Tooltip.vue'),
            source: () => import('../examples/components/Tooltip.vue?raw')
          },
          {
            title: 'Placements',
            demo: () => import('../examples/components/TooltipPlacements.vue'),
            source: () => import('../examples/components/TooltipPlacements.vue?raw')
          }
        ]
      },
      {
        slug: 'popover',
        name: 'Popover',
        summary: 'Click-triggered overlay for richer content than Tooltip: a heading plus a body.',
        props: [
          { name: 'title', type: 'string', notes: 'Optional heading shown above the body.' },
          { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'", notes: '' }
        ],
        slots: [
          { name: 'trigger', notes: 'Scoped with `{ open, toggle, panelId }`: bind `aria-expanded`/`aria-controls` on your trigger element.' },
          { name: 'default', notes: 'The popover body.' }
        ],
        examples: [
          {
            title: 'Basic usage',
            demo: () => import('../examples/components/Popover.vue'),
            source: () => import('../examples/components/Popover.vue?raw')
          },
          {
            title: 'Contextual help on a form field',
            description: "A small help trigger next to a label, placed to the side so it doesn't cover the field.",
            demo: () => import('../examples/components/PopoverHelp.vue'),
            source: () => import('../examples/components/PopoverHelp.vue?raw')
          }
        ]
      },
      {
        slug: 'cookie-consent',
        name: 'CookieConsent',
        summary: 'Bottom-fixed consent banner with accept / reject / customize actions: pair with `useCookieConsent` to actually persist the choice.',
        props: [
          { name: 'modelValue', type: 'boolean', default: 'false', notes: 'Controls visibility; use with `v-model`.' },
          { name: 'title', type: 'string', default: "'Cookie settings'", notes: '' },
          { name: 'text', type: 'string', default: "'We use cookies to run this site reliably and securely. Optional cookies help us improve the experience.'", notes: '' },
          { name: 'acceptLabel', type: 'string', default: "'Accept all'", notes: '' },
          { name: 'rejectLabel', type: 'string', default: "'Necessary only'", notes: '' },
          { name: 'customizeLabel', type: 'string', default: "'Settings'", notes: '' },
          { name: 'lockScroll', type: 'boolean', default: 'false', notes: 'Locks page scroll while the banner is open.' },
          { name: 'equalWeight', type: 'boolean', default: 'true', notes: 'Accept and reject share one button variant (GDPR: rejecting as prominent as accepting). false: highlighted accept button.' },
          { name: 'modal', type: "boolean", default: "true", notes: 'Modal banner (aria-modal): Tab stays inside until a choice is made. false: page stays usable; the banner publishes its height for scroll-padding-bottom and Escape collapses it. Implied by lockScroll.' }
        ],
        events: [
          { name: 'accept', notes: 'Visitor accepted all cookies.' },
          { name: 'reject', notes: 'Visitor accepted necessary cookies only.' },
          { name: 'customize', notes: 'Visitor clicked the settings action.' },
          { name: 'update:modelValue', payload: 'boolean', notes: 'Fires with `false` after accept/reject closes the banner.' }
        ],
        examples: [
          {
            title: 'Basic usage',
            demo: () => import('../examples/components/CookieConsentBasic.vue'),
            source: () => import('../examples/components/CookieConsentBasic.vue?raw')
          },
          {
            title: "Persisting the visitor's choice",
            description: 'Wired to the `useCookieConsent` composable so the decision survives a reload.',
            demo: () => import('../examples/components/CookieConsent.vue'),
            source: () => import('../examples/components/CookieConsent.vue?raw')
          },
          {
            title: 'Non-modal',
            description: 'The page stays usable: the banner publishes its height for scroll-padding-bottom, so focused elements are never hidden behind it, and Escape collapses it.',
            demo: () => import('../examples/components/CookieConsentNonModal.vue'),
            source: () => import('../examples/components/CookieConsentNonModal.vue?raw')
          }
        ]
      }
    ]
  },
  {
    name: 'Content',
    items: [
      {
        slug: 'card',
        name: 'Card',
        summary: 'The general-purpose teaser/list-row card that content grids are built from.',
        props: [
          { name: 'layout', type: "'grid' | 'row' | 'person' | 'job' | 'download'", default: "'grid'", notes: 'Picks the skeleton, `row` is a press/news list row, `person` a contact card, `job` an open-position row, `download` a document list row.' },
          { name: 'media', type: 'string', notes: 'Image src (`grid`/`row`) or avatar src (`person`).' },
          { name: 'mediaAlt', type: 'string', notes: '' },
          { name: 'eyebrow', type: 'string', notes: '' },
          { name: 'title', type: 'string', notes: '' },
          { name: 'subtitle', type: 'string', notes: 'Secondary line under the title, in every layout (the role in person layout).' },
          { name: 'text', type: 'string', notes: 'Row-layout excerpt; in grid layout the body when the default slot is empty.' },
          { name: 'date', type: 'string', notes: '`row` layout only, renders a `<time>`.' },
          { name: 'meta', type: "{ label, href?, newTab?, icon?: 'location' | 'briefcase' }[]", default: '[]', notes: '`person`/`job` layouts.' },
          { name: 'fileType', type: 'string', default: "'PDF'", notes: '`download` layout.' },
          { name: 'fileSize', type: 'string', notes: '`download` layout.' },
          { name: 'trailing', type: "'none' | 'arrow' | 'download'", notes: 'Defaults sensibly per layout.' },
          { name: 'href', type: 'string', notes: 'Renders the whole card as a link when set.' },
          { name: 'newTab', type: 'boolean', default: 'false', notes: 'Opens `href` in a new tab, with a screen-reader hint. `meta` items take their own `newTab: true`.' },
          { name: 'tag', type: 'string | object', notes: 'Overrides the rendered tag, e.g. `RouterLink`. Usually unnecessary with configureLinks({ linkComponent }).' },
          { name: 'appearance', type: "'default' | 'outlined' | 'flat'", default: "'default'", notes: '' },
          { name: 'actionLabel', type: 'string', notes: 'Visible call to action at the end of a linked card, with → or ↗.' },
          { name: 'accent', type: "'none' | 'top' | 'start'", default: "'none'", notes: 'Colored edge across the top or the leading side.' },
          { name: 'accentColor', type: 'theme key | color', notes: 'Edge color; default the accent role.' },
          { name: 'background', type: 'theme key | color', notes: 'Colored card (e.g. primary); text and links follow.' },
          { name: 'number', type: 'string', notes: "Kicker above the title, e.g. '01'." },
          { name: 'headingLevel', type: '2-6', default: '3', notes: 'Heading level of the title.' },
          { name: 'email', type: 'string', notes: 'person layout: safe mailto: link.' },
          { name: 'phone', type: 'string', notes: 'person layout: tel: link (0049 → +49).' },
          { name: 'phoneHref', type: 'string', notes: 'Overrides the derived tel: target.' },
          { name: 'avatar', type: "'initials' | 'auto' | 'none'", default: "'initials'", notes: 'person layout: photo/initials, photo only, or none.' },
          { name: 'showLabels', type: 'boolean', default: 'false', notes: 'person layout: visible Email/Phone labels (i18n catalog).' }
        ],
        slots: [
          { name: 'default', notes: "`grid` layout's body text." },
          { name: 'footer', notes: '`grid` layout only.' }
        ],
        examples: [
          {
            title: 'Basic card',
            demo: () => import('../examples/components/CardBasic.vue'),
            source: () => import('../examples/components/CardBasic.vue?raw')
          },
          {
            title: 'Grid layout & appearances',
            demo: () => import('../examples/components/Card.vue'),
            source: () => import('../examples/components/Card.vue?raw')
          },
          {
            title: 'Article / news row',
            description: '`layout="row"`: a press/news list row with a date and excerpt.',
            demo: () => import('../examples/components/CardArticle.vue'),
            source: () => import('../examples/components/CardArticle.vue?raw')
          },
          {
            title: 'Person / contact card',
            description: '`layout="person"`: a team member or contact card.',
            demo: () => import('../examples/components/CardPerson.vue'),
            source: () => import('../examples/components/CardPerson.vue?raw')
          },
          {
            title: 'Job listing row',
            description: '`layout="job"`: an open-position row for a careers page.',
            demo: () => import('../examples/components/CardJob.vue'),
            source: () => import('../examples/components/CardJob.vue?raw')
          },
          {
            title: 'Download row',
            description: '`layout="download"`: one row of a documents list.',
            demo: () => import('../examples/components/CardDownload.vue'),
            source: () => import('../examples/components/CardDownload.vue?raw')
          },
          { title: 'Content cards: action label, accent, number, dark', description: '`actionLabel`, `accent`, `number` and a `background` theme.', demo: () => import('../examples/components/CardContent.vue'), source: () => import('../examples/components/CardContent.vue?raw') },
          { title: 'Contact card with labels', description: '`email`, `phone`, `showLabels` and `avatar="none"` on the person layout.', demo: () => import('../examples/components/CardContact.vue'), source: () => import('../examples/components/CardContact.vue?raw') }
        ]
      },
      {
        slug: 'accordion',
        name: 'Accordion',
        summary: 'Manages a group of collapsible panels: single-open FAQ pattern by default, or multiple at once.',
        props: [
          { name: 'multiple', type: 'boolean', default: 'false', notes: 'On `Accordion`: allow more than one panel open at the same time.' },
          { name: 'title', type: 'string', notes: "On `AccordionItem`: required. The panel's heading." },
          { name: 'headingLevel', type: 'number', default: '3', notes: 'On `Accordion` (all items) or an `AccordionItem` (override): heading level 2-6.' }
        ],
        slots: [{ name: 'default', notes: "AccordionItem's panel content." }],
        examples: [
          { title: 'Basic FAQ', demo: () => import('../examples/components/Accordion.vue'), source: () => import('../examples/components/Accordion.vue?raw') },
          { title: 'Multiple open panels', description: 'Pass `multiple` to allow several panels open at once.', demo: () => import('../examples/components/AccordionMultiple.vue'), source: () => import('../examples/components/AccordionMultiple.vue?raw') }
        ]
      },
      {
        slug: 'collapse',
        name: 'Collapse',
        summary: 'A single standalone show/hide toggle: the primitive `AccordionItem` is built on.',
        props: [
          { name: 'modelValue', type: 'boolean', default: 'false', notes: 'Use with `v-model`.' },
          { name: 'label', type: 'string', notes: 'Required. The trigger button text.' }
        ],
        events: [{ name: 'update:modelValue', payload: 'boolean', notes: 'Fired when the trigger is clicked.' }],
        slots: [{ name: 'default', notes: "The panel's content." }],
        examples: [
          { title: 'Basic toggle', demo: () => import('../examples/components/Collapse.vue'), source: () => import('../examples/components/Collapse.vue?raw') },
          { title: 'Multiple independent toggles', demo: () => import('../examples/components/CollapseList.vue'), source: () => import('../examples/components/CollapseList.vue?raw') }
        ]
      },
      {
        slug: 'list-group',
        name: 'ListGroup',
        summary: 'A bordered, vertically-stacked list of link or content rows.',
        props: [
          { name: 'items', type: '{ label, description?, href?, newTab?, to?, active?, disabled?, badge? }[]', default: '[]', notes: 'Ignored when the default slot is used instead.' },
          { name: 'flush', type: 'boolean', default: 'false', notes: 'Removes the outer border/radius.' }
        ],
        slots: [{ name: 'default', notes: 'Replaces the generated rows for fully custom markup.' }],
        examples: [
          { title: 'Basic list', demo: () => import('../examples/components/ListGroupBasic.vue'), source: () => import('../examples/components/ListGroupBasic.vue?raw') },
          { title: 'Descriptions, badges & active state', demo: () => import('../examples/components/ListGroup.vue'), source: () => import('../examples/components/ListGroup.vue?raw') }
        ]
      },
      {
        slug: 'carousel',
        name: 'Carousel',
        summary: 'Scroll-snap based slide carousel: no JS drag library, native touch swipe works for free.',
        props: [
          { name: 'slideCount', type: 'number', notes: 'Required: must match the number of default-slot children.' },
          { name: 'autoplay', type: 'boolean', default: 'false', notes: 'Skipped for `prefers-reduced-motion` visitors.' },
          { name: 'interval', type: 'number', default: '6000', notes: 'Milliseconds between slides.' },
          { name: 'ariaLabel', type: 'string', notes: 'Turns the carousel into a labeled region: recommended with more than one on a page.' }
        ],
        slots: [{ name: 'default', notes: 'The slides, one child per slide.' }],
        examples: [
          { title: 'Basic carousel', demo: () => import('../examples/components/Carousel.vue'), source: () => import('../examples/components/Carousel.vue?raw') },
          { title: 'Autoplay with labeled region', demo: () => import('../examples/components/CarouselAutoplay.vue'), source: () => import('../examples/components/CarouselAutoplay.vue?raw') }
        ]
      },
      {
        slug: 'avatar',
        name: 'Avatar',
        summary: 'An image avatar with an automatic initials fallback and an optional presence dot.',
        props: [
          { name: 'src', type: 'string', notes: 'Falls back to initials when empty or on load error.' },
          { name: 'name', type: 'string', notes: 'Used for initials and alt text.' },
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", notes: '' },
          { name: 'shape', type: "'circle' | 'square'", default: "'circle'", notes: '' },
          { name: 'status', type: "'' | 'neutral' | 'online' | 'offline' | 'busy' | 'away' | 'success' | 'warning' | 'danger'", default: "''", notes: 'Shows a presence dot when set.' },
          { name: 'decorative', type: 'boolean', default: 'false', notes: 'The name is visible text next to the avatar: alt="" and no hidden name, so it is not read twice.' }
        ],
        examples: [
          { title: 'Basic avatar', demo: () => import('../examples/components/AvatarBasic.vue'), source: () => import('../examples/components/AvatarBasic.vue?raw') },
          { title: 'Sizes, shapes & status', demo: () => import('../examples/components/Avatar.vue'), source: () => import('../examples/components/Avatar.vue?raw') }
        ]
      },
      {
        slug: 'svg-image',
        name: 'SvgImage',
        summary: 'Uses an SVG file like <img src>, optionally recolored to keep WCAG-safe contrast with its background or the current theme.',
        props: [
          { name: 'src', type: 'string', notes: 'Required. URL of the SVG (or any image with transparency).' },
          { name: 'alt', type: 'string', default: "''", notes: 'Accessible description. Empty marks the graphic as decorative.' },
          { name: 'contrast', type: "'none' | 'theme' | 'auto'", default: "'none'", notes: '`none` keeps the file colors; `theme` paints it in the surrounding text color; `auto` measures the background behind it and picks a color with at least 4.5:1 contrast.' },
          { name: 'width', type: 'string | number', notes: 'CSS length (numbers are px). With only one of width/height, the other follows the file’s aspect ratio.' },
          { name: 'height', type: 'string | number', notes: 'Recolored modes default to a 1em square when neither is set.' }
        ],
        examples: [
          { title: 'Following the theme text color', demo: () => import('../examples/components/SvgImageBasic.vue'), source: () => import('../examples/components/SvgImageBasic.vue?raw') },
          { title: 'Automatic contrast on any background', demo: () => import('../examples/components/SvgImage.vue'), source: () => import('../examples/components/SvgImage.vue?raw') }
        ]
      },
      {
        slug: 'empty-state',
        name: 'EmptyState',
        summary: 'A zero-data placeholder for a table, search result or dashboard panel.',
        props: [
          { name: 'title', type: 'string', notes: 'Required.' },
          { name: 'text', type: 'string', notes: 'Optional short explanation.' },
          { name: 'icon', type: "'default' | 'calendar' | 'search' | 'inbox' | 'document' | 'error' | 'none'", default: "'default'", notes: 'Built-in icon; default = inbox tray.' },
          { name: 'headingLevel', type: '1 | 2 | 3 | 4', default: '3', notes: '1 for a full page (404).' },
          { name: 'action', type: '{ label, href, newTab? }', default: 'null', notes: 'A link button before the slot content.' },
          { name: 'size', type: "'panel' | 'page'", default: "'panel'", notes: 'page = section spacing + container, larger icon/title.' }
        ],
        slots: [
          { name: 'icon', notes: 'Overrides the built-in icon.' },
          { name: 'default', notes: 'Further actions after `action`, shown only when this slot has content.' }
        ],
        examples: [
          { title: 'Basic empty state', demo: () => import('../examples/components/EmptyStateBasic.vue'), source: () => import('../examples/components/EmptyStateBasic.vue?raw') },
          { title: 'With description & action', demo: () => import('../examples/components/EmptyState.vue'), source: () => import('../examples/components/EmptyState.vue?raw') },
          { title: 'Built-in icons', demo: () => import('../examples/components/EmptyStateIcons.vue'), source: () => import('../examples/components/EmptyStateIcons.vue?raw') },
          { title: 'As a 404 page', description: '`size="page"` with `:heading-level="1"` and an `action`.', demo: () => import('../examples/components/EmptyStatePage.vue'), source: () => import('../examples/components/EmptyStatePage.vue?raw') }
        ]
      },
      {
        slug: 'timeline',
        name: 'Timeline',
        summary: "Vertical event timeline: an agency's history, a case's process log, an activity feed.",
        props: [
          { name: 'items', type: '{ date?, title?, text? }[]', default: '[]', notes: 'Ignored when the default slot is used instead.' },
          { name: 'headingLevel', type: 'number', default: '3', notes: 'Heading level (2-6) of the entry titles.' }
        ],
        slots: [{ name: 'default', notes: 'Replaces the generated entries for fully custom row markup.' }],
        examples: [
          { title: 'Basic timeline', demo: () => import('../examples/components/Timeline.vue'), source: () => import('../examples/components/Timeline.vue?raw') },
          { title: 'Case process log', demo: () => import('../examples/components/TimelineCaseLog.vue'), source: () => import('../examples/components/TimelineCaseLog.vue?raw') }
        ]
      },
      {
        slug: 'description-list',
        name: 'DescriptionList',
        summary: 'Term/value pairs (facts, bank details, contact data) as a semantic <dl>.',
        props: [
          { name: 'items', type: '{ term, value, href?, newTab?, emphasis?, copyable? }[]', default: '[]', notes: 'emphasis = larger value; copyable = copy button with a toast.' },
          { name: 'layout', type: "'inline' | 'stacked'", default: "'inline'", notes: 'Side by side, or a small uppercase term above the value.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", notes: '' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/DescriptionListBasic.vue'), source: () => import('../examples/components/DescriptionListBasic.vue?raw') },
          { title: 'Bank details', description: '`layout="stacked"` in an outlined card, IBAN emphasized and copyable.', demo: () => import('../examples/components/DescriptionListBank.vue'), source: () => import('../examples/components/DescriptionListBank.vue?raw') }
        ]
      },
      {
        slug: 'consent-embed',
        name: 'ConsentEmbed',
        summary: 'A YouTube/Vimeo video, map or iframe that requests nothing from the provider until the visitor clicks load.',
        props: [
          { name: 'provider', type: "'youtube' | 'vimeo' | 'osm' | 'iframe'", default: "'iframe'", notes: 'youtube → youtube-nocookie.com, vimeo → dnt=1.' },
          { name: 'videoId', type: 'string', default: "''", notes: 'youtube / vimeo.' },
          { name: 'src', type: 'string', default: "''", notes: 'osm / iframe embed URL (http(s) only).' },
          { name: 'title', type: 'string', notes: 'Required. The iframe title, shown in the placeholder.' },
          { name: 'poster', type: 'string', default: "''", notes: 'Local preview image, darkened.' },
          { name: 'ratio', type: 'string', default: "'16/9'", notes: '' },
          { name: 'providerName', type: 'string', notes: 'Name in the note; default per provider / host.' },
          { name: 'consentText', type: 'string', notes: 'Replaces the note.' },
          { name: 'loadLabel', type: 'string', notes: 'Replaces the button label.' },
          { name: 'externalLink', type: '{ label?, href } | boolean', default: 'true', notes: 'Link to the content on the provider site; false hides it.' },
          { name: 'remember', type: 'boolean', default: 'false', notes: '"Always load" checkbox, stored per provider via useCookieConsent. While remembered, the caption offers a one-click revoke button; from code: revokeEmbedConsent(provider).' }
        ],
        examples: [
          { title: 'YouTube with poster', description: 'With `remember`: ticking the box loads every YouTube embed right away from then on.', demo: () => import('../examples/components/ConsentEmbedYoutube.vue'), source: () => import('../examples/components/ConsentEmbedYoutube.vue?raw') },
          { title: 'OpenStreetMap', demo: () => import('../examples/components/ConsentEmbedMap.vue'), source: () => import('../examples/components/ConsentEmbedMap.vue?raw') }
        ]
      },
      {
        slug: 'image-gallery',
        name: 'ImageGallery',
        summary: 'A thumbnail grid that opens a Lightbox, for news, events and building projects.',
        props: [
          { name: 'images', type: '{ src, alt, thumb?, caption? }[]', default: '[]', notes: 'thumb = small grid file, src = lightbox file.' },
          { name: 'ratio', type: 'string', default: "'4/3'", notes: "Thumbnail aspect ratio; 'auto' = uncropped." },
          { name: 'columns', type: "'auto' | 1-6", default: "'auto'", notes: 'Fixed columns still wrap at minWidth.' },
          { name: 'minWidth', type: 'string', default: "'16rem'", notes: 'Smallest tile width.' },
          { name: 'lightbox', type: 'boolean', default: 'true', notes: 'false = plain images.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/ImageGalleryBasic.vue'), source: () => import('../examples/components/ImageGalleryBasic.vue?raw') },
          { title: 'Fixed columns, square', demo: () => import('../examples/components/ImageGalleryColumns.vue'), source: () => import('../examples/components/ImageGalleryColumns.vue?raw') },
          { title: 'Single zoomable image', description: '`ratio="auto"` and one column inside running text.', demo: () => import('../examples/components/ImageGallerySingle.vue'), source: () => import('../examples/components/ImageGallerySingle.vue?raw') }
        ]
      },
      {
        slug: 'quote',
        name: 'Quote',
        summary: 'A pull-quote (figure, blockquote and attribution) for running text or as an opening statement.',
        props: [
          { name: 'quote', type: 'string', default: "''", notes: 'The quote text; the default slot wins.' },
          { name: 'name', type: 'string', default: "''", notes: 'The source, in the figcaption.' },
          { name: 'role', type: 'string', default: "''", notes: '' },
          { name: 'avatar', type: 'string', default: "''", notes: 'Image URL beside the source (not in border).' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", notes: '' },
          { name: 'size', type: "'md' | 'lg'", default: "'md'", notes: 'lg = the large serif pull-quote of TestimonialSection feature.' },
          { name: 'appearance', type: "'mark' | 'border' | 'card'", default: "'mark'", notes: 'Quotation mark, accent rule for inline use, or a raised box.' },
          { name: 'color', type: 'theme key | color', notes: 'Color of the mark and rule; default the accent role.' }
        ],
        slots: [{ name: 'default', notes: 'The quote text, in place of the quote prop.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/QuoteBasic.vue'), source: () => import('../examples/components/QuoteBasic.vue?raw') },
          { title: 'Inside running text', description: '`appearance="border"` in a `.cui-prose` column.', demo: () => import('../examples/components/QuoteInline.vue'), source: () => import('../examples/components/QuoteInline.vue?raw') }
        ]
      },
      {
        slug: 'stat-card',
        name: 'StatCard',
        summary: 'A key figure on a card: dashboard KPI tile, or a highlighted figure (fee, donation goal) in a content page.',
        props: [
          { name: 'label', type: 'string', notes: 'Required.' },
          { name: 'value', type: 'string | number', notes: 'Required.' },
          { name: 'trend', type: 'number', default: 'null', notes: 'Percent change: sign sets the arrow direction/color.' },
          { name: 'trendLabel', type: 'string', notes: '' },
          { name: 'invert', type: 'boolean', default: 'false', notes: 'Set when a decrease is the good outcome.' },
          { name: 'icon', type: 'string', notes: 'Raw SVG, rendered via v-html (sanitized): developer-authored only.' },
          { name: 'appearance', type: "'dashboard' | 'highlight'", default: "'dashboard'", notes: 'highlight = larger figure with accent edge, for content pages.' },
          { name: 'color', type: 'theme key | color', notes: 'Highlight edge; default the accent role.' },
          { name: 'action', type: '{ label, href, newTab? }', default: 'null', notes: 'A button under the figure.' },
          { name: 'goal', type: 'number', default: 'null', notes: 'With current: progress bar towards the goal.' },
          { name: 'current', type: 'number', default: 'null', notes: '' },
          { name: 'unit', type: 'string', default: "''", notes: 'Appended to the goal in the progress text.' },
          { name: 'progressLabel', type: 'string', default: "''", notes: 'Replaces the progress text.' }
        ],
        examples: [
          { title: 'Basic stat card', demo: () => import('../examples/components/StatCardBasic.vue'), source: () => import('../examples/components/StatCardBasic.vue?raw') },
          { title: 'Trend & dashboard grid', demo: () => import('../examples/components/StatCard.vue'), source: () => import('../examples/components/StatCard.vue?raw') },
          { title: 'Highlight with donation goal', description: '`appearance="highlight"` with `goal`/`current` and an `action`.', demo: () => import('../examples/components/StatCardHighlight.vue'), source: () => import('../examples/components/StatCardHighlight.vue?raw') }
        ]
      },
      {
        slug: 'toolbar',
        name: 'Toolbar',
        summary: 'A layout primitive that keeps a search/filter cluster on one side and actions on the other.',
        props: [{ name: 'wrap', type: 'boolean', default: 'true', notes: 'Allow the clusters to wrap on narrow screens.' }],
        slots: [
          { name: 'start', notes: 'Left-aligned search/filter cluster.' },
          { name: 'end', notes: 'Right-aligned actions cluster.' }
        ],
        examples: [
          { title: 'Basic toolbar', demo: () => import('../examples/components/Toolbar.vue'), source: () => import('../examples/components/Toolbar.vue?raw') },
          { title: 'Multiple filters & actions', demo: () => import('../examples/components/ToolbarFilters.vue'), source: () => import('../examples/components/ToolbarFilters.vue?raw') }
        ]
      },
      {
        slug: 'data-table',
        name: 'DataTable',
        summary: 'Dependency-free data table for webapp screens: sortable columns, selection, custom cells, loading/empty states.',
        props: [
          { name: 'columns', type: '{ key, label, sortable?, align?, width? }[]', notes: 'Required.' },
          { name: 'rows', type: 'object[]', default: '[]', notes: '' },
          { name: 'rowKey', type: 'string', default: "'id'", notes: '' },
          { name: 'selectable', type: 'boolean', default: 'false', notes: '' },
          { name: 'selected', type: 'array', default: '[]', notes: '`v-model:selected`' },
          { name: 'sortBy', type: 'string', default: "''", notes: '`v-model:sortBy`' },
          { name: 'sortDir', type: "'asc' | 'desc'", default: "'asc'", notes: '`v-model:sortDir`' },
          { name: 'striped', type: 'boolean', default: 'false', notes: '' },
          { name: 'dense', type: 'boolean', default: 'false', notes: '' },
          { name: 'loading', type: 'boolean', default: 'false', notes: '' },
          { name: 'emptyTitle', type: 'string', default: "'No data'", notes: '' },
          { name: 'emptyText', type: 'string', notes: '' },
          { name: 'caption', type: 'string', notes: 'Visually-hidden table description for screen readers.' },
          { name: 'rowLink', type: '(row) => string | { href, newTab?, to? } | null', notes: 'First cell becomes a real link stretched over the row: keyboard-reachable row navigation.' }
        ],
        events: [
          { name: 'update:selected', payload: 'array', notes: 'Checkbox toggles.' },
          { name: 'update:sortBy', payload: 'string', notes: 'Sortable header clicked.' },
          { name: 'update:sortDir', payload: "'asc' | 'desc'", notes: 'Fires alongside `update:sortBy`, or alone on re-click.' },
          { name: 'row-click', payload: 'object (the row)', notes: 'Prefer rowLink for navigation. With a listener, the first cell becomes a button stretched over the row (keyboard-operable).' }
        ],
        slots: [{ name: 'cell-<key>', notes: 'Scoped slot per column (`{ row, value }`) to override cell content.' }],
        examples: [
          { title: 'Basic table', demo: () => import('../examples/components/DataTableBasic.vue'), source: () => import('../examples/components/DataTableBasic.vue?raw') },
          { title: 'Sorting, selection & custom cells', demo: () => import('../examples/components/DataTable.vue'), source: () => import('../examples/components/DataTable.vue?raw') },
          { title: 'Row links', description: 'Rows that open a page: `rowLink` puts a real link in the first cell, reachable by keyboard, and keeps the whole row clickable.', demo: () => import('../examples/components/DataTableRowLink.vue'), source: () => import('../examples/components/DataTableRowLink.vue?raw') }
        ]
      }
    ]
  },
  {
    name: 'Forms',
    items: [
      {
        slug: 'text-input',
        name: 'TextInput',
        summary: 'The one text-entry field: a single/multiline/floating-label input sharing one label/hint/error contract.',
        props: [
          { name: 'modelValue', type: 'string | number', default: "''", notes: '' },
          { name: 'label', type: 'string', default: "''", notes: '' },
          { name: 'type', type: 'string', default: "'text'", notes: 'Ignored when multiline is set.' },
          { name: 'placeholder', type: 'string', default: "''", notes: 'With `floating`, shown once the label has floated up (focused, still empty).' },
          { name: 'hint', type: 'string', default: "''", notes: 'Hidden while error is set.' },
          { name: 'error', type: 'string', default: "''", notes: 'Switches the field into its invalid state.' },
          { name: 'required', type: 'boolean', default: 'false', notes: '' },
          { name: 'disabled', type: 'boolean', default: 'false', notes: '' },
          { name: 'autocomplete', type: 'string', notes: '' },
          { name: 'multiline', type: 'boolean', default: 'false', notes: 'Renders a `<textarea>`.' },
          { name: 'rows', type: 'number', default: '4', notes: '`multiline` only.' },
          { name: 'floating', type: 'boolean', default: 'false', notes: 'Floating label layout. Combines with `multiline`; `hint` and `autocomplete` work as in the default layout.' }
        ],
        events: [{ name: 'update:modelValue', payload: 'string', notes: 'Fires on every input event.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/TextInput.vue'), source: () => import('../examples/components/TextInput.vue?raw') },
          { title: 'Multiline', demo: () => import('../examples/components/TextInputMultiline.vue'), source: () => import('../examples/components/TextInputMultiline.vue?raw') },
          { title: 'Floating label', demo: () => import('../examples/components/TextInputFloating.vue'), source: () => import('../examples/components/TextInputFloating.vue?raw') },
          { title: 'Required field with an error', demo: () => import('../examples/components/TextInputError.vue'), source: () => import('../examples/components/TextInputError.vue?raw') }
        ]
      },
      {
        slug: 'input-group',
        name: 'InputGroup',
        summary: 'Wraps a control with prepend/append addons sharing one border.',
        props: [{ name: 'label', type: 'string', default: "''", notes: '' }],
        slots: [
          { name: 'prepend', notes: 'Addon rendered before the control.' },
          { name: 'default', notes: 'Scoped with `{ id }`: bind it to your control so the label stays associated.' },
          { name: 'append', notes: 'Addon rendered after the control.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/InputGroup.vue'), source: () => import('../examples/components/InputGroup.vue?raw') },
          { title: 'Prepend and append together', demo: () => import('../examples/components/InputGroupAppend.vue'), source: () => import('../examples/components/InputGroupAppend.vue?raw') }
        ]
      },
      {
        slug: 'select',
        name: 'Select',
        summary: 'A styled wrapper around the native `<select>`, with plain-string or object options.',
        props: [
          { name: 'modelValue', type: 'string | number', default: "''", notes: '' },
          { name: 'options', type: '(string | { value, label })[]', notes: 'Required.' },
          { name: 'label', type: 'string', default: "''", notes: '' },
          { name: 'placeholder', type: 'string', notes: 'Rendered as a disabled first option.' },
          { name: 'hint', type: 'string', notes: '' },
          { name: 'error', type: 'string', notes: '' },
          { name: 'required', type: 'boolean', default: 'false', notes: '' },
          { name: 'ariaLabel', type: "string", default: "''", notes: 'Accessible name when there is no visible label.' }
        ],
        events: [{ name: 'update:modelValue', payload: 'string', notes: 'Fires on the native change event.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/Select.vue'), source: () => import('../examples/components/Select.vue?raw') },
          { title: 'Object options, required & hint', demo: () => import('../examples/components/SelectDepartment.vue'), source: () => import('../examples/components/SelectDepartment.vue?raw') }
        ]
      },
      {
        slug: 'checkbox',
        name: 'Checkbox',
        summary: 'A checkbox that takes a plain boolean `v-model`, or an array-valued group `v-model` via the `value` prop.',
        props: [
          { name: 'modelValue', type: 'boolean | array', default: 'false', notes: '' },
          { name: 'value', type: 'string | number | boolean', notes: 'Set to opt into array-valued group mode.' },
          { name: 'label', type: 'string', default: "''", notes: 'Ignored if the default slot is used.' },
          { name: 'required', type: 'boolean', default: 'false', notes: '' },
          { name: 'disabled', type: 'boolean', default: 'false', notes: '' },
          { name: 'hint', type: 'string', default: "''", notes: 'Help text under the label, tied via aria-describedby.' },
          { name: 'error', type: 'string', default: "''", notes: 'Error text; replaces the hint, sets aria-invalid and aria-errormessage.' }
        ],
        events: [{ name: 'update:modelValue', payload: 'boolean | array', notes: 'Shape depends on whether `value` is set.' }],
        slots: [{ name: 'default', notes: 'Overrides `label`: use for consent copy with an inline link.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/CheckboxBasic.vue'), source: () => import('../examples/components/CheckboxBasic.vue?raw') },
          { title: 'Array-valued group', demo: () => import('../examples/components/Checkbox.vue'), source: () => import('../examples/components/Checkbox.vue?raw') },
          { title: 'Consent copy with an inline link', demo: () => import('../examples/components/CheckboxConsent.vue'), source: () => import('../examples/components/CheckboxConsent.vue?raw') }
        ]
      },
      {
        slug: 'radio',
        name: 'Radio',
        summary: 'A single radio button: group several with the same `name` and `v-model`.',
        props: [
          { name: 'modelValue', type: 'string | number | boolean', notes: '' },
          { name: 'value', type: 'string | number | boolean', notes: 'Required.' },
          { name: 'name', type: 'string', notes: 'Groups radios. Required outside a RadioGroup.' },
          { name: 'label', type: 'string', notes: 'Required.' },
          { name: 'disabled', type: 'boolean', default: 'false', notes: '' },
          { name: 'hint', type: 'string', default: "''", notes: 'For a lone radio; in a group use RadioGroup.' },
          { name: 'error', type: 'string', default: "''", notes: 'For a lone radio; in a group use RadioGroup.' }
        ],
        events: [{ name: 'update:modelValue', payload: "the radio's value", notes: 'Fires when this radio is selected.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/Radio.vue'), source: () => import('../examples/components/Radio.vue?raw') },
          { title: 'Disabled option', demo: () => import('../examples/components/RadioDisabled.vue'), source: () => import('../examples/components/RadioDisabled.vue?raw') }
        ]
      },
      {
        slug: 'radio-group',
        name: 'RadioGroup',
        summary: 'A fieldset/legend radio group with hint and error: slot Radios in or pass `options`.',
        props: [
          { name: 'modelValue', type: 'string | number | boolean', default: 'null', notes: 'The selected value.' },
          { name: 'legend', type: 'string', notes: "Required. The group's visible name." },
          { name: 'name', type: 'string', default: "''", notes: 'Shared name of the radios; generated when empty.' },
          { name: 'options', type: '{ value, label, disabled? }[] | string[]', default: '[]', notes: 'Ignored when the default slot is used.' },
          { name: 'hint', type: 'string', default: "''", notes: '' },
          { name: 'error', type: 'string', default: "''", notes: 'Replaces the hint and marks the group invalid.' },
          { name: 'required', type: 'boolean', default: 'false', notes: '' },
          { name: 'disabled', type: 'boolean', default: 'false', notes: 'Disables the whole fieldset.' },
          { name: 'inline', type: 'boolean', default: 'false', notes: 'Options in a row.' }
        ],
        events: [{ name: 'update:modelValue', payload: "the selected radio's value", notes: '' }],
        slots: [{ name: 'default', notes: 'Radio components; overrides `options`.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/RadioGroup.vue'), source: () => import('../examples/components/RadioGroup.vue?raw') },
          { title: 'Slotted radios with validation', demo: () => import('../examples/components/RadioGroupValidation.vue'), source: () => import('../examples/components/RadioGroupValidation.vue?raw') }
        ]
      },
      {
        slug: 'switch',
        name: 'Switch',
        summary: 'A boolean toggle styled as a pill switch, same contract as Checkbox.',
        props: [
          { name: 'modelValue', type: 'boolean', default: 'false', notes: '' },
          { name: 'label', type: 'string', notes: 'Required.' },
          { name: 'disabled', type: 'boolean', default: 'false', notes: '' },
          { name: 'hint', type: 'string', default: "''", notes: 'Help text under the label, tied via aria-describedby.' },
          { name: 'error', type: 'string', default: "''", notes: 'Error text; replaces the hint, sets aria-invalid and aria-errormessage.' }
        ],
        events: [{ name: 'update:modelValue', payload: 'boolean', notes: '' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/Switch.vue'), source: () => import('../examples/components/Switch.vue?raw') },
          { title: 'Multiple settings, with a disabled option', demo: () => import('../examples/components/SwitchSettings.vue'), source: () => import('../examples/components/SwitchSettings.vue?raw') }
        ]
      },
      {
        slug: 'range-slider',
        name: 'RangeSlider',
        summary: 'A single-value range input with a label and live numeric readout.',
        props: [
          { name: 'modelValue', type: 'number', notes: 'Required.' },
          { name: 'min', type: 'number', default: '0', notes: '' },
          { name: 'max', type: 'number', default: '100', notes: '' },
          { name: 'step', type: 'number', default: '1', notes: '' },
          { name: 'label', type: 'string', notes: '' },
          { name: 'showValue', type: 'boolean', default: 'true', notes: '' },
          { name: 'valueText', type: 'string | (value) => string', default: "''", notes: 'What the value means ("40 %"): shown in the readout and set as aria-valuetext.' }
        ],
        events: [{ name: 'update:modelValue', payload: 'number', notes: 'Fires on every input event.' }],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/RangeSlider.vue'), source: () => import('../examples/components/RangeSlider.vue?raw') },
          { title: 'Multiple sliders with a custom step', demo: () => import('../examples/components/RangeSliderBudget.vue'), source: () => import('../examples/components/RangeSliderBudget.vue?raw') }
        ]
      },
      {
        slug: 'search-field',
        name: 'SearchField',
        summary: 'Pill-shaped site-search input: icon, text field and submit button in one control.',
        props: [
          { name: 'modelValue', type: 'string', default: "''", notes: '' },
          { name: 'label', type: 'string', default: "'Search'", notes: 'Visually hidden, read by screen readers; also names the search landmark: give each SearchField on a page its own.' },
          { name: 'placeholder', type: 'string', default: "'Enter search term…'", notes: '' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", notes: '' },
          { name: 'maxlength', type: "number", default: "256", notes: 'Native maxlength of the query field; 0 = no limit.' }
        ],
        events: [
          { name: 'update:modelValue', payload: 'string', notes: '' },
          { name: 'search', payload: 'string', notes: 'Fires on form submit with the current query.' }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/SearchFieldBasic.vue'), source: () => import('../examples/components/SearchFieldBasic.vue?raw') },
          { title: 'Handling the search event', demo: () => import('../examples/components/SearchField.vue'), source: () => import('../examples/components/SearchField.vue?raw') }
        ]
      },
      {
        slug: 'tag-input',
        name: 'TagInput',
        summary: 'Free-text tag/chip entry: Enter or comma to add, Backspace to remove the last tag.',
        props: [
          { name: 'modelValue', type: 'string[]', default: '[]', notes: '' },
          { name: 'label', type: 'string', default: "''", notes: '' },
          { name: 'placeholder', type: 'string', default: "'Type and press Enter…'", notes: 'Hidden once a tag is present.' },
          { name: 'disabled', type: 'boolean', default: 'false', notes: '' },
          { name: 'maxLength', type: "number", default: "100", notes: 'Longest allowed tag (also the field maxlength); 0 = no limit.' },
          { name: 'maxTags', type: "number", default: "0", notes: 'Most tags in the list; 0 = no limit.' },
          { name: 'validate', type: "(value: string) => boolean", notes: 'Return false to refuse a tag.' },
          { name: 'ariaLabel', type: 'string', default: "''", notes: 'Accessible name without a visible label (fallback: catalog tagInput.label).' },
          { name: 'hint', type: 'string', default: "''", notes: 'Help text under the label, tied via aria-describedby.' },
          { name: 'error', type: 'string', default: "''", notes: 'Error text; replaces the hint, sets aria-invalid and aria-errormessage.' },
          { name: 'showRejections', type: 'boolean', default: 'true', notes: 'Names a refused tag and the reason in a live region.' }
        ],
        events: [
          { name: 'update:modelValue', payload: 'string[]', notes: 'Fires whenever a tag is added or removed.' },
          { name: 'reject', payload: '{ value, reason }', notes: "A tag was refused: reason is 'length', 'count' or 'invalid'." }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/TagInput.vue'), source: () => import('../examples/components/TagInput.vue?raw') },
          { title: 'Disabled / read-only', demo: () => import('../examples/components/TagInputDisabled.vue'), source: () => import('../examples/components/TagInputDisabled.vue?raw') }
        ]
      },
      {
        slug: 'file-upload',
        name: 'FileUpload',
        summary: 'Drag-and-drop file picker with click-to-browse fallback and a removable file list.',
        props: [
          { name: 'modelValue', type: 'File[]', default: '[]', notes: '' },
          { name: 'label', type: 'string', default: "'Upload files'", notes: '' },
          { name: 'hint', type: 'string', notes: '' },
          { name: 'accept', type: 'string', notes: 'Native accept syntax; also enforced for dropped files.' },
          { name: 'multiple', type: 'boolean', default: 'true', notes: '`false` replaces the current file instead of appending.' },
          { name: 'disabled', type: 'boolean', default: 'false', notes: '' },
          { name: 'browseLabel', type: 'string', default: "'Choose a file'", notes: '' },
          { name: 'dropLabel', type: 'string', default: "'or drag it here'", notes: '' },
          { name: 'maxSize', type: "number", default: "0", notes: 'Maximum size per file in bytes; 0 = no limit.' },
          { name: 'maxFiles', type: "number", default: "0", notes: 'Maximum number of files in the list (multiple only); 0 = no limit.' },
          { name: 'error', type: 'string', default: "''", notes: 'Error text under the drop zone; aria-invalid + aria-errormessage.' },
          { name: 'required', type: 'boolean', default: 'false', notes: '' },
          { name: 'showRejections', type: 'boolean', default: 'true', notes: 'Names refused files and the reason in a live region. Off: show your own message from `reject`.' }
        ],
        events: [
          { name: 'update:modelValue', payload: 'File[]', notes: 'Fires when files are added or removed.' },
          { name: 'reject', payload: '{ file, reason }[]', notes: "Files left out: reason is 'type', 'size' or 'count'." }
        ],
        examples: [
          { title: 'Basic usage', demo: () => import('../examples/components/FileUpload.vue'), source: () => import('../examples/components/FileUpload.vue?raw') },
          { title: 'Single required document', demo: () => import('../examples/components/FileUploadSingle.vue'), source: () => import('../examples/components/FileUploadSingle.vue?raw') }
        ]
      }
    ]
  },
  {
    name: 'Layout',
    items: [
      {
        slug: 'app-shell',
        name: 'AppShell',
        // A whole page layout with its own <main> and skip link: previewed in
        // an iframe (/embed/…), not nested inside the docs page's <main>.
        isolated: true,
        summary: 'The fastest path to a webapp screen: a fixed sidebar, a top bar strip, and a scrollable content area; the mobile sidebar becomes a Modal drawer automatically.',
        props: [
          { name: 'title', type: 'string', notes: 'Used as the mobile offcanvas title.' },
          { name: 'menuLabel', type: "string", default: "'Menu'", notes: 'Drawer title when title is empty.' },
          { name: 'toggleLabel', type: "string", default: "'Toggle navigation menu'", notes: 'Accessible name of the hamburger button.' },
          { name: 'closeLabel', type: "string", default: "'Close dialog'", notes: 'Accessible name of the drawer\'s close button.' },
          { name: 'skipLabel', type: "string", default: "'Skip to main content'", notes: 'Text of the skip link.' }
        ],
        slots: [
          { name: 'sidebar', notes: 'Sidebar content: fixed column on desktop, drawer Modal below 1024px.' },
          { name: 'topbar-start', notes: 'Left side of the sticky top bar.' },
          { name: 'topbar-end', notes: 'Right side of the sticky top bar.' },
          { name: 'default', notes: 'Main scrollable content area.' }
        ],
        examples: [
          { title: 'Basic shell layout', demo: () => import('../examples/components/AppShellBasic.vue'), source: () => import('../examples/components/AppShellBasic.vue?raw') },
          { title: 'Full application shell', description: 'Sidebar navigation, a search field, notifications, a user menu, and a data table wired together.', demo: () => import('../examples/components/AppShell.vue'), source: () => import('../examples/components/AppShell.vue?raw') }
        ]
      }
    ]
  }
]

export function flatComponentList() {
  return componentCategories.flatMap((category) =>
    category.items.map((item) => ({ ...item, category: category.name }))
  )
}

export function findComponent(slug) {
  return flatComponentList().find((item) => item.slug === slug) || null
}
