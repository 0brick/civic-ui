<script setup>
import { ref } from 'vue'
import { AppButton, CookieConsent } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <p style="margin: 0 0 12px; color: var(--cui-text-muted); font-size: 1.3rem;">
    Non-modal: the page stays usable behind the banner. Focused elements
    scroll above it, and Escape collapses it to one line.
  </p>
  <AppButton variant="outline" @click="open = true">Show cookie banner</AppButton>
  <CookieConsent v-model="open" :modal="false" />
</template>
