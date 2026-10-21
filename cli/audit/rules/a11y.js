// Accessibility rules: static checks on templates/HTML, each mapped to the
// WCAG 2.2 success criterion it protects. Static analysis can't see runtime
// state, so every rule errs toward *not* reporting when a value is bound
// dynamically (`:alt="..."`, `v-bind="attrs"`): a false alarm teaches people
// to ignore the report, a miss is caught by the rendered-page (axe) pass.
import { walk, attr, hasAttr, hasListener, componentName, isCustomComponent, textContent } from '../parse.js'

const FORM_FIELD_COMPONENTS = new Set(['TextInput', 'Select', 'TagInput', 'RangeSlider', 'InputGroup', 'Switch', 'Radio'])
const INTERACTIVE = new Set(['a', 'button', 'input', 'select', 'textarea', 'summary', 'details', 'option'])
const NON_INTERACTIVE_CLICK = new Set(['div', 'span', 'li', 'p', 'img', 'section', 'article', 'td', 'tr', 'label', 'svg', 'i', 'ul', 'header', 'footer', 'main', 'figure'])

function staticValue(el, name) {
  const a = attr(el, name)
  return a && !a.bound ? a.value : null
}

function hasSpreadBinding(el) {
  return el.attrs.some((a) => a.name === 'v-bind' || a.name === ':' || a.name === 'v-bind:[key]')
}

function isHiddenFromAt(el) {
  for (let node = el; node && node.type === 'element'; node = node.parent) {
    if (staticValue(node, 'aria-hidden') === 'true') return true
    if (hasAttr(node, 'hidden')) return true
  }
  return false
}

/**
 * Whether an element plausibly has an accessible name. Returns true whenever
 * the name *could* come from something we can't evaluate statically.
 */
// A listener that actually does something, `@click.stop` alone only stops
// propagation and is not an interaction.
function hasActionListener(el, event) {
  return el.attrs.some((a) => {
    const n = a.name.toLowerCase()
    const matches = n === `@${event}` || n.startsWith(`@${event}.`) || n === `v-on:${event}` || n.startsWith(`v-on:${event}.`) || n === `on${event}`
    return matches && a.value !== null && a.value.trim() !== ''
  })
}

function containsInteractive(el) {
  let found = false
  walk(el, (c) => {
    if (INTERACTIVE.has(c.lname) || c.lname === 'slot' || isCustomComponent(c) || (staticValue(c, 'tabindex') !== null && Number(staticValue(c, 'tabindex')) >= 0)) found = true
  })
  return found
}

export function hasAccessibleName(el) {
  if (hasSpreadBinding(el)) return true
  for (const name of ['aria-label', 'aria-labelledby', 'title', 'v-text', 'v-html']) {
    const a = attr(el, name)
    if (a && (a.bound || (a.value && a.value.trim()))) return true
  }
  return childrenProvideName(el)
}

function childrenProvideName(el) {
  for (const child of el.children || []) {
    if (child.type === 'text') {
      if (child.value.replace(/&nbsp;/g, ' ').trim()) return true
      continue
    }
    if (child.type !== 'element') continue
    const n = child.lname
    if (staticValue(child, 'aria-hidden') === 'true') continue
    if (n === 'slot' || n === 'template' || isCustomComponent(child)) return true
    if (n === 'img') {
      const alt = attr(child, 'alt')
      if (alt && (alt.bound || (alt.value && alt.value.trim()))) return true
      continue
    }
    if (n === 'svg') {
      if (hasAccessibleName(child) || child.children.some((c) => c.type === 'element' && c.lname === 'title')) return true
      continue
    }
    if (hasAttr(child, 'v-text') || hasAttr(child, 'v-html')) return true
    if (childrenProvideName(child)) return true
  }
  return false
}

function labelledByLabel(el, labelsFor) {
  const id = attr(el, 'id')
  if (id && (id.bound || labelsFor.has(id.value))) return true
  for (let node = el.parent; node && node.type === 'element'; node = node.parent) {
    if (node.lname === 'label') return true
    if (isCustomComponent(node)) return true // a wrapper component may render the <label>
  }
  return false
}

export const a11yRules = [
  {
    id: 'img-alt',
    severity: 'error',
    wcag: '1.1.1 Non-text Content (A)',
    title: 'Image without alternative text',
    help: 'Add alt="…" describing the image, or alt="" if it is purely decorative.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname !== 'img' && !(el.lname === 'input' && staticValue(el, 'type') === 'image')) return
        if (hasAttr(el, 'alt') || hasSpreadBinding(el)) return
        if (staticValue(el, 'role') === 'presentation' || staticValue(el, 'role') === 'none') return
        if (isHiddenFromAt(el) || hasAttr(el, 'aria-label') || hasAttr(el, 'aria-labelledby')) return
        report(el)
      })
    }
  },
  {
    id: 'button-name',
    severity: 'error',
    wcag: '4.1.2 Name, Role, Value (A)',
    title: 'Button without an accessible name',
    help: 'Give the button visible text, or an aria-label when it only shows an icon.',
    check({ tree, report }) {
      walk(tree, (el) => {
        const isButton = el.lname === 'button' || (el.lname === 'input' && ['button', 'submit', 'reset'].includes(staticValue(el, 'type')))
        if (!isButton || isHiddenFromAt(el)) return
        if (el.lname === 'input') {
          if (hasAttr(el, 'value') || hasAccessibleName(el) || staticValue(el, 'type') !== 'button') return
        } else if (hasAccessibleName(el)) return
        report(el)
      })
    }
  },
  {
    id: 'link-name',
    severity: 'error',
    wcag: '2.4.4 Link Purpose (A)',
    title: 'Link without an accessible name',
    help: 'Give the link text that says where it goes, or an aria-label when it only shows an icon or image.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname !== 'a' && el.lname !== 'router-link' && el.lname !== 'nuxt-link') return
        if (isHiddenFromAt(el) || hasAccessibleName(el)) return
        report(el)
      })
    }
  },
  {
    id: 'link-text-generic',
    severity: 'warning',
    wcag: '2.4.4 Link Purpose (A)',
    title: 'Link text that only makes sense in context',
    help: 'Say where the link goes ("Read the parking rules") instead of "click here"/"more"/"hier".',
    check({ tree, report }) {
      const generic = /^(click here|here|more|read more|learn more|link|hier|hier klicken|mehr|weiter|weiterlesen|mehr erfahren)$/i
      walk(tree, (el) => {
        if (el.lname !== 'a' && el.lname !== 'router-link') return
        if (hasAttr(el, 'aria-label') || hasAttr(el, 'aria-labelledby')) return
        const text = textContent(el).replace(/\s+/g, ' ').trim()
        if (generic.test(text)) report(el, `Link text "${text}" doesn't say where it leads`)
      })
    }
  },
  {
    id: 'form-label',
    severity: 'error',
    wcag: '1.3.1 Info and Relationships / 3.3.2 Labels or Instructions (A)',
    title: 'Form field without a label',
    help: 'Connect a <label for="id"> (or wrap the field in <label>), or add aria-label. A placeholder is not a label.',
    check({ tree, report }) {
      const labelsFor = new Set()
      walk(tree, (el) => {
        if (el.lname === 'label') {
          const f = staticValue(el, 'for')
          if (f) labelsFor.add(f)
        }
      })
      walk(tree, (el) => {
        if (!['input', 'select', 'textarea'].includes(el.lname)) return
        const type = (staticValue(el, 'type') || 'text').toLowerCase()
        if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) return
        if (hasAttr(el, 'type') && attr(el, 'type').bound) return
        if (hasSpreadBinding(el) || isHiddenFromAt(el)) return
        if (hasAttr(el, 'aria-label') || hasAttr(el, 'aria-labelledby') || hasAttr(el, 'title')) return
        if (labelledByLabel(el, labelsFor)) return
        report(el, hasAttr(el, 'placeholder') ? 'Form field only has a placeholder, no label' : undefined)
      })
    }
  },
  {
    id: 'civic-field-label',
    severity: 'error',
    wcag: '1.3.1 Info and Relationships / 3.3.2 Labels or Instructions (A)',
    title: 'civic-ui form field without a label',
    help: 'Pass label="…": civic-ui renders it as a connected <label>. Use it even when the design hides it visually.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (!isCustomComponent(el)) return
        const name = componentName(el)
        if (!FORM_FIELD_COMPONENTS.has(name) && !(name === 'Checkbox')) return
        if (hasAttr(el, 'label') || hasAttr(el, 'aria-label') || hasSpreadBinding(el)) return
        if (name === 'Checkbox' && el.children.some((c) => (c.type === 'text' && c.value.trim()) || c.type === 'element')) return
        report(el, `<${el.name}> has no label`)
      })
    }
  },
  {
    id: 'civic-icon-button-name',
    severity: 'error',
    wcag: '4.1.2 Name, Role, Value (A)',
    title: 'Icon-only civic-ui button without a name',
    help: 'AppButton icon-only uses its slot text as the (visually hidden) accessible name: always pass one.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (!isCustomComponent(el) || !['AppButton', 'Button'].includes(componentName(el))) return
        if (!hasAttr(el, 'icon-only') && !hasAttr(el, 'iconOnly')) return
        if (hasAccessibleName(el)) return
        report(el)
      })
    }
  },
  {
    id: 'civic-modal-name',
    severity: 'error',
    wcag: '4.1.2 Name, Role, Value (A)',
    title: 'Dialog without an accessible name',
    help: 'Pass title="…" to Modal, or aria-label="…" for a title-less sheet.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname === 'dialog') {
          if (!hasAttr(el, 'aria-label') && !hasAttr(el, 'aria-labelledby') && !hasSpreadBinding(el)) report(el)
          return
        }
        if (!isCustomComponent(el) || componentName(el) !== 'Modal') return
        if (hasAttr(el, 'title') || hasAttr(el, 'aria-label') || hasAttr(el, 'ariaLabel') || hasSpreadBinding(el)) return
        report(el)
      })
    }
  },
  {
    id: 'click-events-have-key-events',
    severity: 'error',
    wcag: '2.1.1 Keyboard (A)',
    title: 'Click handler on a non-interactive element',
    help: 'Use a <button> (or <a href> for navigation). A clickable <div> cannot be reached or triggered with the keyboard.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (!NON_INTERACTIVE_CLICK.has(el.lname) || !hasActionListener(el, 'click')) return
        // Clicks bubbling up from a real control inside (a wrapper that
        // toggles when its <button> is pressed) are keyboard-accessible.
        if (containsInteractive(el)) return
        // Backdrop "click outside to close": the keyboard path is Escape.
        if (/backdrop|overlay|scrim/i.test(attr(el, 'class')?.value || '')) return
        const role = staticValue(el, 'role')
        const focusable = hasAttr(el, 'tabindex')
        const keyed = hasListener(el, 'keydown') || hasListener(el, 'keyup') || hasListener(el, 'keypress')
        if (role && focusable && keyed) return
        // @click.self is the overlay/backdrop "click outside to close" pattern,
        // which has its keyboard equivalent on Escape.
        if (el.attrs.some((a) => /^(@|v-on:)click\.self/.test(a.name))) return
        report(el, `<${el.lname}> has a click handler but no keyboard equivalent`)
      })
    }
  },
  {
    id: 'anchor-is-valid',
    severity: 'warning',
    wcag: '2.1.1 Keyboard (A) / 4.1.2 Name, Role, Value (A)',
    title: 'Link used as a button',
    help: 'An <a> without href (or with href="#"/"javascript:") that runs a click handler should be a <button>.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname !== 'a' || !hasActionListener(el, 'click') || hasSpreadBinding(el)) return
        const href = attr(el, 'href')
        if (href && href.bound) return
        if (!href || href.value === '#' || href.value === '' || /^javascript:/i.test(href.value || '')) report(el)
      })
    }
  },
  {
    id: 'tabindex-positive',
    severity: 'warning',
    wcag: '2.4.3 Focus Order (A)',
    title: 'Positive tabindex',
    help: 'Use tabindex="0" (or -1) and fix the DOM order instead; positive values break the natural focus order.',
    check({ tree, report }) {
      walk(tree, (el) => {
        const t = staticValue(el, 'tabindex')
        if (t !== null && Number(t) > 0) report(el, `tabindex="${t}"`)
      })
    }
  },
  {
    id: 'aria-hidden-focusable',
    severity: 'error',
    wcag: '4.1.2 Name, Role, Value (A)',
    title: 'Focusable element hidden from assistive technology',
    help: 'aria-hidden="true" on something keyboard-focusable leaves an unannounced tab stop. Remove aria-hidden, or add tabindex="-1"/inert.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (staticValue(el, 'aria-hidden') !== 'true') return
        const check = (node) => {
          if (node.type !== 'element') return
          const focusable = (node.lname === 'a' && hasAttr(node, 'href')) || ['button', 'input', 'select', 'textarea'].includes(node.lname) || (staticValue(node, 'tabindex') !== null && Number(staticValue(node, 'tabindex')) >= 0)
          if (focusable && staticValue(node, 'tabindex') !== '-1' && !hasAttr(node, 'disabled')) report(node)
          node.children.forEach(check)
        }
        check(el)
      })
    }
  },
  {
    id: 'heading-order',
    severity: 'warning',
    wcag: '1.3.1 Info and Relationships (A)',
    title: 'Skipped heading level',
    help: 'Headings should go down one level at a time (h2 → h3), so the outline reads correctly in a screen reader.',
    check({ tree, report }) {
      let last = 0
      walk(tree, (el) => {
        const m = /^h([1-6])$/.exec(el.lname)
        if (!m) return
        const level = Number(m[1])
        if (last && level > last + 1) report(el, `<h${level}> follows <h${last}>`)
        last = level
      })
    }
  },
  {
    id: 'empty-heading',
    severity: 'error',
    wcag: '1.3.1 Info and Relationships (A) / 2.4.6 Headings and Labels (AA)',
    title: 'Empty heading',
    help: 'Give the heading text, or remove it.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (!/^h[1-6]$/.test(el.lname) || isHiddenFromAt(el)) return
        if (!hasAccessibleName(el)) report(el)
      })
    }
  },
  {
    id: 'iframe-title',
    severity: 'error',
    wcag: '4.1.2 Name, Role, Value (A)',
    title: 'iframe without a title',
    help: 'Add title="…" describing the embedded content.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname === 'iframe' && !hasAttr(el, 'title') && !hasAttr(el, 'aria-label') && !isHiddenFromAt(el)) report(el)
      })
    }
  },
  {
    id: 'media-autoplay',
    severity: 'warning',
    wcag: '1.4.2 Audio Control (A) / 2.2.2 Pause, Stop, Hide (A)',
    title: 'Autoplaying media',
    help: 'Autoplay only muted media, provide visible pause controls, and respect prefers-reduced-motion.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (!['video', 'audio'].includes(el.lname) || !hasAttr(el, 'autoplay')) return
        if (el.lname === 'video' && hasAttr(el, 'muted') && hasAttr(el, 'controls')) return
        report(el)
      })
    }
  },
  {
    id: 'video-captions',
    severity: 'warning',
    wcag: '1.2.2 Captions (Prerecorded) (A)',
    title: 'Video without captions track',
    help: 'Add <track kind="captions" …> for videos with speech (not needed for silent/decorative background video).',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname !== 'video' || hasAttr(el, 'muted') || hasSpreadBinding(el)) return
        const hasTrack = el.children.some((c) => c.type === 'element' && c.lname === 'track' && /captions|subtitles/.test(staticValue(c, 'kind') || ''))
        if (!hasTrack) report(el)
      })
    }
  },
  {
    id: 'table-headers',
    severity: 'warning',
    wcag: '1.3.1 Info and Relationships (A)',
    title: 'Data table without header cells',
    help: 'Mark header cells as <th scope="col|row"> so screen readers can announce which column a value belongs to.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname !== 'table' || staticValue(el, 'role') === 'presentation') return
        let hasTh = false
        walk(el, (c) => {
          if (c.lname === 'th') hasTh = true
        })
        if (!hasTh) report(el)
      })
    }
  },
  {
    id: 'no-distracting-elements',
    severity: 'error',
    wcag: '2.2.2 Pause, Stop, Hide (A)',
    title: '<marquee>/<blink>',
    help: 'Remove it; moving content must be pausable.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname === 'marquee' || el.lname === 'blink') report(el)
      })
    }
  },
  {
    id: 'new-tab-warning',
    severity: 'warning',
    wcag: '3.2.5 Change on Request (AAA) / technique G201',
    title: 'Link opens a new tab without telling the user',
    help: 'Announce it, e.g. a visually hidden "(opens in a new tab)". civic-ui components do this for you with newTab / { newTab: true }.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname !== 'a' || staticValue(el, 'target') !== '_blank') return
        const label = `${staticValue(el, 'aria-label') || ''} ${textContent(el)}`
        if (/new (tab|window)|neue[nm]? (tab|fenster)|opens in/i.test(label)) return
        if (el.children.some((c) => c.type === 'element' && isCustomComponent(c))) return
        report(el)
      })
    }
  },
  {
    id: 'html-lang',
    severity: 'error',
    wcag: '3.1.1 Language of Page (A)',
    title: '<html> without a lang attribute',
    help: 'Set <html lang="de"> (or your page language) so screen readers pick the right pronunciation.',
    kinds: ['html'],
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname === 'html' && !staticValue(el, 'lang') && !hasAttr(el, 'lang')) report(el)
      })
    }
  },
  {
    id: 'document-title',
    severity: 'error',
    wcag: '2.4.2 Page Titled (A)',
    title: 'Page without a <title>',
    help: 'Give every page a descriptive <title> (and update it on route changes in a single-page app).',
    kinds: ['html'],
    check({ tree, report }) {
      let html = null
      let title = null
      walk(tree, (el) => {
        if (el.lname === 'html') html = el
        if (el.lname === 'title') title = el
      })
      if (html && (!title || !textContent(title).trim())) report(html)
    }
  },
  {
    id: 'meta-viewport-zoom',
    severity: 'error',
    wcag: '1.4.4 Resize Text (AA) / 1.4.10 Reflow (AA)',
    title: 'Zooming disabled',
    help: 'Remove user-scalable=no and maximum-scale below 2 from the viewport meta tag.',
    kinds: ['html'],
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname !== 'meta' || (staticValue(el, 'name') || '').toLowerCase() !== 'viewport') return
        const content = (staticValue(el, 'content') || '').toLowerCase()
        const max = /maximum-scale\s*=\s*([\d.]+)/.exec(content)
        if (/user-scalable\s*=\s*(no|0)/.test(content) || (max && Number(max[1]) < 2)) report(el, `viewport "${content}" blocks zoom`)
      })
    }
  },
  {
    id: 'duplicate-id',
    severity: 'warning',
    wcag: '4.1.2 Name, Role, Value (A) / 1.3.1 (A)',
    title: 'Duplicate id',
    help: 'ids must be unique: label/aria references silently point at the wrong element otherwise. Use useId() for repeated components.',
    check({ tree, report }) {
      const seen = new Map()
      walk(tree, (el) => {
        const id = staticValue(el, 'id')
        if (!id) return
        // Elements inside v-for repeat their id at runtime.
        let inLoop = false
        for (let n = el; n && n.type === 'element'; n = n.parent) if (hasAttr(n, 'v-for')) inLoop = true
        if (inLoop) return report(el, `id="${id}" is repeated by v-for`)
        if (seen.has(id)) report(el, `id="${id}" is used more than once`)
        seen.set(id, el)
      })
    }
  },
  {
    id: 'accesskey',
    severity: 'warning',
    wcag: '2.1.4 Character Key Shortcuts (A)',
    title: 'accesskey shortcut',
    help: 'accesskey collides with screen-reader and browser shortcuts; avoid it.',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (hasAttr(el, 'accesskey')) report(el)
      })
    }
  },
  {
    id: 'interactive-role-without-focus',
    severity: 'error',
    wcag: '2.1.1 Keyboard (A)',
    title: 'Widget role on an element that cannot take focus',
    help: 'role="button"/"link"/"checkbox"/… needs tabindex="0" and keyboard handlers, or better, use the native element.',
    check({ tree, report }) {
      const widget = new Set(['button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'menuitem', 'option', 'slider', 'textbox', 'combobox'])
      walk(tree, (el) => {
        const role = staticValue(el, 'role')
        if (!role || !widget.has(role) || INTERACTIVE.has(el.lname) || isCustomComponent(el)) return
        if (!hasAttr(el, 'tabindex') && !['option', 'tab', 'menuitem'].includes(role)) report(el, `role="${role}" on <${el.lname}> without tabindex`)
      })
    }
  }
]
