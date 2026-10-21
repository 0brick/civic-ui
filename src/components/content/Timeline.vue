<script setup>
// Vertical event timeline: agency history ("1956 founded…"), a case's
// process log, an incident's activity feed. Each entry is plain data, or
// swap in the default slot for fully custom row markup.
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] }, // [{ date, title, text }]
  // a11y (WCAG 1.3.1): the entry titles' heading level: match the page outline.
  headingLevel: { type: Number, default: 3, validator: (v) => v >= 2 && v <= 6 }
})
const headingTag = computed(() => `h${props.headingLevel}`)
</script>

<template>
  <ol class="cui-timeline">
    <slot>
      <li v-for="(item, i) in items" :key="i" class="cui-timeline__item">
        <div class="cui-timeline__marker" aria-hidden="true" />
        <div class="cui-timeline__body">
          <span v-if="item.date" class="cui-timeline__date">{{ item.date }}</span>
          <component :is="headingTag" v-if="item.title" class="cui-timeline__title">{{ item.title }}</component>
          <p v-if="item.text" class="cui-timeline__text">{{ item.text }}</p>
        </div>
      </li>
    </slot>
  </ol>
</template>

<style scoped>
.cui-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cui-timeline__item {
  position: relative;
  display: flex;
  gap: var(--cui-space-5);
  padding-bottom: var(--cui-space-6);
  padding-left: var(--cui-space-2);
}

.cui-timeline__item::before {
  content: '';
  position: absolute;
  left: calc(var(--cui-space-2) + 5px);
  top: 1.6rem;
  bottom: 0;
  width: 2px;
  background: var(--cui-border);
}

.cui-timeline__item:last-child::before {
  display: none;
}

.cui-timeline__marker {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  margin-top: 0.5rem;
  border-radius: 50%;
  background: var(--cui-color-yellow);
  border: 2px solid var(--cui-primary);
  z-index: 1;
}

.cui-timeline__date {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cui-text-secondary);
  margin-bottom: 0.4rem;
}

.cui-timeline__title {
  font-size: 1.8rem;
  margin: 0 0 0.4rem;
}

.cui-timeline__text {
  margin: 0;
  color: var(--cui-text-muted);
  font-size: 1.4rem;
}
</style>
