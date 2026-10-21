<script setup>
// A styled wrapper around the native <select> rather than a custom
// listbox: keeps full keyboard/screen-reader/mobile-picker behavior for
// free while still matching the rest of the field styling.
import { computed, useAttrs } from 'vue'
import { useId } from '../../composables/useId'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  options: { type: Array, required: true }, // [{ value, label }] or plain strings
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  // a11y (WCAG 4.1.2): accessible name when there's no visible `label`,
  // e.g. a compact sort/filter select whose purpose is clear visually.
  ariaLabel: { type: String, default: '' }
})
defineEmits(['update:modelValue'])
// Non-prop attributes (`name`, `autocomplete`, `aria-label`, listeners, …)
// go on the native <select>; `class`/`style` stay on the wrapper.
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const controlAttrs = computed(() => {
  // eslint-disable-next-line no-unused-vars
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const list = computed(() => (Array.isArray(props.options) ? props.options.filter((o) => o != null) : []))

const id = useId('select')
// a11y (WCAG 3.3.1/3.3.2): tie the hint/error text to the control so a
// screen reader announces it alongside the field, same contract as TextInput.
const describedBy = computed(() => {
  if (props.error) return `${id}-error`
  if (props.hint) return `${id}-hint`
  return undefined
})
</script>

<template>
  <div v-bind="rootAttrs" class="cui-field">
    <label v-if="label" :for="id" class="cui-field__label">
      {{ label }}
      <span v-if="required" class="cui-field__required" aria-hidden="true">*</span>
    </label>
    <div class="cui-select">
      <select
        v-bind="controlAttrs"
        :id="id"
        :aria-label="!label && ariaLabel ? ariaLabel : undefined"
        class="cui-select__control"
        :class="{ 'cui-select__control--error': error }"
        :value="modelValue"
        :required="required"
        :aria-required="required ? 'true' : undefined"
        :aria-invalid="!!error"
        :aria-describedby="describedBy"
        :aria-errormessage="error ? `${id}-error` : undefined"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in list" :key="opt.value ?? opt" :value="opt.value ?? opt">
          {{ opt.label ?? opt }}
        </option>
      </select>
      <span class="cui-select__chevron" aria-hidden="true" />
    </div>
    <p v-if="error" :id="`${id}-error`" class="cui-field__error">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="cui-field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.cui-select {
  position: relative;
}

.cui-select__control {
  width: 100%;
  padding: 1.1rem 3.6rem 1.1rem 1.4rem;
  border: 1.5px solid var(--cui-border-control);
  border-radius: var(--cui-radius-md);
  background: var(--cui-surface);
  font-size: 1.5rem;
  appearance: none;
  cursor: pointer;
  transition: border-color var(--cui-duration) var(--cui-ease), box-shadow var(--cui-duration) var(--cui-ease);
}
.cui-select__control:hover {
  border-color: var(--cui-text-muted);
}
.cui-select__control:focus {
  border-color: var(--cui-color-teal);
}
/* Transparent, not `none`: the forced-colors focus cue (see TextInput). */
.cui-select__control:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(2, 118, 127, 0.16);
}
.cui-select__control--error {
  border-color: var(--cui-color-danger);
}

.cui-select__chevron {
  position: absolute;
  right: 1.4rem;
  top: 50%;
  width: 1rem;
  height: 1rem;
  transform: translateY(-65%) rotate(45deg);
  border-right: 2px solid var(--cui-text);
  border-bottom: 2px solid var(--cui-text);
  pointer-events: none;
  transition: border-color var(--cui-duration) var(--cui-ease);
}
.cui-select__control:focus ~ .cui-select__chevron {
  border-color: var(--cui-color-teal);
}
</style>
