<script setup>
import DocsIndex from '../components/DocsIndex.vue'
import { sectionCategories } from '../registry/sections'
</script>

<template>
  <DocsIndex
    kind="sections"
    eyebrow="Section Library"
    title="Sections"
    intro="Pre-assembled, page-ready blocks built from the components: the fastest path from an empty project to a real-looking site."
    :categories="sectionCategories"
  />
</template>
