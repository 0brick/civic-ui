<script setup>
import { ref } from 'vue'
import { AppointmentSection } from 'civic-ui'

const status = ref('idle')

function handleSubmit() {
  status.value = 'sending'
  setTimeout(() => {
    status.value = 'success'
  }, 900)
}
</script>

<template>
  <AppointmentSection
    eyebrow="Resident Services"
    title="Book a counter appointment"
    intro="A few details about your request are enough: we'll confirm a time slot by email."
    :status="status"
    privacy-href="#"
    :contact-methods="[
      { label: 'residents@nordholm.example', href: 'mailto:residents@nordholm.example' },
      { label: '+49 30 000000', href: 'tel:+4930000000' }
    ]"
    @submit="handleSubmit"
  />
</template>
