<script setup>
// Term/value pairs as a real <dl>: facts, bank details, contact data.
//   layout 'inline'  term and value side by side (a max-content | 1fr grid),
//                    stacking below 480px
//          'stacked' small uppercase term above its value
// items[]: { term, value, href?, newTab?, emphasis?, copyable? }
//   emphasis  a larger, heavier value (an IBAN, an amount)
//   copyable  a copy button that puts the value on the clipboard and confirms
//             with a toast (useToast: needs a <ToastContainer> in the app)
import CuiLink from '../internal/CuiLink.vue'
import NewTabHint from '../internal/NewTabHint.vue'
import { useToast } from '../../composables/useToast'
import { t } from '../../utils/i18n'

defineProps({
  items: { type: Array, default: () => [] },
  layout: { type: String, default: 'inline', validator: (v) => ['inline', 'stacked'].includes(v) },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) }
})

const toast = useToast()

async function copy(item) {
  const value = String(item.value ?? '')
  try {
    await navigator.clipboard.writeText(value)
    toast.success(t('descriptionList.copied', { term: item.term }))
  } catch {
    toast.danger(t('descriptionList.copyFailed', { term: item.term }))
  }
}
</script>

<template>
  <dl class="cui-description-list" :class="[`cui-description-list--${layout}`, `cui-description-list--${size}`]">
    <div v-for="(item, i) in items" :key="i" class="cui-description-list__row">
      <dt class="cui-description-list__term">{{ item.term }}</dt>
      <dd class="cui-description-list__value" :class="{ 'cui-description-list__value--emphasis': item.emphasis }">
        <CuiLink v-if="item.href" :href="item.href" :new-tab="item.newTab" class="cui-description-list__link">{{ item.value }}<NewTabHint v-if="item.newTab" /></CuiLink>
        <span v-else>{{ item.value }}</span>
        <button
          v-if="item.copyable"
          type="button"
          class="cui-description-list__copy"
          :aria-label="t('descriptionList.copy', { term: item.term })"
          @click="copy(item)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
          </svg>
        </button>
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.cui-description-list {
  margin: 0;
  font-size: 1.6rem;
}
.cui-description-list--sm {
  font-size: 1.4rem;
}
.cui-description-list--lg {
  font-size: 1.8rem;
}
.cui-description-list__term {
  font-weight: 700;
  color: var(--cui-text-muted);
}
.cui-description-list__value {
  display: flex;
  align-items: center;
  gap: var(--cui-space-2);
  margin: 0;
  color: var(--cui-text);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.cui-description-list__value--emphasis {
  font-size: 1.25em;
  font-weight: 700;
  color: var(--cui-heading);
}
.cui-description-list__link {
  color: var(--cui-link);
}
.cui-description-list__link:hover {
  color: var(--cui-link-hover);
}

/* inline: one grid for all rows, so every value starts on the same line */
.cui-description-list--inline {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: var(--cui-space-5);
  row-gap: var(--cui-space-2);
}
.cui-description-list--inline .cui-description-list__row {
  display: contents;
}
@media (max-width: 479px) {
  .cui-description-list--inline {
    grid-template-columns: 1fr;
    row-gap: 0;
  }
  .cui-description-list--inline .cui-description-list__value {
    margin-bottom: var(--cui-space-3);
  }
}

/* stacked: small uppercase term above the value */
.cui-description-list--stacked .cui-description-list__row + .cui-description-list__row {
  margin-top: var(--cui-space-4);
}
.cui-description-list--stacked .cui-description-list__term {
  margin-bottom: var(--cui-space-1);
  font-size: 0.75em;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.cui-description-list__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 3.2rem;
  height: 3.2rem;
  padding: 0;
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
  background: transparent;
  color: var(--cui-text-muted);
  cursor: pointer;
}
.cui-description-list__copy:hover {
  color: var(--cui-text);
  border-color: var(--cui-border-strong);
}
.cui-description-list__copy:focus-visible {
  outline: 2px solid var(--cui-focus-ring);
  outline-offset: 2px;
}
</style>
