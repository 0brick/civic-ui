<script setup>
import { StatsSection } from 'civic-ui'
</script>

<template>
  <StatsSection
    background="light"
    :stats="[
      { value: '€15,000', label: 'Building costs' },
      { value: '120', label: 'Pupils' },
      { value: '2027', label: 'Opening' }
    ]"
  />
</template>
