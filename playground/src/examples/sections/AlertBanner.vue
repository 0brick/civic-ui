<script setup>
import { AlertBanner } from 'civic-ui'
</script>

<template>
  <AlertBanner
    variant="info"
    text="City offices will be closed on October 3 for a public holiday."
    :action="{ label: 'View opening hours', href: '#' }"
  />
</template>
