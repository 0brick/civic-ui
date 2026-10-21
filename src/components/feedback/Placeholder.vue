<script setup>
// Skeleton-loading block. Size it with width/height props or just override
// with a class: it's a plain shimmering rectangle by design.
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1.6rem' },
  rounded: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg', 'pill'].includes(v) },
  animated: { type: Boolean, default: true }
})
</script>

<template>
  <span
    class="cui-placeholder"
    :class="[`cui-placeholder--${rounded}`, { 'cui-placeholder--animated': animated }]"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>

<style scoped>
.cui-placeholder {
  display: inline-block;
  background: var(--cui-bg-muted);
}

.cui-placeholder--sm {
  border-radius: var(--cui-radius-sm);
}
.cui-placeholder--md {
  border-radius: var(--cui-radius-md);
}
.cui-placeholder--lg {
  border-radius: var(--cui-radius-lg);
}
.cui-placeholder--pill {
  border-radius: var(--cui-radius-pill);
}

.cui-placeholder--animated {
  background: linear-gradient(90deg, var(--cui-bg-muted) 25%, var(--cui-border) 37%, var(--cui-bg-muted) 63%);
  background-size: 400% 100%;
  animation: cui-placeholder-shimmer 1.6s ease infinite;
}

@keyframes cui-placeholder-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cui-placeholder--animated {
    animation: none;
  }
}
</style>
