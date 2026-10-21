# Standards

Civic UI is tested against the standards below. Each file lists the requirements of the current version, what the library does to meet them, and how that is verified. Every component, section and composable must meet every requirement marked **Library** before it is merged (see [CONTRIBUTING.md](../CONTRIBUTING.md)).

| File | Standard | Version | Last reviewed |
| --- | --- | --- | --- |
| [wcag-2.2.md](wcag-2.2.md) | Web Content Accessibility Guidelines | WCAG 2.2 (W3C Recommendation, 12 December 2024), Level A and AA | 2026-10-21 |
| [en-301-549.md](en-301-549.md) | Accessibility requirements for ICT products and services | EN 301 549 V3.2.1 (2021-03) and V4.1.1 (2026-09) | 2026-10-21 |
| [bitv-2.0.md](bitv-2.0.md) | Barrierefreie-Informationstechnik-Verordnung (Germany) | BITV 2.0, as amended 21 May 2019 | 2026-10-21 |
| [gdpr.md](gdpr.md) | General Data Protection Regulation and ePrivacy | GDPR (EU) 2016/679, ePrivacy Directive Art. 5(3), TDDDG § 25 | 2026-10-21 |
| [owasp-asvs-5.0.md](owasp-asvs-5.0.md) | OWASP Application Security Verification Standard | ASVS 5.0.0 (May 2025) | 2026-10-21 |
| [bsi-app-3.1.md](bsi-app-3.1.md) | BSI IT-Grundschutz module APP.3.1 Web Applications and Web Services | IT-Grundschutz-Kompendium, Edition 2023 | 2026-10-21 |

## Scope labels

- **Library**: Civic UI must meet the requirement itself. A failing component blocks a release.
- **Shared**: the library provides the mechanism (props, defaults, documentation); the site has to use it correctly.
- **Site**: depends on content, hosting or organisation. Out of the library's control, documented so site operators know what is left to them.

## Keeping this folder current

These files are maintained by hand. They do not update themselves when a standard changes.

1. Check each standard's publisher at least once per release and whenever a new version is announced (W3C, ETSI and the Official Journal of the EU, gesetze-im-internet.de, EDPB, OWASP, BSI).
2. When a version changes, update the file: version line, requirement list, scope and verification columns.
3. Update the table above, including **Last reviewed**.
4. Add or adjust tests for every new or changed requirement marked **Library**, and fix components that fail.
5. Mention the change under `Unreleased` in [CHANGELOG.md](../CHANGELOG.md).

A review without changes still updates **Last reviewed**.
