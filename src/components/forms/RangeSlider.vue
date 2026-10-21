<script setup>
// A single-value range input with a label and a numeric readout.
// `valueText` (a string, or `(value) => string`) says what the number means
// ("40 %", "3 rooms") for the readout and as aria-valuetext, so screen
// readers don't announce a bare "40".
import { computed } from 'vue'
import { useId } from '../../composables/useId'

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  label: { type: String, default: '' },
  showValue: { type: Boolean, default: true },
  valueText: { type: [String, Function], default: '' }
})
defineEmits(['update:modelValue'])

const id = useId('range')
const text = computed(() => (typeof props.valueText === 'function' ? props.valueText(props.modelValue) : props.valueText) || '')
// max === min (a range with one possible value) would divide by zero, and a
// value outside min..max would paint the fill past the track.
const fillPercent = computed(() => {
  const span = props.max - props.min
  if (!(span > 0)) return 0
  return Math.min(100, Math.max(0, ((props.modelValue - props.min) / span) * 100))
})
</script>

<template>
  <div class="cui-range">
    <div v-if="label || showValue" class="cui-range__meta">
      <label v-if="label" :for="id">{{ label }}</label>
      <span v-if="showValue">{{ text || modelValue }}</span>
    </div>
    <input
      :id="id"
      type="range"
      class="cui-range__control"
      :style="{ '--cui-range-fill': `${fillPercent}%` }"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :aria-valuetext="text || undefined"
      @input="$emit('update:modelValue', Number($event.target.value))"
    />
  </div>
</template>

<style scoped>
.cui-range__meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--cui-space-3);
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
}
/* the readout ("35 %") never wraps; a long label does instead */
.cui-range__meta span {
  flex-shrink: 0;
  white-space: nowrap;
}

/* a11y (WCAG 1.4.11): the unfilled track is ~1.2:1 against the page, so an
   outline in the control-border color shows where the range ends. */
.cui-range__control {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border: 1px solid var(--cui-border-control);
  border-radius: var(--cui-radius-pill);
  background: linear-gradient(
    to right,
    var(--cui-color-teal) 0%,
    var(--cui-color-teal) var(--cui-range-fill, 0%),
    var(--cui-bg-muted) var(--cui-range-fill, 0%),
    var(--cui-bg-muted) 100%
  );
  cursor: pointer;
}

.cui-range__control::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--cui-surface);
  border: 2px solid var(--cui-primary);
  box-shadow: var(--cui-shadow-sm);
  margin-top: -0.1px;
}

.cui-range__control::-moz-range-thumb {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--cui-surface);
  border: 2px solid var(--cui-primary);
  box-shadow: var(--cui-shadow-sm);
}
</style>
