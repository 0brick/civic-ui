<script setup>
import { StatsSection } from 'civic-ui'
</script>

<template>
  <StatsSection
    title="Nordholm by the numbers"
    :stats="[
      { value: '128,000', label: 'Residents' },
      { value: '3,400', label: 'Childcare spots' },
      { value: '45,000', label: 'Online applications per year' },
      { value: '12,000', label: 'Trees newly planted' }
    ]"
  />
</template>
