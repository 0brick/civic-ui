# Security Policy

Civic UI is built for public-sector frontends and is tested against **OWASP ASVS 5.0**, **BSI IT-Grundschutz APP.3.1** and the data-minimisation principle of the **GDPR**. The requirement lists are in [`standards/`](standards/README.md); [`docs/security.md`](docs/security.md) explains the untrusted-data sinks the library exposes, how they are sanitized by default, and how to plug in your own sanitizer via `configureSecurity()`.

## Supported versions

| Version | Supported |
| --- | --- |
| 1.x | Yes |
| < 1.0 | No |

Security fixes are released for the latest 1.x version.

## Reporting a vulnerability

**Do not open a public issue for a security vulnerability.**

Report it privately, either through [GitHub private vulnerability reporting](https://github.com/0brick/civic-ui/security/advisories/new) or by email to **felixlohse@proton.me**. Please include:

- a description of the vulnerability and its impact,
- steps to reproduce (a minimal repository or snippet is ideal),
- the affected version(s) of `civic-ui`.

You will get an acknowledgement within **5 business days**. Confirmed issues are fixed within **30 days**, with a disclosure date agreed with you. Credit is given in the release notes unless you prefer to stay anonymous.

Bugs that are not exploitable security issues go to the public tracker: <https://github.com/0brick/civic-ui/issues>.

## Scope

In scope: the library source under `src/` and the CLI under `cli/` as published to npm, including the build output in `dist/`.

Out of scope: the `playground/` demo app (not published), and attacks that require an already compromised build pipeline or a malicious dependency (report those upstream).

Props documented as developer-authored only (for example an `icon` prop that takes a literal SVG string) are sanitized by default anyway. Feeding them untrusted data yourself and observing the documented behavior is not a vulnerability, but a report that the default could be safer is welcome.
