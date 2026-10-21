<script setup>
// A single key figure on a card: a big number, a label, and an optional
// trend delta: distinct from the marketing-oriented StatsSection (a
// full-width band for "About us" pages).
//   appearance 'dashboard' the KPI tile for a webapp dashboard grid
//              'highlight' a figure inside a content page (building costs,
//                          a membership fee, a donation goal): larger, with
//                          an accent edge in `color`
//   action     { label, href, newTab? }: a button under the figure
//   goal/current  a ProgressBar towards a goal ("60% of €15,000 reached");
//                 `unit` is appended to the formatted goal
import { computed } from 'vue'
import AppButton from '../button/AppButton.vue'
import ProgressBar from '../feedback/ProgressBar.vue'
import { sanitizeHtml } from '../../utils/security'
import { themeColors } from '../../utils/themes'
import { parseColor } from '../../utils/color'
import { t } from '../../utils/i18n'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  trend: { type: Number, default: null }, // e.g. 4.2 or -2.1 (percent)
  trendLabel: { type: String, default: '' },
  // Set for metrics where a lower number is the good outcome (open tickets,
  // resolution time, error rate, ...) so the trend color reflects whether
  // the change is favorable rather than just whether it's numerically up.
  invert: { type: Boolean, default: false },
  // Raw SVG markup, rendered via v-html: routed through sanitizeHtml() (see
  // utils/security.js): a strict icon allowlist by default, or whatever
  // sanitizer the host registers with configureSecurity({ sanitizeHtml }).
  icon: { type: String, default: '' },
  appearance: { type: String, default: 'dashboard', validator: (v) => ['dashboard', 'highlight'].includes(v) },
  // a section theme key / palette role, or a color: the highlight edge
  color: { type: String, default: '' },
  action: { type: Object, default: null }, // { label, href, newTab? }
  goal: { type: Number, default: null },
  current: { type: Number, default: null },
  unit: { type: String, default: '' },
  progressLabel: { type: String, default: '' }
})

const accent = computed(() => {
  if (!props.color) return null
  const themed = themeColors(props.color)
  if (themed) return themed.bg
  return parseColor(props.color) ? props.color : null
})

const hasProgress = computed(() => props.goal > 0 && typeof props.current === 'number' && props.current >= 0)
const progressText = computed(() => {
  if (!hasProgress.value) return ''
  if (props.progressLabel) return props.progressLabel
  const lang = typeof document !== 'undefined' ? document.documentElement.lang || undefined : undefined
  let goal
  try {
    goal = new Intl.NumberFormat(lang).format(props.goal)
  } catch {
    goal = String(props.goal)
  }
  if (props.unit) goal = `${goal} ${props.unit}`
  return t('statCard.progress', { percent: Math.round((props.current / props.goal) * 100), goal })
})

const trendDirection = computed(() => {
  if (props.trend === null) return 'flat'
  return props.trend > 0 ? 'up' : props.trend < 0 ? 'down' : 'flat'
})
// a11y (WCAG 1.3.1): the arrow icon is aria-hidden and the figure is shown
// unsigned, so the direction is spelled out for screen readers in front of
// it ("Down by 2.1%"): otherwise a drop would read as "2.1%".
const trendPrefix = computed(() => (trendDirection.value === 'flat' ? '' : `${t(`statCard.${trendDirection.value}`)} `))
const trendSentiment = computed(() => {
  if (trendDirection.value === 'flat') return 'flat'
  const isGood = props.invert ? trendDirection.value === 'down' : trendDirection.value === 'up'
  return isGood ? 'good' : 'bad'
})
</script>

<template>
  <div class="cui-stat-card" :class="`cui-stat-card--${appearance}`" :style="accent ? { '--cui-stat-card-accent': accent } : undefined">
    <div class="cui-stat-card__top">
      <p class="cui-stat-card__label">{{ label }}</p>
      <!-- eslint-disable-next-line vue/no-v-html -- routed through sanitizeHtml(), see utils/security.js -->
      <span v-if="icon" class="cui-stat-card__icon" aria-hidden="true" v-html="sanitizeHtml(icon)" />
    </div>
    <p class="cui-stat-card__value">{{ value }}</p>
    <p v-if="trend !== null" class="cui-stat-card__trend" :class="`cui-stat-card__trend--${trendSentiment}`">
      <svg v-if="trendDirection === 'up'" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 9l4-5 3 3 3-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
      <svg v-else-if="trendDirection === 'down'" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 3l4 5 3-3 3 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
      <span><span v-if="trendPrefix" class="cui-visually-hidden">{{ trendPrefix }}</span>{{ Math.abs(trend) }}%</span>
      <span v-if="trendLabel" class="cui-stat-card__trend-label">{{ trendLabel }}</span>
    </p>
    <ProgressBar
      v-if="hasProgress"
      class="cui-stat-card__progress"
      :value="Math.min(current, goal)"
      :max="goal"
      :label="progressText"
      variant="success"
    />
    <AppButton
      v-if="action"
      class="cui-stat-card__action"
      :variant="appearance === 'highlight' ? 'primary' : 'outline'"
      :size="appearance === 'highlight' ? 'md' : 'sm'"
      :href="action.href"
      :new-tab="action.newTab"
    >
      {{ action.label }}
    </AppButton>
  </div>
</template>

<style scoped>
.cui-stat-card {
  background: var(--cui-surface);
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-lg);
  padding: var(--cui-space-5);
}

/* highlight: a figure inside a content page */
.cui-stat-card--highlight {
  padding: var(--cui-space-6);
  border-top: 4px solid var(--cui-stat-card-accent, var(--cui-accent));
  box-shadow: var(--cui-shadow-sm);
}
.cui-stat-card--highlight .cui-stat-card__label {
  font-size: 1.4rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.cui-stat-card--highlight .cui-stat-card__value {
  font-family: var(--cui-font-heading);
  font-size: clamp(3.6rem, 2vw + 2.8rem, 4.8rem);
  font-variant-numeric: tabular-nums;
}

.cui-stat-card__progress {
  margin-top: var(--cui-space-4);
}
.cui-stat-card__action {
  margin-top: var(--cui-space-4);
}
.cui-stat-card--highlight .cui-stat-card__action {
  width: 100%;
}

.cui-stat-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--cui-space-3);
}

.cui-stat-card__label {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--cui-text-muted);
}

.cui-stat-card__icon {
  display: inline-flex;
  color: var(--cui-text-secondary);
  flex-shrink: 0;
}
.cui-stat-card__icon :deep(svg) {
  width: 2rem;
  height: 2rem;
}

.cui-stat-card__value {
  margin: var(--cui-space-2) 0 0;
  font-size: 3.2rem;
  font-weight: 700;
  color: var(--cui-heading);
  line-height: 1.1;
}

.cui-stat-card__trend {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: var(--cui-space-3) 0 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.cui-stat-card__trend--good {
  color: var(--cui-text-success);
}
.cui-stat-card__trend--bad {
  color: var(--cui-text-danger);
}
.cui-stat-card__trend--flat {
  color: var(--cui-text-muted);
}

.cui-stat-card__trend-label {
  font-weight: 400;
  color: var(--cui-text-muted);
}
</style>
