# OWASP ASVS 5.0

- **Standard:** OWASP Application Security Verification Standard 5.0.0 (May 2025)
- **Source:** <https://github.com/OWASP/ASVS/tree/master/5.0>
- **Target:** every Level 1 and Level 2 requirement a client-side component library can affect. Server, API, authentication and session requirements belong to the site.
- **Last reviewed:** 2026-10-21

## Requirements

| ID | Level | Requirement (summary) | Scope | How Civic UI meets it | Verified by |
| --- | --- | --- | --- | --- | --- |
| 1.2.1 | L1 | Context-aware output encoding for HTML, attributes and CSS | Library | Vue text interpolation everywhere; CSS `url()` values built by `sanitizeCssUrl()`; `applyPalette()` accepts only `--cui-*` names and parsed colors | `test/utils/security.spec.js`, `test/utils/palette.spec.js` |
| 1.2.2 | L1 | Encode dynamic URLs, allow only safe protocols | Library | `sanitizeUrl()` and `sanitizeMediaUrl()` scheme allowlists on every `href`, `src` and `poster` | `test/utils/security.spec.js` |
| 1.3.1 | L1 | Sanitize untrusted HTML with a well-known library or framework feature | Shared | Every `v-html` goes through `sanitizeHtml()`; built-in allowlist, DOMPurify pluggable via `configureSecurity()` | `test/utils/security.spec.js`; ESLint `vue/no-v-html` with documented exceptions |
| 1.3.2 | L1 | No `eval()` or dynamic code execution | Library | None in the library; CLI audit flags it in consumer code | `test/audit/audit.spec.js` |
| 1.3.3 | L2 | Bound and restrict input before it reaches a dangerous context | Library | Length and count limits in `TagInput`, `FileUpload`, `AppointmentSection`, `NewsletterSection` | `test/components/form-limits.spec.js`, `test/components/FileUpload.spec.js` |
| 1.3.4 | L2 | Sanitize user-supplied SVG | Library | `sanitizeHtml()` drops scripts, event handlers, `foreignObject` and external references | `test/utils/security.spec.js` |
| 1.3.5 | L2 | Sanitize scriptable content such as CSS | Library | No style attributes from data; CSS values parsed before use | `test/utils/color.spec.js`, `test/utils/palette.spec.js` |
| 3.2.2 | L1 | Render text with safe functions, never as HTML | Library | Text props are interpolated, never passed to `v-html` | ESLint, review |
| 3.2.3 | L3 | Prevent DOM clobbering and prototype lookups | Library | `hasOwn()` for data-keyed lookups; frozen shared tables | `test/utils/security.spec.js` |
| 3.4.3 | L2 | Content Security Policy restricting script sources | Shared | Works under `script-src 'self'`; `applyPalette()` takes a nonce. Header is set by the site ([docs/security.md](../docs/security.md#recommended-http-security-headers-servercdn-side)) | Documentation |
| 3.4.5 | L2 | Referrer policy | Library | `referrerpolicy` on every library `<img>`, `strict-origin-when-cross-origin` by default | `test/utils/security.spec.js` |
| 3.5.5 | L2 | Validate `postMessage` origins | Library | The library registers no `message` listener | Review |
| 3.6.1 | L3 | External resources only with SRI, or not at all | Library | No external resources; fonts bundled | e2e third-party request count |
| 3.7.1 | L2 | Only supported client-side technologies | Library | Vue 3 and web standards only | |
| 3.7.2 | L2 | Redirects only to allowlisted targets | Site | The library performs no redirects | |
| 5.2.1, 5.2.2 | L1 | File size and type limits on upload | Shared | `FileUpload` enforces `maxSize`, `accept` and `maxFiles` on the client and documents that the server must enforce them again | `test/components/FileUpload.spec.js` |
| 14.2.1 | L1 | No sensitive data in URLs | Library | Forms emit data to the app; nothing is put into URLs | Review |
| 14.2.3 | L2 | No sensitive data to untrusted third parties | Library | Zero third-party requests | e2e |
| 14.3.3 | L2 | No sensitive data in browser storage | Library | Only the consent decision and color mode are stored | `test/composables/` |
| 15.2.1 | L1 | Components free of known vulnerabilities | Shared | No runtime dependencies besides the `vue` peer; `npm audit` in the CLI audit; `npm run sbom` | CI |

## Not applicable to the library

V2 business logic, V4 API and web service, V6 authentication, V7 session management, V8 authorization, V9 tokens, V10 OAuth, V11 cryptography, V12 secure communication, V13 configuration, V16 logging and V17 WebRTC are server or application concerns.
