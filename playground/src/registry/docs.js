// Titles for the narrative guides shown on the Documentation tab (see
// pages/DocsPage.vue, which pairs each slug with its raw markdown import).
// Kept separate from that file so the per-route <title>/meta-description
// logic in utils/head.js can read titles without pulling in the markdown.
export const docTopics = [
  { slug: 'getting-started', title: 'Getting started' },
  { slug: 'accessibility', title: 'Accessibility & privacy' },
  { slug: 'security', title: 'Security' },
  { slug: 'audit', title: 'Project audit' },
  { slug: 'theming', title: 'Theming' },
  { slug: 'utilities', title: 'Utilities' },
  { slug: 'composables', title: 'Composables' }
]
