<script setup>
// The "DE | EN" language toggle common in the utility strip of
// institutional sites: plain-text codes, no flag icons (flags are a poor
// proxy for language and often licensed artwork anyway). The default slot
// (scoped with `{ lang, active }`) replaces an item's text, e.g. to add the
// standard icons for "Leichte Sprache" / "Gebärdensprache" links that German
// public-sector sites are required to offer. An item's `lang` overrides the
// lang/hreflang attributes, since such entries aren't language codes
// (`{ code: 'ls', lang: 'de-x-ls', label: 'Leichte Sprache', href }`).
import { computed } from 'vue'
import NewTabHint from '../internal/NewTabHint.vue'
import { t } from '../../utils/i18n'
import CuiLink from '../internal/CuiLink.vue'

const props = defineProps({
  languages: { type: Array, required: true }, // [{ code, label?, href, newTab?, lang? }]
  current: { type: String, required: true },
  ariaLabel: { type: String }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  ariaLabel: props.ariaLabel ?? t('languageSwitcher.label')
}))


const items = computed(() => (Array.isArray(props.languages) ? props.languages.filter((l) => l && l.code) : []))
</script>

<template>
  <nav class="cui-lang-switch" :aria-label="L.ariaLabel">
    <CuiLink
      v-for="lang in items"
      :key="lang.code"
      :href="lang.href"
      :new-tab="lang.newTab"
      class="cui-lang-switch__item"
      :class="{ 'cui-lang-switch__item--active': lang.code === current }"
      :aria-current="lang.code === current ? 'true' : undefined"
      :lang="lang.lang || lang.code"
      :hreflang="lang.lang || lang.code"
    >
      <slot :lang="lang" :active="lang.code === current">{{ lang.label || String(lang.code).toUpperCase() }}</slot><NewTabHint v-if="lang.newTab" />
    </CuiLink>
  </nav>
</template>

<style scoped>
.cui-lang-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 1.2rem;
  font-weight: 700;
}

/* Every item in the full inherited color: the switcher sits on whatever
   the surrounding bar paints (TopBar's navy, a light header, a theme band),
   and dimming that by opacity fell below 4.5:1 on muted or mid-tone
   backgrounds. The current language differs by a heavier underline (and
   aria-current), not by color. */
.cui-lang-switch__item {
  color: inherit;
  text-decoration: none;
  padding: 0.3rem 0.6rem;
  border-radius: var(--cui-radius-sm);
}

.cui-lang-switch__item + .cui-lang-switch__item {
  margin-left: -0.2rem;
}

.cui-lang-switch__item:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cui-lang-switch__item--active {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
</style>
