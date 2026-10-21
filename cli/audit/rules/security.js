// Security & privacy rules. Template rules walk the parsed markup; code rules
// scan <script> blocks and .js/.ts files line by line with regexes that skip
// comments. They target the sinks docs/security.md describes: raw HTML, URL
// schemes, dynamic code, plus leaked secrets and GDPR-relevant third-party
// requests, which matter for the public-sector sites civic-ui is built for.
import { walk, attr, hasAttr } from '../parse.js'

// The whole v-html expression must be one sanitizer call, `raw + sanitize('')`
// or `cond ? sanitizeHtml(a) : raw` still renders unsanitized markup.
const SANITIZED = /^\s*(sanitizeHtml|DOMPurify\.sanitize|sanitize)\s*\((?:[^()]|\([^()]*\))*\)\s*$/
const THIRD_PARTY_PRIVACY = [
  [/fonts\.(googleapis|gstatic)\.com/i, 'Google Fonts'],
  [/(www\.)?google-analytics\.com|googletagmanager\.com/i, 'Google Analytics / Tag Manager'],
  [/(www\.)?youtube(-nocookie)?\.com\/embed|player\.vimeo\.com/i, 'a video platform embed'],
  [/connect\.facebook\.net|platform\.twitter\.com/i, 'a social-media widget'],
  [/maps\.googleapis\.com|google\.com\/maps/i, 'Google Maps'],
  [/(cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com)/i, 'a public CDN']
]

function staticValue(el, name) {
  const a = attr(el, name)
  return a && !a.bound ? a.value : null
}

function isExternal(url) {
  return /^(https?:)?\/\//i.test(url || '') && !/^(https?:)?\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(url)
}

export const securityTemplateRules = [
  {
    id: 'no-unsanitized-v-html',
    severity: 'error',
    title: 'v-html without sanitizing',
    help: 'v-html renders raw HTML: wrap the value in sanitizeHtml() from civic-ui (backed by DOMPurify via configureSecurity) or render text instead.',
    ref: 'OWASP A03 Injection (XSS) · docs/security.md',
    check({ tree, report }) {
      walk(tree, (el) => {
        const a = el.attrs.find((x) => x.name === 'v-html')
        if (a && !SANITIZED.test(a.value || '')) report(el, `v-html="${(a.value || '').slice(0, 60)}" is not sanitized`)
      })
    }
  },
  {
    id: 'no-javascript-url',
    severity: 'error',
    title: 'javascript: URL',
    help: 'Use a click handler on a <button> instead of href="javascript:…".',
    ref: 'OWASP A03 Injection (XSS)',
    check({ tree, report }) {
      walk(tree, (el) => {
        for (const a of el.attrs) {
          if (/^(:|v-bind:)?(href|src|action|formaction|xlink:href)$/i.test(a.name) && /^\s*['"`]?\s*javascript:/i.test(a.value || '')) report(el)
        }
      })
    }
  },
  {
    id: 'target-blank-noopener',
    severity: 'warning',
    title: 'target="_blank" without rel="noopener"',
    help: 'Add rel="noopener noreferrer" so the opened page cannot control yours through window.opener (civic-ui links with newTab do this).',
    ref: 'OWASP reverse tabnabbing',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (!['a', 'area', 'form'].includes(el.lname) || staticValue(el, 'target') !== '_blank') return
        const rel = attr(el, 'rel')
        if (rel && (rel.bound || /noopener|noreferrer/i.test(rel.value || ''))) return
        report(el)
      })
    }
  },
  {
    id: 'insecure-url',
    severity: 'warning',
    title: 'Insecure http:// resource',
    help: 'Load resources and submit forms over https://: http:// is blocked as mixed content and exposes data in transit.',
    ref: 'OWASP A02 Cryptographic Failures',
    check({ tree, report }) {
      walk(tree, (el) => {
        for (const name of ['src', 'href', 'action', 'poster', 'data']) {
          const v = staticValue(el, name)
          if (!v || !/^http:\/\//i.test(v) || /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(v)) continue
          if (el.lname === 'a' && name === 'href') continue // plain navigation links are the user's choice
          report(el, `${name}="${v}"`)
        }
      })
    }
  },
  {
    id: 'third-party-request',
    severity: 'warning',
    title: 'Request to a third-party server',
    help: 'Every visitor\'s IP address is sent to that provider (GDPR/BSI). Self-host the file, or load the embed only after consent (see the MediaTextSection map pattern).',
    ref: 'GDPR Art. 6 · LG München I 3 O 17493/20 (Google Fonts)',
    check({ tree, report }) {
      walk(tree, (el) => {
        // <link rel="canonical|alternate"> is metadata, not a request.
        const fetchingLink = el.lname === 'link' && /stylesheet|icon|preload|prefetch|modulepreload|manifest/i.test(staticValue(el, 'rel') || '')
        const url = staticValue(el, 'src') || (fetchingLink ? staticValue(el, 'href') : null)
        if (!url || !isExternal(url)) return
        const hit = THIRD_PARTY_PRIVACY.find(([re]) => re.test(url))
        if (hit || ['script', 'iframe', 'link', 'img', 'video', 'audio', 'source'].includes(el.lname)) {
          report(el, `<${el.lname}> loads ${hit ? hit[1] : 'an external resource'} (${url.slice(0, 80)})`)
        }
      })
    }
  },
  {
    id: 'subresource-integrity',
    severity: 'warning',
    title: 'External script/stylesheet without integrity',
    help: 'Add integrity="sha384-…" and crossorigin="anonymous" so a compromised CDN cannot inject code.',
    ref: 'OWASP A08 Software and Data Integrity Failures',
    check({ tree, report }) {
      walk(tree, (el) => {
        const isScript = el.lname === 'script' && isExternal(staticValue(el, 'src'))
        const isStyle = el.lname === 'link' && /stylesheet/i.test(staticValue(el, 'rel') || '') && isExternal(staticValue(el, 'href'))
        if ((isScript || isStyle) && !hasAttr(el, 'integrity')) report(el)
      })
    }
  },
  {
    id: 'iframe-sandbox',
    severity: 'info',
    title: 'Third-party iframe without sandbox',
    help: 'Add sandbox="allow-scripts allow-same-origin …" with only what the embed needs, and referrerpolicy="no-referrer".',
    ref: 'OWASP clickjacking / iframe hardening',
    check({ tree, report }) {
      walk(tree, (el) => {
        if (el.lname === 'iframe' && isExternal(staticValue(el, 'src')) && !hasAttr(el, 'sandbox')) report(el)
      })
    }
  },
  {
    id: 'inline-event-handler',
    severity: 'info',
    title: 'Inline on*="…" event handler',
    help: 'Inline handlers need script-src \'unsafe-inline\' in a Content Security Policy. Attach listeners in code instead.',
    ref: 'docs/security.md → Content Security Policy',
    kinds: ['html'],
    check({ tree, report }) {
      walk(tree, (el) => {
        const h = el.attrs.find((a) => /^on[a-z]+$/i.test(a.name))
        if (h) report(el, `${h.name}="…"`)
      })
    }
  },
  {
    id: 'csp-missing',
    severity: 'info',
    title: 'No Content Security Policy in the page',
    help: 'Send a Content-Security-Policy header from your server (preferred), or add <meta http-equiv="Content-Security-Policy" …>. See docs/security.md for a policy that works with civic-ui.',
    ref: 'OWASP A05 Security Misconfiguration',
    kinds: ['html'],
    check({ tree, report }) {
      let html = null
      let csp = false
      walk(tree, (el) => {
        if (el.lname === 'html') html = el
        if (el.lname === 'meta' && /content-security-policy/i.test(staticValue(el, 'http-equiv') || '')) csp = true
      })
      if (html && !csp) report(html)
    }
  }
]

// ---- code (JS/TS) rules: { id, severity, title, help, ref, pattern, message? } ----
export const securityCodeRules = [
  {
    id: 'no-inner-html',
    severity: 'error',
    title: 'Raw HTML written into the DOM',
    help: 'Use textContent, or pass the string through sanitizeHtml() first.',
    ref: 'OWASP A03 Injection (XSS)',
    pattern: /\.(innerHTML|outerHTML)\s*[+]?=(?!=)|\.insertAdjacentHTML\s*\(|document\.write(ln)?\s*\(|dangerouslySetInnerHTML/,
    skipIf: SANITIZED
  },
  {
    id: 'no-eval',
    severity: 'error',
    title: 'Dynamic code execution',
    help: 'eval / new Function / string timers run arbitrary code and need CSP unsafe-eval. Rewrite without them.',
    ref: 'OWASP A03 Injection',
    pattern: /(^|[^.\w])eval\s*\(|new\s+Function\s*\(|set(Timeout|Interval)\s*\(\s*['"`]/
  },
  {
    id: 'window-open-noopener',
    severity: 'warning',
    title: 'window.open() without noopener',
    help: "Pass 'noopener,noreferrer' as the third argument.",
    ref: 'OWASP reverse tabnabbing',
    pattern: /window\.open\s*\(/,
    skipIf: /noopener/
  },
  {
    id: 'hardcoded-secret',
    severity: 'error',
    title: 'Hard-coded secret',
    help: 'Never ship secrets in frontend code: anything in the bundle is public. Move it to the server; rotate the leaked value.',
    ref: 'OWASP A07 Identification and Authentication Failures / CWE-798',
    pattern: /(api[_-]?key|secret|client[_-]?secret|access[_-]?token|auth[_-]?token|password|passwd)\s*[:=]\s*['"`][^'"`\s]{12,}['"`]|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{36}|xox[baprs]-[A-Za-z0-9-]{10,}|sk_live_[A-Za-z0-9]{20,}/i,
    skipIf: /import\.meta\.env|process\.env|placeholder|example|your[_-]|xxx|<.*>/i,
    redact: true
  },
  {
    id: 'token-in-web-storage',
    severity: 'warning',
    title: 'Credential stored in localStorage/sessionStorage',
    help: 'Web storage is readable by any script on the page (XSS). Keep session tokens in an HttpOnly, Secure, SameSite cookie.',
    ref: 'OWASP HTML5 Security Cheat Sheet',
    pattern: /(local|session)Storage\.setItem\s*\(\s*['"`][^'"`]*(token|jwt|auth|session|password)[^'"`]*['"`]/i
  },
  {
    id: 'insecure-fetch',
    severity: 'warning',
    title: 'Request over plain http://',
    help: 'Call APIs over https://.',
    ref: 'OWASP A02 Cryptographic Failures',
    pattern: /(fetch|axios(\.(get|post|put|patch|delete))?|open)\s*\(\s*['"`]http:\/\/(?!localhost|127\.0\.0\.1)/
  },
  {
    id: 'postmessage-wildcard',
    severity: 'warning',
    title: "postMessage(…, '*')",
    help: 'Name the exact target origin instead of "*", and check event.origin in message listeners.',
    ref: 'OWASP HTML5 Security Cheat Sheet',
    pattern: /postMessage\s*\([^)]*,\s*['"`]\*['"`]/
  }
]

// ---- CSS rules ----
export const securityCssRules = [
  {
    id: 'third-party-request',
    severity: 'warning',
    title: 'Request to a third-party server',
    help: "Self-host fonts/images instead of @import-ing them from a CDN: every visitor's IP address is sent to that provider (GDPR/BSI).",
    ref: 'GDPR Art. 6 · LG München I 3 O 17493/20 (Google Fonts)',
    pattern: /@import\s+(url\()?\s*['"]?https?:\/\/|url\(\s*['"]?https?:\/\/(fonts\.(googleapis|gstatic)\.com|use\.typekit\.net)/i
  }
]
