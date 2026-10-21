<script setup>
import { TopicSlider } from 'civic-ui'
import mobility from '../../assets/photos/mobility.jpg'
import park from '../../assets/photos/park.jpg'
import school from '../../assets/photos/school.jpg'
</script>

<template>
  <TopicSlider
    more-label="Learn more"
    :items="[
      { title: 'Mobility', text: 'New bike lanes, more bus routes, and a city map that keeps up with you.', image: mobility, href: '#' },
      { title: 'Environment & Green Spaces', text: 'Parks, city trees, and the 2030 climate action program.', image: park, href: '#' },
      { title: 'Education', text: 'New childcare spots and renovated schools for the next generation.', image: school, href: '#' }
    ]"
  />
</template>
