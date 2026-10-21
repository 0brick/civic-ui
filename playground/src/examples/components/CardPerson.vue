<script setup>
import { Card } from 'civic-ui'
</script>

<template>
  <div style="max-width: 320px;">
    <Card layout="person" appearance="outlined" title="Anna Berger" subtitle="Customer Support" :meta="[{ label: 'anna.berger@example.com', href: 'mailto:anna.berger@example.com' }]" />
  </div>
</template>
