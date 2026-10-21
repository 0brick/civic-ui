<script setup>
import { Timeline } from 'civic-ui'
</script>

<template>
  <Timeline
    style="max-width: 560px;"
    :items="[
      { date: 'Sep 12, 2026', title: 'Application received', text: 'Case #48213 was received and assigned to the planning office.' },
      { date: 'Sep 15, 2026', title: 'Under review', text: 'Documents are being checked against local zoning rules.' },
      { date: 'Sep 22, 2026', title: 'Site inspection scheduled', text: 'An inspector will visit the property on Sep 29.' },
      { date: 'Oct 3, 2026', title: 'Decision issued', text: 'The building permit was approved with two conditions.' }
    ]"
  />
</template>
