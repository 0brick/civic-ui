<script setup>
import { TeaserGrid } from 'civic-ui'
import digitalServices from '../../assets/photos/digital-services.jpg'
import cultureEvents from '../../assets/photos/culture-events.jpg'
import housingDevelopment from '../../assets/photos/housing-development.jpg'
</script>

<template>
  <TeaserGrid
    eyebrow="More from the City"
    title="Where else things are moving"
    intro="A handful of other programs currently underway across Nordholm."
    :items="[
      { title: 'Digital Services', text: 'New online accounts let residents track every application in one dashboard.', image: digitalServices, href: '#' },
      { title: 'Culture & Events', text: 'A packed calendar of markets, concerts and neighborhood festivals this season.', image: cultureEvents, href: '#' },
      { title: 'Housing & Development', text: 'Three new residential blocks breaking ground in the Ostpark district.', image: housingDevelopment, href: '#' }
    ]"
  />
</template>
