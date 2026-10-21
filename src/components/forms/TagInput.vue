<script setup>
// Free-text tag/chip entry: type and press Enter (or comma) to add, click a
// chip's × or Backspace on an empty field to remove the last one. v-model
// is a plain array of strings.
//
// a11y: the tags are a list (screen readers announce the count); the field
// always has a name, `label`, else `ariaLabel`, else the catalog's
// tagInput.label (WCAG 4.1.2). A rejected entry is named on screen with the
// reason in an always-present live region (WCAG 3.3.1/4.1.3) unless
// `showRejections` is off; `hint`/`error` are tied to the field like TextInput's.
import { computed, nextTick, ref } from 'vue'
import { useId } from '../../composables/useId'
import { t } from '../../utils/i18n'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String },
  disabled: { type: Boolean, default: false },
  // security: bounds for free-text input. `maxLength` caps a single
  // tag (also set as the field's maxlength), `maxTags` the list (0 = no
  // limit), and `validate(value)` can veto a tag (return false).
  maxLength: { type: Number, default: 100 },
  maxTags: { type: Number, default: 0 },
  validate: { type: Function, default: null },
  // Accessible name when there's no visible `label`.
  ariaLabel: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  showRejections: { type: Boolean, default: true }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  placeholder: props.placeholder ?? t('tagInput.placeholder')
}))

// `reject` fires with { value, reason: 'length' | 'count' | 'invalid' }.
const emit = defineEmits(['update:modelValue', 'reject'])

// `v-model` reset to null (common when clearing a form) counts as no tags.
const tags = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

const id = useId('tags')
const draft = ref('')
const fieldEl = ref(null)
const rejection = ref('')

const describedBy = computed(() => {
  const ids = []
  if (props.error) ids.push(`${id}-error`)
  else if (props.hint) ids.push(`${id}-hint`)
  if (rejection.value) ids.push(`${id}-rejection`)
  return ids.join(' ') || undefined
})

const rejectionKeys = { length: 'tagInput.rejectedLength', count: 'tagInput.rejectedCount', invalid: 'tagInput.rejectedInvalid' }

function addTag() {
  const value = draft.value.trim()
  if (!value || tags.value.includes(value)) {
    draft.value = ''
    return
  }
  let reason = null
  if (props.maxLength > 0 && value.length > props.maxLength) reason = 'length'
  else if (props.maxTags > 0 && tags.value.length >= props.maxTags) reason = 'count'
  else if (props.validate && props.validate(value) === false) reason = 'invalid'
  if (reason) {
    emit('reject', { value, reason })
    if (props.showRejections) {
      const max = reason === 'length' ? props.maxLength : props.maxTags
      rejection.value = t(rejectionKeys[reason], { value, max })
    }
    return
  }
  emit('update:modelValue', [...tags.value, value])
  draft.value = ''
  rejection.value = ''
}

function removeTag(index) {
  emit('update:modelValue', tags.value.filter((_, i) => i !== index))
}

// a11y (WCAG 2.4.3): the × button disappears with its tag; keep keyboard
// focus in the field instead of dropping it to <body>.
function removeTagByButton(index) {
  removeTag(index)
  nextTick(() => fieldEl.value?.focus())
}

function onKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  } else if (e.key === 'Backspace' && draft.value === '' && tags.value.length) {
    removeTag(tags.value.length - 1)
  }
}
</script>

<template>
  <div class="cui-field">
    <label v-if="label" :for="id" class="cui-field__label">{{ label }}</label>
    <div class="cui-tag-input" :class="{ 'cui-tag-input--disabled': disabled, 'cui-tag-input--error': error }">
      <ul v-if="tags.length" class="cui-tag-input__tags" :aria-label="t('tagInput.list')">
        <li v-for="(tag, i) in tags" :key="tag" class="cui-tag-input__tag">
          {{ tag }}
          <button type="button" :aria-label="t('tagInput.remove', { tag })" :disabled="disabled" @mousedown.prevent @click="removeTagByButton(i)">&times;</button>
        </li>
      </ul>
      <input
        :id="id"
        ref="fieldEl"
        v-model="draft"
        type="text"
        class="cui-tag-input__field"
        :placeholder="tags.length ? '' : L.placeholder"
        :maxlength="maxLength > 0 ? maxLength : undefined"
        :disabled="disabled"
        :aria-label="label ? undefined : ariaLabel || t('tagInput.label')"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-errormessage="error ? `${id}-error` : undefined"
        @keydown="onKeydown"
        @blur="addTag"
      />
    </div>
    <p v-if="error" :id="`${id}-error`" class="cui-field__error">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="cui-field__hint">{{ hint }}</p>
    <p :id="`${id}-rejection`" class="cui-field__error cui-tag-input__rejection" role="status"><template v-if="rejection">{{ rejection }}</template></p>
  </div>
</template>

<style scoped>
.cui-tag-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid var(--cui-border-control);
  border-radius: var(--cui-radius-md);
  background: var(--cui-surface);
  transition: border-color var(--cui-duration) var(--cui-ease);
}

.cui-tag-input:focus-within {
  border-color: var(--cui-color-teal);
}

.cui-tag-input--disabled {
  background: var(--cui-bg-muted);
}

.cui-tag-input--error {
  border-color: var(--cui-color-danger);
}

.cui-tag-input__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Stays in the DOM (a live region must exist before its content changes),
   but out of the column's flow while empty so it adds no extra gap. */
.cui-tag-input__rejection:empty {
  position: absolute;
}

.cui-tag-input__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.1rem 0.1rem 0.1rem 1rem;
  border-radius: var(--cui-radius-pill);
  background: var(--cui-bg-muted);
  font-size: 1.3rem;
  font-weight: 600;
}

/* WCAG 2.5.8: 24×24, the chip's padding shrinks to match so the chip stays
   the same height as before (26px). */
.cui-tag-input__tag button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.4rem;
  min-height: 2.4rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--cui-text-muted);
}
.cui-tag-input__tag button:hover:not(:disabled) {
  background: var(--cui-border);
  color: var(--cui-text);
}

.cui-tag-input__field {
  flex: 1;
  min-width: 120px;
  border: none;
  background: none;
  font: inherit;
  padding: 0.4rem 0;
}
/* The wrapper's border carries the focus state; this transparent outline is
   the forced-colors fallback (see TextInput), where border colors are forced. */
.cui-tag-input__field:focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
</style>
