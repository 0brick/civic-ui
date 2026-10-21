<script setup>
import { ImageGallery } from 'civic-ui'
import school from '../../assets/photos/school.jpg'
import park from '../../assets/photos/park.jpg'
import townhall from '../../assets/photos/townhall.jpg'

const images = [
  { src: school, alt: 'The new school building' },
  { src: park, alt: 'The park next to the school' },
  { src: townhall, alt: 'Town hall' }
]
</script>

<template>
  <ImageGallery :images="images" :columns="3" ratio="1/1" min-width="10rem" />
</template>
