<script setup>
// A native <button>, or an <a> when `href` is set, so one component covers
// actions and call-to-action links. `tag` swaps in a router link.
// `icon` takes a component or an image URL, sized in em; `iconOnly` makes a
// square button whose slot text stays as a visually hidden accessible name.
// `newTab` (links only): see utils/links.js.
// a11y:
// - A disabled link drops its href and renders <a role="link"
//   aria-disabled="true"> (WCAG 4.1.2).
// - `loading`, and `disabled` with `focusableWhenDisabled`, use aria-disabled
//   so a focused button keeps focus while busy (WCAG 2.4.3). Clicks and
//   submits are blocked either way.
import { computed, useAttrs } from 'vue'
import { sanitizeUrl, sanitizeMediaUrl, mediaReferrerPolicy } from '../../utils/security'
import { internalLinkComponent, isRouterTag } from '../../utils/links'
import NewTabHint from '../internal/NewTabHint.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    // `violet` is an alias for `quaternary`
    validator: (v) => ['primary', 'accent', 'quaternary', 'violet', 'outline', 'ghost', 'link', 'danger'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  tag: { type: [String, Object], default: null },
  href: { type: String, default: null },
  newTab: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  // Keep a disabled <button> focusable (aria-disabled, clicks blocked),
  // for a button that gets disabled while it has focus.
  focusableWhenDisabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  icon: { type: [String, Object, Function], default: null }, // component | image URL
  iconPosition: { type: String, default: 'start', validator: (v) => ['start', 'end'].includes(v) },
  iconOnly: { type: Boolean, default: false }
})

// The variant is named after the palette role, not the default palette's
// color, with a configured brand, `quaternary` needn't be violet at all.
const variantClass = computed(() => `cui-btn--${props.variant === 'violet' ? 'quaternary' : props.variant}`)

const iconIsImage = computed(() => typeof props.icon === 'string')
// a11y (WCAG 4.1.2 Name, Role, Value): with `iconOnly` the slot text stays
// in the DOM (visually hidden) so the button keeps an accessible name,
// always pass one (or an aria-label).

// With configureLinks({ linkComponent }) an internal href renders the router
// link (client-side navigation) without needing `tag` on every button.
const routerTag = computed(() => (props.tag ? null : internalLinkComponent(sanitizeUrl(props.href), props.newTab || attrs.target === '_blank')))
const resolvedTag = computed(() => props.tag ?? routerTag.value ?? (props.href ? 'a' : 'button'))
// A router link takes `to`, not `href` (an explicit `to` attribute wins).
const isRouterLink = computed(() => isRouterTag(resolvedTag.value))
// security (OWASP ASVS 5.0 1.2.2): every CTA/link across the library renders
// through this one component, so sanitizing `href` here: instead of at
// each of the ~15 section components that pass a data-driven `href`/
// `action.href` through: blocks a javascript:/vbscript:/data: URI for
// all of them at once.
const attrs = useAttrs()
const safeHref = computed(() => sanitizeUrl(props.href))
// a11y (WCAG 3.2.5): a native target="_blank" attribute opens a new tab just
// like `newTab` does, so it gets the same rel + screen-reader hint instead of
// silently skipping it.
const opensNewTab = computed(() => (props.newTab || attrs.target === '_blank') && (resolvedTag.value === 'a' || isRouterLink.value))
const isLink = computed(() => resolvedTag.value === 'a' || isRouterLink.value)
const linkBlocked = computed(() => isLink.value && (props.disabled || props.loading))
const softBlocked = computed(() => resolvedTag.value === 'button' && (props.loading || (props.disabled && props.focusableWhenDisabled)))
const ariaDisabled = computed(() => linkBlocked.value || softBlocked.value)
const renderTag = computed(() => (linkBlocked.value ? 'a' : resolvedTag.value))
function blockClick(e) {
  if (!ariaDisabled.value) return
  e.preventDefault()
  e.stopPropagation()
}
// The spinner takes the icon's place while loading, so with
// iconPosition="end" the label doesn't jump sideways.
const spinnerAtEnd = computed(() => !!props.icon && props.iconPosition === 'end')
</script>

<template>
  <component
    :is="renderTag"
    class="cui-btn"
    :class="[
      variantClass,
      `cui-btn--${size}`,
      { 'cui-btn--block': block, 'cui-btn--loading': loading, 'cui-btn--icon-only': iconOnly && icon }
    ]"
    :href="isRouterLink || linkBlocked ? undefined : safeHref"
    :to="isRouterLink && !linkBlocked ? (attrs.to ?? safeHref) : undefined"
    :target="opensNewTab && !linkBlocked ? '_blank' : undefined"
    :rel="opensNewTab && !linkBlocked ? 'noopener noreferrer' : undefined"
    :role="linkBlocked ? 'link' : undefined"
    :type="resolvedTag === 'button' ? type : undefined"
    :disabled="resolvedTag === 'button' && disabled && !softBlocked ? true : undefined"
    :aria-disabled="ariaDisabled ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    @click.capture="blockClick"
  >
    <span v-if="loading && !spinnerAtEnd" class="cui-btn__spinner" data-cui-motion="essential" aria-hidden="true" />
    <template v-if="icon && !loading && iconPosition === 'start'">
      <img v-if="iconIsImage" :src="sanitizeMediaUrl(icon)" alt="" class="cui-btn__icon" aria-hidden="true" :referrerpolicy="mediaReferrerPolicy()" />
      <component :is="icon" v-else class="cui-btn__icon" aria-hidden="true" focusable="false" />
    </template>
    <span class="cui-btn__label" :class="{ 'cui-visually-hidden': iconOnly && icon }"><slot /><NewTabHint v-if="opensNewTab" /></span>
    <template v-if="icon && !loading && iconPosition === 'end'">
      <img v-if="iconIsImage" :src="sanitizeMediaUrl(icon)" alt="" class="cui-btn__icon" aria-hidden="true" :referrerpolicy="mediaReferrerPolicy()" />
      <component :is="icon" v-else class="cui-btn__icon" aria-hidden="true" focusable="false" />
    </template>
    <span v-if="loading && spinnerAtEnd" class="cui-btn__spinner" data-cui-motion="essential" aria-hidden="true" />
  </component>
</template>

<style scoped>
.cui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--cui-space-2);
  font-family: var(--cui-font-sans);
  font-weight: var(--cui-btn-font-weight);
  letter-spacing: -0.005em;
  border-radius: var(--cui-btn-radius);
  border: 1.5px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition:
    background-color var(--cui-duration) var(--cui-ease),
    color var(--cui-duration) var(--cui-ease),
    border-color var(--cui-duration) var(--cui-ease),
    transform var(--cui-duration-fast) var(--cui-ease);
  white-space: nowrap;
}

.cui-btn:active:not(:disabled, [aria-disabled='true']) {
  transform: scale(0.97);
}

.cui-btn:disabled,
.cui-btn[aria-disabled='true'] {
  cursor: not-allowed;
  opacity: 0.55;
}

/* sizes */
.cui-btn--sm {
  padding: 0.9rem 1.6rem;
  font-size: 1.3rem;
}
.cui-btn--md {
  padding: 1.3rem 2.6rem;
  font-size: 1.5rem;
}
.cui-btn--lg {
  padding: 1.6rem 3.2rem;
  font-size: 1.7rem;
}
.cui-btn--block {
  display: flex;
  width: 100%;
}

/* the label is a flex row of its own, so whatever lands in the slot (a
   Spinner, an inline SVG, a badge, …) is centered on the cross axis and
   spaced like the `icon` prop, instead of sitting on the text baseline. */
.cui-btn__label {
  display: inline-flex;
  align-items: center;
  gap: var(--cui-space-2);
}

/* icons: sized relative to the button's font-size, so sm/md/lg scale them
   automatically. SVG icon components that draw with currentColor pick up
   each variant's text color on their own. */
.cui-btn__icon {
  flex: none;
  display: block;
  width: 1.25em;
  height: 1.25em;
  object-fit: contain;
}

/* icon-only: square, exactly as tall as a text button of the same size.
   The zero-width strut keeps the text line box (the label itself is
   visually hidden, i.e. out of flow), the size class keeps its vertical
   padding, and the width is that same line box + padding. content-box so
   the border is added the same (device-pixel-snapped) way on both axes. */
.cui-btn--icon-only {
  box-sizing: content-box;
  padding-inline: 0;
}
.cui-btn--icon-only.cui-btn--sm {
  width: calc(var(--cui-lh-base) * 1em + 1.8rem); /* fallback where `lh` is unsupported (Safari < 17) */
  width: calc(1lh + 1.8rem);
}
.cui-btn--icon-only.cui-btn--md {
  width: calc(var(--cui-lh-base) * 1em + 2.6rem); /* fallback where `lh` is unsupported (Safari < 17) */
  width: calc(1lh + 2.6rem);
}
.cui-btn--icon-only.cui-btn--lg {
  width: calc(var(--cui-lh-base) * 1em + 3.2rem); /* fallback where `lh` is unsupported (Safari < 17) */
  width: calc(1lh + 3.2rem);
}
.cui-btn--icon-only::before {
  content: '\200b';
  width: 0;
  margin-right: calc(-1 * var(--cui-space-2)); /* cancel the flex gap */
}

/* variants */
.cui-btn--primary {
  background: var(--cui-primary);
  color: var(--cui-primary-contrast);
}
.cui-btn--primary:hover:not(:disabled) {
  background: var(--cui-primary-hover);
}

.cui-btn--accent {
  background: var(--cui-accent);
  color: var(--cui-accent-contrast);
}
.cui-btn--accent:hover:not(:disabled) {
  background: var(--cui-accent-hover);
}

.cui-btn--quaternary {
  background: var(--cui-color-violet);
  color: var(--cui-color-white);
}
.cui-btn--quaternary:hover:not(:disabled) {
  filter: brightness(0.92);
}

.cui-btn--outline {
  background: transparent;
  border-color: var(--cui-primary);
  color: var(--cui-primary);
}
.cui-btn--outline:hover:not(:disabled) {
  background: var(--cui-primary);
  color: var(--cui-primary-contrast);
}

.cui-btn--ghost {
  background: transparent;
  color: var(--cui-text);
  border-color: var(--cui-color-line-strong);
}
.cui-btn--ghost:hover:not(:disabled) {
  background: var(--cui-bg-muted);
  border-color: var(--cui-border-strong);
}

/* On a dark band (a section with a dark background sets
   data-cui-theme="dark" on itself, or the .cui-section--dark utility) the
   ink-colored outline/ghost variants would vanish: switch them to the
   band's light text color. Plain descendant selectors, not :global(): scoped
   CSS only tags the last compound, and `:global(x) .y` compiles to `x {}`. */
[data-cui-theme='dark'] .cui-btn--outline,
.cui-section--dark .cui-btn--outline {
  border-color: var(--cui-heading);
  color: var(--cui-heading);
}
[data-cui-theme='dark'] .cui-btn--outline:hover:not(:disabled),
.cui-section--dark .cui-btn--outline:hover:not(:disabled) {
  background: var(--cui-heading);
  color: var(--cui-primary);
}
[data-cui-theme='dark'] .cui-btn--ghost,
.cui-section--dark .cui-btn--ghost {
  color: var(--cui-heading);
  border-color: rgba(255, 255, 255, 0.4);
}
[data-cui-theme='dark'] .cui-btn--ghost:hover:not(:disabled),
.cui-section--dark .cui-btn--ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--cui-heading);
}
[data-cui-theme='dark'] .cui-btn--link,
.cui-section--dark .cui-btn--link {
  color: var(--cui-link);
}

.cui-btn--link {
  background: transparent;
  color: var(--cui-link);
  padding-inline: 0;
  border-radius: 0;
}
.cui-btn--link:hover:not(:disabled) {
  color: var(--cui-link-hover);
  text-decoration: underline;
}

.cui-btn--danger {
  background: var(--cui-color-danger);
  color: var(--cui-color-white);
}
.cui-btn--danger:hover:not(:disabled) {
  filter: brightness(0.9);
}

.cui-btn__spinner {
  width: 1.4em;
  height: 1.4em;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: cui-btn-spin 0.7s linear infinite;
}
/* Like Spinner: its motion is the "busy" message, so reduced motion slows it
   down instead of stopping it (exempt from base.css's global rule via
   data-cui-motion="essential"). */
@media (prefers-reduced-motion: reduce) {
  .cui-btn__spinner {
    animation-duration: 1.4s;
  }
}

@keyframes cui-btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
