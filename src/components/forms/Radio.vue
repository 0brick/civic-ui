<script setup>
// A single radio. Standalone it takes `name` + `v-model` like a native radio;
// inside a <RadioGroup> it takes name, value, required and the group's
// error state from the group (provide/inject) and needs only `value`/`label`.
// `hint`/`error` here are for a lone radio, in a group, put them on the group.
import { computed, inject } from 'vue'
import { useId } from '../../composables/useId'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: null },
  value: { type: [String, Number, Boolean], required: true },
  name: { type: String, default: '' }, // required outside a RadioGroup
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  error: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const id = useId('radio')
const group = inject('cui-radio-group', null)

const checked = computed(() => (group ? group.modelValue() : props.modelValue) === props.value)
const isDisabled = computed(() => props.disabled || !!group?.disabled())
const invalid = computed(() => !!props.error || !!group?.invalid())
const describedBy = computed(() => {
  if (props.error) return `${id}-error`
  if (props.hint) return `${id}-hint`
  return undefined
})

function select() {
  emit('update:modelValue', props.value)
  group?.select(props.value)
}
</script>

<template>
  <div class="cui-choice-field">
    <label class="cui-radio" :class="{ 'cui-radio--disabled': isDisabled, 'cui-radio--error': invalid }" :for="id">
      <input
        :id="id"
        type="radio"
        class="cui-radio__input"
        :name="name || group?.name"
        :value="String(value)"
        :checked="checked"
        :disabled="isDisabled"
        :required="group?.required() || undefined"
        :aria-invalid="invalid ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-errormessage="error ? `${id}-error` : undefined"
        @change="select"
      />
      <span class="cui-radio__dot" aria-hidden="true" />
      <span class="cui-radio__label">{{ label }}</span>
    </label>
    <p v-if="error" :id="`${id}-error`" class="cui-field__error cui-choice-field__message">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="cui-field__hint cui-choice-field__message">{{ hint }}</p>
  </div>
</template>

<style scoped>
.cui-radio {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-size: 1.4rem;
}

.cui-radio--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cui-radio__input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}

.cui-radio__dot {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1.5px solid var(--cui-border-strong);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--cui-surface);
}

.cui-radio--error .cui-radio__dot {
  border-color: var(--cui-color-danger);
}

.cui-radio__dot::after {
  content: '';
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--cui-primary);
  transform: scale(0);
  transition: transform var(--cui-duration-fast) var(--cui-ease);
}

.cui-radio__input:checked + .cui-radio__dot::after {
  transform: scale(1);
}

.cui-radio__input:focus-visible + .cui-radio__dot {
  outline: 3px solid var(--cui-focus-ring);
  outline-offset: 2px;
}

/* a11y (forced colors / Windows contrast themes): backgrounds are forced to
   Canvas, which would erase the checked dot: the only cue that this radio
   is selected. Paint it in the system text color instead (pattern: SvgImage). */
@media (forced-colors: active) {
  .cui-radio__dot {
    border-color: CanvasText;
  }
  .cui-radio__dot::after {
    forced-color-adjust: none;
    background: CanvasText;
  }
}
</style>
