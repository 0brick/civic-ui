<script setup>
import { ref } from 'vue'
import { AppButton, CookieConsent } from 'civic-ui'

const open = ref(false)
</script>

<template>
  <p style="margin: 0 0 12px; color: var(--cui-text-muted); font-size: 1.3rem;">
    The banner is fixed to the bottom of the browser viewport, not to this preview box. It is modal: focus stays in it until you choose.
  </p>
  <AppButton variant="outline" @click="open = true">Show cookie banner</AppButton>
  <CookieConsent v-model="open" />
</template>
