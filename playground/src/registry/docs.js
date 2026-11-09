// Titles and search-result descriptions for the narrative guides shown on the
// Documentation tab (see pages/DocsPage.vue, which pairs each slug with its
// raw markdown import). Kept separate from that file so utils/seo.js can read
// them without pulling in the markdown.
export const docTopics = [
  {
    slug: 'getting-started',
    title: 'Getting started',
    description: 'Install Civic UI in a Vue 3 project, register its components, load the styles and start building an accessible public-sector site.'
  },
  {
    slug: 'accessibility',
    title: 'Accessibility & privacy',
    description: 'How Civic UI is built and tested against WCAG 2.2 AA, EN 301 549 and BITV 2.0 with zero third-party requests, and how to verify it yourself.'
  },
  {
    slug: 'security',
    title: 'Security',
    description: 'How Civic UI guards its untrusted-data sinks, tested against OWASP ASVS 5.0 and BSI IT-Grundschutz APP.3.1 for public-sector deployments.'
  },
  {
    slug: 'audit',
    title: 'Project audit',
    description: 'Run npx civic-ui audit to check your own project for WCAG 2.2 AA and security problems, with file, line and a fix for every finding.'
  },
  {
    slug: 'theming',
    title: 'Theming',
    description: 'Re-skin Civic UI without touching a component: every color and font is a CSS custom property you can override with your own design tokens.'
  },
  {
    slug: 'utilities',
    title: 'Utilities',
    description: 'The layout and text utility classes that ship with Civic UI, for assembling pages from sections and components without writing new CSS.'
  },
  {
    slug: 'composables',
    title: 'Composables',
    description: 'The Vue 3 composables Civic UI is built on, such as useToast, useFocusTrap and useColorMode, all usable directly in your own components.'
  }
]
