<script setup>
import { Breadcrumb, HeroSection } from 'civic-ui'
import townhall from '../../assets/photos/townhall.jpg'
</script>

<template>
  <HeroSection
    size="compact"
    align="center"
    title="Careers at the City"
    text="Meaningful work, a dependable employer: help shape Nordholm's future."
    background="tertiary"
    :image="townhall"
    image-alt="City hall building"
  />
  <div class="cui-container" style="padding-block: var(--cui-space-4);">
    <Breadcrumb :items="[{ label: 'Home', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Application Process' }]" />
  </div>
</template>
