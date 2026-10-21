<script setup>
// Wraps a set of <AccordionItem>s and tells them (via provide) which one is
// open, so only one panel expands at a time unless `multiple` is set,
// mirrors a common FAQ pattern. `headingLevel` sets the heading tag of every
// item (an item's own `headingLevel` still wins).
import { ref, provide, readonly } from 'vue'

const props = defineProps({
  multiple: { type: Boolean, default: false },
  headingLevel: { type: Number, default: 3, validator: (v) => v >= 2 && v <= 6 }
})

const openIds = ref(new Set())

function toggle(id) {
  if (openIds.value.has(id)) {
    openIds.value.delete(id)
  } else {
    if (!props.multiple) openIds.value.clear()
    openIds.value.add(id)
  }
  openIds.value = new Set(openIds.value)
}

function isOpen(id) {
  return openIds.value.has(id)
}

provide('cui-accordion', {
  toggle,
  isOpen,
  openIds: readonly(openIds),
  headingLevel: () => props.headingLevel
})
</script>

<template>
  <div class="cui-accordion">
    <slot />
  </div>
</template>

<style scoped>
.cui-accordion {
  border-top: 1px solid var(--cui-border);
}
</style>
