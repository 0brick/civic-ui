<script setup>
import { Card, Carousel } from 'civic-ui'
</script>

<template>
  <Carousel
    :slide-count="3"
    autoplay
    :interval="5000"
    aria-label="Featured city news"
    class="cui-carousel-demo"
    style="max-width: 720px;"
  >
    <Card title="New recycling centre opens" text="The Elmstadt site starts taking appointments next Monday." />
    <Card title="Road works on Bahnhofstraße" text="Expect delays through the end of the month." />
    <Card title="Library extends evening hours" text="Open until 20:00 on weekdays starting in October." />
  </Carousel>
</template>

<style scoped>
/* See Carousel.vue's own example for why the nav buttons need pushing fully
   outside the card's padding, and why only where the page has room for it
   (below that they'd stick out of a 320px viewport, WCAG 1.4.10). */
@media (min-width: 900px) {
  .cui-carousel-demo :deep(.cui-carousel__nav--prev) {
    left: -5.2rem;
  }
  .cui-carousel-demo :deep(.cui-carousel__nav--next) {
    right: -5.2rem;
  }
}
</style>
