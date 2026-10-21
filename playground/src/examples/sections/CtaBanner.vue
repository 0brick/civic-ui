<script setup>
import { CtaBanner } from 'civic-ui'
</script>

<template>
  <CtaBanner
    background="primary"
    title="Interested in a job with the city?"
    text="We're always looking for engaged colleagues in administration, IT and technical services."
    :action="{ label: 'View open positions', href: '#' }"
  />
</template>
