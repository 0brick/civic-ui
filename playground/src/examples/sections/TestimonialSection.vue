<script setup>
import { TestimonialSection } from 'civic-ui'
</script>

<template>
  <TestimonialSection
    eyebrow="Resident Feedback"
    title="What residents are saying"
    :items="[
      { quote: 'Booked a permit appointment online in two minutes: no more waiting number.', name: 'J. Albrecht', role: 'Nordholm resident', rating: 5 },
      { quote: 'The status tracker meant I never had to call to check on my application.', name: 'S. Yilmaz', role: 'Small business owner', rating: 5 },
      { quote: 'Straightforward, and the confirmation email had everything I needed to bring.', name: 'M. Berger', role: 'Nordholm resident', rating: 4 }
    ]"
  />
</template>
