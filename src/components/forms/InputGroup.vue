<script setup>
// Wraps a control (usually the default slot's <input>) with prepend/append
// addons (icons, units, an inline button) all sharing one visual border.
import { useId } from '../../composables/useId'

defineProps({
  label: { type: String, default: '' }
})

// a11y (WCAG 1.3.1/3.3.2): the visible label has to be programmatically
// associated with the wrapped control. Since that control comes in through
// a slot, we can't bind `for` to it directly: instead we generate an id
// here and hand it to the slot so the consumer's <input> can bind `:id`.
const id = useId('input-group')
</script>

<template>
  <div class="cui-field">
    <label v-if="label" :for="id" class="cui-field__label">{{ label }}</label>
    <div class="cui-input-group">
      <span v-if="$slots.prepend" class="cui-input-group__addon"><slot name="prepend" /></span>
      <slot :id="id" />
      <span v-if="$slots.append" class="cui-input-group__addon"><slot name="append" /></span>
    </div>
  </div>
</template>

<style scoped>
.cui-input-group {
  display: flex;
  align-items: stretch;
  border: 1.5px solid var(--cui-border-control);
  border-radius: var(--cui-radius-md);
  overflow: hidden;
  background: var(--cui-surface);
  transition: border-color var(--cui-duration) var(--cui-ease);
}

.cui-input-group:focus-within {
  border-color: var(--cui-color-teal);
}

.cui-input-group :deep(input),
.cui-input-group :deep(select) {
  flex: 1;
  border: none;
  padding: 1.1rem 1.4rem;
  font-size: 1.5rem;
  background: transparent;
  min-width: 0;
}
/* Transparent, not `none`: the forced-colors focus cue (see TextInput). */
.cui-input-group :deep(input:focus),
.cui-input-group :deep(select:focus) {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.cui-input-group__addon {
  display: flex;
  align-items: center;
  padding: 0 1.4rem;
  background: var(--cui-bg-subtle);
  color: var(--cui-text-muted);
  font-size: 1.4rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>
