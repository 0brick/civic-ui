# BITV 2.0

- **Standard:** Barrierefreie-Informationstechnik-Verordnung (BITV 2.0), German federal ordinance under § 12d BGG, as amended on 21 May 2019
- **Source:** <https://www.gesetze-im-internet.de/bitv_2_0/>
- **Applies to:** websites, mobile apps and electronic administrative processes of federal public bodies. State ordinances (Landesverordnungen) follow the same pattern. Private products and services fall under the BFSG with EN 301 549 as the technical reference.
- **Last reviewed:** 2026-10-21

## Requirements

| Provision | Requirement | Scope | How Civic UI meets it |
| --- | --- | --- | --- |
| § 3 | Conformity with harmonised standards, i.e. EN 301 549 | Library / Shared / Site | See [en-301-549.md](en-301-549.md) and [wcag-2.2.md](wcag-2.2.md) |
| § 4 with Annex 2 Part 1 | Information on the start page in German Sign Language (DGS) | Site | Video content. Embed it with `ConsentEmbed` or a self-hosted video |
| § 4 with Annex 2 Part 2 | Information on the start page in Easy Language (Leichte Sprache) | Site | Text content. `LanguageSwitcher` supports an Easy Language entry (`{ code: 'ls', lang: 'de', label: 'Leichte Sprache' }`) |
| § 7 with § 12b BGG | Accessibility statement (Erklärung zur Barrierefreiheit), reachable from every page | Site | Link it via `SiteFooter` `legalLinks` |
| § 7 with § 12b BGG | Feedback mechanism for reporting barriers | Site | Can be built with the form components (`TextInput`, `AppointmentSection`) |
| § 7 with § 16 BGG | Link to the conciliation body (Schlichtungsstelle) | Site | Part of the accessibility statement |

## Verification

The technical requirements are verified through EN 301 549. The organisational duties in §§ 4 and 7 cannot be verified by the library; [docs/accessibility.md](../docs/accessibility.md#what-stays-the-consuming-projects-responsibility) lists them for site operators.
