<script setup>
import { ListGroup } from 'civic-ui'
</script>

<template>
  <ListGroup
    style="max-width: 420px;"
    :items="[
      { label: 'Account created', description: 'Step 1 of 4', badge: '✓' },
      { label: 'Team invited', description: 'Step 2 of 4', active: true },
      { label: 'Payment on file', description: 'Step 3 of 4' }
    ]"
  />
</template>
