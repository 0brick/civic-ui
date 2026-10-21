<script setup>
import { StatsSection } from 'civic-ui'
</script>

<template>
  <StatsSection
    :stats="[
      { value: '24', label: 'Online services' },
      { value: '18', label: 'District offices' },
      { value: '92%', label: 'Requests resolved within 5 days' }
    ]"
  />
</template>
