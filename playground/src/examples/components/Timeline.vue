<script setup>
import { Timeline } from 'civic-ui'
</script>

<template>
  <Timeline
    style="max-width: 560px;"
    :items="[
      { date: '2022', title: 'Project started', text: 'First version of the component library.' },
      { date: '2024', title: 'Webapp kit', text: 'Added dashboard components.' },
      { date: '2026', title: 'Current release', text: 'Refreshed design system.' }
    ]"
  />
</template>
