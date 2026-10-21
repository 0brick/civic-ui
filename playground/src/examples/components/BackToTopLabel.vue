<script setup>
import { BackToTop } from 'civic-ui'
</script>

<template>
  <p style="color: var(--cui-text-muted); margin: 0;">Scroll down a little on this page: a circular button with a custom, localized label fades in at the bottom-right corner.</p>
  <BackToTop :threshold="120" label="Nach oben" />
</template>
