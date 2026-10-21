<script setup>
// Multi-column footer: brand blurb, link columns, social row, legal row,
// the same shape many institutional footers use (sitemap columns + legal-notice/privacy-policy
// links + social icons). Columns come from a prop so this stays data-driven.
// `collapsible` renders each column as a native <details> on narrow
// screens, so the sitemap folds into an accordion on mobile. From
// 900px up the columns are plain blocks again: a <summary> there would be a
// keyboard stop whose Enter hides the links, with no +/− and no way for a
// mouse to reopen them.
//
// `background` takes a section theme key or color (like HeroSection/
// CtaBanner); a dark one sets data-cui-theme="dark", so links and buttons
// in the brand slot get readable on-dark colors too. `address`, `email` and
// `phone` render a contact block under the brand slot.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { sanitizeHtml } from '../utils/security'
import NewTabHint from '../components/internal/NewTabHint.vue'
import { newTabLabel, mailtoHref, telHref } from '../utils/links'
import { resolveBackground, themeColors, deriveContrastText, isDarkBackground } from '../utils/themes'
import { t } from '../utils/i18n'
import CuiLink from '../components/internal/CuiLink.vue'

const props = defineProps({
  columns: { type: Array, default: () => [] }, // [{ title, links: [{ label, href, newTab? }] }]: legalLinks/socialLinks take newTab too
  legalLinks: { type: Array, default: () => [] },
  // [{ label, href, icon }], `icon` is rendered via v-html as raw SVG
  // markup, routed through sanitizeHtml() (see utils/security.js): a strict
  // icon allowlist by default; register e.g.
  // configureSecurity({ sanitizeHtml: (raw) => DOMPurify.sanitize(raw) }) once
  // at app startup for richer markup, instead of sanitizing every call site.
  socialLinks: { type: Array, default: () => [] },
  copyright: { type: String, default: '' },
  collapsible: { type: Boolean, default: false },
  background: { type: String, default: 'navy' }, // theme key | color
  address: { type: Array, default: () => [] }, // lines, e.g. ['Town Hall Square 1', '12345 Nordholm']
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  // a11y (WCAG 1.3.1): heading level of the column titles; match the page outline.
  headingLevel: { type: Number, default: 3, validator: (v) => v >= 2 && v <= 6 }
})
const headingTag = computed(() => `h${props.headingLevel}`)

// Collapsing only applies below 900px (see the header comment). Without
// matchMedia (SSR, tests) it stays <details>; the CSS below then keeps the
// wide layout click-free as before.
const wide = ref(false)
let wideQuery = null
const onWideChange = (e) => (wide.value = e.matches)
onMounted(() => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  wideQuery = window.matchMedia('(min-width: 900px)')
  wide.value = wideQuery.matches
  wideQuery.addEventListener?.('change', onWideChange)
})
onBeforeUnmount(() => wideQuery?.removeEventListener?.('change', onWideChange))
const collapsing = computed(() => props.collapsible && !wide.value)

const theme = computed(() => {
  const r = resolveBackground(props.background)
  if (r?.type === 'theme') return r
  if (r?.type === 'color') return { bg: r.bg, ...deriveContrastText(r.bg) }
  return themeColors('navy')
})
const isDark = computed(() => isDarkBackground(theme.value.bg))
const themeVars = computed(() => ({
  '--cui-footer-theme-bg': theme.value.bg,
  '--cui-footer-theme-text': theme.value.text,
  '--cui-footer-theme-heading': theme.value.heading
}))
const emailHref = computed(() => mailtoHref(props.email))
const phoneHref = computed(() => telHref(props.phone))
const hasContact = computed(() => props.address.length > 0 || !!props.email || !!props.phone)
</script>

<template>
  <footer class="cui-footer" :data-cui-theme="isDark ? 'dark' : undefined" :style="themeVars">
    <div class="cui-container cui-footer__top">
      <div class="cui-footer__brand">
        <slot name="brand" />
        <address v-if="hasContact" class="cui-footer__contact">
          <span v-for="(line, i) in address" :key="i" class="cui-footer__contact-line">{{ line }}</span>
          <a v-if="email && emailHref" :href="emailHref" class="cui-footer__contact-link">{{ email }}</a>
          <span v-else-if="email" class="cui-footer__contact-line">{{ email }}</span>
          <a v-if="phone && phoneHref" :href="phoneHref" class="cui-footer__contact-link">{{ phone }}</a>
          <span v-else-if="phone" class="cui-footer__contact-line">{{ phone }}</span>
        </address>
      </div>
      <div class="cui-footer__columns" :class="{ 'cui-footer__columns--collapsible': collapsible }">
        <component :is="collapsing ? 'details' : 'div'" v-for="col in columns" :key="col.title" class="cui-footer__col" :open="collapsing || undefined">
          <!-- a11y (WCAG 1.3.1): collapsible columns keep their heading inside the summary. -->
          <summary v-if="collapsing" class="cui-footer__col-title">
            <component :is="headingTag" class="cui-footer__col-heading">{{ col.title }}</component>
          </summary>
          <component :is="headingTag" v-else class="cui-footer__col-title">{{ col.title }}</component>
          <ul>
            <li v-for="link in col.links" :key="link.label"><CuiLink :href="link.href" :new-tab="link.newTab">{{ link.label }}<NewTabHint v-if="link.newTab" /></CuiLink></li>
          </ul>
        </component>
      </div>
    </div>

    <div v-if="socialLinks.length" class="cui-container cui-footer__social">
      <CuiLink
        v-for="s in socialLinks"
        :key="s.label"
        :href="s.href"
        :new-tab="s.newTab"
        :aria-label="s.newTab ? `${s.label} ${newTabLabel()}` : s.label"
        class="cui-footer__social-link"
      >
        <!-- eslint-disable-next-line vue/no-v-html -- routed through sanitizeHtml(), see utils/security.js -->
        <span v-html="sanitizeHtml(s.icon)" />
      </CuiLink>
    </div>

    <div class="cui-footer__bottom">
      <div class="cui-container cui-footer__bottom-inner">
        <p class="cui-footer__copyright">{{ copyright }}</p>
        <!-- a11y: no empty landmark when there are no legal links -->
        <nav v-if="legalLinks.length" class="cui-footer__legal" :aria-label="t('siteFooter.legal')">
          <CuiLink v-for="link in legalLinks" :key="link.label" :href="link.href" :new-tab="link.newTab">{{ link.label }}<NewTabHint v-if="link.newTab" /></CuiLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Colors come from the `background` theme (inline --cui-footer-theme-*);
   --cui-footer-background / -text / -heading override them from a
   stylesheet, e.g. a darker footer in the dark color mode. */
.cui-footer {
  --cui-footer-bg: var(--cui-footer-background, var(--cui-footer-theme-bg, var(--cui-color-navy)));
  --cui-footer-fg: var(--cui-footer-text, var(--cui-footer-theme-text, rgba(255, 255, 255, 0.8)));
  --cui-footer-ink: var(--cui-footer-heading, var(--cui-footer-theme-heading, var(--cui-color-white)));
  background: var(--cui-footer-bg);
  color: var(--cui-footer-fg);
}

.cui-footer__top {
  display: grid;
  gap: var(--cui-space-6);
  padding-block: var(--cui-space-7);
}

.cui-footer__brand {
  color: var(--cui-footer-ink);
  max-width: 420px;
}

.cui-footer__contact {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: var(--cui-space-4);
  font-style: normal;
  font-size: 1.4rem;
  line-height: 1.6;
  color: var(--cui-footer-fg);
}
.cui-footer__contact-link {
  color: inherit;
  overflow-wrap: anywhere;
}

.cui-footer__columns {
  display: grid;
  gap: var(--cui-space-5);
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.cui-footer__col-title {
  font-family: var(--cui-font-heading);
  color: var(--cui-footer-ink);
  font-size: 1.4rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: var(--cui-space-3);
}

.cui-footer__col summary {
  cursor: pointer;
  list-style: none;
}
.cui-footer__col-heading {
  display: inline;
  margin: 0;
  font: inherit;
  color: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
}
.cui-footer__col summary::-webkit-details-marker {
  display: none;
}
.cui-footer__col summary::after {
  content: '+';
  float: right;
}
details.cui-footer__col[open] summary::after {
  content: '\2212';
}

@media (min-width: 900px) {
  .cui-footer__columns--collapsible summary {
    pointer-events: none;
  }
  .cui-footer__columns--collapsible summary::after {
    display: none;
  }
}

.cui-footer__col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.cui-footer__col a {
  color: inherit;
  text-decoration: none;
  font-size: 1.35rem;
  opacity: 0.7;
  transition: opacity var(--cui-duration) var(--cui-ease);
}
.cui-footer__col a:hover,
.cui-footer__col a:focus-visible {
  opacity: 1;
}

.cui-footer__social {
  display: flex;
  gap: var(--cui-space-3);
  padding-bottom: var(--cui-space-6);
}

.cui-footer__social-link {
  width: 3.8rem;
  height: 3.8rem;
  border-radius: 50%;
  border: 1.5px solid color-mix(in srgb, var(--cui-footer-ink) 30%, transparent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--cui-footer-ink);
  transition: border-color var(--cui-duration) var(--cui-ease), background-color var(--cui-duration) var(--cui-ease);
}
.cui-footer__social-link:hover {
  background: var(--cui-accent);
  border-color: var(--cui-accent);
  color: var(--cui-accent-contrast);
}

.cui-footer__bottom {
  border-top: 1px solid color-mix(in srgb, var(--cui-footer-ink) 15%, transparent);
}

.cui-footer__bottom-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--cui-space-3);
  padding-block: var(--cui-space-4);
  font-size: 1.2rem;
}

.cui-footer__legal {
  display: flex;
  gap: var(--cui-space-4);
}
.cui-footer__legal a {
  color: inherit;
  text-decoration: none;
  opacity: 0.7;
  transition: opacity var(--cui-duration) var(--cui-ease);
}
.cui-footer__legal a:hover,
.cui-footer__legal a:focus-visible {
  opacity: 1;
}

/* The dimmed link look relies on light ink over a dark band; on a light
   footer theme the text color is already muted, and 0.7 opacity on top of
   it would drop below 4.5:1. */
.cui-footer:not([data-cui-theme='dark']) .cui-footer__col a,
.cui-footer:not([data-cui-theme='dark']) .cui-footer__legal a {
  opacity: 1;
}
.cui-footer:not([data-cui-theme='dark']) .cui-footer__col a:hover,
.cui-footer:not([data-cui-theme='dark']) .cui-footer__legal a:hover {
  color: var(--cui-footer-ink);
}

@media (min-width: 900px) {
  .cui-footer__top {
    grid-template-columns: 1fr 2fr;
  }
}
</style>
