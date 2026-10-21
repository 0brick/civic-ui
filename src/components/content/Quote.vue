<script setup>
// A pull-quote: figure > blockquote + figcaption (source, role, avatar).
// Standalone for quotes inside running text (a .cui-prose column, an
// article), and what TestimonialSection's `layout="feature"` renders.
//   appearance 'mark'   large quotation mark above the text (the feature look)
//              'border' an accent rule on the leading side, subtle field, the
//                       source in small caps, for inline use
//              'card'   a raised box
// `color` (a section theme key / palette role, or a color) tints the mark
// and the rule; default the accent role.
import { computed } from 'vue'
import { sanitizeMediaUrl, mediaReferrerPolicy } from '../../utils/security'
import { themeColors } from '../../utils/themes'
import { parseColor } from '../../utils/color'

const props = defineProps({
  quote: { type: String, default: '' }, // the default slot wins
  name: { type: String, default: '' },
  role: { type: String, default: '' },
  avatar: { type: String, default: '' },
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) },
  size: { type: String, default: 'md', validator: (v) => ['md', 'lg'].includes(v) },
  appearance: { type: String, default: 'mark', validator: (v) => ['mark', 'border', 'card'].includes(v) },
  color: { type: String, default: '' }
})

const accent = computed(() => {
  if (!props.color) return null
  const themed = themeColors(props.color)
  if (themed) return themed.bg
  return parseColor(props.color) ? props.color : null
})
</script>

<template>
  <figure
    class="cui-quote"
    :class="[`cui-align-${align}`, `cui-quote--${appearance}`, `cui-quote--${size}`]"
    :style="accent ? { '--cui-quote-accent': accent } : undefined"
  >
    <svg v-if="appearance !== 'border'" class="cui-quote__mark" viewBox="0 0 32 24" width="40" height="30" aria-hidden="true">
      <path d="M0 24V13.5C0 6 4.5 1 12 0l1.5 3.5C8 5 5.5 8 5.5 12H12V24H0zm18 0V13.5C18 6 22.5 1 30 0l1.5 3.5C26 5 23.5 8 23.5 12H30V24H18z" fill="currentColor" />
    </svg>
    <blockquote class="cui-quote__text"><slot>{{ quote }}</slot></blockquote>
    <figcaption v-if="name" class="cui-quote__author">
      <!-- alt="": the name is the text right next to it (read once, not twice) -->
      <img v-if="avatar" :src="sanitizeMediaUrl(avatar)" alt="" class="cui-quote__avatar" :referrerpolicy="mediaReferrerPolicy()" />
      <span>
        <strong>{{ name }}</strong>
        <span v-if="role" class="cui-quote__role">{{ role }}</span>
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
/* :where() keeps this reset weaker than a surrounding layout's spacing,
   e.g. .cui-prose's paragraph rhythm. */
:where(.cui-quote) {
  margin: 0;
}
.cui-quote__mark {
  display: block;
  color: var(--cui-quote-accent, var(--cui-color-yellow));
  margin-bottom: var(--cui-space-3);
}
.cui-quote__text {
  margin: 0;
  max-width: 40ch; /* keep a large pull-quote readable */
  font-family: var(--cui-font-serif);
  font-weight: 600;
  line-height: 1.35;
  color: var(--cui-heading);
}
.cui-quote--lg .cui-quote__text {
  font-size: clamp(2.2rem, 2vw + 1.4rem, 3.2rem);
}
.cui-quote--md .cui-quote__text {
  font-size: 1.9rem;
  max-width: 60ch;
}
.cui-quote--md .cui-quote__mark {
  width: 28px;
  height: 21px;
}
.cui-quote__text :slotted(p) {
  margin: 0 0 var(--cui-space-3);
}
.cui-quote__text :slotted(p:last-child) {
  margin-bottom: 0;
}
.cui-quote__author strong {
  font-family: var(--cui-font-heading);
  font-weight: var(--cui-heading-weight);
}
.cui-quote__author {
  display: flex;
  align-items: center;
  gap: var(--cui-space-3);
  margin-top: var(--cui-space-5);
  font-size: 1.4rem;
  color: var(--cui-text-muted);
}
.cui-quote__avatar {
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 50%;
  object-fit: cover;
}
.cui-quote__role {
  display: block;
  font-size: 1.3rem;
}

/* border: inline pull-quote inside running text */
.cui-quote--border {
  padding: var(--cui-space-4) var(--cui-space-5);
  border-inline-start: 4px solid var(--cui-quote-accent, var(--cui-accent));
  background: var(--cui-bg-subtle);
  border-radius: 0 var(--cui-radius-md) var(--cui-radius-md) 0;
}
.cui-quote--border .cui-quote__text {
  font-weight: 500;
}
.cui-quote--border .cui-quote__author {
  margin-top: var(--cui-space-3);
  font-size: 1.2rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.cui-quote--border .cui-quote__author strong {
  font-family: inherit;
  font-weight: 700;
}
/* card: a raised box */
.cui-quote--card {
  padding: var(--cui-space-6);
  background: var(--cui-surface-raised);
  border-radius: var(--cui-radius-lg);
  box-shadow: var(--cui-shadow-sm);
}

.cui-quote.cui-align-center .cui-quote__mark,
.cui-quote.cui-align-center .cui-quote__text {
  margin-inline: auto;
}
.cui-quote.cui-align-right .cui-quote__mark,
.cui-quote.cui-align-right .cui-quote__text {
  margin-inline: auto 0;
}
.cui-quote.cui-align-center .cui-quote__author {
  justify-content: center;
}
.cui-quote.cui-align-right .cui-quote__author {
  justify-content: flex-end;
}
</style>
