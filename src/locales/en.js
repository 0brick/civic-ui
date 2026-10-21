// The English UI texts every component falls back to (see utils/i18n.js).
// Visible text and screen-reader-only labels alike, `{name}` placeholders
// are filled in at render time. A component's own label prop, when set,
// still wins over the catalog for that one instance.
export default {
  links: { newTab: '(opens in a new tab)' },
  buttonGroup: { label: 'Button group' },
  avatar: { status: { neutral: 'Neutral', online: 'Online', offline: 'Offline', busy: 'Busy', away: 'Away', success: 'Success', warning: 'Warning', danger: 'Error' } },
  closeButton: { label: 'Close' },
  colorMode: { label: 'Dark mode' },
  alert: { dismiss: 'Dismiss alert', prefix: { info: 'Information:', success: 'Success:', warning: 'Warning:', danger: 'Error:' } },
  toast: { dismiss: 'Dismiss notification' },
  spinner: { label: 'Loading…' },
  card: { email: 'Email', phone: 'Phone' },
  statCard: { progress: '{percent}% of {goal} reached', up: 'Up by', down: 'Down by' },
  lightbox: {
    label: 'Image viewer',
    previous: 'Previous image',
    next: 'Next image',
    status: 'Image {current} of {total}',
    open: 'Enlarge image: {alt}',
    openNumber: 'Enlarge image {n}'
  },
  consentEmbed: {
    text: 'This content is provided by {provider}. Loading it transmits your IP address to {provider}.',
    load: 'Load content',
    loadVideo: 'Play video',
    loadMap: 'Load map',
    remember: 'Always load content from {provider}',
    revoke: 'Stop always loading content from {provider}',
    external: 'Open on {provider}'
  },
  descriptionList: { copy: 'Copy {term}', copied: '{term} copied to the clipboard', copyFailed: "{term} couldn't be copied" },
  carousel: {
    previous: 'Previous slide',
    next: 'Next slide',
    play: 'Play automatic slideshow',
    pause: 'Pause automatic slideshow',
    slides: 'Slides',
    dots: 'Slide navigation',
    goTo: 'Go to slide {n}',
    status: 'Slide {current} of {total}'
  },
  dataTable: { selectAll: 'Select all rows', selectRow: 'Select row {key}', empty: 'No data', loading: 'Loading…', label: 'Table' },
  fileUpload: {
    label: 'Upload files',
    browse: 'Choose a file',
    drop: 'or drag it here',
    remove: 'Remove {name}',
    rejectedType: '“{name}” was not added: this file type is not allowed.',
    rejectedSize: '“{name}” was not added: the file is larger than {max}.',
    rejectedCount: '“{name}” was not added: at most {max} files.'
  },
  tagInput: {
    label: 'Tags',
    list: 'Added tags',
    placeholder: 'Type and press Enter…',
    remove: 'Remove {tag}',
    rejectedLength: '“{value}” was not added: at most {max} characters.',
    rejectedCount: '“{value}” was not added: at most {max} entries.',
    rejectedInvalid: '“{value}” was not added: this entry is not valid.'
  },
  searchField: { label: 'Search', placeholder: 'Enter search term…' },
  backToTop: { label: 'Back to top' },
  breadcrumb: { label: 'Breadcrumb' },
  languageSwitcher: { label: 'Language selection' },
  navbar: {
    toggle: 'Toggle navigation menu',
    menu: 'Menu',
    close: 'Close dialog',
    nav: 'Main',
    mobileNav: 'Main (mobile)'
  },
  notifications: {
    title: 'Notifications',
    unread: 'Notifications, {count} unread',
    markAllRead: 'Mark all read',
    unreadItem: 'Unread:',
    markRead: 'Mark as read',
    emptyTitle: 'No notifications',
    emptyText: "You're all caught up."
  },
  pagination: { label: 'Pagination', previous: 'Previous page', next: 'Next page', page: 'Page {n}' },
  scrollspy: { label: 'On this page' },
  sidebar: { label: 'Application' },
  modal: { close: 'Close dialog', fallbackName: 'Dialog' },
  popover: { trigger: 'More information' },
  cookieConsent: {
    title: 'Cookie settings',
    text: 'We use cookies to run this site reliably and securely. Optional cookies help us improve the experience.',
    accept: 'Accept all',
    reject: 'Necessary only',
    customize: 'Settings',
    expand: 'Show cookie settings'
  },
  appShell: { skip: 'Skip to main content' },
  siteHeader: { skip: 'Skip to main content' },
  alertBanner: { dismiss: 'Dismiss notice' },
  appointment: {
    submit: 'Request appointment',
    requiredHint: 'Fields marked * are required.',
    sending: 'Sending…',
    success: "Thanks: we'll be in touch shortly with a proposed time.",
    error: 'Something went wrong sending your request. Please try again or contact us directly.',
    privacyText: 'I have read the',
    privacyLink: 'privacy policy',
    directTitle: 'Prefer to reach out directly?',
    messagePlaceholder: 'Property, request and preferred timing',
    name: 'Name',
    phone: 'Phone (optional)',
    email: 'Email',
    street: 'Street',
    houseNumber: 'No.',
    zip: 'ZIP code',
    city: 'City',
    message: 'Message'
  },
  hero: { scrollDown: 'Scroll down', playVideo: 'Play background video', pauseVideo: 'Pause background video' },
  listSection: {
    searchLabel: 'Search jobs',
    searchPlaceholder: 'Search open positions…',
    emptyTitle: 'No open positions found',
    emptyText: 'Try adjusting your search, or check back later.'
  },
  newsletter: { title: 'Newsletter', label: 'Email address', placeholder: 'you@example.com', submit: 'Subscribe' },
  relatedLinks: { title: 'More on this topic' },
  siteFooter: { legal: 'Legal' },
  testimonial: { rating: '{n} out of 5 stars' },
  topBar: { label: 'Utility navigation' },
  topicSlider: { more: 'Learn more' }
}
