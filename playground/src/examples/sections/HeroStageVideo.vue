<script setup>
import { HeroSection } from 'civic-ui'
import skyline from '../../assets/photos/skyline.jpg'
// local file: the playground makes no third-party requests
import skylineVideo from '../../assets/videos/skyline-pan.mp4'
</script>

<template>
  <HeroSection
    stage
    align="center"
    title="City services, close to home"
    text="Permits, appointments and public records: everything Nordholm residents need, in one place."
    :video="skylineVideo"
    :video-poster="skyline"
    scroll-target="#services"
    :primary-action="{ label: 'Book an appointment', href: '#' }"
    :secondary-action="{ label: 'Browse services', href: '#' }"
  />
</template>
