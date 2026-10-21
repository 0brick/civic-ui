<script setup>
// Drag-and-drop file picker with a click-to-browse fallback and a simple
// file list with per-item remove. v-model is a plain array of File objects
// wire the actual upload/submit yourself.
//
// a11y (WCAG 3.3.1/4.1.3): files that don't make it in are named on screen
// with the reason, in a live region that is always in the DOM (so the
// change gets announced). `showRejections: false` leaves that to the page
// (via the `reject` event). `error` is the field's own validation message.
import { computed, nextTick, ref } from 'vue'
import { useId } from '../../composables/useId'
import { t } from '../../utils/i18n'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String },
  hint: { type: String, default: '' },
  accept: { type: String, default: '' },
  multiple: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  browseLabel: { type: String },
  dropLabel: { type: String },
  // Upper bounds per file (bytes) and for the whole list; 0 = no limit.
  maxSize: { type: Number, default: 0 },
  maxFiles: { type: Number, default: 0 },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
  showRejections: { type: Boolean, default: true }
})
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  label: props.label ?? t('fileUpload.label'),
  browseLabel: props.browseLabel ?? t('fileUpload.browse'),
  dropLabel: props.dropLabel ?? t('fileUpload.drop')
}))

// `reject` fires with [{ file, reason: 'type' | 'size' | 'count' }] for
// every file that didn't make it into v-model, so the page can say why.
const emit = defineEmits(['update:modelValue', 'reject'])

// `v-model` reset to null (common when clearing a form) counts as no files.
const files = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))

const id = useId('upload')
const dragging = ref(false)
const inputEl = ref(null)
const listEl = ref(null)
const rejections = ref([])

const describedBy = computed(() => {
  const ids = []
  if (props.error) ids.push(`${id}-error`)
  if (props.hint) ids.push(`${id}-hint`)
  if (rejections.value.length) ids.push(`${id}-rejections`)
  return ids.join(' ') || undefined
})

function rejectionText({ file, reason }) {
  const name = file?.name ?? ''
  if (reason === 'size') return t('fileUpload.rejectedSize', { name, max: formatSize(props.maxSize) })
  if (reason === 'count') return t('fileUpload.rejectedCount', { name, max: props.multiple ? props.maxFiles : 1 })
  return t('fileUpload.rejectedType', { name })
}

// security: `accept` only filters the native file dialog (and even
// there "All files" bypasses it): a dropped `invoice.pdf.exe` would land in
// v-model unchecked. Enforce it, plus the size/count limits, for every path
// in. Server-side validation stays mandatory; this keeps the UI honest.
const acceptRules = computed(() =>
  props.accept
    .split(',')
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean)
)

function matchesAccept(file) {
  if (!acceptRules.value.length) return true
  const name = (file.name || '').toLowerCase()
  const type = (file.type || '').toLowerCase()
  return acceptRules.value.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule)
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

function addFiles(fileList) {
  const incoming = Array.from(fileList || [])
  if (!incoming.length) return
  const rejected = []
  const accepted = []
  for (const file of incoming) {
    if (!matchesAccept(file)) rejected.push({ file, reason: 'type' })
    else if (props.maxSize > 0 && file.size > props.maxSize) rejected.push({ file, reason: 'size' })
    else accepted.push(file)
  }
  const base = props.multiple ? files.value : []
  const limit = props.multiple ? (props.maxFiles > 0 ? props.maxFiles : Infinity) : 1
  const room = Math.max(0, limit - base.length)
  for (const file of accepted.slice(room)) rejected.push({ file, reason: 'count' })
  const added = accepted.slice(0, room)
  if (added.length) emit('update:modelValue', [...base, ...added])
  if (rejected.length) emit('reject', rejected)
  rejections.value = props.showRejections ? rejected.map(rejectionText) : []
}

function onDrop(e) {
  dragging.value = false
  if (props.disabled) return
  addFiles(e.dataTransfer.files)
}

function onPick(e) {
  addFiles(e.target.files)
  e.target.value = ''
}

// a11y (WCAG 2.4.3): the clicked button goes away with its row; move focus
// to the next row's remove button, or back to the file input, not <body>.
function removeFile(index) {
  emit('update:modelValue', files.value.filter((_, i) => i !== index))
  nextTick(() => {
    const buttons = listEl.value ? listEl.value.querySelectorAll('button') : []
    const next = buttons[index] ?? inputEl.value
    next?.focus()
  })
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="cui-field">
    <label :for="id" class="cui-field__label">
      {{ L.label }}
      <span v-if="required" class="cui-field__required" aria-hidden="true">*</span>
    </label>
    <div
      class="cui-file-upload"
      :class="{ 'cui-file-upload--dragging': dragging, 'cui-file-upload--disabled': disabled, 'cui-file-upload--error': error }"
      @dragover.prevent="!disabled && (dragging = true)"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
      @click="!disabled && inputEl.click()"
    >
      <input
        :id="id"
        ref="inputEl"
        type="file"
        class="cui-visually-hidden"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        :required="required"
        :aria-required="required ? 'true' : undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-errormessage="error ? `${id}-error` : undefined"
        @change="onPick"
      />
      <svg class="cui-file-upload__icon" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <path d="M16 21V8m0 0l-5 5m5-5l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6 22v3a2 2 0 002 2h16a2 2 0 002-2v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <p class="cui-file-upload__text">
        <strong>{{ L.browseLabel }}</strong> {{ L.dropLabel }}
      </p>
      <p v-if="hint" :id="`${id}-hint`" class="cui-field__hint">{{ hint }}</p>
    </div>
    <p v-if="error" :id="`${id}-error`" class="cui-field__error">{{ error }}</p>
    <div :id="`${id}-rejections`" class="cui-file-upload__rejections" role="status">
      <p v-for="(msg, i) in rejections" :key="i" class="cui-field__error">{{ msg }}</p>
    </div>

    <ul v-if="files.length" ref="listEl" class="cui-file-upload__list">
      <li v-for="(file, i) in files" :key="`${file.name}-${i}`">
        <span class="cui-file-upload__name">{{ file.name }}</span>
        <span class="cui-file-upload__size">{{ formatSize(file.size) }}</span>
        <button type="button" :aria-label="t('fileUpload.remove', { name: file.name })" @click="removeFile(i)">&times;</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.cui-file-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
  padding: var(--cui-space-6) var(--cui-space-4);
  border: 2px dashed var(--cui-border-control);
  border-radius: var(--cui-radius-lg);
  background: var(--cui-bg-subtle);
  color: var(--cui-text-muted);
  cursor: pointer;
  transition: border-color var(--cui-duration) var(--cui-ease), background-color var(--cui-duration) var(--cui-ease);
}

.cui-file-upload:hover,
.cui-file-upload--dragging {
  border-color: var(--cui-color-teal);
  background: var(--cui-bg-muted);
}
.cui-file-upload--error {
  border-color: var(--cui-color-danger);
}

.cui-file-upload__rejections {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
/* Stays in the DOM (a live region must exist before its content changes),
   but out of the column's flow while empty so it adds no extra gap. */
.cui-file-upload__rejections:empty {
  position: absolute;
}

/* a11y (WCAG 2.4.7): the real, keyboard-operable control here is the
   visually-hidden native file input: draw its focus ring on this visible
   dropzone instead, since the input itself is clipped to 1px. */
.cui-file-upload:focus-within {
  outline: 2px solid var(--cui-focus-ring);
  outline-offset: 2px;
}

.cui-file-upload--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.cui-file-upload__icon,
.cui-file-upload__text,
.cui-field__hint {
  pointer-events: none;
}

.cui-file-upload__text {
  margin: 0;
  font-size: 1.4rem;
  color: var(--cui-text);
}
.cui-file-upload__text strong {
  color: var(--cui-link);
}

.cui-file-upload__list {
  list-style: none;
  margin: var(--cui-space-3) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.cui-file-upload__list li {
  display: flex;
  align-items: center;
  gap: var(--cui-space-3);
  padding: 0.8rem 1.2rem;
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
  font-size: 1.3rem;
}

.cui-file-upload__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.cui-file-upload__size {
  color: var(--cui-text-muted);
  flex-shrink: 0;
}

/* WCAG 2.5.8: a 24×24 target instead of the bare × glyph (about 10×16),
   pulled into the row's padding so the row keeps its height. */
.cui-file-upload__list button {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.4rem;
  min-height: 2.4rem;
  margin: -0.4rem -0.6rem;
  padding: 0;
  border: none;
  border-radius: var(--cui-radius-sm);
  background: none;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: var(--cui-text-muted);
}
.cui-file-upload__list button:hover {
  color: var(--cui-text-danger);
}
</style>
