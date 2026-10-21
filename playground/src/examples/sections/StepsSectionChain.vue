<script setup>
import { StepsSection } from 'civic-ui'
</script>

<template>
  <StepsSection
    layout="chain"
    eyebrow="How to apply"
    title="Four steps to your new job"
    intro="From your online application to your offer letter: every stage explained in short."
    :steps="[
      { title: '1. Apply online', text: 'Fill out the form, upload your documents, done.', theme: 'tertiary', href: '#' },
      { title: '2. First conversation', text: 'A quick introduction by video or phone call.', theme: 'quaternary', href: '#' },
      { title: '3. Meet the team', text: 'Meet your future colleagues in person.', theme: 'highlight', href: '#' },
      { title: '4. Offer & onboarding', text: 'Receive your offer and plan your first weeks.', theme: 'secondary', href: '#' }
    ]"
  />
</template>
