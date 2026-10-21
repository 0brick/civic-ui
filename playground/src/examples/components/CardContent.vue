<script setup>
import { Card } from 'civic-ui'
</script>

<template>
  <!-- Content cards without custom CSS: a partner card with a visible link
       label and accent edge, a numbered option, and a dark story card. -->
  <div class="cui-grid cui-grid--3">
    <Card
      eyebrow="Partner"
      title="Blaswerk Nordholm"
      subtitle="Nordholm-Ost"
      text="Brass band and music school, partner since 2019."
      href="https://example.org"
      new-tab
      action-label="blaswerk.example"
      appearance="outlined"
      accent="top"
      accent-color="secondary"
    />
    <Card number="01" title="Become a member" text="Support the association for 20 euros a year." href="#" action-label="Learn more" appearance="outlined" />
    <Card background="primary" title="Nazifah's story" text="How a school place changed a family's future." href="#" action-label="Read the story" />
  </div>
</template>
