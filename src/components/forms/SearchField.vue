<script setup>
// The site-search input pattern: icon, text field and submit button in one
// pill-shaped control. Emits `search` on submit so a page can route to a
// results page or filter data in place.
import { useId } from '../../composables/useId'
import { computed } from 'vue'
import { t } from '../../utils/i18n'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String },
  placeholder: { type: String },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  maxlength: { type: Number, default: 256 } // 0 = no limit
})
const emit = defineEmits(['update:modelValue', 'search'])
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  label: props.label ?? t('searchField.label'),
  placeholder: props.placeholder ?? t('searchField.placeholder')
}))


const id = useId('search')
</script>

<template>
  <form class="cui-search-field" :class="`cui-search-field--${size}`" role="search" :aria-label="L.label" @submit.prevent="emit('search', modelValue)">
    <!-- a11y: the search landmark is named by the label too, so several on one
         page (site search + a table filter) are told apart: give each its own. -->
    <label :for="id" class="cui-visually-hidden">{{ L.label }}</label>
    <svg class="cui-search-field__icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" stroke-width="1.8" />
      <path d="M13.2 13.2L18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
    </svg>
    <input
      :id="id"
      type="search"
      class="cui-search-field__input"
      :value="modelValue"
      :placeholder="L.placeholder"
      :maxlength="maxlength > 0 ? maxlength : undefined"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <button type="submit" class="cui-search-field__submit" :aria-label="L.label">
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 10h12m0 0l-5-5m5 5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
  </form>
</template>

<style scoped>
.cui-search-field {
  display: flex;
  align-items: center;
  gap: var(--cui-space-2);
  background: var(--cui-surface);
  border: 1.5px solid var(--cui-border-control);
  border-radius: var(--cui-radius-pill);
  padding-left: var(--cui-space-4);
  transition: border-color var(--cui-duration) var(--cui-ease);
}

.cui-search-field:focus-within {
  border-color: var(--cui-color-teal);
}

.cui-search-field__icon {
  flex-shrink: 0;
  color: var(--cui-color-grey-500);
}

.cui-search-field__input {
  flex: 1;
  min-width: 0;
  /* a11y (WCAG 1.4.10): a percentage width lets the field's min-content
     drop to zero (inputs are "compressible"), so the whole control can
     shrink inside a flex row (Toolbar) instead of pushing a 320px page
     sideways; its natural width stays the browser's default. */
  width: 100%;
  border: none;
  background: none;
  font: inherit;
  padding-block: 0.8rem;
}
/* The wrapper's border carries the focus state; this transparent outline is
   the forced-colors fallback (see TextInput), where border colors are forced. */
.cui-search-field__input:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.cui-search-field__submit {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.8rem;
  height: 3.8rem;
  margin: 0.3rem;
  border: none;
  border-radius: 50%;
  background: var(--cui-primary);
  color: var(--cui-primary-contrast);
  cursor: pointer;
  transition: background-color var(--cui-duration) var(--cui-ease);
}
.cui-search-field__submit:hover {
  background: var(--cui-primary-hover);
}

.cui-search-field--sm .cui-search-field__input {
  padding-block: 0.6rem;
  font-size: 1.3rem;
}
.cui-search-field--sm .cui-search-field__submit {
  width: 3.2rem;
  height: 3.2rem;
}

.cui-search-field--lg .cui-search-field__input {
  padding-block: 1.05rem;
  font-size: 1.7rem;
}
.cui-search-field--lg .cui-search-field__submit {
  width: 4.4rem;
  height: 4.4rem;
}
</style>
