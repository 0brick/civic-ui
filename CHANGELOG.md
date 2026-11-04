# Changelog

All notable changes to this project are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Source Serif 4 ships as one variable font file per script for weights 600 and 700 instead of two identical copies.

### Fixed

- `civic-ui/style.css` no longer inlines all fonts as base64 (1.3 MB render-blocking stylesheet, about 150 kB now). The fonts ship as separate files in `dist/fonts/`, and the browser fetches only the subsets a page renders. A Content Security Policy no longer needs `font-src data:`.
- `HeroSection` loads its image with `fetchpriority="high"`, since it is usually the largest contentful paint.

## [1.1.0] - 2026-11-04

### Changed

- Default typeface is now IBM Plex Sans (self-hosted variable font, weights 100-700, upright and italic, widths 85%-100%) instead of Fira Sans. `--cui-heading-display-weight` defaults to `700`, the heaviest Plex weight. Set `--cui-font-sans` and add your own `@font-face` rules to keep Fira Sans.

## [1.0.0] - 2026-10-21

First public release of Civic UI.

[Unreleased]: https://github.com/0brick/civic-ui/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/0brick/civic-ui/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/0brick/civic-ui/releases/tag/v1.0.0
