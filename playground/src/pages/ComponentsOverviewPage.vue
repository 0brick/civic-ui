<script setup>
import DocsIndex from '../components/DocsIndex.vue'
import { componentCategories } from '../registry/components'
</script>

<template>
  <DocsIndex
    kind="components"
    eyebrow="Component Library"
    title="Components"
    intro="Every building block Civic UI ships, grouped by purpose. Choose one to see it live, with a copy-paste code example."
    :categories="componentCategories"
  />
</template>
