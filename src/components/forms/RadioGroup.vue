<script setup>
// A labeled set of radios: a <fieldset> whose <legend> names the group, with
// the group's hint/error under it. Put <Radio>s in the default slot (they
// take name, checked state, required and the error state from here), or pass
// `options` ([{ value, label, disabled? }] or plain strings) to render them.
// `v-model` is the selected value. `inline` lays the options out in a row.
import { computed, provide } from 'vue'
import Radio from './Radio.vue'
import { useId } from '../../composables/useId'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: null },
  legend: { type: String, required: true },
  name: { type: String, default: '' }, // default: a generated unique name
  options: { type: Array, default: () => [] },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  inline: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const id = useId('cui-radio-group')
const describedBy = computed(() => {
  if (props.error) return `${id}-error`
  if (props.hint) return `${id}-hint`
  return undefined
})
const items = computed(() => props.options.map((o) => (typeof o === 'object' && o !== null ? o : { value: o, label: String(o) })))

provide('cui-radio-group', {
  name: props.name || id,
  modelValue: () => props.modelValue,
  disabled: () => props.disabled,
  required: () => props.required,
  invalid: () => !!props.error,
  select: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <fieldset
    class="cui-radio-group"
    :class="{ 'cui-radio-group--inline': inline }"
    role="radiogroup"
    :aria-labelledby="`${id}-legend`"
    :aria-required="required ? 'true' : undefined"
    :aria-invalid="error ? 'true' : undefined"
    :aria-describedby="describedBy"
    :aria-errormessage="error ? `${id}-error` : undefined"
    :disabled="disabled"
  >
    <!-- a11y (WCAG 1.3.1/3.3.1/3.3.2): role="radiogroup" on the fieldset so the
         group itself can carry aria-required/aria-invalid/aria-errormessage;
         the legend stays its name, the hint/error its description. -->
    <legend :id="`${id}-legend`" class="cui-field__label cui-radio-group__legend">
      {{ legend }}
      <span v-if="required" class="cui-field__required" aria-hidden="true">*</span>
    </legend>
    <div class="cui-radio-group__options">
      <slot>
        <Radio v-for="opt in items" :key="String(opt.value)" :value="opt.value" :label="opt.label" :disabled="!!opt.disabled" />
      </slot>
    </div>
    <p v-if="error" :id="`${id}-error`" class="cui-field__error">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="cui-field__hint">{{ hint }}</p>
  </fieldset>
</template>

<style scoped>
.cui-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: none;
}

.cui-radio-group__legend {
  padding: 0;
  margin-bottom: 0.4rem;
}

.cui-radio-group__options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.cui-radio-group--inline .cui-radio-group__options {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem 2.4rem;
}
</style>
