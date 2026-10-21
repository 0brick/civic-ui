<script setup>
import { HeroSection } from 'civic-ui'
import skyline from '../../assets/photos/skyline.jpg'
</script>

<template>
  <!-- A display-size headline on a photo veiled from the text's side, with
       the crop pinned to the upper third (and further right on phones). -->
  <HeroSection
    stage
    align="left"
    title-size="display"
    veil-from="start"
    image-focus="center 30%"
    image-focus-mobile="65% 30%"
    eyebrow="Nordholm 2030"
    title="A city for everyone"
    text="Our plan for housing, mobility and climate: shaped with the people who live here."
    :image="skyline"
    image-alt="The Nordholm skyline at dusk"
    :primary-action="{ label: 'Read the plan', href: '#' }"
  />
</template>
