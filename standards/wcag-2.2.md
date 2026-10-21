# WCAG 2.2, Level A and AA

- **Standard:** Web Content Accessibility Guidelines (WCAG) 2.2, W3C Recommendation of 12 December 2024 (also ISO/IEC 40500:2025)
- **Source:** <https://www.w3.org/TR/WCAG22/>
- **Target:** Level AA (all Level A and AA success criteria), plus 4.1.1 Parsing for EN 301 549 V3.2.1
- **Last reviewed:** 2026-10-21

## Verification

| Key | Test |
| --- | --- |
| axe | `test/a11y/axe.spec.js`: axe-core (WCAG 2.0 to 2.2 A/AA) on a fixture for every exported component, including open states |
| e2e | `scripts/a11y-e2e.mjs` (`npm run test:a11y-e2e`): every playground route and example in headless Chromium, light and dark mode |
| unit | Component specs in `test/components/`, `test/composables/`, `test/utils/` |
| style | CSS contract specs in `test/styles/` |

## Success criteria

| SC | Title | Level | Scope | Verified by |
| --- | --- | --- | --- | --- |
| 1.1.1 | Non-text Content | A | Shared | axe; unit (`Avatar`, `HeroSection`, `SvgImage`). Alt text itself is site content |
| 1.2.1 | Audio-only and Video-only (Prerecorded) | A | Site | Media content |
| 1.2.2 | Captions (Prerecorded) | A | Site | Media content |
| 1.2.3 | Audio Description or Media Alternative (Prerecorded) | A | Site | Media content |
| 1.2.4 | Captions (Live) | AA | Site | Media content |
| 1.2.5 | Audio Description (Prerecorded) | AA | Site | Media content |
| 1.3.1 | Info and Relationships | A | Library | axe; unit (`heading-levels`, `form-messages`, `minor-a11y`, `StatCard`, `NotificationCenter`) |
| 1.3.2 | Meaningful Sequence | A | Library | axe; e2e; DOM order equals visual order in every layout |
| 1.3.3 | Sensory Characteristics | A | Site | Instructions in content |
| 1.3.4 | Orientation | AA | Library | e2e reflow; no orientation lock anywhere |
| 1.3.5 | Identify Input Purpose | AA | Shared | unit (`AppointmentSection` autocomplete tokens); `autocomplete` passes through on every field |
| 1.4.1 | Use of Color | A | Library | unit (`Avatar` status shapes, `Navbar` current page marker, `StatCard` trend) |
| 1.4.2 | Audio Control | A | Library | Background video is always muted; unit (`HeroSection`) |
| 1.4.3 | Contrast (Minimum) | AA | Shared | style (`accent-contrast`, `dark-mode`); unit (`palette`); e2e axe. Overridden tokens are the site's responsibility |
| 1.4.4 | Resize Text | AA | Library | rem-based type scale; e2e |
| 1.4.5 | Images of Text | AA | Site | Image content |
| 1.4.10 | Reflow | AA | Library | e2e: every route at 320 CSS px; style (`forced-colors` Tooltip reflow) |
| 1.4.11 | Non-text Contrast | AA | Library | style (`control-contrast`); unit (`palette`) |
| 1.4.12 | Text Spacing | AA | Library | No fixed heights on text containers; e2e |
| 1.4.13 | Content on Hover or Focus | AA | Library | unit (`Tooltip`); e2e Tooltip hover and Escape check |
| 2.1.1 | Keyboard | A | Library | unit (`Tabs`, `DataTable`, `Carousel`, `Modal`, `NotificationCenter`); e2e |
| 2.1.2 | No Keyboard Trap | A | Library | unit (`Modal`, `CookieConsent`, `useClickOutside`) |
| 2.1.4 | Character Key Shortcuts | A | Library | No single-character shortcuts in the library |
| 2.2.1 | Timing Adjustable | A | Library | unit (`useToast`, `ToastContainer`: no auto-close for warning/danger, at least 10 s, pause on hover/focus) |
| 2.2.2 | Pause, Stop, Hide | A | Library | unit (`Carousel`, `HeroSection` video toggle); style (`motion-and-focus`) |
| 2.3.1 | Three Flashes or Below Threshold | A | Library | No flashing animations |
| 2.4.1 | Bypass Blocks | A | Shared | Skip link in `AppShell` and `SiteHeader`; axe |
| 2.4.2 | Page Titled | A | Site | Document title |
| 2.4.3 | Focus Order | A | Library | unit (`focus-handoff`, `Modal`, `Dropdown`, `FileUpload`, `TagInput`) |
| 2.4.4 | Link Purpose (In Context) | A | Shared | New-tab hint on every `newTab` link; link text is content |
| 2.4.5 | Multiple Ways | AA | Site | Site structure (`SearchField`, `Breadcrumb`, `ScrollspyNav` available) |
| 2.4.6 | Headings and Labels | AA | Shared | unit (`heading-levels`): `headingLevel` on every component with headings |
| 2.4.7 | Focus Visible | AA | Library | style (`motion-and-focus`, `forced-colors`) |
| 2.4.11 | Focus Not Obscured (Minimum) | AA | Library | unit (`CookieConsent`); e2e tab walk at 1280×600 and 320×256 |
| 2.5.1 | Pointer Gestures | A | Library | Swipe and drag always have button alternatives (`Carousel`, `Lightbox`, bottom sheet) |
| 2.5.2 | Pointer Cancellation | A | Library | Actions fire on `click` (up event) only |
| 2.5.3 | Label in Name | A | Library | axe; visible labels are part of the accessible name |
| 2.5.4 | Motion Actuation | A | Library | No device-motion input |
| 2.5.7 | Dragging Movements | AA | Library | unit (`Modal` bottom sheet: close button alternative) |
| 2.5.8 | Target Size (Minimum) | AA | Library | style (`control-contrast`: Carousel dots 24×24, sheet handle 44×24); e2e axe |
| 3.1.1 | Language of Page | A | Site | `lang` on `<html>` |
| 3.1.2 | Language of Parts | AA | Shared | unit (`i18n`): every library text from the locale catalog; `LanguageSwitcher` sets `lang`/`hreflang` |
| 3.2.1 | On Focus | A | Library | No context change on focus |
| 3.2.2 | On Input | A | Library | No context change on input; `LanguageSwitcher` uses links |
| 3.2.3 | Consistent Navigation | AA | Site | Page templates |
| 3.2.4 | Consistent Identification | AA | Library | One component per function, one text catalog |
| 3.2.6 | Consistent Help | A | Site | Page templates |
| 3.3.1 | Error Identification | A | Library | unit (`form-messages`, `TextInput`) |
| 3.3.2 | Labels or Instructions | A | Library | unit (`form-messages`: hints, required marker explained) |
| 3.3.3 | Error Suggestion | AA | Shared | `error` prop on every field; message text is content |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | Site | Form flow |
| 3.3.7 | Redundant Entry | A | Site | Form flow |
| 3.3.8 | Accessible Authentication (Minimum) | AA | Shared | Fields never block paste or password managers; authentication flow is the site's |
| 4.1.2 | Name, Role, Value | A | Library | axe; unit (`Tabs`, `Carousel`, `AppButton`, `Sidebar`, `minor-a11y`) |
| 4.1.3 | Status Messages | AA | Library | unit (`ToastContainer`, `Carousel`, `FileUpload`, `AppointmentSection`) |

### 4.1.1 Parsing (EN 301 549 V3.2.1 only)

Obsolete in WCAG 2.2 but still required by EN 301 549 V3.2.1. Scope: **Library**. Verified by axe (`duplicate-id-aria`, `nested-interactive`) and unit tests (`Tabs` unique ids, `Card` no nested links).
