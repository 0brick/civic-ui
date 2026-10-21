<script setup>
// The split image/text content section: the workhorse for long-form
// content pages. Two content shapes share this one skeleton, picked
// automatically by which props are set:
//   text mode     plain body copy (`text`) + optional `action` button
//   feature mode  a divided list of named items, pass `items`
// The `#visual` slot replaces the image with any custom visual. There is
// deliberately no built-in map embed (a tile server iframe would contact a
// third party without consent); put a ConsentEmbed into `#visual` instead.
// `reverse` flips which side the visual sits on in both modes; `subtle`
// applies the sunken section background.
import { computed } from 'vue'
import AppButton from '../components/button/AppButton.vue'
import { vReveal } from '../composables/useReveal'
import { sanitizeMediaUrl, mediaReferrerPolicy } from '../utils/security'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  text: { type: String, default: '' }, // plain body copy, or the feature-list lead paragraph
  items: { type: Array, default: () => [] }, // [{ title, text }]: enables feature mode
  image: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  reverse: { type: Boolean, default: false },
  subtle: { type: Boolean, default: false },
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) },
  action: { type: Object, default: null } // { label, href, newTab? }
})

const mode = computed(() => (props.items.length ? 'feature' : 'text'))
</script>

<template>
  <section class="cui-section" :class="{ 'cui-section--subtle': subtle }">
    <div class="cui-container">
      <div class="cui-media-text" :class="[`cui-media-text--${mode}`, { 'cui-media-text--reverse': reverse }]">
        <div v-reveal class="cui-media-text__media">
          <slot name="visual">
            <img v-if="image" :src="sanitizeMediaUrl(image)" :alt="imageAlt" loading="lazy" :referrerpolicy="mediaReferrerPolicy()" />
          </slot>
        </div>
        <div class="cui-media-text__body">
          <div v-reveal="60" class="cui-media-text__head" :class="`cui-align-${align}`">
            <span v-if="eyebrow" class="cui-eyebrow">{{ eyebrow }}</span>
            <h2 v-if="title">{{ title }}</h2>
            <p v-if="text" class="cui-media-text__text">{{ text }}</p>
          </div>

          <ul v-if="mode === 'feature'" class="cui-media-text__items">
            <li v-for="(item, i) in items" :key="item.title" v-reveal="i * 70 + 60">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </li>
          </ul>

          <div v-if="$slots.default"><slot /></div>
          <AppButton v-if="action" variant="primary" :href="action.href" :new-tab="action.newTab" class="cui-media-text__action">
            {{ action.label }}
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cui-media-text {
  display: grid;
  gap: var(--cui-space-6);
  align-items: center;
}

.cui-media-text__media {
  border-radius: var(--cui-radius-lg);
  overflow: hidden;
}
.cui-media-text__media img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  aspect-ratio: 4 / 3;
}

.cui-media-text--feature .cui-media-text__media {
  border: 1px solid var(--cui-border);
}
.cui-media-text--feature .cui-media-text__media img {
  aspect-ratio: 4 / 5;
}

.cui-media-text__head h2 {
  max-width: 20ch;
}
/* h2/text below carry their own max-width rather than .cui-media-text__head
   itself, so centering/right-aligning needs its own auto margins too: the
   .cui-align-* utility's margin-inline only reaches the head element. */
.cui-media-text__head.cui-align-center h2,
.cui-media-text__head.cui-align-center .cui-media-text__text {
  margin-inline: auto;
}
.cui-media-text__head.cui-align-right h2,
.cui-media-text__head.cui-align-right .cui-media-text__text {
  margin-inline: auto 0;
}

.cui-media-text__text {
  font-size: 1.6rem;
  line-height: 1.55;
  color: var(--cui-text-muted);
}
.cui-media-text--feature .cui-media-text__text {
  max-width: 44ch;
}

.cui-media-text__items {
  list-style: none;
  margin: var(--cui-space-6) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.cui-media-text__items li {
  padding-block: var(--cui-space-4);
  border-top: 1px solid var(--cui-border);
}
.cui-media-text__items li:last-child {
  border-bottom: 1px solid var(--cui-border);
}
.cui-media-text__items h3 {
  margin: 0;
  font-size: 1.8rem;
}
.cui-media-text__items p {
  margin: var(--cui-space-2) 0 0;
  font-size: 1.5rem;
  line-height: 1.55;
  color: var(--cui-text-muted);
  max-width: 44ch;
}

.cui-media-text__action {
  margin-top: var(--cui-space-4);
}

@media (min-width: 900px) {
  .cui-media-text {
    grid-template-columns: 1fr 1fr;
    gap: var(--cui-space-8);
  }
  .cui-media-text--feature {
    grid-template-columns: 0.85fr 1.15fr;
  }
  .cui-media-text--reverse .cui-media-text__media {
    order: 2;
  }}
</style>
