# GDPR and ePrivacy

- **Standards:**
  - General Data Protection Regulation (EU) 2016/679 (GDPR)
  - ePrivacy Directive 2002/58/EC, Art. 5(3) (storage and access on terminal equipment)
  - Germany: Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG), § 25
  - Guidance: EDPB Cookie Banner Taskforce report (January 2023), DSK Orientierungshilfe Telemedien
- **Sources:** <https://eur-lex.europa.eu/eli/reg/2016/679/oj>, <https://www.gesetze-im-internet.de/ttdsg/__25.html>
- **Last reviewed:** 2026-10-21

## Requirements

| Provision | Requirement | Scope | How Civic UI meets it | Verified by |
| --- | --- | --- | --- | --- |
| Art. 5(1)(c), Art. 25 | Data minimisation, data protection by design and by default | Library | Zero requests to third-party hosts by default; fonts self-hosted; no analytics, no telemetry | e2e: third-party request count must be 0 (`scripts/a11y-e2e.mjs`); `cli` audit rule against CDN imports |
| Art. 5(3) ePrivacy, § 25 TDDDG | Only strictly necessary storage without consent | Library | `localStorage` is used for two user-requested settings only: the consent decision (`useCookieConsent`) and the chosen color mode (`useColorMode`, can be disabled with `persist: false`). No cookies | unit (`useCookieConsent`, `useColorMode`) |
| Art. 4(11), Art. 6(1)(a), Art. 7 | Consent is informed, specific, unambiguous and freely given | Shared | `CookieConsent` offers *Accept all* and *Necessary only* with equal weight by default; consent per category and per policy `version`; expiry via `maxAgeDays` | unit (`CookieConsent`, `useCookieConsent`) |
| Art. 7(3) | Withdrawing consent is as easy as giving it | Library | `ConsentEmbed` offers one-click revocation next to the embed; `useCookieConsent().reset()`, `revokeEmbedConsent()` | unit (`ConsentEmbed`) |
| Art. 13 | Information at the time of collection | Shared | `ConsentEmbed` names the provider and links its privacy policy before loading; privacy policy text is the site's | unit (`ConsentEmbed`) |
| Art. 44 ff. | Transfers to third countries | Site | Nothing is transferred by the library; embeds load only after consent | e2e |
| Art. 32 | Security of processing | Shared | See [owasp-asvs-5.0.md](owasp-asvs-5.0.md) and [bsi-app-3.1.md](bsi-app-3.1.md) | |

## Site responsibilities

Privacy policy, records of processing, legal basis for forms (`AppointmentSection`, `NewsletterSection`), server-side storage and retention, and the configuration of any analytics loaded after consent.
