<script setup>
// A header + vertical stack of items. `itemType` picks the Card shape and
// its widget: 'article' (press index with Pagination), 'job' (search toolbar
// + EmptyState fallback) or 'download' (plain file list).
// `#item="{ item }"` renders any other item shape.
import { computed } from 'vue'
import Card from '../components/content/Card.vue'
import Pagination from '../components/navigation/Pagination.vue'
import Toolbar from '../components/content/Toolbar.vue'
import SearchField from '../components/forms/SearchField.vue'
import EmptyState from '../components/content/EmptyState.vue'
import { t } from '../utils/i18n'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  intro: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  itemType: { type: String, default: 'article', validator: (v) => ['article', 'job', 'download'].includes(v) },
  align: { type: String, default: 'left', validator: (v) => ['left', 'center', 'right'].includes(v) },
  // Opt-in 860px column. Off by default so every section shares the same
  // container width and their edges line up when stacked.
  narrow: { type: Boolean, default: false },
  subtle: { type: Boolean, default: null }, // null = auto (download only)
  // itemType="job" only
  searchable: { type: Boolean, default: true },
  searchLabel: { type: String },
  searchPlaceholder: { type: String },
  emptyTitle: { type: String },
  emptyText: { type: String },
  // itemType="article" only
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 0 }
})
const emit = defineEmits(['search', 'update:page'])
// UI texts: the instance's own prop, else the i18n catalog (utils/i18n.js).
const L = computed(() => ({
  searchLabel: props.searchLabel ?? t('listSection.searchLabel'),
  searchPlaceholder: props.searchPlaceholder ?? t('listSection.searchPlaceholder'),
  emptyTitle: props.emptyTitle ?? t('listSection.emptyTitle'),
  emptyText: props.emptyText ?? t('listSection.emptyText')
}))


const effectiveSubtle = computed(() => (props.subtle !== null ? props.subtle : props.itemType === 'download'))

function jobMeta(job) {
  const meta = []
  if (job.location) meta.push({ icon: 'location', label: job.location })
  if (job.type) meta.push({ icon: 'briefcase', label: job.type })
  return meta
}
</script>

<template>
  <section class="cui-section" :class="{ 'cui-section--subtle': effectiveSubtle }">
    <div class="cui-container" :class="{ 'cui-container--narrow': narrow }">
      <div class="cui-list-section__intro" :class="`cui-align-${align}`">
        <span v-if="eyebrow" class="cui-eyebrow">{{ eyebrow }}</span>
        <h2>{{ title }}</h2>
        <p v-if="intro" class="cui-list-section__lead">{{ intro }}</p>
      </div>

      <Toolbar v-if="itemType === 'job' && searchable" class="cui-list-section__toolbar">
        <template #start>
          <SearchField :label="L.searchLabel" :placeholder="L.searchPlaceholder" @search="emit('search', $event)" />
        </template>
        <template #end><slot name="filters" /></template>
      </Toolbar>

      <template v-if="itemType === 'job'">
        <div v-if="items.length" class="cui-stack cui-list-section__items">
          <template v-for="job in items" :key="job.title">
            <slot name="item" :item="job">
              <Card layout="job" appearance="outlined" :title="job.title" :eyebrow="job.department" :meta="jobMeta(job)" :href="job.href" :new-tab="job.newTab" />
            </slot>
          </template>
        </div>
        <EmptyState v-else :title="L.emptyTitle" :text="L.emptyText" />
      </template>

      <template v-else-if="itemType === 'download'">
        <div class="cui-stack cui-list-section__items">
          <template v-for="file in items" :key="file.title">
            <slot name="item" :item="file">
              <Card layout="download" appearance="outlined" :title="file.title" :file-type="file.fileType || 'PDF'" :file-size="file.fileSize" :href="file.href" :new-tab="file.newTab" />
            </slot>
          </template>
        </div>
      </template>

      <template v-else>
        <div class="cui-list-section__items">
          <template v-for="article in items" :key="article.title">
            <slot name="item" :item="article">
              <Card layout="row" :media="article.image" :date="article.date" :eyebrow="article.category" :title="article.title" :text="article.excerpt" :href="article.href" :new-tab="article.newTab" />
            </slot>
          </template>
        </div>
        <div v-if="totalPages > 1" class="cui-list-section__pagination">
          <Pagination :model-value="page" :total="totalPages" @update:model-value="emit('update:page', $event)" />
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.cui-list-section__intro {
  max-width: 640px;
  margin-bottom: var(--cui-space-6);
}

.cui-list-section__lead {
  font-size: var(--cui-fz-lead);
  color: var(--cui-lead-color, var(--cui-text-muted));
}

.cui-list-section__toolbar {
  margin-bottom: var(--cui-space-6);
}

.cui-list-section__items {
  gap: var(--cui-space-3);
}

.cui-list-section__pagination {
  display: flex;
  justify-content: center;
  margin-top: var(--cui-space-6);
}
</style>
