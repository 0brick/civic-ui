<script setup>
import { h } from 'vue'
import { AppButton } from 'civic-ui'

// Any component works as an icon: an icon library's component, or a
// small inline one like these. Drawing with currentColor lets the icon
// follow each variant's text color.
const SearchIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }, [
    h('circle', { cx: 11, cy: 11, r: 7 }),
    h('path', { d: 'm20 20-4-4' })
  ])
const ArrowIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M5 12h14M13 6l6 6-6 6' })
  ])
</script>

<template>
  <div class="cui-stack">
    <div class="cui-cluster">
      <AppButton :icon="SearchIcon">Search</AppButton>
      <AppButton variant="accent" :icon="ArrowIcon" icon-position="end">Continue</AppButton>
      <AppButton variant="outline" icon="/favicon.svg">Image icon</AppButton>
    </div>
    <div class="cui-cluster">
      <AppButton size="sm" :icon="SearchIcon" icon-only>Search</AppButton>
      <AppButton :icon="SearchIcon" icon-only>Search</AppButton>
      <AppButton size="lg" :icon="SearchIcon" icon-only>Search</AppButton>
      <AppButton variant="ghost" :icon="ArrowIcon" icon-only>Next page</AppButton>
    </div>
  </div>
</template>
