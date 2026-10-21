<script setup>
import { MediaTextSection } from 'civic-ui'
import digitalServices from '../../assets/photos/digital-services.jpg'
</script>

<template>
  <MediaTextSection
    eyebrow="Resident Services"
    title="Services at a glance"
    text="The most-used counters, now available online as well as in person."
    :image="digitalServices"
    image-alt="A blank laptop screen on a desk"
    :items="[
      { title: 'Permits & applications', text: 'Building permits, business licenses and residency registration in one queue.' },
      { title: 'Appointments', text: 'Book a single visit or a recurring slot, whichever your request needs.' }
    ]"
  />
</template>
