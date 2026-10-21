<script setup>
// Light/dark switch for the page-wide color mode (useColorMode.js). A toggle
// button in the WAI-ARIA sense: the accessible name stays constant ("Dark
// mode") and aria-pressed carries the state, so a screen reader announces
// "Dark mode, toggle button, pressed" instead of a label that flips meaning.
// Inherits `color` from its surroundings, so it reads correctly both in a
// light Navbar and on a `dark` one.
import { useColorMode } from '../../composables/useColorMode'
import { computed } from 'vue'
import { t } from '../../utils/i18n'

const props = defineProps({
  label: { type: String },
  showLabel: { type: Boolean, default: false },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md'].includes(v) }
})
const emit = defineEmits(['change'])
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  label: props.label ?? t('colorMode.label')
}))


const { isDark, toggle } = useColorMode()

function onClick() {
  emit('change', toggle())
}
</script>

<template>
  <button
    type="button"
    class="cui-color-mode-toggle"
    :class="[`cui-color-mode-toggle--${props.size}`, { 'cui-color-mode-toggle--labelled': props.showLabel }]"
    :aria-pressed="isDark ? 'true' : 'false'"
    :aria-label="props.showLabel ? undefined : L.label"
    @click="onClick"
  >
    <svg v-if="isDark" class="cui-color-mode-toggle__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
    <svg v-else class="cui-color-mode-toggle__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2" />
      <path
        d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
    <span v-if="props.showLabel" class="cui-color-mode-toggle__label">{{ L.label }}</span>
  </button>
</template>

<style scoped>
.cui-color-mode-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--cui-space-2);
  width: 4rem;
  height: 4rem;
  padding: 0;
  border: 1.5px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
  background: transparent;
  color: inherit;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color var(--cui-duration) var(--cui-ease),
    border-color var(--cui-duration) var(--cui-ease);
}
.cui-color-mode-toggle:hover {
  border-color: currentColor;
}

.cui-color-mode-toggle--sm {
  width: 3.2rem;
  height: 3.2rem;
}

.cui-color-mode-toggle--labelled {
  width: auto;
  padding-inline: var(--cui-space-3);
}

.cui-color-mode-toggle__icon {
  flex-shrink: 0;
}
</style>
