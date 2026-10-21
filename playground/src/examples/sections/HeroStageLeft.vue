<script setup>
import { HeroSection } from 'civic-ui'
import townhall from '../../assets/photos/townhall.jpg'
</script>

<template>
  <HeroSection
    stage
    align="left"
    title="Nordholm City Hall"
    text="Permits, registrations and public records: book a counter appointment or handle it online, whichever fits your day."
    :image="townhall"
    image-alt="Nordholm's town hall building"
    scroll-target="#services"
    :primary-action="{ label: 'Book an appointment', href: '#' }"
    :secondary-action="{ label: 'Browse services', href: '#' }"
  />
</template>
