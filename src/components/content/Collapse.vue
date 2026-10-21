<script setup>
// The standalone building block behind AccordionItem: use this directly
// when you just need one show/hide toggle (e.g. "show more details") and
// don't want the whole Accordion group-state machinery.
import { useId } from '../../composables/useId'

defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true }
})
defineEmits(['update:modelValue'])

const panelId = useId('cui-collapse-panel')
</script>

<template>
  <div class="cui-collapse">
    <button
      type="button"
      class="cui-collapse__trigger"
      :aria-expanded="String(modelValue)"
      :aria-controls="panelId"
      @click="$emit('update:modelValue', !modelValue)"
    >
      {{ label }}
    </button>
    <div
      :id="panelId"
      class="cui-collapse__panel"
      :class="{ 'cui-collapse__panel--open': modelValue }"
      :aria-hidden="!modelValue"
      :inert="!modelValue"
    >
      <div class="cui-collapse__panel-inner"><slot /></div>
    </div>
  </div>
</template>

<style scoped>
.cui-collapse__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: none;
  border: none;
  padding: 0;
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--cui-text-secondary);
  cursor: pointer;
}

.cui-collapse__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--cui-duration) var(--cui-ease);
}
.cui-collapse__panel--open {
  grid-template-rows: 1fr;
}

.cui-collapse__panel-inner {
  min-height: 0;
  overflow: hidden;
  padding-top: 0;
  transition: padding-top var(--cui-duration) var(--cui-ease);
}
.cui-collapse__panel--open .cui-collapse__panel-inner {
  padding-top: var(--cui-space-3);
}
</style>
