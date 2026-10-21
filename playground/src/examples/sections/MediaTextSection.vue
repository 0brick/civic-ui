<script setup>
import { MediaTextSection } from 'civic-ui'
import park from '../../assets/photos/park.jpg'
</script>

<template>
  <MediaTextSection
    eyebrow="Closer Look"
    title="More green space for Nordholm"
    text="The 2030 climate action program is bringing three new parks, additional street trees, and greener courtyards: planned together with the residents of each neighborhood."
    :image="park"
    image-alt="A tree-lined path in a city park"
    :action="{ label: 'About the program', href: '#' }"
  />
</template>
