<script setup>
import { ref } from 'vue'
import { AppButton, Lightbox } from 'civic-ui'
import housing from '../../assets/photos/housing-development.jpg'
import skyline from '../../assets/photos/skyline.jpg'

const viewer = ref(null)
const images = [
  { src: housing, alt: 'New housing development', caption: 'Phase 1: 120 apartments' },
  { src: skyline, alt: 'City skyline at dusk' }
]
</script>

<template>
  <AppButton variant="outline" @click="viewer.open(0)">View photos</AppButton>
  <Lightbox ref="viewer" :images="images" />
</template>
