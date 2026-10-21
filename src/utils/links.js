// New-tab links. Components accept `newTab` as a prop (AppButton, Card) or
// as a field on link objects (`action`, `items[]`, `links[]`, ...) and route
// it through linkAttrs():
// - security: target="_blank" always comes with rel="noopener noreferrer".
// - a11y (WCAG 3.2.5, G201): a visually hidden hint (NewTabHint) announces
//   the new tab. Its text is `links.newTab` in the i18n catalog;
//   configureLinks({ newTabLabel }) overrides just this one text.
import { sanitizeUrl } from './security'
import { configureI18n, t } from './i18n'

// Router integration: configureLinks({ linkComponent: RouterLink }) makes
// every data-driven link navigate client-side for internal paths.
// `isInternal(href)` decides which; the default accepts root-relative paths
// ("/contact", "/news?page=2", "/#team") and rejects protocol-relative URLs,
// other origins, mailto:/tel: and file downloads ("/downloads/bylaws.pdf").
// New-tab links always stay plain <a> elements.
const ROUTER_TAGS = ['router-link', 'RouterLink', 'nuxt-link', 'NuxtLink']
const FILE_RE = /\/[^/?#]+\.[a-z0-9]{2,5}(?:[?#]|$)/i

export function defaultIsInternal(href) {
  return typeof href === 'string' && /^\/(?!\/)/.test(href) && !FILE_RE.test(href)
}

const linkConfig = {
  linkComponent: null,
  isInternal: defaultIsInternal
}

export function configureLinks(options = {}) {
  if (typeof options.newTabLabel === 'string') configureI18n({ links: { newTab: options.newTabLabel } })
  if ('linkComponent' in options) linkConfig.linkComponent = options.linkComponent || null
  if ('isInternal' in options) {
    if (options.isInternal != null && typeof options.isInternal !== 'function') throw new TypeError('civic-ui: configureLinks({ isInternal }) must be a function')
    linkConfig.isInternal = options.isInternal || defaultIsInternal
  }
}

// Whether `tag` is a router link component (takes `to`, not `href`).
export function isRouterTag(tag) {
  return (tag && typeof tag === 'object') || typeof tag === 'function' || ROUTER_TAGS.includes(tag)
}

// The configured router link component for an internal, same-tab href, else
// null, for components that pick their own root element (AppButton, Card).
export function internalLinkComponent(href, newTab = false) {
  if (newTab || !linkConfig.linkComponent || typeof href !== 'string' || !href) return null
  return linkConfig.isInternal(href) ? linkConfig.linkComponent : null
}

/**
 * What a data-driven link renders as: `{ is, attrs }` for <component>.
 *   - `tag` set: that element/component: router components get `to`,
 *     anything else a sanitized `href`.
 *   - `to` set (ListGroup/Sidebar/Breadcrumb items): the configured link
 *     component (default 'router-link') with `to`.
 *   - otherwise the configured link component for internal hrefs, else <a>.
 */
export function resolveLink(href, newTab = false, tag = null, to = null) {
  if (to != null && to !== '') {
    const is = tag || linkConfig.linkComponent || 'router-link'
    return { is, attrs: { to: typeof to === 'string' ? sanitizeUrl(to) : to } }
  }
  if (tag && isRouterTag(tag)) {
    const attrs = { to: sanitizeUrl(href) }
    if (newTab) Object.assign(attrs, { target: '_blank', rel: 'noopener noreferrer' })
    return { is: tag, attrs }
  }
  if (tag) return { is: tag, attrs: linkAttrs(href, newTab) }
  const safe = sanitizeUrl(href)
  const component = internalLinkComponent(safe, newTab)
  if (component) return { is: component, attrs: { to: safe } }
  return { is: 'a', attrs: linkAttrs(href, newTab) }
}

export function newTabLabel() {
  return t('links.newTab')
}

/**
 * The attributes for an <a>: a sanitized `href`, plus `target`/`rel` when
 * `newTab` is set. Spread with v-bind.
 */
export function linkAttrs(href, newTab = false) {
  const attrs = { href: sanitizeUrl(href) }
  if (newTab) {
    attrs.target = '_blank'
    attrs.rel = 'noopener noreferrer'
  }
  return attrs
}

// security: contact links built from data (CMS person records). A
// raw `mailto:${email}` lets `a@b.example?bcc=attacker@evil.example&body=…`
// smuggle extra recipients and a prefilled body into the visitor's mail
// client: only a plain address becomes a link. Phone numbers keep digits
// and a leading `+` only, so no `?`/`&` parameters reach the tel: handler.
const EMAIL_RE = /^[^\s@?&#/:%<>"]+@[^\s@?&#/:%<>"]+\.[^\s@?&#/:%<>"]+$/

export function mailtoHref(email) {
  const value = typeof email === 'string' ? email.trim() : ''
  return EMAIL_RE.test(value) ? `mailto:${value}` : null
}

export function telHref(phone) {
  const value = typeof phone === 'string' || typeof phone === 'number' ? String(phone).trim() : ''
  // "0049 351 …" → "+49351…": the international prefix dialers expect
  const digits = value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '').replace(/^00(?=[1-9])/, '+')
  return /\d/.test(digits) ? `tel:${digits}` : null
}
