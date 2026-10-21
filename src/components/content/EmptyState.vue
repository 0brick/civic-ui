<script setup>
// Zero-data placeholder for a table, search result or dashboard panel: an
// icon, a short explanation and a way out: an `action` link button and/or
// the default slot (a button to clear filters or create the first item).
//   icon  one of a small built-in set, drawn in the Card meta icons' stroke
//         weight; the `icon` slot still overrides it
//   size  'panel' sits inside whatever holds it; 'page' brings its own
//         section spacing and container, for a full page such as a 404
//         (combine with headingLevel=1 so the page has its h1)
import { computed } from 'vue'
import AppButton from '../button/AppButton.vue'

const props = defineProps({
  title: { type: String, required: true },
  text: { type: String, default: '' },
  icon: { type: String, default: 'default', validator: (v) => ['default', 'calendar', 'search', 'inbox', 'document', 'error', 'none'].includes(v) },
  headingLevel: { type: Number, default: 3, validator: (v) => v >= 1 && v <= 4 },
  action: { type: Object, default: null }, // { label, href, newTab? }
  size: { type: String, default: 'panel', validator: (v) => ['panel', 'page'].includes(v) }
})

const headingTag = computed(() => `h${props.headingLevel}`)
// 'default' is the inbox tray, the illustration EmptyState always had
const iconName = computed(() => (props.icon === 'default' ? 'inbox' : props.icon))
</script>

<template>
  <component
    :is="size === 'page' ? 'section' : 'div'"
    class="cui-empty-state"
    :class="[`cui-empty-state--${size}`, { 'cui-section': size === 'page' }]"
  >
    <div :class="size === 'page' ? 'cui-container cui-empty-state__inner' : 'cui-empty-state__inner'">
      <span v-if="$slots.icon || iconName !== 'none'" class="cui-empty-state__icon">
        <slot name="icon">
          <svg
            viewBox="0 0 48 48"
            width="48"
            height="48"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <template v-if="iconName === 'inbox'">
              <rect x="7" y="16" width="34" height="24" rx="2" />
              <path d="M7 24h10l3 5h8l3-5h10" />
              <path d="M14 16l3-8h14l3 8" />
            </template>
            <template v-else-if="iconName === 'calendar'">
              <rect x="7" y="10" width="34" height="30" rx="2" />
              <path d="M7 19h34M16 6v8M32 6v8" />
              <path d="M15 27h4M22 27h4M29 27h4M15 33h4M22 33h4" />
            </template>
            <template v-else-if="iconName === 'search'">
              <circle cx="21" cy="21" r="12" />
              <path d="M30 30l11 11" />
            </template>
            <template v-else-if="iconName === 'document'">
              <path d="M12 6h17l9 9v27H12z" />
              <path d="M29 6v9h9" />
              <path d="M18 24h14M18 30h14M18 36h9" />
            </template>
            <template v-else-if="iconName === 'error'">
              <circle cx="24" cy="24" r="17" />
              <path d="M24 15v11" />
              <path d="M24 32.5v.5" />
            </template>
          </svg>
        </slot>
      </span>
      <component :is="headingTag" class="cui-empty-state__title">{{ title }}</component>
      <p v-if="text" class="cui-empty-state__text">{{ text }}</p>
      <div v-if="action || $slots.default" class="cui-empty-state__actions">
        <AppButton
          v-if="action"
          :variant="size === 'page' ? 'primary' : 'outline'"
          :size="size === 'page' ? 'md' : 'sm'"
          :href="action.href"
          :new-tab="action.newTab"
        >
          {{ action.label }}
        </AppButton>
        <slot />
      </div>
    </div>
  </component>
</template>

<style scoped>
.cui-empty-state__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: var(--cui-text-muted);
}
.cui-empty-state--panel .cui-empty-state__inner {
  padding: var(--cui-space-7) var(--cui-space-4);
}

.cui-empty-state__icon {
  display: inline-flex;
  color: var(--cui-color-grey-500);
  margin-bottom: var(--cui-space-4);
}

.cui-empty-state__title {
  margin: 0 0 var(--cui-space-2);
  font-size: 1.8rem;
  color: var(--cui-heading);
}

.cui-empty-state__text {
  margin: 0;
  max-width: 42ch;
  font-size: 1.4rem;
}

.cui-empty-state__actions {
  margin-top: var(--cui-space-5);
  display: flex;
  gap: var(--cui-space-3);
  flex-wrap: wrap;
  justify-content: center;
}

/* page: a whole page's content (404, "no events") */
.cui-empty-state--page .cui-empty-state__icon svg {
  width: 72px;
  height: 72px;
}
.cui-empty-state--page .cui-empty-state__title {
  font-size: clamp(2.8rem, 2vw + 2rem, 4rem);
  margin-bottom: var(--cui-space-3);
}
.cui-empty-state--page .cui-empty-state__text {
  max-width: 52ch;
  font-size: 1.7rem;
}
.cui-empty-state--page .cui-empty-state__actions {
  margin-top: var(--cui-space-6);
}
</style>
