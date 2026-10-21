<script setup>
// The one text-entry field. `multiline` swaps the `<input>` for a
// `<textarea>`, `floating` puts the label inside the control until it has
// focus or a value. Both combine into a floating-label textarea.
//
// Attributes that aren't props (`name`, `maxlength`, `pattern`, `inputmode`,
// listeners, …) land on the <input>/<textarea> itself, so native validation
// and form submits work; only `class`/`style` stay on the outer wrapper.
import { ref, computed, useAttrs } from 'vue'
import { useId } from '../../composables/useId'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' }, // ignored when multiline
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  autocomplete: { type: String, default: null },
  multiline: { type: Boolean, default: false },
  rows: { type: Number, default: 4 }, // multiline only
  floating: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const controlAttrs = computed(() => {
  // eslint-disable-next-line no-unused-vars
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const id = useId('field')
const describedBy = computed(() => {
  if (props.error) return `${id}-error`
  if (props.hint) return `${id}-hint`
  return undefined
})

const focused = ref(false)
const floated = computed(() => focused.value || `${props.modelValue ?? ''}`.length > 0)
// The floating label sits where a placeholder would, so the placeholder only
// shows once the label has floated up (focused, still empty). Otherwise a
// single space keeps the control's :placeholder-shown state usable for CSS.
const floatingPlaceholder = computed(() => (floated.value && props.placeholder ? props.placeholder : ' '))
</script>

<template>
  <div
    v-if="floating"
    v-bind="rootAttrs"
    class="cui-floating"
    :class="{ 'cui-floating--floated': floated, 'cui-floating--error': error, 'cui-floating--multiline': multiline }"
  >
    <component
      :is="multiline ? 'textarea' : 'input'"
      v-bind="controlAttrs"
      :id="id"
      class="cui-floating__control"
      :type="multiline ? undefined : type"
      :rows="multiline ? rows : undefined"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :aria-required="required ? 'true' : undefined"
      :aria-invalid="!!error"
      :aria-describedby="describedBy"
      :aria-errormessage="error ? `${id}-error` : undefined"
      :placeholder="floatingPlaceholder"
      @focus="focused = true"
      @blur="focused = false"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <label :for="id" class="cui-floating__label">
      {{ label }}
      <span v-if="required" class="cui-field__required" aria-hidden="true">*</span>
    </label>
    <p v-if="error" :id="`${id}-error`" class="cui-floating__error">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="cui-field__hint cui-floating__hint">{{ hint }}</p>
  </div>

  <div v-else v-bind="rootAttrs" class="cui-field">
    <label v-if="label" :for="id" class="cui-field__label">
      {{ label }}
      <span v-if="required" class="cui-field__required" aria-hidden="true">*</span>
    </label>
    <textarea
      v-if="multiline"
      v-bind="controlAttrs"
      :id="id"
      class="cui-field__control"
      :class="{ 'cui-field__control--error': error }"
      :rows="rows"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :aria-required="required ? 'true' : undefined"
      :aria-invalid="!!error"
      :aria-describedby="describedBy"
      :aria-errormessage="error ? `${id}-error` : undefined"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <input
      v-else
      v-bind="controlAttrs"
      :id="id"
      class="cui-field__control"
      :class="{ 'cui-field__control--error': error }"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-required="required ? 'true' : undefined"
      :autocomplete="autocomplete"
      :aria-invalid="!!error"
      :aria-describedby="describedBy"
      :aria-errormessage="error ? `${id}-error` : undefined"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" :id="`${id}-error`" class="cui-field__error">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="cui-field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.cui-field__control {
  width: 100%;
  padding: 1.1rem 1.4rem;
  border: 1.5px solid var(--cui-border-control);
  border-radius: var(--cui-radius-md);
  background: var(--cui-surface);
  font-size: 1.5rem;
  font-family: inherit;
  transition: border-color var(--cui-duration) var(--cui-ease), box-shadow var(--cui-duration) var(--cui-ease);
}

textarea.cui-field__control {
  resize: vertical;
}

.cui-field__control:hover {
  border-color: var(--cui-text-muted);
}

.cui-field__control:focus {
  border-color: var(--cui-color-teal);
}

/* Own quiet focus halo instead of the generic high-contrast outline: the
   field's border already carries the focus state, so a soft tinted glow
   reads clearer here than a hard 2px ring sitting on top of it.
   a11y (WCAG 2.4.7): the outline is transparent, not `none`: under
   forced-colors box-shadow is dropped and the border turns system-colored,
   so this transparent outline (which the system paints) is the only focus
   cue left there. */
.cui-field__control:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-color: var(--cui-color-teal);
  box-shadow: 0 0 0 3px rgba(2, 118, 127, 0.16);
}

/* Chrome/Safari paint autofilled fields with their own yellow tint,
   override it back to the field's normal surface/text colors. */
.cui-field__control:-webkit-autofill,
.cui-field__control:-webkit-autofill:hover,
.cui-field__control:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--cui-text);
  -webkit-box-shadow: 0 0 0 1000px var(--cui-surface) inset;
  box-shadow: 0 0 0 1000px var(--cui-surface) inset;
  transition: background-color 9999s ease-in-out 0s;
}

.cui-field__control:disabled {
  background: var(--cui-bg-muted);
  cursor: not-allowed;
}

.cui-field__control--error {
  border-color: var(--cui-color-danger);
}

/* ---- floating variant ---- */
.cui-floating {
  position: relative;
}

/* Dimensions read optional custom properties, so a denser or larger floating
   field is one override (e.g. on a wrapper class) instead of re-positioning
   the label by hand: --cui-floating-height, --cui-floating-padding-top,
   --cui-floating-padding-x, --cui-floating-padding-bottom,
   --cui-floating-label-top, --cui-floating-label-shift, --cui-floating-font-size. */
.cui-floating__control {
  width: 100%;
  height: var(--cui-floating-height, 5.6rem);
  padding: var(--cui-floating-padding-top, 2rem) var(--cui-floating-padding-x, 1.4rem) var(--cui-floating-padding-bottom, 0.6rem);
  border: 1.5px solid var(--cui-border-control);
  border-radius: var(--cui-radius-md);
  background: var(--cui-surface);
  font-size: var(--cui-floating-font-size, 1.5rem);
  font-family: inherit;
  transition: border-color var(--cui-duration) var(--cui-ease), box-shadow var(--cui-duration) var(--cui-ease);
}

.cui-floating--multiline .cui-floating__control {
  height: auto;
  padding-top: calc(var(--cui-floating-padding-top, 2rem) + 0.6rem);
  resize: vertical;
}

.cui-floating__control:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-color: var(--cui-color-teal);
  box-shadow: 0 0 0 3px rgba(2, 118, 127, 0.16);
}

.cui-floating__control:-webkit-autofill,
.cui-floating__control:-webkit-autofill:hover,
.cui-floating__control:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--cui-text);
  -webkit-box-shadow: 0 0 0 1000px var(--cui-surface) inset;
  box-shadow: 0 0 0 1000px var(--cui-surface) inset;
  transition: background-color 9999s ease-in-out 0s;
}

.cui-floating--error .cui-floating__control {
  border-color: var(--cui-color-danger);
}

.cui-floating__label {
  position: absolute;
  left: var(--cui-floating-padding-x, 1.4rem);
  top: var(--cui-floating-label-top, 1.8rem);
  font-size: var(--cui-floating-font-size, 1.5rem);
  color: var(--cui-text-muted);
  pointer-events: none;
  transform-origin: left top;
  transition: transform var(--cui-duration) var(--cui-ease), color var(--cui-duration) var(--cui-ease);
}

.cui-floating--floated .cui-floating__label {
  transform: translateY(var(--cui-floating-label-shift, -1rem)) scale(0.75);
  color: var(--cui-text-secondary);
}

.cui-floating__hint {
  margin: 0.6rem 0 0;
}

.cui-floating__error {
  margin: 0.6rem 0 0;
  font-size: 1.2rem;
  color: var(--cui-text-danger);
  font-weight: 600;
}
</style>
