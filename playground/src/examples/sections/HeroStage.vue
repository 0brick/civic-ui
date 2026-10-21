<script setup>
import { HeroSection } from 'civic-ui'
import skyline from '../../assets/photos/skyline.jpg'
</script>

<template>
  <HeroSection
    stage
    align="center"
    tone="grayscale"
    title="City services, close to home"
    text="Permits, appointments and public records: everything Nordholm residents need, in one place."
    :image="skyline"
    image-alt="City skyline at dusk"
    scroll-target="#services"
    :primary-action="{ label: 'Book an appointment', href: '#' }"
    :secondary-action="{ label: 'Browse services', href: '#' }"
  />
</template>
