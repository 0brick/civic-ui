// A small, forgiving HTML/Vue-template parser, just enough structure for the
// audit rules (element tree, attributes with positions, text content). It is
// not a spec-compliant HTML parser: it never throws on malformed markup, it
// just closes what it can and carries on, which is what a linter wants.

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
])
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title'])

export function lineIndex(source) {
  const starts = [0]
  for (let i = 0; i < source.length; i++) if (source[i] === '\n') starts.push(i + 1)
  return (offset) => {
    let lo = 0
    let hi = starts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (starts[mid] <= offset) lo = mid
      else hi = mid - 1
    }
    return { line: lo + 1, column: offset - starts[lo] + 1 }
  }
}

function parseAttributes(raw, baseOffset) {
  const attrs = []
  const re = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let m
  while ((m = re.exec(raw))) {
    const value = m[2] ?? m[3] ?? m[4]
    attrs.push({ name: m[1], value: value === undefined ? null : value, offset: baseOffset + m.index })
  }
  return attrs
}

// Finds the end of a start tag, respecting quoted attribute values (which
// may legally contain ">", e.g. v-if="a > b").
function findTagEnd(source, from) {
  let quote = null
  for (let i = from; i < source.length; i++) {
    const c = source[i]
    if (quote) {
      if (c === quote) quote = null
    } else if (c === '"' || c === "'") quote = c
    else if (c === '>') return i
  }
  return -1
}

/**
 * Parses markup into { type: 'root', children } of element nodes
 * ({ type: 'element', name, lname, attrs, children, parent, offset }) and
 * text nodes ({ type: 'text', value, offset }). `offset` values are relative
 * to the original file when `baseOffset` is given.
 */
export function parseMarkup(source, baseOffset = 0, options = {}) {
  // In Vue templates <Select>/<Button> are components, never native elements.
  const lower = (name) => (options.vue && /^[A-Z]/.test(name) ? name : name.toLowerCase())
  const root = { type: 'root', children: [], parent: null }
  let current = root
  let i = 0
  const pushText = (value, offset) => {
    if (value) current.children.push({ type: 'text', value, offset: baseOffset + offset, parent: current })
  }

  while (i < source.length) {
    const lt = source.indexOf('<', i)
    if (lt === -1) {
      pushText(source.slice(i), i)
      break
    }
    pushText(source.slice(i, lt), i)

    if (source.startsWith('<!--', lt)) {
      const end = source.indexOf('-->', lt + 4)
      const body = source.slice(lt + 4, end === -1 ? source.length : end)
      current.children.push({ type: 'comment', value: body, offset: baseOffset + lt, parent: current })
      i = end === -1 ? source.length : end + 3
      continue
    }
    if (source[lt + 1] === '!' || source[lt + 1] === '?') {
      const end = source.indexOf('>', lt)
      i = end === -1 ? source.length : end + 1
      continue
    }

    if (source[lt + 1] === '/') {
      const end = source.indexOf('>', lt)
      const name = source.slice(lt + 2, end === -1 ? source.length : end).trim()
      const lname = lower(name)
      // Close the nearest matching open element (and anything unclosed inside it).
      let node = current
      while (node && node.type === 'element' && node.lname !== lname) node = node.parent
      if (node && node.type === 'element') {
        node.endOffset = baseOffset + lt
        current = node.parent
      }
      i = end === -1 ? source.length : end + 1
      continue
    }

    const nameMatch = /^<([A-Za-z][\w:.-]*)/.exec(source.slice(lt, lt + 200))
    if (!nameMatch) {
      pushText('<', lt)
      i = lt + 1
      continue
    }
    const name = nameMatch[1]
    const lname = lower(name)
    const tagEnd = findTagEnd(source, lt + nameMatch[0].length)
    const end = tagEnd === -1 ? source.length : tagEnd
    let rawAttrs = source.slice(lt + nameMatch[0].length, end)
    const selfClosing = rawAttrs.trimEnd().endsWith('/')
    if (selfClosing) rawAttrs = rawAttrs.replace(/\/\s*$/, '')
    const el = {
      type: 'element',
      name,
      lname,
      attrs: parseAttributes(rawAttrs, baseOffset + lt + nameMatch[0].length),
      children: [],
      parent: current,
      offset: baseOffset + lt
    }
    current.children.push(el)
    i = end + 1

    if (selfClosing || VOID.has(lname)) continue
    if (RAW_TEXT.has(lname)) {
      const close = source.toLowerCase().indexOf(`</${lname}`, i)
      const stop = close === -1 ? source.length : close
      el.rawText = source.slice(i, stop)
      el.rawOffset = baseOffset + i
      if (el.rawText) el.children.push({ type: 'text', value: el.rawText, offset: baseOffset + i, parent: el })
      const closeEnd = close === -1 ? source.length : source.indexOf('>', close)
      i = closeEnd === -1 ? source.length : closeEnd + 1
      continue
    }
    current = el
  }
  return root
}

/**
 * Splits a .vue single-file component into its top-level blocks
 * ({ type: 'template' | 'script' | 'style', content, offset, attrs }).
 */
export function splitSfc(source) {
  const blocks = []
  const re = /<(template|script|style)(\s[^>]*)?>/gi
  let m
  while ((m = re.exec(source))) {
    const type = m[1].toLowerCase()
    const start = m.index + m[0].length
    let close
    if (type === 'template') {
      // Templates nest (<template #slot>), so match open/close pairs.
      let depth = 1
      const tagRe = /<(\/?)template\b[^>]*?(\/?)>/gi
      tagRe.lastIndex = start
      let t
      while ((t = tagRe.exec(source))) {
        if (t[2] === '/') continue
        depth += t[1] ? -1 : 1
        if (depth === 0) {
          close = t.index
          break
        }
      }
    } else {
      close = source.toLowerCase().indexOf(`</${type}>`, start)
    }
    if (close === undefined || close === -1) close = source.length
    blocks.push({ type, content: source.slice(start, close), offset: start, attrs: m[2] || '' })
    re.lastIndex = close
  }
  return blocks
}

// ---- tree helpers used by the rules ----

export function walk(node, visit) {
  for (const child of node.children || []) {
    if (child.type === 'element') {
      visit(child)
      walk(child, visit)
    }
  }
}

/** Looks up an attribute by name, matching plain, `:name` and `v-bind:name`. */
export function attr(el, name) {
  const lname = name.toLowerCase()
  for (const a of el.attrs) {
    const n = a.name.toLowerCase()
    if (n === lname) return { ...a, bound: false }
    if (n === `:${lname}` || n === `v-bind:${lname}`) return { ...a, bound: true }
  }
  return null
}

export function hasAttr(el, name) {
  return attr(el, name) !== null
}

/** Any Vue event listener / inline handler for `event`. */
export function hasListener(el, event) {
  return el.attrs.some((a) => {
    const n = a.name.toLowerCase()
    return n === `@${event}` || n.startsWith(`@${event}.`) || n === `v-on:${event}` || n.startsWith(`v-on:${event}.`) || n === `on${event}`
  })
}

/** Normalizes a component tag to PascalCase without a `cui-` prefix: cui-text-input → TextInput. */
export function componentName(el) {
  const raw = el.name.replace(/^cui-/i, '')
  if (!raw.includes('-') && /^[A-Z]/.test(raw)) return raw
  return raw
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

export function isCustomComponent(el) {
  return /[A-Z]/.test(el.name[0]) || el.name.includes('-')
}

/** Concatenated static text (mustache interpolations count as text). */
export function textContent(el) {
  let out = ''
  for (const child of el.children || []) {
    if (child.type === 'text') out += child.value
    else if (child.type === 'element') out += textContent(child)
  }
  return out
}
