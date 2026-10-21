<script setup>
import { ImageGallery } from 'civic-ui'
import school from '../../assets/photos/school.jpg'
import park from '../../assets/photos/park.jpg'
import townhall from '../../assets/photos/townhall.jpg'
import housing from '../../assets/photos/housing-development.jpg'
import castle from '../../assets/photos/dresden-castle.jpg'
import skyline from '../../assets/photos/skyline.jpg'

const images = [
  { src: school, alt: 'The new school building', caption: 'Opened in May' },
  { src: park, alt: 'The park next to the school' },
  { src: townhall, alt: 'Town hall' },
  { src: housing, alt: 'New housing development' },
  { src: castle, alt: 'Castle in the old town' },
  { src: skyline, alt: 'City skyline at dusk' }
]
</script>

<template>
  <ImageGallery :images="images" />
</template>
