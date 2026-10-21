<script setup>
// An intro + card grid (3 columns by default, see `columns`). `itemVariant` picks what each item renders as:
// 'teaser' (topic grid, default) or 'person' (press office or team
// directory, Card layout="person").
import { computed } from 'vue'
import Card from '../components/content/Card.vue'
import { useId } from '../composables/useId'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  // Optional; with `titleHidden` it's kept for screen readers only (the
  // section stays named via aria-labelledby), for a page whose own <h1>
  // already says what the grid is.
  title: { type: String, default: '' },
  titleHidden: { type: Boolean, default: false },
  intro: { type: String, default: '' },
  items: { type: Array, required: true }, // teaser: [{title,text,image,href,newTab,tag?}]; person: [{name,role,image,email,phone,href,newTab,tag?}]
  // Element/component for the card links (an item's own `tag` wins), e.g.
  // RouterLink: usually unnecessary with configureLinks({ linkComponent }).
  tag: { type: [String, Object], default: null },
  itemVariant: { type: String, default: 'teaser', validator: (v) => ['teaser', 'person'].includes(v) },
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) },
  // 2 | 3 | 4 fixed columns from 900px up (same as StepsSection), or 'auto':
  // as many columns of at least --cui-teaser-min (24rem) as fit, so 4 or 5
  // teasers never leave one alone on a row.
  columns: { type: [Number, String], default: 3, validator: (v) => [2, 3, 4, 'auto'].includes(v) || ['2', '3', '4'].includes(v) },
  // Sunken background, like MediaTextSection's `subtle`.
  subtle: { type: Boolean, default: false }
})

const titleId = useId('cui-teaser-grid-title')
const gridClass = computed(() => (props.columns === 'auto' ? 'cui-teaser-grid__grid--auto' : `cui-grid--${props.columns}`))
const showIntro = computed(() => !!(props.eyebrow || props.intro || (props.title && !props.titleHidden)))

</script>

<template>
  <section class="cui-section" :class="{ 'cui-section--subtle': subtle }" :aria-labelledby="title ? titleId : undefined">
    <div class="cui-container">
      <h2 v-if="title && titleHidden" :id="titleId" class="cui-visually-hidden">{{ title }}</h2>
      <div v-if="showIntro" class="cui-teaser-grid__intro" :class="`cui-align-${align}`">
        <span v-if="eyebrow" class="cui-eyebrow">{{ eyebrow }}</span>
        <h2 v-if="title && !titleHidden" :id="titleId">{{ title }}</h2>
        <p v-if="intro" class="cui-teaser-grid__lead">{{ intro }}</p>
      </div>
      <div class="cui-grid" :class="gridClass">
        <template v-if="itemVariant === 'person'">
          <Card
            v-for="person in items"
            :key="person.name"
            layout="person"
            appearance="outlined"
            :media="person.image"
            :title="person.name"
            :subtitle="person.role"
            :email="person.email"
            :phone="person.phone ? String(person.phone) : ''"
            :href="person.href"
            :new-tab="person.newTab"
            :tag="person.tag || tag"
          />
        </template>
        <template v-else>
          <Card
            v-for="item in items"
            :key="item.title"
            :media="item.image"
            :title="item.title"
            :href="item.href"
            :new-tab="item.newTab"
            :tag="item.tag || tag"
          >
            {{ item.text }}
          </Card>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cui-teaser-grid__intro {
  max-width: 640px;
  margin-bottom: var(--cui-space-6);
}

.cui-teaser-grid__grid--auto {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--cui-teaser-min, 24rem)), 1fr));
}

.cui-teaser-grid__lead {
  font-size: var(--cui-fz-lead);
  color: var(--cui-lead-color, var(--cui-text-muted));
}
</style>
