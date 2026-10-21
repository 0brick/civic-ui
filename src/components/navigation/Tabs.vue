<script setup>
// Also doubles as "Nav": pass `pills` for a nav-pills look instead of the
// underlined tab look. Tabs own their own active state via v-model so a
// page can read/react to the current tab if needed.
import { computed, ref, watch } from 'vue'
import { useId } from '../../composables/useId'

const props = defineProps({
  tabs: { type: Array, required: true }, // [{ id, label, disabled }]
  modelValue: { type: String, default: null },
  pills: { type: Boolean, default: false },
  fill: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

// A missing/non-array `tabs` renders an empty tablist instead of crashing.
const list = computed(() => (Array.isArray(props.tabs) ? props.tabs.filter(Boolean) : []))
const active = ref(props.modelValue ?? list.value[0]?.id)
watch(
  () => props.modelValue,
  (v) => {
    if (v) active.value = v
  }
)

// a11y (WCAG 4.1.1 / 4.1.2): ids are prefixed per instance, so two Tabs with
// the same tab ids on one page don't produce duplicate ids, and every tab's
// aria-controls points at a panel that exists: each tab has its own panel
// element (inactive ones `hidden` and empty, so slot content still only
// mounts while its tab is active).
const uid = useId('cui-tabs')
const idPart = (tab) => String(tab.id).replace(/\s+/g, '-')
const tabId = (tab) => `${uid}-tab-${idPart(tab)}`
const panelId = (tab) => `${uid}-panel-${idPart(tab)}`

function select(tab) {
  if (tab.disabled) return
  active.value = tab.id
  emit('update:modelValue', tab.id)
}

// a11y (WAI-ARIA APG "Tabs" pattern, WCAG 2.1.1): a real tablist is operated
// with Left/Right (Home/End) arrow keys, not Tab: Tab only enters/leaves the
// whole tablist once, landing on the active tab (see the roving `tabindex`
// below). We move focus AND selection together ("automatic activation"),
// matching the existing click-to-select behavior.
const tabRefs = ref({})
function setTabRef(id, el) {
  if (el) tabRefs.value[id] = el
}

function onKeydown(e) {
  const enabled = list.value.filter((t) => !t.disabled)
  if (!enabled.length) return
  const currentIndex = enabled.findIndex((t) => t.id === active.value)
  let nextIndex
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % enabled.length
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + enabled.length) % enabled.length
  else if (e.key === 'Home') nextIndex = 0
  else if (e.key === 'End') nextIndex = enabled.length - 1
  else return
  e.preventDefault()
  const nextTab = enabled[nextIndex]
  select(nextTab)
  tabRefs.value[nextTab.id]?.focus()
}
</script>

<template>
  <div class="cui-tabs">
    <div
      class="cui-tabs__list"
      :class="{ 'cui-tabs__list--pills': pills, 'cui-tabs__list--fill': fill }"
      role="tablist"
      @keydown="onKeydown"
    >
      <button
        v-for="tab in list"
        :id="tabId(tab)"
        :key="tab.id"
        :ref="(el) => setTabRef(tab.id, el)"
        type="button"
        role="tab"
        class="cui-tabs__tab"
        :class="{ 'cui-tabs__tab--active': active === tab.id }"
        :aria-selected="active === tab.id"
        :aria-controls="panelId(tab)"
        :tabindex="active === tab.id ? 0 : -1"
        :disabled="tab.disabled"
        @click="select(tab)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      v-for="tab in list"
      :id="panelId(tab)"
      :key="tab.id"
      class="cui-tabs__panel"
      role="tabpanel"
      :aria-labelledby="tabId(tab)"
      :hidden="active !== tab.id"
      :tabindex="active === tab.id ? 0 : undefined"
    >
      <transition name="cui-tabs-panel">
        <div v-if="active === tab.id">
          <slot :name="tab.id" :active="active" />
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.cui-tabs__list {
  display: flex;
  gap: var(--cui-space-2);
  border-bottom: 2px solid var(--cui-border);
  overflow-x: auto;
  overflow-y: hidden;
}

.cui-tabs__list--fill .cui-tabs__tab {
  flex: 1;
}

.cui-tabs__tab {
  padding: var(--cui-space-3) var(--cui-space-4);
  border: none;
  background: none;
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--cui-text-muted);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  white-space: nowrap;
  transition: color var(--cui-duration) var(--cui-ease), border-color var(--cui-duration) var(--cui-ease);
}

/* :not(--active): otherwise this out-specifies the pills variant's active
   color below and paints --cui-text onto the --cui-primary fill. */
.cui-tabs__tab:hover:not(:disabled):not(.cui-tabs__tab--active) {
  color: var(--cui-text);
}

.cui-tabs__tab--active {
  color: var(--cui-heading);
  border-color: var(--cui-color-teal);
}

.cui-tabs__tab:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cui-tabs__list--pills {
  border-bottom: none;
  gap: var(--cui-space-2);
}
.cui-tabs__list--pills .cui-tabs__tab {
  border: none;
  border-radius: var(--cui-radius-pill);
  background: var(--cui-bg-muted);
  margin-bottom: 0;
}
.cui-tabs__list--pills .cui-tabs__tab--active {
  background: var(--cui-primary);
  color: var(--cui-primary-contrast);
}

.cui-tabs__panel {
  padding-top: var(--cui-space-5);
}

.cui-tabs-panel-enter-active,
.cui-tabs-panel-leave-active {
  transition: opacity var(--cui-duration-fast) var(--cui-ease), transform var(--cui-duration-fast) var(--cui-ease);
}
.cui-tabs-panel-enter-from {
  opacity: 0;
  transform: translateY(2px);
}
.cui-tabs-panel-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .cui-tabs-panel-enter-from,
  .cui-tabs-panel-leave-to {
    transform: none;
  }
}
</style>
