<script setup>
import { FaqSection } from 'civic-ui'
</script>

<template>
  <FaqSection
    eyebrow="FAQ"
    title="Frequently asked questions"
    intro="The most common questions about online applications and appointments."
    :items="[
      { question: 'How long does an online application take to process?', answer: 'Usually three to five business days, depending on the type of application. You can check the current status any time in your resident account.' },
      { question: 'Can I book appointments at the resident office online?', answer: 'Yes, through the appointment booking tool on this site. Most requests need no queue at all.' },
      { question: 'Is support available in multiple languages?', answer: 'Yes, the resident services team supports English, German and Turkish, with interpreters available on request for other languages.' }
    ]"
  />
</template>
