<script setup>
// Third-party content (a YouTube/Vimeo video, an OpenStreetMap, any iframe)
// that only loads after the visitor asked for it: until then nothing is
// requested from the third party, just the optional local `poster`, a note
// naming the provider, and a load button.
//   provider 'youtube'  videoId → youtube-nocookie.com, plays on load
//            'vimeo'    videoId → player.vimeo.com with dnt=1
//            'osm'      src = an openstreetmap.org/export/embed.html URL
//            'iframe'   src = any https embed URL
//   remember shows a "always load from <provider>" checkbox; a ticked load
//            is stored per provider through useCookieConsent (storage key
//            `cui-consent-embed:<provider>`), and later embeds of the same
//            provider load right away. While such a remembered consent
//            exists, the caption offers a button to revoke it (GDPR Art. 7(3));
//            `revokeEmbedConsent(provider)` does the same from code
//
// security / GDPR: the iframe is only rendered after the click (or a stored
// per-provider consent), src must be http(s), and it gets
// referrerpolicy="strict-origin-when-cross-origin".
import { computed, nextTick, ref, watch } from 'vue'
import AppButton from '../button/AppButton.vue'
import { useCookieConsent, embedConsentKey } from '../../composables/useCookieConsent'
import { sanitizeMediaUrl, sanitizeUrl, mediaReferrerPolicy } from '../../utils/security'
import { useId } from '../../composables/useId'
import { t } from '../../utils/i18n'
import NewTabHint from '../internal/NewTabHint.vue'

const props = defineProps({
  provider: { type: String, default: 'iframe', validator: (v) => ['youtube', 'vimeo', 'osm', 'iframe'].includes(v) },
  videoId: { type: String, default: '' },
  src: { type: String, default: '' },
  title: { type: String, required: true },
  poster: { type: String, default: '' },
  ratio: { type: String, default: '16/9' },
  providerName: { type: String, default: '' },
  consentText: { type: String, default: '' },
  loadLabel: { type: String, default: '' },
  // { label?, href }, or false for none; youtube/vimeo/osm get one by default
  externalLink: { type: [Object, Boolean], default: true },
  remember: { type: Boolean, default: false }
})

const PROVIDER_NAMES = { youtube: 'YouTube (Google)', vimeo: 'Vimeo', osm: 'OpenStreetMap' }
const SHORT_NAMES = { youtube: 'YouTube', vimeo: 'Vimeo', osm: 'OpenStreetMap' }

const httpUrl = (url) => {
  const safe = sanitizeUrl(url)
  return typeof safe === 'string' && /^https?:\/\//i.test(safe) ? safe : ''
}
const host = computed(() => {
  try {
    return new URL(httpUrl(props.src)).hostname
  } catch {
    return ''
  }
})

const videoKey = computed(() => {
  if (props.provider === 'youtube') return /^[\w-]{6,20}$/.test(props.videoId) ? props.videoId : ''
  if (props.provider === 'vimeo') return /^\d{1,15}$/.test(props.videoId) ? props.videoId : ''
  return ''
})

// A video autoplays only when the visitor's click loaded it, not when a
// remembered consent loads it with the page.
const clicked = ref(false)
const embedSrc = computed(() => {
  const autoplay = clicked.value ? '&autoplay=1' : ''
  if (props.provider === 'youtube') return videoKey.value ? `https://www.youtube-nocookie.com/embed/${videoKey.value}?rel=0${autoplay}` : ''
  if (props.provider === 'vimeo') return videoKey.value ? `https://player.vimeo.com/video/${videoKey.value}?dnt=1${autoplay}` : ''
  return httpUrl(props.src)
})

const name = computed(() => props.providerName || PROVIDER_NAMES[props.provider] || host.value)
const shortName = computed(() => props.providerName || SHORT_NAMES[props.provider] || host.value)
const isVideo = computed(() => props.provider === 'youtube' || props.provider === 'vimeo')

const link = computed(() => {
  if (props.externalLink === false) return null
  if (props.externalLink && typeof props.externalLink === 'object') {
    const href = httpUrl(props.externalLink.href)
    return href ? { href, label: props.externalLink.label || t('consentEmbed.external', { provider: shortName.value }) } : null
  }
  let href = ''
  if (props.provider === 'youtube' && videoKey.value) href = `https://www.youtube.com/watch?v=${videoKey.value}`
  else if (props.provider === 'vimeo' && videoKey.value) href = `https://vimeo.com/${videoKey.value}`
  else if (props.provider === 'osm') href = 'https://www.openstreetmap.org/'
  return href ? { href, label: t('consentEmbed.external', { provider: shortName.value }) } : null
})

const storageKey = computed(() => embedConsentKey(props.provider === 'iframe' ? host.value || 'iframe' : props.provider))
const store = props.remember ? useCookieConsent({ storageKey: storageKey.value }) : null
// Shared per provider: a consent stored or revoked by another embed (or
// another tab, or revokeEmbedConsent()) reaches this one too.
const remembered = computed(() => !!store && store.hasConsent())

const loaded = ref(remembered.value)
const rememberChoice = ref(false)
const frame = ref(null)
const loadButton = ref(null)
const noteId = useId('cui-consent-embed-note')

const buttonLabel = computed(() => props.loadLabel || t(isVideo.value ? 'consentEmbed.loadVideo' : props.provider === 'osm' ? 'consentEmbed.loadMap' : 'consentEmbed.load'))
const ratioStyle = computed(() => ({ aspectRatio: /^\s*\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?\s*$/.test(props.ratio) ? props.ratio : '16/9' }))

async function load() {
  if (store && rememberChoice.value) store.accept()
  clicked.value = true
  loaded.value = true
  // the button that had focus is gone: hand focus to the content it loaded
  await nextTick()
  frame.value?.focus()
}

// GDPR Art. 7(3): revoking is one click, right where the content is, and it
// takes effect at once: every remembered embed of the provider unloads.
let revoking = false
function revoke() {
  revoking = true
  store?.reset()
}
watch(remembered, (on) => {
  if (on) {
    loaded.value = true // "always load" granted elsewhere: load, without autoplay
    return
  }
  // The revoke button (or the iframe) that had focus is gone: the load
  // button takes it, so focus isn't dropped to <body> (WCAG 2.4.3).
  const refocus = revoking || (!!frame.value && document.activeElement === frame.value)
  revoking = false
  loaded.value = false
  clicked.value = false
  rememberChoice.value = false
  if (refocus) nextTick(() => loadButton.value?.$el?.focus())
})
</script>

<template>
  <figure class="cui-consent-embed">
    <div class="cui-consent-embed__frame" :style="ratioStyle">
      <iframe
        v-if="loaded && embedSrc"
        ref="frame"
        class="cui-consent-embed__iframe"
        :src="embedSrc"
        :title="title"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
      />
      <div
        v-else
        class="cui-consent-embed__placeholder"
        :class="{ 'cui-consent-embed__placeholder--poster': poster }"
        :data-cui-theme="poster ? 'dark' : undefined"
      >
        <img
          v-if="poster"
          class="cui-consent-embed__poster"
          :src="sanitizeMediaUrl(poster)"
          alt=""
          :referrerpolicy="mediaReferrerPolicy()"
        />
        <div class="cui-consent-embed__panel">
          <p class="cui-consent-embed__title">{{ title }}</p>
          <p :id="noteId" class="cui-consent-embed__note">{{ consentText || t('consentEmbed.text', { provider: name }) }}</p>
          <AppButton ref="loadButton" :variant="poster ? 'accent' : 'primary'" :aria-describedby="noteId" :disabled="!embedSrc" @click="load">
            <svg v-if="isVideo" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
              <path d="M7 4.5v15l13-7.5z" />
            </svg>
            {{ buttonLabel }}
          </AppButton>
          <label v-if="remember" class="cui-consent-embed__remember">
            <input v-model="rememberChoice" type="checkbox" />
            {{ t('consentEmbed.remember', { provider: shortName }) }}
          </label>
        </div>
      </div>
    </div>
    <figcaption v-if="link || remembered" class="cui-consent-embed__caption">
      <a v-if="link" :href="link.href" target="_blank" rel="noopener noreferrer">{{ link.label }}<NewTabHint /></a>
      <button v-if="remembered" type="button" class="cui-consent-embed__revoke" @click="revoke">
        {{ t('consentEmbed.revoke', { provider: shortName }) }}
      </button>
    </figcaption>
  </figure>
</template>

<style scoped>
.cui-consent-embed {
  margin: 0;
}
.cui-consent-embed__frame {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--cui-radius-md);
  background: var(--cui-bg-muted);
}
.cui-consent-embed__iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
.cui-consent-embed__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--cui-space-4);
  color: var(--cui-text);
  overflow: auto;
}
.cui-consent-embed__poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* darken the poster so the white note stays legible on any image */
.cui-consent-embed__placeholder--poster::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.62);
}
.cui-consent-embed__placeholder--poster {
  color: var(--cui-text-on-dark, #fff);
}
.cui-consent-embed__panel {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--cui-space-3);
  max-width: 52ch;
  text-align: center;
}
.cui-consent-embed__title {
  margin: 0;
  font-family: var(--cui-font-heading);
  font-weight: var(--cui-heading-weight);
  font-size: 1.8rem;
}
.cui-consent-embed__note {
  margin: 0;
  font-size: 1.4rem;
}
.cui-consent-embed__remember {
  display: inline-flex;
  align-items: center;
  gap: var(--cui-space-2);
  font-size: 1.3rem;
  cursor: pointer;
}
/* WCAG 2.5.8: the box itself is the 24×24 target (the label around it
   toggles too, but only the box counts for the target size). */
.cui-consent-embed__remember input {
  flex-shrink: 0;
  width: 2.4rem;
  height: 2.4rem;
  margin: 0;
  accent-color: var(--cui-focus-ring);
}
.cui-consent-embed__caption {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: var(--cui-space-4);
  margin-top: var(--cui-space-2);
  font-size: 1.3rem;
}
.cui-consent-embed__caption a {
  color: var(--cui-link);
}
/* looks like the link beside it; a button because it acts, not navigates */
.cui-consent-embed__revoke {
  min-height: 2.4rem; /* WCAG 2.5.8 */
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--cui-link);
  text-decoration: underline;
  cursor: pointer;
}
.cui-consent-embed__revoke:hover {
  color: var(--cui-link-hover);
}
/* small embeds (a narrow column): the note scrolls instead of overflowing */
@media (max-width: 479px) {
  .cui-consent-embed__title {
    font-size: 1.6rem;
  }
  .cui-consent-embed__note {
    font-size: 1.3rem;
  }
}
</style>
