<script setup>
import { Card, Carousel } from 'civic-ui'
</script>

<template>
  <Carousel :slide-count="3" class="cui-carousel-demo" style="max-width: 720px;">
    <Card title="Slide one">First slide content.</Card>
    <Card title="Slide two">Second slide content.</Card>
    <Card title="Slide three">Third slide content.</Card>
  </Carousel>
</template>

<style scoped>
/* Carousel's default nav buttons hang 3rem inward from each edge (see the
   component's own header comment): fine over a full-bleed photo slide, but
   Card's side padding here is only 2.4rem, so the buttons were covering the
   first/last couple of characters of the slide text. Push them fully
   outside instead, the same way TopicSlider.vue overrides nav position for
   its own (opposite) full-bleed case, but only once the page actually has
   room for that on either side; below this the default inward position
   (which never leaves the viewport) is the safer choice. */
@media (min-width: 900px) {
  .cui-carousel-demo :deep(.cui-carousel__nav--prev) {
    left: -5.2rem;
  }
  .cui-carousel-demo :deep(.cui-carousel__nav--next) {
    right: -5.2rem;
  }
}
</style>
