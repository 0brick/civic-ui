<script setup>
import { TeaserGrid } from 'civic-ui'
</script>

<template>
  <TeaserGrid
    title="Popular services"
    :items="[
      { title: 'Renew a passport', text: 'Book a counter appointment or start the renewal online.' },
      { title: 'Register a new address', text: 'Update your registration within two weeks of moving.' }
    ]"
  />
</template>
