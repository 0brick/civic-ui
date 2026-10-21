<script setup>
import { ConsentEmbed } from 'civic-ui'
</script>

<template>
  <ConsentEmbed
    provider="osm"
    src="https://www.openstreetmap.org/export/embed.html?bbox=13.30%2C52.45%2C13.50%2C52.55"
    title="Service area map"
    ratio="4/3"
    style="max-width: 48rem"
  />
</template>
