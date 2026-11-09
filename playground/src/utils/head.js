// Keeps the tab title, meta description and canonical link in sync with the
// route, so bookmarks and screen readers (WCAG 2.4.2) see where they are. The
// values come from seo.js, which also fills the static HTML at build time.
import { watchEffect } from 'vue'
import { canonicalUrl, describeRoute } from './seo.js'

function setHeadTag(tagName, matchAttr, matchValue, valueAttr, value) {
  let tag = document.head.querySelector(`${tagName}[${matchAttr}="${matchValue}"]`)
  if (!tag) {
    tag = document.createElement(tagName)
    tag.setAttribute(matchAttr, matchValue)
    document.head.appendChild(tag)
  }
  tag.setAttribute(valueAttr, value)
}

export function useDocumentHead(route) {
  watchEffect(() => {
    const { title, description, path } = describeRoute(route.value)
    document.title = title
    setHeadTag('meta', 'name', 'description', 'content', description)
    setHeadTag('link', 'rel', 'canonical', 'href', canonicalUrl(path))
  })
}
