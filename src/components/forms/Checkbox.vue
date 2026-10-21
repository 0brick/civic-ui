<script setup>
// v-model works with a plain boolean, or with an array (pass `value` and
// bind the same array as modelValue to several checkboxes) exactly like a
// native checkbox group does. `hint`/`error` render under the label and are
// tied to the input via aria-describedby (an error replaces the hint).
import { computed } from 'vue'
import { useId } from '../../composables/useId'

const props = defineProps({
  modelValue: { type: [Boolean, Array], default: false },
  value: { type: [String, Number, Boolean], default: null },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  error: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const id = useId('checkbox')
const describedBy = computed(() => {
  if (props.error) return `${id}-error`
  if (props.hint) return `${id}-hint`
  return undefined
})

const checked = computed(() => (Array.isArray(props.modelValue) ? props.modelValue.includes(props.value) : props.modelValue))

function toggle(event) {
  if (Array.isArray(props.modelValue)) {
    const next = new Set(props.modelValue)
    event.target.checked ? next.add(props.value) : next.delete(props.value)
    emit('update:modelValue', Array.from(next))
  } else {
    emit('update:modelValue', event.target.checked)
  }
}
</script>

<template>
  <div class="cui-choice-field">
    <label class="cui-check" :class="{ 'cui-check--disabled': disabled, 'cui-check--error': error }" :for="id">
      <input
        :id="id"
        type="checkbox"
        class="cui-check__input"
        :checked="checked"
        :required="required"
        :aria-required="required ? 'true' : undefined"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-errormessage="error ? `${id}-error` : undefined"
        @change="toggle"
      />
      <span class="cui-check__box" aria-hidden="true">
        <svg class="cui-check__icon" viewBox="0 0 16 16" width="11" height="11"><path d="M2 8l4 4 8-8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </span>
      <span class="cui-check__label"><slot>{{ label }}</slot></span>
    </label>
    <p v-if="error" :id="`${id}-error`" class="cui-field__error cui-choice-field__message">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="cui-field__hint cui-choice-field__message">{{ hint }}</p>
  </div>
</template>

<style scoped>
.cui-check {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-size: 1.4rem;
}

.cui-check--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cui-check__input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}

.cui-check__box {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border: 1.5px solid var(--cui-border-strong);
  border-radius: var(--cui-radius-sm);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  background: var(--cui-surface);
  transition: background-color var(--cui-duration-fast) var(--cui-ease), border-color var(--cui-duration-fast) var(--cui-ease);
}

.cui-check--error .cui-check__box {
  border-color: var(--cui-color-danger);
}

.cui-check__input:checked + .cui-check__box {
  background: var(--cui-primary);
  border-color: var(--cui-primary);
  color: var(--cui-primary-contrast);
}

.cui-check__icon {
  transform: scale(0);
  transition: transform var(--cui-duration-fast) var(--cui-ease);
}
.cui-check__input:checked + .cui-check__box .cui-check__icon {
  transform: scale(1);
}

.cui-check__input:focus-visible + .cui-check__box {
  outline: 3px solid var(--cui-focus-ring);
  outline-offset: 2px;
}
</style>
