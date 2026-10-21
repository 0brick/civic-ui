<script setup>
// Shared layout for both overview pages (Components and Sections): an intro
// banner plus every item grouped by category, name-first. Clicking a name
// navigates to that item's own doc page.
import { navigate } from '../router'

const props = defineProps({
  kind: { type: String, required: true }, // 'components' | 'sections'
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  intro: { type: String, required: true },
  categories: { type: Array, required: true }
})
</script>

<template>
  <header class="docs-intro">
    <div class="cui-container">
      <span class="cui-eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p>{{ intro }}</p>
    </div>
  </header>

  <div class="cui-container docs-index">
    <section v-for="category in categories" :key="category.name" class="docs-index__category">
      <h2>{{ category.name }}</h2>
      <ul class="docs-index__grid">
        <li v-for="item in category.items" :key="item.slug">
          <a :href="`/${props.kind}/${item.slug}`" class="docs-index__link" @click.prevent="navigate(props.kind, item.slug)">
            <span class="docs-index__name">{{ item.name }}</span>
            <span class="docs-index__summary">{{ item.summary }}</span>
          </a>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.docs-intro {
  padding-block: var(--cui-space-7) var(--cui-space-6);
  background: var(--cui-bg-subtle);
  border-bottom: 1px solid var(--cui-border);
}
.docs-intro h1 {
  margin: var(--cui-space-2) 0 var(--cui-space-2);
}
.docs-intro p {
  max-width: 60ch;
  color: var(--cui-text-muted);
  font-size: 1.6rem;
  margin: 0;
}

.docs-index {
  padding-block: var(--cui-space-7);
  display: flex;
  flex-direction: column;
  gap: var(--cui-space-7);
}

.docs-index__category h2 {
  font-size: 2rem;
  margin: 0 0 var(--cui-space-4);
  padding-bottom: var(--cui-space-2);
  border-bottom: 1px solid var(--cui-border);
}

.docs-index__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--cui-space-3);
}

.docs-index__link {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  height: 100%;
  padding: var(--cui-space-3) var(--cui-space-4);
  border: 1px solid var(--cui-border);
  border-radius: var(--cui-radius-md);
  text-decoration: none;
  background: var(--cui-bg);
  transition: border-color var(--cui-duration) var(--cui-ease), box-shadow var(--cui-duration) var(--cui-ease), transform var(--cui-duration) var(--cui-ease);
}

.docs-index__link:hover {
  border-color: var(--cui-color-line-strong);
  box-shadow: var(--cui-shadow-sm);
  transform: translateY(-1px);
}

.docs-index__name {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--cui-heading);
}

.docs-index__summary {
  font-size: 1.3rem;
  color: var(--cui-text-muted);
  line-height: 1.4;
}
</style>
