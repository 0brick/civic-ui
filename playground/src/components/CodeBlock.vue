<script setup>
import { ref } from 'vue'

const props = defineProps({
  code: { type: String, default: '' },
  // Shown in the bar above the code.
  lang: { type: String, default: 'Vue' },
  // Accessible name of the scrollable code region: unique per page, since
  // several regions with the same name are indistinguishable landmarks.
  label: { type: String, default: 'Code example' }
})

const copied = ref(false)
let copiedTimer

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code.trim())
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => (copied.value = false), 1600)
  } catch {
    // Clipboard API unavailable (e.g. insecure context): the code is still
    // fully visible and selectable by hand, so this is a silent no-op.
  }
}
</script>

<template>
  <div class="cui-doc-code">
    <div class="cui-doc-code__bar">
      <span class="cui-doc-code__lang">{{ lang }}</span>
      <button type="button" class="cui-doc-code__copy" @click="copy">
        {{ copied ? 'Copied' : 'Copy' }}<span class="cui-visually-hidden"> code</span>
      </button>
      <!-- Present before the first copy, so screen readers announce the change. -->
      <span class="cui-visually-hidden" role="status">{{ copied ? 'Code copied to clipboard' : '' }}</span>
    </div>
    <!-- Focusable so keyboard users can scroll long lines (WCAG 2.1.1). -->
    <pre class="cui-doc-code__pre" tabindex="0" role="region" :aria-label="label"><code>{{ code.trim() }}</code></pre>
  </div>
</template>

<style scoped>
.cui-doc-code {
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-lg);
  overflow: hidden;
  background: var(--cui-color-navy);
}

.cui-doc-code__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--cui-space-2) var(--cui-space-4);
  background: rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.cui-doc-code__lang {
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}

.cui-doc-code__copy {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font: inherit;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0.4rem 1rem;
  border-radius: var(--cui-radius-sm);
  cursor: pointer;
  transition: background-color var(--cui-duration) var(--cui-ease), border-color var(--cui-duration) var(--cui-ease);
}

.cui-doc-code__copy:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.35);
}

.cui-doc-code__pre {
  margin: 0;
  padding: var(--cui-space-4);
  overflow-x: auto;
  color: #e8edf3;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.3rem;
  line-height: 1.6;
}

.cui-doc-code__pre code {
  font-family: inherit;
}
</style>
