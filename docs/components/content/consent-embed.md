# ConsentEmbed

Third-party content (a YouTube or Vimeo video, an OpenStreetMap, any other iframe) that only loads after the visitor asked for it. Until then nothing is requested from the third party: the component shows an optional local poster image, a note naming the provider and that loading transmits the visitor's IP address, and a load button. That keeps a page within the library's [zero third-party requests](../../accessibility.md#privacy-and-third-party-requests-gdpr-and-bsi) default even with embedded media.

## Import

```js
import { ConsentEmbed, revokeEmbedConsent } from 'civic-ui'
```

## YouTube video

`provider="youtube"` with a `videoId` loads the player from `youtube-nocookie.com` (YouTube's privacy-enhanced mode) and starts playback with the same click. A `poster` (a local image, not YouTube's thumbnail URL, which would itself be a request to Google) is darkened so the note stays legible:

```vue
<script setup>
import { ConsentEmbed } from 'civic-ui'
import poster from './concert-poster.jpg'
</script>

<template>
  <ConsentEmbed provider="youtube" video-id="dQw4w9WgXcQ" :poster="poster" title="Christmas concert 2025 (recording)" />
</template>
```

Vimeo works the same way (`provider="vimeo"`, numeric `videoId`) and gets `dnt=1` (Vimeo's do-not-track flag).

## Map

`provider="osm"` takes an OpenStreetMap embed URL as `src` (from openstreetmap.org → Share → HTML). Below is the consent-gated map the [MediaTextSection](../../sections/media-text-section.md#custom-visual-eg-a-map) docs recommend:

```vue
<ConsentEmbed
  provider="osm"
  src="https://www.openstreetmap.org/export/embed.html?bbox=13.30%2C52.45%2C13.50%2C52.55"
  title="Nordholm service area"
  ratio="1/1"
/>
```

`provider="iframe"` (the default) accepts any `https` embed URL; the provider name in the note is then the URL's host unless you pass `providerName`.

## Remembering the choice

With `remember`, a checkbox "Always load content from YouTube" sits under the button. A load with the box ticked is stored per provider through [`useCookieConsent`](../../composables.md) (storage key `cui-consent-embed:<provider>`, or `cui-consent-embed:<host>` for `iframe`); every `ConsentEmbed` of that provider with `remember` then loads right away, without autoplay.

Withdrawing that consent is as easy as giving it (GDPR Art. 7(3)): while a remembered consent exists, the caption under every such embed shows a button "Stop always loading content from YouTube". One click deletes the stored choice, and every remembered embed of that provider on the page unloads at once, back to the placeholder. To offer the same on your privacy page, call `revokeEmbedConsent(provider)`, `provider` is `'youtube'`, `'vimeo'`, `'osm'`, or the embed URL's host for `provider="iframe"`:

```vue
<script setup>
import { AppButton, revokeEmbedConsent } from 'civic-ui'
</script>

<template>
  <AppButton variant="outline" @click="revokeEmbedConsent('youtube')">Stop always loading YouTube videos</AppButton>
</template>
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `provider` | `'youtube' \| 'vimeo' \| 'osm' \| 'iframe'` | `'iframe'` | |
| `videoId` | `string` | `''` | `youtube`/`vimeo`. An id that doesn't look like one disables the button. |
| `src` | `string` | `''` | `osm`/`iframe`: the embed URL; only `http(s)` URLs load. |
| `title` | `string` |, (required) | The iframe's accessible name, also shown in the placeholder. |
| `poster` | `string` | `''` | A local preview image behind the note. |
| `ratio` | `string` | `'16/9'` | Aspect ratio of placeholder and iframe, e.g. `'4/3'`, `'1/1'`. |
| `providerName` | `string` | per provider | Name in the note, e.g. `'YouTube (Google)'`; for `iframe` the host. |
| `consentText` | `string` | from i18n | Replaces the note. |
| `loadLabel` | `string` | from i18n | Replaces the button label. |
| `externalLink` | `{ label?, href } \| boolean` | `true` | A link to the content on the provider's site below the frame (new tab). `true` builds one for `youtube`/`vimeo`/`osm`; `false` hides it. |
| `remember` | `boolean` | `false` | Shows the "always load" checkbox and, once remembered, the revoke button: see above. |

## Localization

The texts come from the [i18n catalog](../../accessibility.md#language-and-labels-wcag-312), `{provider}` is filled in:

| Key | Default |
|---|---|
| `consentEmbed.text` | `'This content is provided by {provider}. Loading it transmits your IP address to {provider}.'` |
| `consentEmbed.loadVideo` / `loadMap` / `load` | `'Play video'` / `'Load map'` / `'Load content'` |
| `consentEmbed.remember` | `'Always load content from {provider}'` |
| `consentEmbed.revoke` | `'Stop always loading content from {provider}'` |
| `consentEmbed.external` | `'Open on {provider}'` |

## Accessibility notes

The load button is described by the privacy note (`aria-describedby`), so a screen reader announces what loading means. After the click, focus moves to the loaded iframe instead of being lost with the removed button. The poster is decorative (`alt=""`): the `title` is shown as text. The external link carries the usual new-tab hint. After a revoke, focus moves to the load button that replaces the iframe.

## Security notes

The iframe exists only after consent, gets `referrerpolicy="strict-origin-when-cross-origin"` and `loading="lazy"`, and its `src` must be `http(s)`. Add the provider's host to your CSP's `frame-src` (`https://www.youtube-nocookie.com`, `https://player.vimeo.com`, `https://www.openstreetmap.org`): see [Security](../../security.md).
