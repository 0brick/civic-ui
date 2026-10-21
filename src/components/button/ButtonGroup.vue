<script setup>
// Groups a row of AppButtons into one visually joined control (segmented
// button / toolbar pattern). Just wraps children: it doesn't manage state,
// so it works with plain buttons or v-for'd AppButtons alike.
import { computed } from 'vue'
import { t } from '../../utils/i18n'
const props = defineProps({
  vertical: { type: Boolean, default: false },
  ariaLabel: { type: String }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  ariaLabel: props.ariaLabel ?? t('buttonGroup.label')
}))
</script>

<template>
  <div class="cui-btn-group" :class="{ 'cui-btn-group--vertical': vertical }" role="group" :aria-label="L.ariaLabel">
    <slot />
  </div>
</template>

<style scoped>
.cui-btn-group {
  display: inline-flex;
}

.cui-btn-group--vertical {
  flex-direction: column;
}

.cui-btn-group :deep(.cui-btn) {
  border-radius: 0;
}

/* `currentColor`-based rather than a fixed white tint, so the divider stays
   visible whichever AppButton variant is grouped: a light divider would
   disappear against outline/ghost's near-white background. */
.cui-btn-group:not(.cui-btn-group--vertical) :deep(.cui-btn:not(:last-child)) {
  border-right: 1.5px solid color-mix(in srgb, currentColor 25%, transparent);
}

.cui-btn-group--vertical :deep(.cui-btn:not(:last-child)) {
  border-bottom: 1.5px solid color-mix(in srgb, currentColor 25%, transparent);
}

.cui-btn-group:not(.cui-btn-group--vertical) :deep(.cui-btn:first-child) {
  border-top-left-radius: var(--cui-radius-md);
  border-bottom-left-radius: var(--cui-radius-md);
}
.cui-btn-group:not(.cui-btn-group--vertical) :deep(.cui-btn:last-child) {
  border-top-right-radius: var(--cui-radius-md);
  border-bottom-right-radius: var(--cui-radius-md);
}

.cui-btn-group--vertical :deep(.cui-btn:first-child) {
  border-top-left-radius: var(--cui-radius-md);
  border-top-right-radius: var(--cui-radius-md);
}
.cui-btn-group--vertical :deep(.cui-btn:last-child) {
  border-bottom-left-radius: var(--cui-radius-md);
  border-bottom-right-radius: var(--cui-radius-md);
}
</style>
