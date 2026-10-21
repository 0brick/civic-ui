<script setup>
// The general-purpose teaser/list-row card: optional link wrapper, leading
// visual, text body, optional trailing element. `layout` picks the skeleton:
//   'grid'     vertical card, image on top (default)
//   'row'      horizontal row, image left, date/category meta above the title
//   'person'   avatar + name/role + a short list of mailto/tel links
//   'job'      title + icon meta row + trailing arrow
//   'download' file-type chip + title/size + trailing download icon
// `meta` items are `{ label, href?, icon?, newTab? }`; `icon` is 'location'
// or 'briefcase' (built-in glyphs). See utils/links.js for `newTab`.
//
// a11y/validity (WCAG 4.1.1/4.1.2): a linked card is one big <a>, and links
// can't nest. With `href` set, the contact details and meta links render as
// plain text (and a dev warning names the conflict): put them on an unlinked
// card if they must stay clickable.
import { computed, watchEffect } from 'vue'
import Avatar from './Avatar.vue'
import NewTabHint from '../internal/NewTabHint.vue'
import { hasOwn, sanitizeHtml, sanitizeUrl, sanitizeMediaUrl, mediaReferrerPolicy, warnOnce } from '../../utils/security'
import CuiLink from '../internal/CuiLink.vue'
import { internalLinkComponent, isRouterTag, mailtoHref, telHref } from '../../utils/links'
import { t } from '../../utils/i18n'
import { resolveBackground, themeColors, deriveContrastText, isDarkBackground } from '../../utils/themes'
import { parseColor } from '../../utils/color'

const props = defineProps({
  layout: { type: String, default: 'grid', validator: (v) => ['grid', 'row', 'person', 'job', 'download'].includes(v) },
  media: { type: String, default: '' },
  mediaAlt: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  text: { type: String, default: '' },
  date: { type: String, default: '' },
  meta: { type: Array, default: () => [] }, // [{ label, href?, newTab?, icon?: 'location'|'briefcase' }]
  fileType: { type: String, default: 'PDF' },
  fileSize: { type: String, default: '' },
  trailing: { type: String, default: '', validator: (v) => ['', 'none', 'arrow', 'download'].includes(v) },
  href: { type: String, default: '' },
  newTab: { type: Boolean, default: false },
  tag: { type: [String, Object], default: null }, // swap in router-link etc. when href is an internal route
  // Named `appearance`, not the library's usual `variant`: `layout` above
  // already owns the structural axis (grid/row/person/job/download), so
  // `variant` would be ambiguous between "which shape" and "which visual
  // style", `appearance` is reserved for the latter. Precedent for any
  // future component that needs both axes.
  appearance: { type: String, default: 'default', validator: (v) => ['default', 'outlined', 'flat'].includes(v) },
  // A visible call to action at the end of a linked card ("Mehr erfahren"),
  // with → (or ↗ for a new tab / another site): the whole card stays the link.
  actionLabel: { type: String, default: '' },
  // A colored edge: 'top' (a bar across the top) or 'start' (the leading
  // side). `accentColor` is a section theme key / palette role ('accent',
  // 'secondary', 'navy', …) or a color; default the accent role.
  accent: { type: String, default: 'none', validator: (v) => ['none', 'top', 'start'].includes(v) },
  accentColor: { type: String, default: '' },
  // A section theme key / color for a colored card, e.g. 'primary' for a
  // dark story card; text, heading and links follow (data-cui-theme="dark").
  background: { type: String, default: '' },
  // A number/kicker over the title, e.g. '01'.
  number: { type: String, default: '' },
  // The title's heading level (grid/row/job layouts), 2-6.
  headingLevel: { type: Number, default: 3, validator: (v) => v >= 2 && v <= 6 },
  // person layout: contact details straight on the card; rendered as
  // mailto:/tel: links (only a plain address / digits become links, see
  // utils/links.js), ahead of any `meta` items. `phoneHref` overrides the
  // derived tel: target (e.g. an extension the displayed number omits).
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  phoneHref: { type: String, default: '' },
  // 'initials' (default): the photo, or initials without one; 'auto': the
  // photo only; 'none': no avatar at all.
  avatar: { type: String, default: 'initials', validator: (v) => ['auto', 'initials', 'none'].includes(v) },
  // Visible "Email"/"Phone" labels before the contact details (texts from
  // the i18n catalog: card.email / card.phone).
  showLabels: { type: Boolean, default: false }
})

const contacts = computed(() => {
  const list = []
  if (props.email) list.push({ key: 'email', label: t('card.email'), value: props.email, href: mailtoHref(props.email) })
  if (props.phone) list.push({ key: 'phone', label: t('card.phone'), value: props.phone, href: props.phoneHref ? sanitizeUrl(props.phoneHref) : telHref(props.phone) })
  return list
})
const showAvatar = computed(() => props.avatar === 'initials' || (props.avatar === 'auto' && !!props.media))

const theme = computed(() => {
  if (!props.background) return null
  const r = resolveBackground(props.background)
  if (r?.type === 'theme') return r
  if (r?.type === 'color') return { bg: r.bg, ...deriveContrastText(r.bg) }
  return null
})
const isDark = computed(() => !!theme.value && isDarkBackground(theme.value.bg))
const accentValue = computed(() => {
  if (props.accent === 'none') return null
  if (!props.accentColor) return 'var(--cui-accent)'
  const themed = themeColors(props.accentColor)
  if (themed) return themed.bg
  return parseColor(props.accentColor) ? props.accentColor : 'var(--cui-accent)'
})
const cardVars = computed(() => {
  const vars = {}
  if (theme.value) Object.assign(vars, { '--cui-card-bg': theme.value.bg, '--cui-card-text': theme.value.text, '--cui-card-heading': theme.value.heading })
  if (accentValue.value) vars['--cui-card-accent'] = accentValue.value
  return vars
})
const headingTag = computed(() => `h${props.headingLevel}`)
const isExternal = computed(() => /^(https?:)?\/\//i.test(props.href || ''))

// An internal href renders the configured router link (configureLinks), so a
// teaser card navigates client-side without `tag`; a download never does.
const routerTag = computed(() => (props.tag || props.layout === 'download' ? null : internalLinkComponent(sanitizeUrl(props.href), props.newTab)))
const resolvedTag = computed(() => props.tag ?? routerTag.value ?? (props.href ? 'a' : 'div'))
const isRouterLink = computed(() => isRouterTag(resolvedTag.value))
// The whole card is a link: inner links would nest inside it.
const isLinkCard = computed(() => resolvedTag.value !== 'div')
watchEffect(() => {
  if (!isLinkCard.value) return
  const inner = contacts.value.some((c) => c.href) || props.meta.some((m) => m.href)
  if (inner) warnOnce('card-nested-links', 'Card: `href` makes the whole card a link, so email/phone/meta links render as text (links cannot nest). Drop `href` to keep them clickable.')
})
// security (OWASP ASVS 5.0 1.2.2): sanitize the whole-card link once here
// instead of at every section (ListSection, TeaserGrid, ...) that feeds
// this component a data-driven `href`.
const safeHref = computed(() => sanitizeUrl(props.href))
const opensNewTab = computed(() => props.newTab && (resolvedTag.value === 'a' || isRouterLink.value))
const effectiveTrailing = computed(() => {
  if (props.trailing) return props.trailing
  if (props.layout === 'job') return 'arrow'
  if (props.layout === 'download') return 'download'
  return 'none'
})

const metaIcons = {
  location: '<path d="M8 15s5-4.6 5-8.5a5 5 0 10-10 0C3 10.4 8 15 8 15z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="6.5" r="1.8" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  briefcase: '<rect x="2" y="5" width="12" height="8.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 5V3.5a1 1 0 011-1h3a1 1 0 011 1V5" fill="none" stroke="currentColor" stroke-width="1.4"/>'
}
</script>

<template>
  <component
    :is="resolvedTag"
    :href="isRouterLink ? undefined : safeHref || undefined"
    :to="isRouterLink ? safeHref : undefined"
    :target="opensNewTab ? '_blank' : undefined"
    :rel="opensNewTab ? 'noopener noreferrer' : undefined"
    :download="layout === 'download' ? true : undefined"
    class="cui-card"
    :class="[
      `cui-card--${appearance}`,
      `cui-card--${layout}`,
      { 'cui-card--themed': !!theme, [`cui-card--accent-${accent}`]: accent !== 'none' }
    ]"
    :style="cardVars"
    :data-cui-theme="isDark ? 'dark' : undefined"
  >
    <div v-if="layout === 'grid' && media" class="cui-card__media cui-card__media--cover">
      <img :src="sanitizeMediaUrl(media)" :alt="mediaAlt" loading="lazy" :referrerpolicy="mediaReferrerPolicy()" />
    </div>

    <div v-if="layout === 'row' && media" class="cui-card__media cui-card__media--row">
      <img :src="sanitizeMediaUrl(media)" :alt="mediaAlt" loading="lazy" :referrerpolicy="mediaReferrerPolicy()" />
    </div>

    <Avatar v-if="layout === 'person' && showAvatar" :src="media" :name="title" size="lg" decorative />

    <span v-if="layout === 'download'" class="cui-card__chip" aria-hidden="true">{{ fileType }}</span>

    <div class="cui-card__body">
      <div v-if="layout === 'row' && (date || eyebrow)" class="cui-card__row-meta">
        <time v-if="date">{{ date }}</time>
        <span v-if="eyebrow" class="cui-card__category">{{ eyebrow }}</span>
      </div>
      <span v-else-if="eyebrow" class="cui-eyebrow">{{ eyebrow }}</span>

      <span v-if="number" class="cui-card__number">{{ number }}</span>
      <component :is="headingTag" v-if="title && layout !== 'person' && layout !== 'download'" class="cui-card__title">{{ title }}</component>
      <span v-if="layout === 'person'" class="cui-card__name">{{ title }}</span>
      <span v-if="layout === 'download'" class="cui-card__title cui-card__title--inline">{{ title }}</span>

      <p v-if="subtitle" class="cui-card__subtitle">{{ subtitle }}</p>
      <p v-if="layout === 'row' && text" class="cui-card__text">{{ text }}</p>
      <span v-if="layout === 'download' && fileSize" class="cui-card__filesize">{{ fileType }} &middot; {{ fileSize }}</span>

      <dl v-if="layout === 'person' && contacts.length && showLabels" class="cui-card__contact">
        <template v-for="c in contacts" :key="c.key">
          <dt>{{ c.label }}</dt>
          <dd>
            <a v-if="c.href && !isLinkCard" :href="c.href" @click.stop>{{ c.value }}</a>
            <template v-else>{{ c.value }}</template>
          </dd>
        </template>
      </dl>
      <ul v-else-if="layout === 'person' && contacts.length" class="cui-card__meta">
        <li v-for="c in contacts" :key="c.key" class="cui-card__meta-item">
          <a v-if="c.href && !isLinkCard" :href="c.href" @click.stop>{{ c.value }}</a>
          <template v-else>{{ c.value }}</template>
        </li>
      </ul>
      <ul v-if="(layout === 'person' || layout === 'job') && meta.length" class="cui-card__meta">
        <li v-for="(item, i) in meta" :key="i" class="cui-card__meta-item">
          <!-- eslint-disable-next-line vue/no-v-html -- routed through sanitizeHtml(), see utils/security.js -->
          <svg v-if="item.icon && hasOwn(metaIcons, item.icon)" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" v-html="sanitizeHtml(metaIcons[item.icon])" />
          <CuiLink v-if="item.href && !isLinkCard" :href="item.href" :new-tab="item.newTab" @click.stop>{{ item.label }}<NewTabHint v-if="item.newTab" /></CuiLink>
          <template v-else>{{ item.label }}</template>
        </li>
      </ul>

      <template v-if="layout === 'grid'">
        <div class="cui-card__content"><slot>{{ text }}</slot></div>
        <div v-if="$slots.footer" class="cui-card__footer"><slot name="footer" /></div>
      </template>
      <span v-if="actionLabel && href" class="cui-card__action">
        {{ actionLabel }}<span class="cui-card__action-icon" aria-hidden="true">{{ newTab || isExternal ? '↗' : '→' }}</span>
      </span>
      <NewTabHint v-if="opensNewTab" />
    </div>

    <span v-if="effectiveTrailing === 'arrow'" class="cui-card__trailing" aria-hidden="true">
      <svg viewBox="0 0 20 20" width="18" height="18"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </span>
    <span v-else-if="effectiveTrailing === 'download'" class="cui-card__trailing" aria-hidden="true">
      <svg viewBox="0 0 20 20" width="18" height="18"><path d="M10 3v10m0 0l-4-4m4 4l4-4M4 16h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </span>
  </component>
</template>

<style scoped>
.cui-card {
  display: flex;
  color: inherit;
  text-decoration: none;
  transition: transform var(--cui-duration) var(--cui-ease), box-shadow var(--cui-duration) var(--cui-ease), border-color var(--cui-duration) var(--cui-ease);
}

/* ---- appearance ---- */
.cui-card--default {
  background: var(--cui-surface);
  box-shadow: var(--cui-shadow-sm);
}
.cui-card--outlined {
  background: var(--cui-surface);
  border: 1px solid var(--cui-border);
}
.cui-card--flat {
  background: transparent;
}

/* ---- background theme, accent edge ---- */
.cui-card--themed {
  background: var(--cui-card-bg);
  color: var(--cui-card-text);
  border-color: transparent;
}
.cui-card--themed .cui-card__title,
.cui-card--themed .cui-card__name {
  color: var(--cui-card-heading);
}
.cui-card--themed .cui-card__content,
.cui-card--themed .cui-card__subtitle,
.cui-card--themed .cui-card__text {
  color: var(--cui-card-text);
}
.cui-card--accent-top {
  border-top: 4px solid var(--cui-card-accent);
}
.cui-card--accent-start {
  border-inline-start: 4px solid var(--cui-card-accent);
}

.cui-card__number {
  display: block;
  margin-bottom: var(--cui-space-2);
  font-family: var(--cui-font-heading);
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--cui-text-secondary);
}
.cui-card--themed .cui-card__number {
  color: var(--cui-card-heading);
}

.cui-card__action {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  margin-top: var(--cui-space-4);
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--cui-link);
}
.cui-card--themed .cui-card__action {
  color: var(--cui-card-heading);
}
.cui-card__action-icon {
  transition: transform var(--cui-duration) var(--cui-ease);
}
a.cui-card:hover .cui-card__action-icon {
  transform: translateX(3px);
}

/* ---- grid layout (default Card) ---- */
.cui-card--grid {
  flex-direction: column;
  border-radius: var(--cui-radius-lg);
  overflow: hidden;
  height: 100%;
}
a.cui-card--grid:hover {
  transform: translateY(-3px);
  box-shadow: var(--cui-shadow-md);
}
.cui-card__media--cover {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--cui-bg-muted);
}
.cui-card__media--cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cui-card--grid .cui-card__body {
  padding: var(--cui-space-5);
  display: flex;
  flex-direction: column;
  flex: 1;
}
.cui-card__content {
  flex: 1;
  color: var(--cui-text-muted);
  font-size: 1.4rem;
}
.cui-card__footer {
  margin-top: var(--cui-space-4);
}

/* ---- row layout ---- */
.cui-card--row {
  gap: var(--cui-space-5);
  padding-block: var(--cui-space-5);
  border-bottom: 1px solid var(--cui-border);
  background: none;
  box-shadow: none;
}
.cui-card--row:first-child {
  padding-top: 0;
}
.cui-card__media--row {
  flex-shrink: 0;
  width: 160px;
  aspect-ratio: 4 / 3;
  border-radius: var(--cui-radius-md);
  overflow: hidden;
  background: var(--cui-bg-muted);
}
.cui-card__media--row img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cui-card--row .cui-card__body {
  flex: 1;
  min-width: 0;
}
.cui-card__row-meta {
  display: flex;
  align-items: center;
  gap: var(--cui-space-3);
  font-size: 1.2rem;
  color: var(--cui-text-muted);
  margin-bottom: 0.6rem;
}
.cui-card__category {
  color: var(--cui-text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
a.cui-card--row:hover .cui-card__title {
  color: var(--cui-link);
}
.cui-card__text {
  margin: 0;
  color: var(--cui-text-muted);
  font-size: 1.4rem;
  max-width: 68ch;
}
@media (max-width: 640px) {
  .cui-card--row {
    flex-direction: column;
  }
  .cui-card__media--row {
    width: 100%;
    aspect-ratio: 16 / 9;
  }
}

/* ---- shared title ---- */
.cui-card__title {
  margin: 0 0 0.6rem;
  font-size: 2rem;
}
.cui-card--grid .cui-card__title {
  margin: 0 0 var(--cui-space-2);
}
.cui-card__title--inline {
  display: block;
  font-family: var(--cui-font-heading);
  font-size: 1.5rem;
  font-weight: var(--cui-heading-weight);
  letter-spacing: var(--cui-heading-letter-spacing);
  margin: 0;
}

/* ---- person layout ---- */
.cui-card--person {
  gap: var(--cui-space-4);
  align-items: flex-start;
  padding: var(--cui-space-4);
  border-radius: var(--cui-radius-lg);
}
.cui-card--person .cui-card__body {
  flex: 1;
  min-width: 0;
}
.cui-card__name {
  display: block;
  font-family: var(--cui-font-heading);
  font-weight: var(--cui-heading-weight);
  letter-spacing: var(--cui-heading-letter-spacing);
  font-size: 1.6rem;
}
.cui-card__subtitle {
  margin: 0.2rem 0 0;
  font-size: 1.3rem;
  color: var(--cui-text-muted);
}
a.cui-card--person:hover {
  box-shadow: var(--cui-shadow-md);
  transform: translateY(-2px);
}
.cui-card--person .cui-card__meta {
  list-style: none;
  margin: var(--cui-space-3) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 1.3rem;
}
.cui-card--person .cui-card__meta a,
.cui-card__contact a {
  color: var(--cui-link);
  overflow-wrap: anywhere;
}
.cui-card__contact {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 0.4rem var(--cui-space-3);
  margin: var(--cui-space-3) 0 0;
  font-size: 1.3rem;
}
.cui-card__contact dt {
  font-weight: 700;
  color: var(--cui-text-muted);
}
.cui-card__contact dd {
  margin: 0;
  min-width: 0;
}

/* ---- job layout ---- */
.cui-card--job {
  align-items: center;
  justify-content: space-between;
  gap: var(--cui-space-4);
  padding: var(--cui-space-5);
  border-radius: var(--cui-radius-lg);
}
a.cui-card--job:hover {
  border-color: var(--cui-border-strong);
  box-shadow: var(--cui-shadow-sm);
}
.cui-card--job .cui-card__body {
  flex: 1;
  min-width: 0;
}
.cui-card--job .cui-card__meta {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: var(--cui-space-4);
  margin: 0;
  padding: 0;
  font-size: 1.3rem;
  color: var(--cui-text-muted);
}
.cui-card--job .cui-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* ---- shared meta-item / trailing (job + download) ---- */
.cui-card__trailing {
  flex-shrink: 0;
  display: inline-flex;
  align-self: center;
  color: var(--cui-text-secondary);
}

/* ---- download layout ---- */
.cui-card--download {
  align-items: center;
  gap: var(--cui-space-4);
  padding: var(--cui-space-4);
  border-radius: var(--cui-radius-md);
}
a.cui-card--download:hover {
  border-color: var(--cui-border-strong);
  background: var(--cui-bg-subtle);
}
.cui-card__chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;
  height: 3.2rem;
  padding-inline: 0.6rem;
  border-radius: var(--cui-radius-sm);
  background: var(--cui-primary);
  color: var(--cui-primary-contrast);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.cui-card--download .cui-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}
.cui-card__filesize {
  font-size: 1.2rem;
  color: var(--cui-text-muted);
}
</style>
