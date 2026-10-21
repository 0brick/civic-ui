<script setup>
import { StepsSection } from 'civic-ui'
</script>

<template>
  <StepsSection
    eyebrow="How it works"
    title="From request to confirmed appointment"
    intro="The same four steps for every counter service, online or in person."
    :steps="[
      { title: 'Submit your request', text: 'Tell us what you need and your preferred time window.' },
      { title: 'We check availability', text: 'A caseworker matches your request to the next open slot.' },
      { title: 'Confirmation', text: 'You receive a confirmed date, time and required documents by email.' },
      { title: 'Your visit', text: 'Arrive with your documents: most counters are done in 15 minutes.' }
    ]"
    :action="{ label: 'Start a request', href: '#' }"
  />
</template>
