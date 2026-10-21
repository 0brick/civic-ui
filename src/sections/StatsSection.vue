<script setup>
// A row of key figures ("X employees, Y locations…"): common on agency
// "about us" pages to establish scale without a wall of text.
//   background  a section theme key / palette role or a color (as in
//               CtaBanner); unset keeps the dark primary band
//   columns     'auto' (as many columns as figures, up to 4) or a fixed
//               2/3/4 from 900px up
// For a single highlighted figure beside running text (a donation goal, a
// membership fee) use StatCard appearance="highlight" instead.
import { computed } from 'vue'
import { resolveBackground, deriveContrastText, isDarkBackground } from '../utils/themes'

const props = defineProps({
  title: { type: String, default: '' },
  stats: { type: Array, required: true }, // [{ value, label }]
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) },
  background: { type: String, default: '' },
  columns: { type: [String, Number], default: 'auto', validator: (v) => v === 'auto' || [2, 3, 4].includes(Number(v)) }
})

const theme = computed(() => {
  const r = resolveBackground(props.background)
  if (r?.type === 'theme') return r
  if (r?.type === 'color') return { bg: r.bg, ...deriveContrastText(r.bg) }
  return null
})
const isDark = computed(() => (theme.value ? isDarkBackground(theme.value.bg) : true))

// cui-grid--4 already drops to as many columns as there are figures
const gridClass = computed(() => `cui-grid--${props.columns === 'auto' ? 4 : Number(props.columns)}`)
</script>

<template>
  <section
    class="cui-section cui-stats"
    :class="{ 'cui-section--dark': !theme, 'cui-stats--themed': theme }"
    :data-cui-theme="theme && isDark ? 'dark' : undefined"
    :style="theme ? { '--cui-stats-bg': theme.bg, '--cui-stats-text': theme.text, '--cui-stats-heading': theme.heading, '--cui-stats-value': theme.eyebrow } : undefined"
  >
    <div class="cui-container">
      <h2 v-if="title" class="cui-stats__title" :class="`cui-align-${align}`">{{ title }}</h2>
      <div class="cui-grid cui-stats__grid" :class="gridClass">
        <div v-for="stat in stats" :key="stat.label" class="cui-stats__item">
          <p class="cui-stats__value">{{ stat.value }}</p>
          <p class="cui-stats__label">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cui-stats__title {
  color: var(--cui-stats-heading, var(--cui-color-white));
  margin-bottom: var(--cui-space-6);
}

.cui-stats__item {
  text-align: center;
}

.cui-stats__value {
  font-size: clamp(3rem, 4vw, 4.6rem);
  font-weight: 700;
  color: var(--cui-stats-value, var(--cui-accent-on-primary));
  margin: 0;
}

.cui-stats__label {
  margin: var(--cui-space-2) 0 0;
  color: var(--cui-stats-text, rgba(255, 255, 255, 0.8));
  font-size: 1.4rem;
}

.cui-stats--themed {
  background: var(--cui-stats-bg);
}
</style>
