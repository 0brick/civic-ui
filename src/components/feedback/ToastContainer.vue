<script setup>
// Drop this once near the root of the app (e.g. in App.vue) and every
// `useToast().push(...)` call anywhere in the app renders here.
//
// a11y (WCAG 4.1.3): many screen readers only announce changes inside a live
// region that was already in the DOM: a toast that brings its own
// role="status" along is often inserted silently. So the container always
// renders two (empty, until something arrives) regions, assertive for
// warning/danger and polite for the rest, and the toasts are rendered into
// them with their own live role turned off.
import { computed } from 'vue'
import Toast from './Toast.vue'
import { useToast } from '../../composables/useToast'

defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (v) => ['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(v)
  }
})

const { toasts, dismiss, pause, resume } = useToast()

const isUrgent = (toast) => toast.variant === 'warning' || toast.variant === 'danger'
const regions = computed(() => [
  { key: 'assertive', items: toasts.filter(isUrgent) },
  { key: 'polite', items: toasts.filter((toast) => !isUrgent(toast)) }
])
</script>

<template>
  <teleport to="body">
    <div class="cui-toast-container" :class="`cui-toast-container--${position}`">
      <div v-for="region in regions" :key="region.key" class="cui-toast-region" :aria-live="region.key">
        <transition-group name="cui-toast-list" tag="div" class="cui-toast-list">
          <Toast
            v-for="t in region.items"
            :key="t.id"
            :variant="t.variant"
            :title="t.title"
            :live="false"
            @dismiss="dismiss(t.id)"
            @mouseenter="pause(t.id)"
            @mouseleave="resume(t.id)"
            @focusin="pause(t.id)"
            @focusout="resume(t.id)"
          >
            {{ t.message }}
          </Toast>
        </transition-group>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.cui-toast-container {
  position: fixed;
  z-index: var(--cui-z-toast);
  padding: var(--cui-space-4);
  pointer-events: none;
}
.cui-toast-container :deep(.cui-toast) {
  pointer-events: auto;
  margin-bottom: var(--cui-space-2);
}

.cui-toast-list {
  position: relative;
}

.cui-toast-container--top-right {
  top: 0;
  right: 0;
}
.cui-toast-container--top-left {
  top: 0;
  left: 0;
}
.cui-toast-container--bottom-right {
  bottom: 0;
  right: 0;
}
.cui-toast-container--bottom-left {
  bottom: 0;
  left: 0;
}

.cui-toast-list-move,
.cui-toast-list-enter-active,
.cui-toast-list-leave-active {
  transition: all var(--cui-duration) var(--cui-ease);
}
.cui-toast-list-enter-from,
.cui-toast-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
/* Take the leaving toast out of flow so the remaining ones can slide
   smoothly into its place (the standard FLIP list-transition technique)
   instead of snapping the moment it's removed from the DOM. */
.cui-toast-list-leave-active {
  position: absolute;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .cui-toast-list-move,
  .cui-toast-list-enter-active,
  .cui-toast-list-leave-active {
    transition: opacity var(--cui-duration) var(--cui-ease);
  }
  .cui-toast-list-enter-from,
  .cui-toast-list-leave-to {
    transform: none;
  }
}
</style>
