<script setup>
import { HeroSection } from 'civic-ui'
import skyline from '../../assets/photos/skyline.jpg'
</script>

<template>
  <HeroSection
    eyebrow="Welcome to Nordholm,"
    text="File permits online, track active building projects, and stay connected with your city, around the clock, without a waiting number."
    background="tertiary"
    :image="skyline"
    image-alt="City skyline at dusk"
    vertical-align="center"
  />
</template>
