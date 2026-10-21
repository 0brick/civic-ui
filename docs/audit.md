# Project audit (`npm run test civic`)

Civic UI ships an audit for **your** project, not just its own components. One command checks every template, page, script and stylesheet for accessibility (WCAG 2.2 AA) and security problems, and prints a detailed report: file, line, what is wrong, how to fix it, and the WCAG success criterion or OWASP category it maps to.

```bash
npx civic-ui audit
```

It has no dependencies, needs no build, and runs in about a second on a typical site.

## Run it as `npm run test civic`

Set it up once:

```bash
npx civic-ui audit --init
```

From then on:

```bash
npm run test civic
```

What `--init` does depends on your project:

| Your project | What `--init` does | Why it works |
|---|---|---|
| Uses **Vitest** | Adds `civic.test.js`, which runs the audit, prints the report and fails on errors | Vitest treats `civic` as a file filter, so only that file runs |
| Uses **Jest** | Same, with a Jest-style `civic.test.js` | Jest treats `civic` as a path pattern too |
| Has **no test script** | Sets `"test": "civic-ui audit"` in `package.json` | `civic` is accepted as an alias of `audit`, so `npm run test civic` and `npm test` both run it |
| Has some other test runner | Changes nothing and suggests a `"test:civic": "civic-ui audit"` script | Your existing setup is never rewritten |

The generated Vitest file is short enough to write by hand:

```js
// civic.test.js
import { test, expect } from 'vitest'
import { runAudit, formatReport } from 'civic-ui/audit'

test('civic-ui audit: accessibility (WCAG 2.2 AA) and security', async () => {
  const result = await runAudit({ root: process.cwd() })
  console.log(formatReport(result, { color: true }))
  expect(result.summary.errors, 'the civic-ui audit found errors: see the report above').toBe(0)
}, 120_000)
```

## Reading the report

```text
src/views/ContactView.vue
  14:7     error   a11y Form field only has a placeholder, no label  form-label
             │ <input type="email" placeholder="E-Mail">
             └ Connect a <label for="id"> (or wrap the field in <label>), or add aria-label. A placeholder is not a label.  [WCAG 1.3.1 Info and Relationships / 3.3.2 Labels or Instructions (A)]
  31:5     error   sec  v-html="bio" is not sanitized  no-unsanitized-v-html
             │ <div v-html="bio" />
             └ v-html renders raw HTML: wrap the value in sanitizeHtml() from civic-ui …  [OWASP A03 Injection (XSS) · docs/security.md]

Findings by rule
     3  error   form-label                       Form field without a label
     1  error   no-unsanitized-v-html            v-html without sanitizing

Summary
  Accessibility: 3 error(s), 1 warning(s), 0 info
  Security     : 1 error(s), 0 warning(s), 1 info

✖ 4 error(s), 1 warning(s), 1 info.
```

- **error**: a real barrier or vulnerability. Fails the run.
- **warning**: very likely a problem, but it depends on context (generic link text, a new tab without a hint, a third-party request). Doesn't fail the run unless you pass `--fail-on warning`.
- **info**: hardening advice (Content Security Policy, iframe sandboxing).

Exit code `0` means no errors, `1` means findings at the `--fail-on` level, `2` means a usage error. That makes it usable directly in CI.

## What it checks

### Accessibility (WCAG 2.2)

| Rule | Level | Checks |
|---|---|---|
| `img-alt` | 1.1.1 A | `<img>` without `alt` (use `alt=""` for decoration) |
| `button-name` · `link-name` | 4.1.2 A · 2.4.4 A | Buttons/links with no text, `aria-label` or labelled image |
| `link-text-generic` | 2.4.4 A | "click here", "mehr", "hier" as the whole link text |
| `form-label` | 1.3.1 / 3.3.2 A | `<input>`/`<select>`/`<textarea>` without a connected label, placeholder-only fields |
| `civic-field-label` | 1.3.1 / 3.3.2 A | civic-ui `TextInput`, `Select`, `Checkbox`, … without `label` |
| `civic-icon-button-name` | 4.1.2 A | `AppButton icon-only` without slot text |
| `civic-modal-name` | 4.1.2 A | `Modal`/`<dialog>` without `title`/`aria-label` |
| `click-events-have-key-events` | 2.1.1 A | Clickable `<div>`/`<span>` with no keyboard equivalent |
| `anchor-is-valid` | 2.1.1 A | `<a href="#" @click>` that should be a `<button>` |
| `interactive-role-without-focus` | 2.1.1 A | `role="button"` etc. without `tabindex` |
| `tabindex-positive` | 2.4.3 A | `tabindex` greater than 0 |
| `aria-hidden-focusable` | 4.1.2 A | Focusable content inside `aria-hidden="true"` |
| `heading-order` · `empty-heading` | 1.3.1 A · 2.4.6 AA | Skipped heading levels, empty headings |
| `iframe-title` | 4.1.2 A | `<iframe>` without `title` |
| `media-autoplay` · `video-captions` | 1.4.2 / 2.2.2 A · 1.2.2 A | Autoplaying media, videos without a captions track |
| `table-headers` | 1.3.1 A | Tables without `<th>` |
| `html-lang` · `document-title` | 3.1.1 A · 2.4.2 A | `index.html` without `lang` or `<title>` |
| `meta-viewport-zoom` | 1.4.4 / 1.4.10 AA | `user-scalable=no`, `maximum-scale` < 2 |
| `duplicate-id` | 4.1.2 A | Static ids used twice, or repeated by `v-for` |
| `new-tab-warning` | 3.2.5 (G201) | `target="_blank"` without an "opens in a new tab" hint |
| `accesskey` · `no-distracting-elements` | 2.1.4 A · 2.2.2 A | `accesskey`, `<marquee>`/`<blink>` |

### Security and privacy

| Rule | Category | Checks |
|---|---|---|
| `no-unsanitized-v-html` | XSS (OWASP A03) | `v-html` whose value isn't passed through `sanitizeHtml()` |
| `no-inner-html` · `no-eval` | XSS / injection | `innerHTML =`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, string timers |
| `no-javascript-url` | XSS | `href="javascript:…"` |
| `hardcoded-secret` | CWE-798 | API keys, tokens, private keys, passwords in frontend code (shown redacted) |
| `env-file-committed` | Misconfiguration | `.env` files not listed in `.gitignore` |
| `token-in-web-storage` | Session security | Auth tokens in `localStorage`/`sessionStorage` |
| `target-blank-noopener` · `window-open-noopener` | Reverse tabnabbing | New-tab links/windows without `noopener` |
| `insecure-url` · `insecure-fetch` | Transport (A02) | `http://` resources, forms and API calls |
| `third-party-request` | GDPR / BSI | Google Fonts, analytics, video/map embeds, CDNs, in markup and CSS `@import` |
| `subresource-integrity` | Integrity (A08) | External scripts/stylesheets without `integrity` |
| `postmessage-wildcard` | Messaging | `postMessage(…, '*')` |
| `iframe-sandbox` · `inline-event-handler` · `csp-missing` | Hardening (info) | Unsandboxed third-party iframes, `onclick="…"`, no CSP |
| `vulnerable-dependency` | A06 | Runs `npm audit`. Runtime dependencies: critical/high count as errors, moderate as warnings. Dev-only dependencies (build tool, test runner, dev server) are reported one level lower, marked *(dev dependency)*: skip them with `--no-npm-audit-dev`. Skip the whole check with `--no-npm-audit` (it needs network access) |

### Rendered pages (optional, axe-core)

Static checks can't see what JavaScript renders at runtime. If your build outputs HTML (a static site, prerendering, SSG), also run **axe-core** (the engine behind Lighthouse and axe DevTools) on the built pages:

```bash
npm i -D jsdom axe-core
npm run build
npx civic-ui audit --rendered dist
```

axe findings appear as `axe/<rule>` with the page, a CSS selector for the element, and the axe help link. Color contrast can't be measured without a real browser, so it's left to Lighthouse. civic-ui's own colors are contrast-checked by the palette engine anyway.

## Options

```text
npx civic-ui audit [paths…] [options]

  --init                 Set up `npm run test civic`
  --only <area>          accessibility | security
  --fail-on <level>      error (default) | warning | never
  --min-severity <lvl>   Hide lower findings in the report: info (default) | warning | error
  --ignore <glob>        Skip matching files (repeatable)
  --rendered [dir]       Also run axe-core on built HTML (default dir: dist)
  --no-npm-audit         Skip the dependency vulnerability check
  --no-npm-audit-dev     Check runtime dependencies only
  --json                 Machine-readable output
  --no-color             Plain output
```

By default the whole project is scanned, except `node_modules`, `dist`, `build`, `coverage`, `.nuxt`, `.output`, minified files and test files (`*.spec.*`, `*.test.*`, `__tests__`).

## Configuration

Use `civic-audit.config.json` in the project root, or a `civicAudit` key in `package.json`:

```json
{
  "ignore": ["src/legacy/**"],
  "rules": {
    "new-tab-warning": "off",
    "heading-order": "error",
    "third-party-request": "info"
  },
  "npmAudit": false,
  "rendered": "dist"
}
```

`rules` accepts `"off"`, `"info"`, `"warning"` or `"error"` per rule id.

To silence a single, reviewed finding, put a comment on the line above:

```vue
<!-- civic-audit-disable-next-line img-alt -->
<img :src="decorativeShape" role="presentation">
```

```js
// civic-audit-disable-next-line no-inner-html
el.innerHTML = trustedTemplate
```

An existing `<!-- eslint-disable-next-line vue/no-v-html -->` also silences `no-unsanitized-v-html` for that line, since it records the same "reviewed" decision. `civic-audit-disable-file` anywhere in a file skips the whole file.

## From code

```js
import { runAudit, formatReport, formatJson, rules } from 'civic-ui/audit'

const result = await runAudit({ root: process.cwd(), only: 'accessibility', npmAudit: false })
result.summary // { files, errors, warnings, infos, byCategory, byRule, passed }
result.findings // [{ ruleId, category, severity, file, line, column, message, help, wcag, ref, snippet }]
```

## Limits

An automated audit finds a large share of real barriers, not all of them. It can't judge whether alt text is *meaningful*, whether the focus order makes sense, or how a screen reader actually reads the page. Treat a clean run as the floor. Then do the manual passes from [Accessibility → How to verify this yourself](accessibility.md#how-to-verify-this-yourself): keyboard only, NVDA/VoiceOver, and Lighthouse or axe DevTools on the running site.

## How civic-ui tests itself

The library's own test suite runs axe-core (WCAG 2.0-2.2 A/AA rules) against every exported component and section, and against the variants where names and relations are easiest to lose (icon-only buttons, fields in error, title-less dialogs, dark navbars, …). See `test/a11y/axe.spec.js`. `npm test` fails if any of them regresses.

`npm run test:a11y-e2e` then checks what jsdom can't see, on the built playground in headless Chrome: axe-core including color contrast on every route and every example, in the light and the dark color mode; no horizontal scrolling at a 320px viewport (WCAG 1.4.10); zero requests to any other host; and pointer/keyboard checks (a Tooltip stays open while the pointer moves onto it and closes on Escape, a CookieConsent never fully hides the focused element at 1280×600 or 320×256, Dropdown and Popover close when focus leaves them).
