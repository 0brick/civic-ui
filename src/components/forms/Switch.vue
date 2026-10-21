<script setup>
// A toggle switch: same boolean v-model contract as Checkbox, styled as a
// pill/slider instead. Handy extra alongside Checks & Radios for on/off
// settings rather than list selections. `hint`/`error` work as on Checkbox.
import { computed } from 'vue'
import { useId } from '../../composables/useId'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  error: { type: String, default: '' }
})
defineEmits(['update:modelValue'])

const id = useId('switch')
const describedBy = computed(() => {
  if (props.error) return `${id}-error`
  if (props.hint) return `${id}-hint`
  return undefined
})
</script>

<template>
  <div class="cui-choice-field">
    <label class="cui-switch" :class="{ 'cui-switch--disabled': disabled }" :for="id">
      <input
        :id="id"
        type="checkbox"
        class="cui-switch__input"
        role="switch"
        :checked="modelValue"
        :disabled="disabled"
        :aria-checked="modelValue"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-errormessage="error ? `${id}-error` : undefined"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
      <span class="cui-switch__track" aria-hidden="true"><span class="cui-switch__thumb" /></span>
      <span class="cui-switch__label">{{ label }}</span>
    </label>
    <p v-if="error" :id="`${id}-error`" class="cui-field__error cui-choice-field__message cui-switch__message">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="cui-field__hint cui-choice-field__message cui-switch__message">{{ hint }}</p>
  </div>
</template>

<style scoped>
.cui-switch {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-size: 1.4rem;
}

.cui-switch--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cui-switch__input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}

.cui-switch__track {
  flex-shrink: 0;
  width: 4rem;
  height: 2.2rem;
  border-radius: var(--cui-radius-pill);
  /* a11y (WCAG 1.4.11): the off-track is the only thing that shows the
     switch is there, 3:1 against the page and against the white thumb. */
  background: var(--cui-border-control);
  position: relative;
  transition: background-color var(--cui-duration) var(--cui-ease);
}

.cui-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  border: 1px solid var(--cui-border-control);
  background: var(--cui-color-white);
  box-shadow: var(--cui-shadow-sm);
  transition: transform var(--cui-duration) var(--cui-ease);
}

.cui-switch__input:checked + .cui-switch__track {
  background: var(--cui-color-teal);
}

/* the track is 4rem wide, not the 2rem box of Checkbox/Radio */
.cui-switch__message {
  padding-inline-start: 5rem;
}
.cui-switch__input:checked + .cui-switch__track .cui-switch__thumb {
  transform: translateX(1.8rem);
}

.cui-switch__input:focus-visible + .cui-switch__track {
  outline: 3px solid var(--cui-focus-ring);
  outline-offset: 2px;
}

/* a11y (forced colors / Windows contrast themes): track and thumb are drawn
   with backgrounds, which the system forces to Canvas: the switch would
   vanish. Outline the track, paint the thumb in the text color, and fill the
   on-state with the system highlight so on/off differ by more than position. */
@media (forced-colors: active) {
  .cui-switch__track {
    border: 1px solid CanvasText;
  }
  .cui-switch__thumb {
    forced-color-adjust: none;
    top: 1px;
    left: 1px;
    background: CanvasText;
    border-color: CanvasText;
  }
  .cui-switch__input:checked + .cui-switch__track {
    forced-color-adjust: none;
    background: Highlight;
    border-color: Highlight;
  }
  .cui-switch__input:checked + .cui-switch__track .cui-switch__thumb {
    background: HighlightText;
    border-color: HighlightText;
  }
}
</style>
