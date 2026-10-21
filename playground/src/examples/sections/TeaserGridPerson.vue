<script setup>
import { TeaserGrid } from 'civic-ui'
</script>

<template>
  <TeaserGrid
    item-variant="person"
    eyebrow="Get in Touch"
    title="Resident Services &amp; Press"
    intro="For general inquiries and media requests."
    :items="[
      { name: 'Julia Wagner', role: 'Head of Resident Services', email: 'residentservices@nordholm.example' },
      { name: 'Tom Brandt', role: 'Press Office', email: 'press@nordholm.example', phone: '+1 555 0142' },
      { name: 'Nora Fischer', role: 'Digital Services', email: 'digital@nordholm.example' }
    ]"
  />
</template>
