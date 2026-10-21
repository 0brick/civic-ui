<script setup>
import { computed, inject, ref } from 'vue'
import { useId } from '../../composables/useId'

const props = defineProps({
  title: { type: String, required: true },
  // a11y (WCAG 1.3.1): match the page outline. Unset → the parent
  // Accordion's `headingLevel`, else 3.
  headingLevel: { type: Number, default: undefined, validator: (v) => v >= 2 && v <= 6 }
})

const id = useId('accordion')
// Outside an <Accordion> (or before it provides), fall back to a local
// open/closed state instead of crashing, so a lone item still works.
const ownOpen = ref(false)
const accordion = inject('cui-accordion', {
  isOpen: () => ownOpen.value,
  toggle: () => (ownOpen.value = !ownOpen.value)
})
const headingTag = computed(() => `h${props.headingLevel ?? accordion.headingLevel?.() ?? 3}`)
</script>

<template>
  <div class="cui-accordion-item">
    <component :is="headingTag" class="cui-accordion-item__heading">
      <button
        :id="`${id}-trigger`"
        type="button"
        class="cui-accordion-item__trigger"
        :aria-expanded="accordion.isOpen(id)"
        :aria-controls="`${id}-panel`"
        @click="accordion.toggle(id)"
      >
        {{ title }}
        <span class="cui-accordion-item__icon" aria-hidden="true" />
      </button>
    </component>
    <!-- a11y (WCAG 4.1.2): a region needs a name; its trigger's text. -->
    <div
      :id="`${id}-panel`"
      class="cui-accordion-item__panel"
      :class="{ 'cui-accordion-item__panel--open': accordion.isOpen(id) }"
      role="region"
      :aria-labelledby="`${id}-trigger`"
      :aria-hidden="!accordion.isOpen(id)"
      :inert="!accordion.isOpen(id)"
    >
      <div class="cui-accordion-item__panel-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cui-accordion-item {
  border-bottom: 1px solid var(--cui-border);
}

.cui-accordion-item__heading {
  margin: 0;
}

.cui-accordion-item__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cui-space-3);
  padding: var(--cui-space-4) 0;
  background: none;
  border: none;
  text-align: left;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--cui-text);
  cursor: pointer;
}

.cui-accordion-item__icon {
  flex-shrink: 0;
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 50%;
  position: relative;
  background: var(--cui-primary);
  color: var(--cui-primary-contrast);
  box-shadow: var(--cui-shadow-sm);
  transition: background-color var(--cui-duration) var(--cui-ease), color var(--cui-duration) var(--cui-ease);
}
.cui-accordion-item__icon::before,
.cui-accordion-item__icon::after {
  content: '';
  position: absolute;
  background: currentColor;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.cui-accordion-item__icon::before {
  width: 1.4rem;
  height: 2px;
}
.cui-accordion-item__icon::after {
  width: 2px;
  height: 1.4rem;
  transition: transform var(--cui-duration) var(--cui-ease);
}
.cui-accordion-item__trigger[aria-expanded='true'] .cui-accordion-item__icon {
  background: var(--cui-accent);
  color: var(--cui-accent-contrast);
}
.cui-accordion-item__trigger[aria-expanded='true'] .cui-accordion-item__icon::after {
  transform: translate(-50%, -50%) rotate(90deg);
  opacity: 0;
}

.cui-accordion-item__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--cui-duration) var(--cui-ease);
}
.cui-accordion-item__panel--open {
  grid-template-rows: 1fr;
}

.cui-accordion-item__panel-inner {
  min-height: 0;
  overflow: hidden;
  padding-bottom: 0;
  color: var(--cui-text-muted);
  font-size: 1.4rem;
  line-height: 1.6;
  transition: padding-bottom var(--cui-duration) var(--cui-ease);
}
.cui-accordion-item__panel--open .cui-accordion-item__panel-inner {
  padding-bottom: var(--cui-space-4);
}
</style>
