<script setup>
import { FaqSection } from 'civic-ui'
</script>

<template>
  <FaqSection
    title="Frequently asked questions"
    :items="[
      { question: 'How long does an online application take to process?', answer: 'Usually three to five business days, depending on the type of application.' },
      { question: 'Can I book appointments at the resident office online?', answer: 'Yes, through the appointment booking tool on this site.' }
    ]"
  />
</template>
