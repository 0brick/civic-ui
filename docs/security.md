# Security

Civic UI is built for public-sector deployments and is tested against **OWASP ASVS 5.0** (the frontend requirements of V1 Encoding and Sanitization and V3 Web Frontend Security) and **BSI IT-Grundschutz APP.3.1** (web applications and web services), alongside the [accessibility and privacy conformance](accessibility.md) covered separately. The requirement lists live in [`standards/`](../standards/README.md). See [`SECURITY.md`](../SECURITY.md) for how to report a vulnerability.

## The two untrusted-data sinks, and how they're guarded

Two kinds of component props are the library's only real injection surface, because they render values the *content*, not just the developer's markup, controls:

1. **Raw SVG via `v-html`**: the `icon`/`socialLinks[].icon`/`contactMethods[].icon` props on `Card`, `Sidebar`, `StatCard`, `SiteFooter` and `AppointmentSection`. Meant for developer-authored markup, but in practice these fields often end up wired to a CMS or an API response for a nav/footer that a non-developer maintains.
2. **URLs bound to `href`, `src`/`poster` or a CSS `background-image: url(...)`**: every `href`/`action.href` prop across the library, every image/video prop (`Card` `media`, `Avatar` `src`, `AppButton` image `icon`, `HeroSection` `image`/`video`/`videoPoster`, `MediaTextSection` `image`, `TestimonialSection` avatars, `SvgImage`), and the `image` field on `StepsSection`'s `chain` steps and `TopicSlider` items.

Both sinks route through `src/utils/security.js` instead of binding `v-html`/`:href`/`:src`/`:style` directly. Values that aren't strings (an array or object from JSON, a `URL` object) are checked as the string Vue would render them as: they can't slip past the check.

| Function | Used for | Default behavior |
|---|---|---|
| `sanitizeHtml(value)` | every `v-html` call site | **Allowlist sanitizer** (`src/utils/sanitizeMarkup.js`) for icon markup and simple rich text: SVG shapes, and text/structure tags (paragraphs, headings, lists, links, images, tables, code, quotes) with presentational and accessibility attributes. Link/image URLs go through `sanitizeUrl`/`sanitizeMediaUrl`, `target="_blank"` always gets `rel="noopener noreferrer"`. Dropped: `<script>`/`<style>`/`<iframe>`/`<form>`/`<object>`/`<foreignObject>` (with their content), event handlers, `style` and `name` attributes, external `url(…)` and non-local `<use href>`; other unknown elements are unwrapped, keeping their text. Needs a DOM: during SSR it returns `''` unless you register a sanitizer. |
| `sanitizeUrl(value)` | `href`/`to` bindings | **Scheme allowlist:** `http:`, `https:`, `mailto:`, `tel:` and scheme-less URLs (relative paths, `#fragment`, `?query`, `//host/path`) pass; anything else (`javascript:`, `data:`, `file:`, `intent:`, `ms-msdt:`, `search-ms:`, …) becomes `#`. |
| `sanitizeMediaUrl(value)` | `src`/`poster` bindings | Same allowlist plus `blob:` and `data:image\|video\|audio/…` (never executed as script); anything else becomes `''`, so no request is made. |
| `mediaReferrerPolicy()` | `referrerpolicy` on every library `<img>` | `strict-origin-when-cross-origin`: an external image host sees your origin at most, never the page path or query. |
| `sanitizeCssUrl(value)` | `style="{ backgroundImage: ... }"` | Runs `sanitizeMediaUrl`, then quotes/escapes the result into a `url("...")` string. |
| `linkAttrs(href, newTab)` (internal, `src/utils/links.js`) | links that accept `newTab` | `sanitizeUrl(href)`, plus `target="_blank"` **always paired with** `rel="noopener noreferrer"` (no reverse tabnabbing via `window.opener`). |
| `hasOwn(obj, key)` | internal lookup tables keyed by a data field (`sectionThemes[value]`, `Card`'s `metaIcons[item.icon]`) | `Object.prototype.hasOwnProperty.call`: stops a value like `"constructor"` from resolving through the prototype chain instead of the intended fallback. |

## Plugging in your own sanitizer or backend security method

You don't need to rebuild sanitization from scratch, and you don't need to patch every component that renders an icon or a link. Register your own implementation **once**, at app startup, and every call site above picks it up automatically:

```js
// main.js
import { createApp } from 'vue'
import CivicUI, { configureSecurity } from 'civic-ui'
import DOMPurify from 'dompurify' // or any sanitizer/backend proxy you already run
import App from './App.vue'

configureSecurity({
  // Wire in DOMPurify, or forward to a backend endpoint that sanitizes
  // HTML fragments server-side: anything with the same (string) => string shape.
  sanitizeHtml: (raw) => DOMPurify.sanitize(raw, { USE_PROFILES: { svg: true, svgFilters: true } }),
  // Optional: replace the built-in scheme blocklist with your own
  // backend-driven allowlist (e.g. only same-origin + your CMS host).
  sanitizeUrl: (raw) => myBackendUrlAllowlist(raw)
})

createApp(App).use(CivicUI).mount('#app')
```

`configureSecurity()` accepts `sanitizeHtml`, `sanitizeUrl` and `sanitizeMediaUrl` (functions, or `null` for the built-in default), `allowedUrlSchemes` / `allowedMediaSchemes` (replace the default scheme allowlists, e.g. `['https:', 'mailto:', 'tel:', 'sms:']`) and `referrerPolicy` (e.g. `'no-referrer'`); any option you omit keeps its current value. It **fails closed**: a sanitizer that isn't a function: say the `DOMPurify` object instead of `DOMPurify.sanitize`: throws a `TypeError` instead of silently leaving the default in place. A custom URL sanitizer always receives the value already normalized to a string.

Lock the configuration once your app has set it, so no later script (a compromised dependency, a third-party tag) can switch a sanitizer off again:

```js
configureSecurity({ sanitizeHtml: (raw) => DOMPurify.sanitize(raw) }, { lock: true })
configureSecurity({ sanitizeHtml: null }) // → throws: configureSecurity() is locked
``` This is also the integration point for backend-provided security methods that don't look like a sanitizer function, e.g. call your backend's content-moderation/allowlist API from inside `sanitizeUrl`/`sanitizeHtml` and cache the result, instead of re-implementing that logic in the frontend.

## SSR safety

`Carousel`, `HeroSection`'s reduced-motion check, and the shared `useFocusTrap`/`useScrollLock` composables (used by `Modal` and `CookieConsent`) all defer their `window`/`document` access to `onMounted()` (or guard it with a `typeof document === 'undefined'` check) instead of touching it at `setup()` time, so server-rendering a page that includes them, e.g. from Nuxt: doesn't throw. If you add your own component that reads `window`/`document`/`localStorage` outside an event handler, follow the same pattern (see `useCookieConsent.js` for the `try`/`catch` variant used around `localStorage`, which can also throw in locked-down/private-browsing environments).

## Recommended HTTP security headers (server/CDN-side)

The items below aren't things a component library can set (they're response headers your backend, reverse proxy or static host adds) but a Civic UI-based frontend is built to be compatible with a strict policy: no inline `eval`/`new Function`, no third-party script/style/font hosts by default (see [Accessibility & privacy conformance → Privacy](accessibility.md#privacy-and-third-party-requests-gdpr-and-bsi)), so a strict policy needs only the exceptions listed below.

```
Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

What the policy has to allow for the library itself:

- **`font-src 'self' data:`**: the bundled stylesheet (`civic-ui/style.css`) inlines its self-hosted fonts as `data:font/woff2` URLs. Without `data:` here, the policy blocks every font of the library. (Serving `src/assets/fonts` yourself and dropping `data:` works too.)
- **`applyPalette()`** injects one `<style>` element: pass a nonce (`applyPalette(palette, { nonce })`) and add `'nonce-…'` to `style-src`, or generate the palette at build time and ship it as a stylesheet.
- **Server-side rendering** writes component styles (`--cui-*` custom properties) as `style="…"` attributes, which `style-src 'self'` blocks; client-side rendering sets them through the CSSOM, which CSP doesn't restrict. For SSR, add `'unsafe-hashes'` with the hashes, or `style-src-attr 'unsafe-inline'`.
- **Trusted Types** (`require-trusted-types-for 'script'`): the icon props render through `v-html`, so a Trusted Types policy needs `sanitizeHtml` to return `TrustedHTML`, e.g. `configureSecurity({ sanitizeHtml: (raw) => DOMPurify.sanitize(raw, { RETURN_TRUSTED_TYPE: true }) })`. The built-in default returns plain strings.

`object-src 'none'` and `form-action 'self'` close two more injection paths (plugin content, a form posting to another origin). Adjust `img-src`/`media-src`/`frame-src` for any `video`/`image` URL host (or third-party embed in a slot) you actually use. The playground's `index.html` uses one inline `<script>` (it restores a deep link) and is not meant to run under this policy. Copy-paste starting points:

- **Nginx**: add each line as `add_header <Name> "<value>" always;` in your `server`/`location` block.
- **Netlify**: a `_headers` file with a `/*` block and the same key/value pairs.
- **Node/Express**: the [`helmet`](https://www.npmjs.com/package/helmet) middleware sets sane defaults for most of these in one line (`app.use(helmet())`), then override `contentSecurityPolicy` with the directives above.
- **Apache**: the same pairs via `Header always set <Name> "<value>"` in `.htaccess` or your vhost config.


## Dependencies and SBOM

At runtime the library depends on nothing but its `vue` peer dependency. `npx civic-ui audit` (see [Project audit](audit.md)) runs `npm audit` for your project: runtime dependencies at full severity, dev dependencies (build tool, test runner, a dev server reachable on the network) one level lower. `npm run sbom` in this repository writes a CycloneDX software bill of materials of the runtime dependency tree to `sbom.cdx.json` (`npm sbom`, npm 10+), for a procurement or BSI-style supply-chain review.
