<script setup>
import { ListGroup } from 'civic-ui'
</script>

<template>
  <ListGroup
    style="max-width: 420px;"
    :items="[
      { label: 'Register a new address', href: '#' },
      { label: 'Apply for a passport', href: '#' },
      { label: 'Request a birth certificate', href: '#' }
    ]"
  />
</template>
