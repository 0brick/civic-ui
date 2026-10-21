<script setup>
// Heading + intro wrapped around an Accordion: the FAQ block pattern used
// on process/service pages.
import Accordion from '../components/content/Accordion.vue'
import AccordionItem from '../components/content/AccordionItem.vue'

defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  intro: { type: String, default: '' },
  items: { type: Array, default: () => [] }, // [{ question, answer }]
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) },
  // Opt-in 860px column. Off by default so every section shares the same
  // container width and their edges line up when stacked.
  narrow: { type: Boolean, default: false }
})
</script>

<template>
  <section class="cui-section">
    <div class="cui-container" :class="{ 'cui-container--narrow': narrow }">
      <div class="cui-faq__intro" :class="`cui-align-${align}`">
        <span v-if="eyebrow" class="cui-eyebrow">{{ eyebrow }}</span>
        <h2>{{ title }}</h2>
        <p v-if="intro" class="cui-faq__lead">{{ intro }}</p>
      </div>
      <Accordion>
        <slot>
          <AccordionItem v-for="(item, i) in items" :key="i" :title="item.question">
            {{ item.answer }}
          </AccordionItem>
        </slot>
      </Accordion>
    </div>
  </section>
</template>

<style scoped>
.cui-faq__intro {
  max-width: 640px;
  margin-bottom: var(--cui-space-6);
}

.cui-faq__lead {
  font-size: var(--cui-fz-lead);
  color: var(--cui-lead-color, var(--cui-text-muted));
  margin: 0;
}
</style>
