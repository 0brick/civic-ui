<script setup>
import { Card } from 'civic-ui'
</script>

<template>
  <div style="max-width: 480px;">
    <Card
      layout="job"
      appearance="outlined"
      title="Frontend Developer (f/m/d)"
      eyebrow="Product"
      :meta="[{ icon: 'location', label: 'Remote' }, { icon: 'briefcase', label: 'Full-time' }]"
      href="#"
    />
  </div>
</template>
