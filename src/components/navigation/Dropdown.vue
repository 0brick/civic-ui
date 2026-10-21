<script setup>
// The one trigger+menu primitive. By default the trigger is whatever you put
// in the `#trigger` slot and the menu is the default slot: used standalone
// for menus and internally by Select. `triggerVariant` swaps in a built-in
// trigger button: 'chevron-label' (a labeled nav item with a chevron) or
// 'user' (an avatar + name account trigger). Passing a
// `#trigger` slot always overrides whichever built-in trigger `triggerVariant`
// would render.
//
// Not merged with Popover: both already share click-outside behavior via
// useClickOutside below, but Dropdown is a 2-way-aligned action-menu
// primitive (styles :deep(a)/:deep(button) rows, ships built-in trigger
// chrome) while Popover is a 4-way-placed rich-content primitive with no
// menu semantics: real divergence, not duplication.
import { computed, inject, ref, nextTick } from 'vue'
import { useClickOutside } from '../../composables/useClickOutside'
import { useId } from '../../composables/useId'
import Avatar from '../content/Avatar.vue'

const props = defineProps({
  align: { type: String, default: 'start', validator: (v) => ['start', 'end'].includes(v) },
  triggerVariant: { type: String, default: 'custom', validator: (v) => ['custom', 'chevron-label', 'user'].includes(v) },
  label: { type: String, default: '' }, // triggerVariant="chevron-label"
  highlight: { type: Boolean, default: false }, // triggerVariant="chevron-label": the emphasized nav-item style
  name: { type: String, default: '' }, // triggerVariant="user"
  role: { type: String, default: '' }, // triggerVariant="user"
  avatar: { type: String, default: '' } // triggerVariant="user"
})

// Inside a Navbar (see internal/NavContext.vue): in the mobile drawer a
// chevron-label dropdown renders as an expanded link group: a flyout menu
// in a drawer is both cramped and, with a tap-to-close drawer, unusable.
const navContext = inject('cui-nav-context', null)
const asGroup = computed(() => navContext === 'mobile' && props.triggerVariant === 'chevron-label')
const groupId = useId('cui-dropdown-group')

const open = ref(false)
const root = ref(null)
const menu = ref(null)
// `align` alone picks which edge the menu hangs from, not whether that
// still fits: a trigger sitting near either edge of a narrow viewport (a
// phone-width header, or this component previewed in a small stage) pushes
// a wide menu straight off-screen. Nudge it back in bounds after it renders
// rather than trying to predict trigger position from CSS alone.
const menuShift = ref(0)
// a11y (ARIA APG "Disclosure Navigation Menu" pattern): plain id/expanded
// wiring rather than role="menu": the panel holds arbitrary slotted content
// (nav links, action buttons, a whole mega-menu), not a strict action-menu
// list, so we don't claim a role whose required arrow-key/roving-tabindex
// keyboard behavior isn't implemented. An incomplete role="menu" would be
// worse for screen-reader users than no special role at all.
const menuId = useId('cui-dropdown-menu')

function toggle() {
  open.value ? close() : openMenu()
}

let previouslyFocused = null

function openMenu() {
  if (open.value) return
  previouslyFocused = document.activeElement
  open.value = true
  menuShift.value = 0
  nextTick(() => {
    const el = menu.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const margin = 8
    if (rect.left < margin) menuShift.value = margin - rect.left
    else if (rect.right > window.innerWidth - margin) menuShift.value = window.innerWidth - margin - rect.right
  })
}

function close() {
  if (!open.value) return
  open.value = false
  // a11y (WCAG 2.4.3): if focus was inside the menu when it closed (e.g.
  // Escape pressed on a menu item), send it back to the trigger instead of
  // letting it silently fall back to <body>.
  if (previouslyFocused && root.value?.contains(document.activeElement)) previouslyFocused.focus()
  previouslyFocused = null
}

useClickOutside(root, close)

defineExpose({ close, open })
</script>

<template>
  <div v-if="asGroup" class="cui-dropdown cui-dropdown--group" role="group" :aria-labelledby="groupId">
    <span :id="groupId" class="cui-dropdown__group-label">{{ label }}</span>
    <div class="cui-dropdown__group-items">
      <slot :close="close" />
    </div>
  </div>
  <div
    v-else
    ref="root"
    class="cui-dropdown"
    :class="{
      'cui-dropdown--mega': triggerVariant === 'chevron-label',
      'cui-dropdown--user': triggerVariant === 'user',
      'cui-dropdown--in-nav': navContext === 'desktop'
    }"
    @keydown.escape="close"
  >
    <div class="cui-dropdown__trigger" @click="toggle">
      <slot name="trigger" :open="open" :toggle="toggle" :menu-id="menuId">
        <button
          v-if="triggerVariant === 'chevron-label'"
          type="button"
          class="cui-dropdown__trigger-btn cui-dropdown__trigger-btn--mega"
          :class="{ 'cui-dropdown__trigger-btn--highlight': highlight }"
          :aria-expanded="String(open)"
          :aria-controls="menuId"
        >
          {{ label }}
          <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" class="cui-dropdown__chevron" :class="{ 'cui-dropdown__chevron--open': open }">
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button v-else-if="triggerVariant === 'user'" type="button" class="cui-dropdown__trigger-btn cui-dropdown__trigger-btn--user" :aria-expanded="String(open)" :aria-controls="menuId">
          <Avatar :src="avatar" :name="name" size="sm" decorative />
          <span class="cui-dropdown__user-info">
            <span class="cui-dropdown__user-name">{{ name }}</span>
            <span v-if="role" class="cui-dropdown__user-role">{{ role }}</span>
          </span>
          <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" class="cui-dropdown__chevron" :class="{ 'cui-dropdown__chevron--open': open }">
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </slot>
    </div>
    <transition name="cui-dropdown-fade">
      <div
        v-if="open"
        :id="menuId"
        ref="menu"
        class="cui-dropdown__menu"
        :class="`cui-dropdown__menu--${align}`"
        :style="{ '--cui-dropdown-shift': `${menuShift}px` }"
        @click="close"
      >
        <slot :close="close" />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.cui-dropdown {
  position: relative;
  display: inline-block;
}

/* Menu surface tokens: --cui-dropdown-bg / --cui-dropdown-text /
   --cui-dropdown-hover-bg (defaults follow the surface tokens, so the dark
   color mode works without overrides). */
.cui-dropdown__menu {
  position: absolute;
  top: calc(100% + 6px);
  min-width: 200px;
  background: var(--cui-dropdown-bg, var(--cui-surface-raised));
  color: var(--cui-dropdown-text, var(--cui-text));
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
  box-shadow: var(--cui-shadow-md);
  padding: var(--cui-space-2);
  z-index: var(--cui-z-dropdown);
  transform: translateX(var(--cui-dropdown-shift, 0px));
}

.cui-dropdown__menu--start {
  left: 0;
}
.cui-dropdown__menu--end {
  right: 0;
}

.cui-dropdown__menu :deep(a),
.cui-dropdown__menu :deep(button) {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.8rem 1rem;
  border-radius: var(--cui-radius-sm);
  border: none;
  background: none;
  font-size: 1.4rem;
  color: inherit;
  cursor: pointer;
  text-decoration: none;
}

.cui-dropdown__menu :deep(a:hover),
.cui-dropdown__menu :deep(button:hover) {
  background: var(--cui-dropdown-hover-bg, var(--cui-bg-subtle));
}
.cui-dropdown__menu :deep(a[aria-current='page']) {
  color: var(--cui-link);
}

.cui-dropdown-fade-enter-active,
.cui-dropdown-fade-leave-active {
  transition:
    opacity var(--cui-duration-fast) var(--cui-ease),
    transform var(--cui-duration-fast) var(--cui-ease);
}
.cui-dropdown-fade-enter-from,
.cui-dropdown-fade-leave-to {
  opacity: 0;
  transform: translateX(var(--cui-dropdown-shift, 0px)) translateY(-4px);
}

/* ---- built-in trigger buttons ---- */
.cui-dropdown__chevron {
  transition: transform var(--cui-duration) var(--cui-ease);
}
.cui-dropdown__chevron--open {
  transform: rotate(180deg);
}

/* chevron-label */
.cui-dropdown__trigger-btn--mega {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  font: inherit;
  font-weight: 600;
  font-size: 1.4rem;
  color: inherit;
  padding: 0.6rem 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.cui-dropdown__trigger-btn--mega:hover {
  border-color: var(--cui-accent);
}
/* In a Navbar's link row the trigger takes the row's own typography (the
   --cui-nav-* tokens on the row), so it reads exactly like the links beside
   it. `highlight` stays the deliberate exception. */
.cui-dropdown--in-nav .cui-dropdown__trigger-btn--mega:not(.cui-dropdown__trigger-btn--highlight) {
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  padding-block: 0.4rem;
}
.cui-dropdown--in-nav .cui-dropdown__trigger-btn--mega:not(.cui-dropdown__trigger-btn--highlight):hover,
.cui-dropdown--in-nav .cui-dropdown__trigger-btn--mega[aria-expanded='true']:not(.cui-dropdown__trigger-btn--highlight) {
  color: var(--cui-nav-active, var(--cui-text));
}
.cui-dropdown__trigger-btn--highlight {
  padding: 0.8rem 1.6rem;
  border-radius: var(--cui-radius-md);
  background: var(--cui-accent);
  color: var(--cui-accent-contrast);
  border-bottom: none;
}
.cui-dropdown__trigger-btn--highlight:hover {
  background: var(--cui-accent-hover);
}
.cui-dropdown--mega .cui-dropdown__menu {
  left: 0;
  min-width: 260px;
}
.cui-dropdown--mega .cui-dropdown__menu :deep(a) {
  padding: 1rem 1.2rem;
}

/* expanded group in the Navbar's mobile drawer (see asGroup) */
.cui-dropdown--group {
  display: block;
}
.cui-dropdown__group-label {
  display: block;
  padding: var(--cui-space-4) 0 var(--cui-space-1);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cui-text-muted);
}
.cui-dropdown__group-items {
  padding-inline-start: var(--cui-space-4);
  border-bottom: 1px solid var(--cui-border);
}
.cui-dropdown__group-items :deep(a:last-child) {
  border-bottom: none;
}

/* user */
.cui-dropdown__trigger-btn--user {
  display: flex;
  align-items: center;
  gap: var(--cui-space-2);
  padding: 0.4rem 0.8rem 0.4rem 0.4rem;
  border: 1px solid transparent;
  border-radius: var(--cui-radius-pill);
  background: none;
  cursor: pointer;
  font: inherit;
  color: inherit;
  transition: border-color var(--cui-duration) var(--cui-ease), background-color var(--cui-duration) var(--cui-ease);
}
.cui-dropdown__trigger-btn--user:hover {
  background: var(--cui-bg-muted);
}
/* Below 640px only the avatar shows, but name and role stay in the
   accessibility tree (visually hidden, not display:none): they are the
   button's name, and the avatar is decorative so the name isn't read twice. */
.cui-dropdown__user-info {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  text-align: left;
  line-height: 1.3;
}
.cui-dropdown__user-name {
  font-size: 1.3rem;
  font-weight: 700;
}
.cui-dropdown__user-role {
  font-size: 1.1rem;
  color: var(--cui-text-muted);
}
.cui-dropdown--user .cui-dropdown__chevron {
  color: var(--cui-text-muted);
}
@media (min-width: 640px) {
  .cui-dropdown__user-info {
    position: static;
    width: auto;
    height: auto;
    margin: 0;
    overflow: visible;
    clip: auto;
  }
}
</style>
