<script setup>
import { HeroSection } from 'civic-ui'
import skyline from '../../assets/photos/skyline.jpg'
</script>

<template>
  <HeroSection
    eyebrow="Resident Portal"
    title="Your city government. Digital, open, for everyone."
    text="File permits online, track active building projects, and stay connected with your city, around the clock, without a waiting number."
    background="tertiary"
    :image="skyline"
    image-alt="City skyline at dusk"
    :primary-action="{ label: 'Explore online services', href: '#' }"
    :secondary-action="{ label: 'About the city', href: '#' }"
  />
</template>
