<script setup>
import { ImageGallery } from 'civic-ui'
import castle from '../../assets/photos/dresden-castle.jpg'
</script>

<template>
  <div class="cui-prose">
    <p>The restoration of the castle's west wing is complete. Click the picture to enlarge it.</p>
    <ImageGallery :images="[{ src: castle, alt: 'The restored west wing of the castle', caption: 'West wing after the restoration' }]" :columns="1" ratio="auto" />
    <p>Guided tours start again next month.</p>
  </div>
</template>
