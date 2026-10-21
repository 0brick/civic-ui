<script setup>
// A quote or grid of quotes. `layout="feature"` renders one large serif
// pull-quote (pass a single-entry `items` array) and `layout="grid"`
// (default) renders a star-rated card grid. Both loop the same
// `{ quote, name, role?, avatar?, rating? }` item shape.
import { computed } from 'vue'
import Avatar from '../components/content/Avatar.vue'
import Quote from '../components/content/Quote.vue'
import { t } from '../utils/i18n'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  intro: { type: String, default: '' },
  items: { type: Array, required: true }, // [{ quote, name, role?, avatar?, rating? }]
  layout: { type: String, default: 'grid', validator: (v) => ['grid', 'feature'].includes(v) },
  // null = auto (feature layout's pull-quote defaults centered, grid's head defaults left)
  align: { type: String, default: null, validator: (v) => v === null || ['left', 'center', 'right'].includes(v) },
  // Opt-in 860px column. Off by default so every section shares the same
  // container width and their edges line up when stacked.
  narrow: { type: Boolean, default: false },
  // layout="feature": passed to the Quote it renders ('mark' | 'border' | 'card')
  appearance: { type: String, default: 'mark', validator: (v) => ['mark', 'border', 'card'].includes(v) }
})

const effectiveAlign = computed(() => props.align || (props.layout === 'feature' ? 'center' : 'left'))

// Stars only for a real rating: no `rating` means no stars, not five
// invented ones. Clamped to 0-5 so the icons and the spoken text agree.
const hasRating = (item) => typeof item.rating === 'number' && Number.isFinite(item.rating)
const ratingOf = (item) => Math.min(5, Math.max(0, Math.round(item.rating)))

function stars(item) {
  const filled = ratingOf(item)
  return Array.from({ length: 5 }, (_, i) => i < filled)
}
</script>

<template>
  <section class="cui-section">
    <div class="cui-container" :class="{ 'cui-container--narrow': narrow }">
      <div v-if="title && layout === 'grid'" class="cui-testimonial__head" :class="`cui-align-${effectiveAlign}`">
        <span v-if="eyebrow" class="cui-eyebrow">{{ eyebrow }}</span>
        <h2>{{ title }}</h2>
        <p v-if="intro">{{ intro }}</p>
      </div>

      <Quote
        v-if="layout === 'feature'"
        :quote="items[0]?.quote"
        :name="items[0]?.name"
        :role="items[0]?.role"
        :avatar="items[0]?.avatar"
        :align="effectiveAlign"
        :appearance="appearance"
        size="lg"
      />

      <div v-else class="cui-grid cui-grid--3">
        <article v-for="(item, i) in items" :key="item.id ?? `${item.name}-${i}`" class="cui-testimonial-card">
          <div v-if="hasRating(item)" class="cui-testimonial-card__stars">
            <!-- a11y (WCAG 1.1.1): the star icons are aria-hidden decoration,
                 but the rating they represent is real information: expose it
                 as text instead of dropping it for screen-reader users. -->
            <svg
              v-for="(filled, j) in stars(item)"
              :key="j"
              viewBox="0 0 20 20"
              width="16"
              height="16"
              aria-hidden="true"
              :fill="filled ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="1.2"
            >
              <path d="M10 1.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" stroke-linejoin="round" />
            </svg>
            <span class="cui-visually-hidden">{{ t('testimonial.rating', { n: ratingOf(item) }) }}</span>
          </div>
          <p class="cui-testimonial-card__quote">&ldquo;{{ item.quote }}&rdquo;</p>
          <div class="cui-testimonial-card__person">
            <Avatar :src="item.avatar" :name="item.name" size="sm" decorative />
            <div>
              <p class="cui-testimonial-card__name">{{ item.name }}</p>
              <p v-if="item.role" class="cui-testimonial-card__role">{{ item.role }}</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cui-testimonial__head {
  max-width: 640px;
  margin-bottom: var(--cui-space-6);
}
.cui-testimonial__head p {
  margin-top: var(--cui-space-2);
  font-size: var(--cui-fz-lead);
  color: var(--cui-lead-color, var(--cui-text-muted));
}

.cui-testimonial-card {
  display: flex;
  flex-direction: column;
  gap: var(--cui-space-3);
  padding: var(--cui-space-5);
  background: var(--cui-surface);
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-lg);
  box-shadow: var(--cui-shadow-sm);
}

.cui-testimonial-card__stars {
  display: flex;
  gap: 0.2rem;
  color: var(--cui-color-yellow);
}

.cui-testimonial-card__quote {
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.55;
  color: var(--cui-text);
  flex: 1;
}

.cui-testimonial-card__person {
  display: flex;
  align-items: center;
  gap: var(--cui-space-3);
}

.cui-testimonial-card__name {
  margin: 0;
  font-family: var(--cui-font-heading);
  font-weight: var(--cui-heading-weight);
  font-size: 1.4rem;
}
.cui-testimonial-card__role {
  margin: 0;
  font-size: 1.3rem;
  color: var(--cui-text-muted);
}

/* ---- feature ---- */
</style>
