<script setup>
// The intro block under a HeroSection: kicker, heading, lead paragraph and
// an optional action. Spans the container width; the lead paragraph caps
// its own line length. `narrow` limits the block to an 860px column.
import AppButton from '../components/button/AppButton.vue'

defineProps({
  kicker: { type: String, default: '' },
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  action: { type: Object, default: null }, // { label, href, newTab? }
  align: { type: String, default: 'center', validator: (v) => ['left', 'center', 'right'].includes(v) },
  // Opt-in 860px column. Off by default so every section shares the same
  // container width and their edges line up when stacked.
  narrow: { type: Boolean, default: false }
})

const actionJustify = { left: 'flex-start', center: 'center', right: 'flex-end' }
</script>

<template>
  <section class="cui-section cui-page-intro">
    <div class="cui-container" :class="[`cui-align-${align}`, { 'cui-container--narrow': narrow }]">
      <p v-if="kicker" class="cui-page-intro__kicker">{{ kicker }}</p>
      <h2 v-if="title">{{ title }}</h2>
      <p v-if="text" class="cui-page-intro__text">{{ text }}</p>
      <div v-if="action" class="cui-page-intro__action" :style="{ justifyContent: actionJustify[align] }">
        <AppButton variant="primary" :href="action.href" :new-tab="action.newTab">{{ action.label }}</AppButton>
      </div>
      <div v-if="$slots.default" class="cui-page-intro__extra"><slot /></div>
    </div>
  </section>
</template>

<style scoped>
.cui-page-intro__kicker {
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--cui-text-muted);
  margin: 0 0 var(--cui-space-2);
}

.cui-page-intro__text {
  max-width: 60ch;
  font-size: 1.8rem;
  line-height: 1.6;
  color: var(--cui-text-muted);
  margin: var(--cui-space-3) 0 0;
}

.cui-align-center > .cui-page-intro__text {
  margin-inline: auto;
}
.cui-align-right > .cui-page-intro__text {
  margin-inline: auto 0;
}

.cui-page-intro__action {
  margin-top: var(--cui-space-5);
  display: flex;
  justify-content: center;
}

.cui-page-intro__extra {
  margin-top: var(--cui-space-5);
}
</style>
