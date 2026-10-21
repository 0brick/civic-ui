<script setup>
import { NewsletterSection, ToastContainer, useToast } from 'civic-ui'

const toast = useToast()
</script>

<template>
  <ToastContainer />
  <NewsletterSection
    title="Nordholm Newsletter"
    text="The most important city news, once a month: no spam."
    @submit="(addr) => toast.success(`Subscribed: ${addr}`)"
  />
</template>
