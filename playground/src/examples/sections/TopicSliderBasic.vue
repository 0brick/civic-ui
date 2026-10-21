<script setup>
import { TopicSlider } from 'civic-ui'
import housingDevelopment from '../../assets/photos/housing-development.jpg'
import cultureEvents from '../../assets/photos/culture-events.jpg'
</script>

<template>
  <TopicSlider
    :items="[
      { title: 'Housing & Development', image: housingDevelopment },
      { title: 'Culture & Events', image: cultureEvents }
    ]"
  />
</template>
