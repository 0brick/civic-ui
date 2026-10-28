# Contributing to Civic UI

Civic UI is used on public-sector websites, where accessibility, privacy and security are legal requirements, not polish. Contributions are welcome as long as they keep that promise.

## Principles

1. **Every requirement, every time.** Each component, each section and every detail of them (every prop, variant, state and slot) must meet every requirement marked **Library** in [`standards/`](standards/README.md): WCAG 2.2 AA, EN 301 549, BITV 2.0, GDPR, OWASP ASVS 5.0 and BSI IT-Grundschutz APP.3.1. A change that breaks one requirement is not merged, however small.
2. **Tested, not assumed.** A requirement counts as met only when a test proves it: a unit test, the axe fixture, a CSS contract test or the browser run in `scripts/a11y-e2e.mjs`. New behavior comes with the test that verifies it.
3. **No third-party requests.** Nothing in the library may contact another host on its own. Fonts, icons and images are bundled; external content loads only after consent.
4. **Tokens only.** Components read colors, spacing, radii and type from `--cui-*` custom properties. No hard-coded colors.
5. **Variants over duplicates.** Prefer a new prop on an existing component over a near-duplicate component.
6. **Small and readable.** No runtime dependencies besides Vue. Short, precise comments that explain *why*, not *what*.

## Ways to contribute

- **Bugs and feature requests:** open an [issue](https://github.com/0brick/civic-ui/issues).
- **Security vulnerabilities:** never in a public issue. See [SECURITY.md](SECURITY.md).
- **Documentation:** fixes to [`docs/`](docs/README.md) are welcome as small, standalone pull requests.
- **Code:** bug fixes, new components or sections, accessibility and security improvements.

## Setup

```bash
git clone https://github.com/0brick/civic-ui.git
cd civic-ui
npm install
npm run dev
```

`npm run dev` opens the playground at `http://localhost:5173`. See [`playground/README.md`](playground/README.md) for how examples are organised.

## Adding or changing a component

1. Implement it in `src/components/<group>/` or `src/sections/`, reading only from the design tokens.
2. Export it from `src/index.js`: the import, the named export and the `Cui*` entry in the plugin's `components` map.
3. Put every visible and screen-reader-only text into `src/locales/en.js` **and** `src/locales/de.js`.
4. Write tests in `test/` and add an axe fixture in `test/a11y/axe.spec.js` (the suite fails for an exported component without one). Cover open, empty and error states.
5. Write the doc page in `docs/components/<group>/` or `docs/sections/` and add one line to [`docs/README.md`](docs/README.md).
6. Add the registry entry and example files to the playground (`playground/src/registry/`, `playground/src/examples/`).
7. Run `npm run docs:index` to regenerate [`docs/component-index.md`](docs/component-index.md).

## Before opening a pull request

All of these must pass. CI runs them on every pull request and once a week on `main`.

```bash
npm run lint
npm test
npm run build:lib
npm run docs:index -- --check
npm run test:a11y-e2e
```

`test:a11y-e2e` needs Node 22+ and Chrome or Chromium (on `PATH`, or set `CHROME_PATH`). It builds the playground and opens every route and example in light and dark mode. It fails on any axe violation, any page wider than a 320px viewport, any request to another host, and any failed interaction check. Options are documented at the top of `scripts/a11y-e2e.mjs`.

Automated tests cannot catch everything. For changes to interaction or semantics, also check with a keyboard only and with a screen reader (NVDA with Firefox, or VoiceOver with Safari) and say in the pull request what you tested.

## Code style

- Match the surrounding code. Prettier is configured for editors and new files, but has not been applied to the whole repository; do not run `npm run format` across it.
- One prop per line in `defineProps`, enum props with an inline `validator`.
- Root class `cui-<kebab-name>`, BEM-style `__element` and `--modifier`, scoped CSS.
- Respect `prefers-reduced-motion` and `forced-colors` in every new style.
- Comments are short and in English.

## Pull requests

- One component or fix per pull request.
- Commit messages: short, plain, imperative ("Add RadioGroup", "Fix Tooltip reflow at 320px").
- Fill in the checklist in the pull request template.
- Add a line under `Unreleased` in [CHANGELOG.md](CHANGELOG.md).

## Updating the standards

The files in [`standards/`](standards/README.md) describe the current version of each standard and are maintained by hand. When a standard changes, follow the procedure in [`standards/README.md`](standards/README.md#keeping-this-folder-current): update the file, the review date, the tests and the components, in that order.

## Releasing (maintainers)

The version bump goes through a pull request like any other change.

1. On `main`, run `npm run release -- patch` (or `minor`, `major`, `x.y.z`). It updates the version, moves the `Unreleased` entries in `CHANGELOG.md` under it and pushes a `release/vX.Y.Z` branch.
2. Open the pull request from the link it prints and merge it when CI is green.
3. Run `npm run release -- tag`. It tags the merge commit and pushes the tag.

The `Release` workflow takes it from there: it publishes the package to npm, creates the GitHub release with the changelog section as notes and deploys the playground. It refuses tags that don't match `package.json` or don't point to a commit on `main`. Publishing uses npm trusted publishing, so there is no npm token in the repository.

For a prerelease, use `npm run release -- prerelease --preid beta`. It is published under the `next` tag on npm, leaves `CHANGELOG.md` alone and doesn't deploy the playground.

To redeploy the playground without a release, run the `Pages` workflow by hand.

## License

By contributing, you agree that your contribution is licensed under the [MIT license](LICENSE).
