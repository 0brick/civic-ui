// security (OWASP ASVS 5.0 1.3.1): the built-in default behind
// sanitizeHtml(): an allowlist for the raw markup a site realistically
// passes through v-html: icon props (inline SVG, an <img>, a small span) and
// simple rich text (paragraphs, headings, lists, links, tables, code,
// quotes). Everything else is dropped: <script>/<style>/<iframe>/<form>/
// <object>/<foreignObject>, event-handler and `style` attributes, `name`
// (document named-property clobbering), any url() other than an in-document
// `url(#id)` reference, and <use> pointing outside the document. Link and
// image URLs go through sanitizeUrl()/sanitizeMediaUrl(), `target="_blank"`
// always gets rel="noopener noreferrer", images get the configured
// referrerpolicy. Hosts that need more (a full HTML sanitizer, Trusted
// Types) register their own via configureSecurity({ sanitizeHtml }).
//
// Parsed with DOMParser, whose documents are inert: nothing loads or runs
// while the markup is inspected. Without a DOM (SSR) it fails closed and
// returns '': register a sanitizer (e.g. DOMPurify on jsdom) for SSR.
import { sanitizeUrl, sanitizeMediaUrl, mediaReferrerPolicy } from './security'

const SVG_TAGS = [
  'svg', 'g', 'path', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'rect',
  'title', 'desc', 'defs', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask',
  'symbol', 'use', 'text', 'tspan'
]
const HTML_TAGS = [
  'p', 'br', 'hr', 'span', 'div', 'i', 'b', 'strong', 'em', 'small', 'mark', 's', 'u', 'sub', 'sup',
  'abbr', 'cite', 'q', 'code', 'kbd', 'pre', 'blockquote', 'figure', 'figcaption',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'a', 'img', 'picture', 'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'
]
const ALLOWED_TAGS = new Set([...SVG_TAGS, ...HTML_TAGS])

// Dropped together with their content; any other unknown element is
// unwrapped instead, so the text inside a stray <font> or <section> survives.
const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'template', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet',
  'form', 'input', 'button', 'select', 'textarea', 'option', 'noscript', 'noembed', 'noframes',
  'foreignobject', 'math', 'link', 'meta', 'base', 'audio', 'video', 'source', 'track', 'canvas'
])

const ALLOWED_ATTRS = new Set([
  // SVG geometry & paint
  'viewbox', 'width', 'height', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
  'd', 'points', 'transform', 'pathlength',
  'fill', 'fill-opacity', 'fill-rule', 'clip-rule', 'clip-path', 'mask', 'opacity', 'color',
  'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
  'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', 'vector-effect',
  'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform', 'spreadmethod',
  'clippathunits', 'maskunits', 'preserveaspectratio',
  'font-size', 'font-weight', 'font-family', 'text-anchor', 'dominant-baseline', 'xmlns', 'version',
  // HTML
  'id', 'class', 'title', 'lang', 'dir', 'role', 'focusable', 'alt', 'href', 'src', 'target',
  'colspan', 'rowspan', 'scope', 'headers', 'start', 'reversed', 'datetime', 'loading', 'decoding',
  'aria-hidden', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-current'
])

const URL_IN_VALUE_RE = /url\s*\(/i
const LOCAL_URL_RE = /^\s*url\(\s*['"]?#[\w-]+['"]?\s*\)\s*$/i

function cleanChildren(el) {
  for (const child of Array.from(el.children)) {
    const tag = child.localName.toLowerCase()
    if (ALLOWED_TAGS.has(tag)) {
      cleanAttributes(child, tag)
      cleanChildren(child)
    } else if (DROP_WITH_CONTENT.has(tag)) {
      child.remove()
    } else {
      cleanChildren(child)
      child.replaceWith(...child.childNodes)
    }
  }
}

function cleanAttributes(el, tag) {
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase()
    const value = attr.value
    if (!ALLOWED_ATTRS.has(name) && name !== 'xlink:href') {
      el.removeAttribute(attr.name)
      continue
    }
    if (name === 'href' || name === 'xlink:href') {
      if (tag === 'use') {
        // in-document references only, never an external sprite
        if (!value.trim().startsWith('#')) el.removeAttribute(attr.name)
      } else if (tag === 'a') {
        el.setAttribute(attr.name, sanitizeUrl(value))
      } else {
        el.removeAttribute(attr.name)
      }
      continue
    }
    if (name === 'src') {
      const safe = tag === 'img' ? sanitizeMediaUrl(value) : ''
      if (safe) el.setAttribute('src', safe)
      else el.removeAttribute('src')
      continue
    }
    if (name === 'target') {
      if (tag === 'a' && value === '_blank') el.setAttribute('rel', 'noopener noreferrer')
      else el.removeAttribute('target')
      continue
    }
    if (URL_IN_VALUE_RE.test(value) && !LOCAL_URL_RE.test(value)) el.removeAttribute(attr.name)
  }
  if (tag === 'img') el.setAttribute('referrerpolicy', mediaReferrerPolicy())
}

export function sanitizeMarkup(raw) {
  if (raw === null || raw === undefined) return ''
  const markup = String(raw)
  if (markup.trim() === '') return ''
  if (typeof DOMParser === 'undefined') return ''
  const doc = new DOMParser().parseFromString(`<!doctype html><body>${markup}`, 'text/html')
  cleanChildren(doc.body)
  return doc.body.innerHTML
}
