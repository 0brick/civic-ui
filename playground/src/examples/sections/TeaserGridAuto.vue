<script setup>
import { TeaserGrid } from 'civic-ui'
import digitalServices from '../../assets/photos/digital-services.jpg'
import cultureEvents from '../../assets/photos/culture-events.jpg'
import housingDevelopment from '../../assets/photos/housing-development.jpg'
import mobility from '../../assets/photos/mobility.jpg'
</script>

<template>
  <!-- Four teasers with columns="auto": one row on wide screens, two by two
       in between, never three plus a lonely fourth. The title is for
       screen readers only. -->
  <TeaserGrid
    title="Current programs"
    title-hidden
    columns="auto"
    subtle
    :items="[
      { title: 'Digital Services', text: 'Track every application in one dashboard.', image: digitalServices, href: '#' },
      { title: 'Culture & Events', text: 'Markets, concerts and neighborhood festivals.', image: cultureEvents, href: '#' },
      { title: 'Housing', text: 'Three new residential blocks in Ostpark.', image: housingDevelopment, href: '#' },
      { title: 'Mobility', text: 'New cycle lanes along the river.', image: mobility, href: '#' }
    ]"
  />
</template>
