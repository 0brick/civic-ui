# BSI IT-Grundschutz APP.3.1

- **Standard:** BSI IT-Grundschutz-Kompendium, module APP.3.1 Webanwendungen und Webservices (web applications and web services)
- **Version:** Edition 2023 (1 February 2023)
- **Source:** <https://www.bsi.bund.de/dok/it-grundschutz-kompendium>
- **Last reviewed:** 2026-10-21. Check at every review whether the BSI has replaced the Kompendium edition.

Requirements marked as withdrawn (entfallen) in Edition 2023 are omitted.

## Requirements

| ID | Title | Level | Scope | How Civic UI meets it |
| --- | --- | --- | --- | --- |
| APP.3.1.A1 | Authentisierung (authentication) | Basis | Site | The library contains no authentication. Form fields never block password managers or paste |
| APP.3.1.A4 | Kontrolliertes Einbinden von Dateien und Inhalten (controlled inclusion of files and content) | Basis | Shared | `FileUpload` limits size, type and count on the client; the server must enforce them again. Third-party content only through `ConsentEmbed` |
| APP.3.1.A7 | Schutz vor unerlaubter automatisierter Nutzung (protection against automated misuse) | Basis | Shared | `AppointmentSection` and `NewsletterSection` lock against double submits; rate limiting is server-side |
| APP.3.1.A8 | Systemarchitektur (system architecture) | Standard | Site | |
| APP.3.1.A9 | Beschaffung (procurement): input validation and output encoding considered | Standard | Library | Documented sanitization sinks ([docs/security.md](../docs/security.md)), requirement lists in this folder, SBOM via `npm run sbom` |
| APP.3.1.A11 | Sichere Anbindung von Hintergrundsystemen (secure backend connections) | Standard | Site | |
| APP.3.1.A12 | Sichere Konfiguration (secure configuration): no security-relevant details in errors | Standard | Library | Developer warnings only outside production builds; `configureSecurity()` fails closed and can be locked |
| APP.3.1.A14 | Schutz vertraulicher Daten (protection of confidential data) | Basis | Shared | No secrets in the library; CLI audit flags secrets and `.env` files in consumer code |
| APP.3.1.A20 | Einsatz von Web Application Firewalls | erhöht | Site | |
| APP.3.1.A21 | Sichere HTTP-Konfiguration (secure HTTP configuration: CSP, X-Content-Type-Options, cookie flags) | Standard | Shared | Compatible with a strict CSP; recommended headers in [docs/security.md](../docs/security.md#recommended-http-security-headers-servercdn-side). The library sets no cookies |
| APP.3.1.A22 | Penetrationstest und Revision (penetration test and audit) | Standard | Site | `npx civic-ui audit` supports, but does not replace, a penetration test |

## Verification

`npm test` (security, form limit and audit specs), `npm run lint`, and the CLI audit of consumer projects. See also [owasp-asvs-5.0.md](owasp-asvs-5.0.md).
